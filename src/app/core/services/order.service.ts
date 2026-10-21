import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import {
    Firestore, collection, collectionData, doc,
    setDoc, Timestamp, runTransaction, DocumentReference
} from '@angular/fire/firestore';
import { TenantService } from '../tenant/tenant.service';
import { Subscription } from 'rxjs';
import { Product, OrderItem, Order } from '../../shared/interfaces';
import { TableService } from './table.service';
import { AuthService } from '../auth/auth.service';
import { toOrder } from './shift.service';
import {
    addProductToNewLines, changeNewLineQuantity, mergeLines, sumItems, countItems, newLineId
} from './order.logic';

@Injectable({
    providedIn: 'root'
})
export class OrderService implements OnDestroy {
    // Líneas NUEVAS del mesero (solo en este dispositivo hasta que se envían)
    private newLines = signal<OrderItem[]>([]);
    private tableId = signal<string | null>(null);

    // Lista de órdenes activas desde Firestore (tiempo real)
    private activeOrders = signal<Order[]>([]);
    // true cuando llegó la primera respuesta de Firestore (evita avisos falsos al abrir la caja)
    readonly ordersLoaded = signal(false);

    private firestore = inject(Firestore);
    private tenant = inject(TenantService);
    private tableService = inject(TableService);
    private authService = inject(AuthService);

    private ordersSubscription: Subscription;

    // Señales derivadas (computed)
    readonly currentTable = this.tableId.asReadonly();

    // Líneas ya enviadas: se leen EN VIVO de Firestore (sobreviven a recargas de página)
    private readonly sentLines = computed<OrderItem[]>(() => {
        const tId = this.tableId();
        if (!tId) return [];
        return this.activeOrders()
            .filter(o => o.id_mesa === tId)
            .flatMap(o => o.items.map(item => ({ ...item, enviado: true })));
    });

    // Líneas nuevas que el servidor aún no tiene (si una confirmación llegó tarde, desaparecen solas)
    private readonly pendingLines = computed<OrderItem[]>(() => {
        const sentIds = new Set(this.sentLines().map(l => l.line_id));
        return this.newLines().filter(l => !sentIds.has(l.line_id));
    });

    // Comanda que ve el mesero = enviadas (🔒) + nuevas (editables)
    readonly items = computed<OrderItem[]>(() => [...this.sentLines(), ...this.pendingLines()]);
    readonly hasNewItems = computed(() => this.pendingLines().length > 0);

    readonly totalQuantity = computed(() => countItems(this.items()));
    readonly totalAmount = computed(() => sumItems(this.items()));

    constructor() {
        // Suscripción a órdenes activas en tiempo real
        // Solo escucha las órdenes del restaurante activo de este equipo
        this.ordersSubscription = this.tenant.watch(
            rid => collectionData(collection(this.firestore, 'restaurants', rid, 'orders'), { idField: 'id' }),
            [] as any[]
        ).subscribe(
            (data) => {
                this.activeOrders.set((data as any[]).map(toOrder));
                this.ordersLoaded.set(true);
            }
        );
        // El historial de ventas NO se escucha aquí: lo carga ShiftService solo en caja y admin.
    }

    ngOnDestroy(): void {
        this.ordersSubscription?.unsubscribe();
    }

    // Establecer la mesa actual para el pedido
    setActiveTable(id: string | null): void {
        // Al cambiar de mesa se descartan las líneas nuevas de la mesa anterior
        if (id !== this.tableId()) {
            this.newLines.set([]);
        }
        this.tableId.set(id);
    }

    addToCart(product: Product, note: string = '', quantity: number = 1): void {
        this.newLines.update(lines => addProductToNewLines(lines, product, note, quantity));
    }

    // Solo afecta líneas nuevas: las enviadas (🔒) no están en newLines
    updateQuantity(lineId: string, delta: number): void {
        this.newLines.update(lines => changeNewLineQuantity(lines, lineId, delta));
    }

    removeItem(lineId: string): void {
        this.newLines.update(lines => lines.filter(l => l.line_id !== lineId));
    }

    clearCart(): void {
        this.newLines.set([]);
    }

    /**
     * Envía las líneas nuevas de la mesa a Firestore dentro de una transacción.
     * - Lee la orden actual EN EL SERVIDOR y le agrega solo las líneas nuevas (sin duplicar line_id),
     *   así una recarga de página o un cambio simultáneo de la caja no borran nada.
     * - La mesa guarda su orden abierta (id_orden_actual) para que dos meseros no creen dos órdenes.
     */
    async saveOrder(estadoFinal: 'pendiente' | 'en_caja'): Promise<boolean> {
        const tId = this.tableId();
        if (!tId) return false;

        const currentUser = this.authService.user();
        const linesToSend: OrderItem[] = this.pendingLines().map(line => ({
            ...line,
            enviado: true,
            agregado_por: currentUser?.id ?? 'desconocido',
            agregado_en: Date.now()
        }));
        const knownOrderId = this.getOrderByTable(tId)?.id;

        if (linesToSend.length === 0 && !knownOrderId) return false;

        const tableRef = this.tenant.docRef('tables', tId);

        try {
            await runTransaction(this.firestore, async (tx) => {
                const tableSnap = await tx.get(tableRef);
                if (!tableSnap.exists()) throw new Error(`La mesa ${tId} no existe`);
                const tableData = tableSnap.data();

                // Buscar la orden abierta: primero la registrada en la mesa, luego la que vemos en vivo
                const candidateIds = [tableData['id_orden_actual'], knownOrderId]
                    .filter((id, i, arr): id is string => !!id && arr.indexOf(id) === i);

                let orderRef: DocumentReference | null = null;
                let existingItems: OrderItem[] = [];
                for (const id of candidateIds) {
                    const ref = this.tenant.docRef('orders', id);
                    const snap = await tx.get(ref);
                    if (snap.exists()) {
                        orderRef = ref;
                        existingItems = (snap.data()['items'] ?? []) as OrderItem[];
                        break;
                    }
                }

                if (orderRef) {
                    const items = mergeLines(existingItems, linesToSend);
                    const subtotal = sumItems(items);
                    tx.update(orderRef, {
                        items,
                        estado: estadoFinal,
                        subtotal,
                        total: subtotal,
                        actualizado_en: Timestamp.now(),
                        ...(estadoFinal === 'en_caja' ? { enviado_en: Timestamp.now() } : {})
                    });
                    tx.update(tableRef, { estado: 'ocupada', id_orden_actual: orderRef.id });
                    return;
                }

                if (linesToSend.length === 0) throw new Error('No hay productos para crear la orden');

                const newOrderRef = this.tenant.newDocRef('orders');
                const subtotal = sumItems(linesToSend);
                tx.set(newOrderRef, {
                    id_mesa: tId,
                    numero_mesa: Number(tableData['numero_mesa'] ?? tId.replace('mesa_', '')),
                    id_mesero: currentUser?.id ?? 'desconocido',
                    nombre_mesero: currentUser?.nombre ?? 'Desconocido',
                    items: linesToSend,
                    estado: estadoFinal,
                    codigo_pago: this.generatePaymentCode(),
                    subtotal,
                    propina: 0,
                    total: subtotal,
                    fecha_creacion: Timestamp.now(),
                    actualizado_en: Timestamp.now(),
                    ...(estadoFinal === 'en_caja' ? { enviado_en: Timestamp.now() } : {})
                });
                tx.update(tableRef, { estado: 'ocupada', id_orden_actual: newOrderRef.id });
            });

            // Quitar del carrito local solo las líneas confirmadas, y solo si seguimos en la misma mesa
            // (si la confirmación llegó tarde, el mesero pudo haber abierto otra mesa).
            if (this.tableId() === tId) {
                const sentIds = new Set(linesToSend.map(l => l.line_id));
                this.newLines.update(lines => lines.filter(l => !sentIds.has(l.line_id)));
            }
            return true;
        } catch (error) {
            console.error('Error al guardar orden:', error);
            return false;
        }
    }

    // Generador auxiliar de PIN para seguridad
    private generatePaymentCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // --- Métodos compartidos / Cajero ---

    // Obtener todas las órdenes que están listas para cobrar
    readonly getOrdersForCashier = computed(() => {
        return this.activeOrders().filter(o => o.estado === 'en_caja');
    });

    // Obtener orden por mesa
    getOrderByTable(tableId: string): Order | undefined {
        return this.activeOrders().find(o => o.id_mesa === tableId);
    }

    /**
     * Estado de la mesa al quitarle una orden: si tiene otras órdenes activas
     * (p. ej. tras dividir la cuenta) sigue ocupada; si no, queda libre.
     */
    private tableStateAfterRemoving(tableId: string, removedOrderIds: string[]): { estado: 'libre' | 'ocupada'; id_orden_actual: string | null } {
        const others = this.activeOrders().filter(o => o.id_mesa === tableId && !removedOrderIds.includes(o.id));
        return others.length > 0
            ? { estado: 'ocupada', id_orden_actual: others[0].id }
            : { estado: 'libre', id_orden_actual: null };
    }

    /**
     * Cierra la orden y registra la venta en UNA transacción.
     * La venta se guarda en order_history con el MISMO id de la orden: si el cajero toca dos veces
     * o la red reintenta, no puede quedar una venta duplicada.
     * El total se recalcula a partir de las líneas guardadas en el servidor.
     */
    async closeOrder(orderId: string, method: 'efectivo' | 'transferencia'): Promise<boolean> {
        const orderRef = this.tenant.docRef('orders', orderId);
        const historyRef = this.tenant.docRef('order_history', orderId);

        try {
            await runTransaction(this.firestore, async (tx) => {
                const orderSnap = await tx.get(orderRef);
                const historySnap = await tx.get(historyRef);

                if (historySnap.exists()) {
                    // Ya se cobró antes: solo asegurar que no quede como activa
                    if (orderSnap.exists()) tx.delete(orderRef);
                    return;
                }
                if (!orderSnap.exists()) throw new Error('La orden ya no existe');

                const order = orderSnap.data();
                const items = (order['items'] ?? []) as OrderItem[];
                if (items.length === 0) throw new Error('La orden no tiene productos');
                const total = sumItems(items);

                const tableId = order['id_mesa'] as string;
                const tableRef = tableId && tableId !== 'para_llevar' ? this.tenant.docRef('tables', tableId) : null;
                const tableSnap = tableRef ? await tx.get(tableRef) : null;

                tx.set(historyRef, {
                    id_mesa: tableId,
                    numero_mesa: order['numero_mesa'] ?? 0,
                    id_mesero: order['id_mesero'] ?? '',
                    nombre_mesero: order['nombre_mesero'] ?? '',
                    items,
                    estado: 'pagada',
                    codigo_pago: order['codigo_pago'] ?? '',
                    subtotal: total,
                    propina: 0,
                    total,
                    metodo_pago: method,
                    cobrado_por: this.authService.user()?.id ?? 'desconocido',
                    fecha_creacion: order['fecha_creacion'] ?? Timestamp.now(),
                    fecha_cierre: Timestamp.now()
                });
                tx.delete(orderRef);
                if (tableRef && tableSnap?.exists()) {
                    tx.update(tableRef, this.tableStateAfterRemoving(tableId, [orderId]));
                }
            });
            return true;
        } catch (error) {
            console.error('Error al cerrar orden:', error);
            return false;
        }
    }

    // 🔒 Solo el cajero puede eliminar items de una orden ya enviada
    // Se borra por line_id (no por posición) y leyendo la orden en el servidor,
    // así un envío simultáneo del mesero no hace reaparecer ni desaparecer otras líneas.
    async removeItemFromOrder(orderId: string, lineId: string): Promise<boolean> {
        if (!lineId) return false;
        const orderDoc = this.tenant.docRef('orders', orderId);

        try {
            return await runTransaction(this.firestore, async (tx) => {
                const snap = await tx.get(orderDoc);
                if (!snap.exists()) return false;

                const items = (snap.data()['items'] ?? []) as OrderItem[];
                const newItems = items.filter(item => item.line_id !== lineId);
                if (newItems.length === items.length) return false;

                const newSubtotal = sumItems(newItems);
                tx.update(orderDoc, {
                    items: newItems,
                    subtotal: newSubtotal,
                    total: newSubtotal
                });
                return true;
            });
        } catch (error) {
            console.error('Error al eliminar item de orden:', error);
            return false;
        }
    }

    // Obtener TODAS las órdenes activas (para el cajero)
    readonly getAllActiveOrders = computed(() => {
        return this.activeOrders();
    });

    // 🔗 Unir Mesas — Fusionar órdenes de 2+ mesas en una cuenta unificada (una sola transacción)
    async mergeTables(tableIds: string[]): Promise<boolean> {
        if (tableIds.length < 2) return false;

        const ordersToMerge = tableIds
            .map(id => this.activeOrders().find(o => o.id_mesa === id))
            .filter((o): o is Order => o !== undefined);

        if (ordersToMerge.length < 2) return false;
        const primary = ordersToMerge[0];
        const secondaries = ordersToMerge.slice(1);

        try {
            await runTransaction(this.firestore, async (tx) => {
                // Lecturas primero (regla de las transacciones)
                const allItems: OrderItem[] = [];
                for (const o of ordersToMerge) {
                    const snap = await tx.get(this.tenant.docRef('orders', o.id));
                    if (!snap.exists()) throw new Error('Una de las órdenes ya no existe');
                    allItems.push(...((snap.data()['items'] ?? []) as OrderItem[]));
                }
                const secondaryTableExists: boolean[] = [];
                for (const o of secondaries) {
                    secondaryTableExists.push((await tx.get(this.tenant.docRef('tables', o.id_mesa))).exists());
                }

                const mergedItems = mergeLines([], allItems);
                const mergedSubtotal = sumItems(mergedItems);

                tx.update(this.tenant.docRef('orders', primary.id), {
                    items: mergedItems,
                    subtotal: mergedSubtotal,
                    total: mergedSubtotal,
                    mesas_unidas: ordersToMerge.map(o => o.numero_mesa),
                    actualizado_en: Timestamp.now()
                });

                secondaries.forEach((o, i) => {
                    tx.delete(this.tenant.docRef('orders', o.id));
                    if (secondaryTableExists[i]) {
                        tx.update(this.tenant.docRef('tables', o.id_mesa), this.tableStateAfterRemoving(o.id_mesa, [o.id]));
                    }
                });
            });
            return true;
        } catch (error) {
            console.error('Error al fusionar mesas:', error);
            return false;
        }
    }

    // ✂️ Dividir Cuenta — Mover las líneas elegidas (por line_id) a una nueva orden de la misma mesa
    async splitOrder(orderId: string, lineIds: string[]): Promise<string | null> {
        if (lineIds.length === 0) return null;
        const orderRef = this.tenant.docRef('orders', orderId);
        const newOrderRef = this.tenant.newDocRef('orders');

        try {
            await runTransaction(this.firestore, async (tx) => {
                const snap = await tx.get(orderRef);
                if (!snap.exists()) throw new Error('La orden ya no existe');
                const order = snap.data();
                const items = (order['items'] ?? []) as OrderItem[];

                const isSelected = (i: OrderItem) => !!i.line_id && lineIds.includes(i.line_id);
                const splitItems = items.filter(isSelected);
                const remainingItems = items.filter(i => !isSelected(i));
                if (splitItems.length === 0) throw new Error('No se encontraron las líneas a dividir');
                if (remainingItems.length === 0) throw new Error('Debe quedar al menos un producto en la cuenta original');

                const splitSubtotal = sumItems(splitItems);
                const remainingSubtotal = sumItems(remainingItems);

                tx.set(newOrderRef, {
                    id_mesa: order['id_mesa'],
                    numero_mesa: order['numero_mesa'],
                    id_mesero: order['id_mesero'],
                    nombre_mesero: order['nombre_mesero'],
                    items: splitItems,
                    estado: 'en_caja',
                    codigo_pago: this.generatePaymentCode(),
                    subtotal: splitSubtotal,
                    propina: 0,
                    total: splitSubtotal,
                    dividida_de: orderId,
                    fecha_creacion: order['fecha_creacion'] ?? Timestamp.now(),
                    actualizado_en: Timestamp.now()
                });
                tx.update(orderRef, {
                    items: remainingItems,
                    subtotal: remainingSubtotal,
                    total: remainingSubtotal,
                    actualizado_en: Timestamp.now()
                });
            });
            return newOrderRef.id;
        } catch (error) {
            console.error('Error al dividir orden:', error);
            return null;
        }
    }

    // 🛍️ Venta Directa (Para Llevar) — Sin mesa ni mesero asignado
    async createDirectSaleOrder(items: { product_id: string; nombre: string; precio: number; cantidad: number; notas?: string }[]): Promise<string | null> {
        if (items.length === 0) return null;
        const currentUser = this.authService.user();
        const orderItems: OrderItem[] = items.map(item => ({
            line_id: newLineId(),
            id_producto: item.product_id,
            nombre_producto: item.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            notas: item.notas || '',
            enviado: true,
            agregado_por: currentUser?.id ?? 'caja',
            agregado_en: Date.now()
        }));
        const subtotal = sumItems(orderItems);
        const orderRef = this.tenant.newDocRef('orders');

        try {
            await setDoc(orderRef, {
                id_mesa: 'para_llevar',
                numero_mesa: 0,
                id_mesero: 'caja',
                nombre_mesero: 'Venta Directa',
                items: orderItems,
                estado: 'en_caja',
                codigo_pago: this.generatePaymentCode(),
                subtotal,
                propina: 0,
                total: subtotal,
                fecha_creacion: Timestamp.now(),
                actualizado_en: Timestamp.now()
            });
            return orderRef.id;
        } catch (error) {
            console.error('Error al crear venta directa:', error);
            return null;
        }
    }
}

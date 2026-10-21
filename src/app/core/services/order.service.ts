import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import {
    Firestore, collection, collectionData, doc,
    addDoc, updateDoc, deleteDoc, Timestamp, writeBatch, runTransaction, DocumentReference
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Product, OrderItem, Order } from '../../shared/interfaces';
import { TableService } from './table.service';
import { AuthService } from '../auth/auth.service';
import {
    addProductToNewLines, changeNewLineQuantity, mergeLines, sumItems, countItems
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

    // Historial de órdenes pagadas desde Firestore (tiempo real)
    private orderHistory = signal<Order[]>([]);

    private firestore = inject(Firestore);
    private tableService = inject(TableService);
    private authService = inject(AuthService);

    private ordersSubscription: Subscription;
    private historySubscription: Subscription;

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

    // Comanda que ve el mesero = enviadas (🔒) + nuevas (editables)
    readonly items = computed<OrderItem[]>(() => [...this.sentLines(), ...this.newLines()]);
    readonly hasNewItems = computed(() => this.newLines().length > 0);

    readonly totalQuantity = computed(() => countItems(this.items()));
    readonly totalAmount = computed(() => sumItems(this.items()));

    constructor() {
        // Suscripción a órdenes activas en tiempo real
        const ordersRef = collection(this.firestore, 'orders');
        this.ordersSubscription = collectionData(ordersRef, { idField: 'id' }).subscribe(
            (data) => {
                const orders = (data as any[]).map(o => ({
                    ...o,
                    fecha_creacion: o.fecha_creacion?.toDate ? o.fecha_creacion.toDate() : new Date(o.fecha_creacion),
                    fecha_cierre: o.fecha_cierre?.toDate ? o.fecha_cierre.toDate() : (o.fecha_cierre ? new Date(o.fecha_cierre) : undefined)
                })) as Order[];
                this.activeOrders.set(orders);
            }
        );

        // Suscripción a historial en tiempo real
        const historyRef = collection(this.firestore, 'order_history');
        this.historySubscription = collectionData(historyRef, { idField: 'id' }).subscribe(
            (data) => {
                const history = (data as any[]).map(o => ({
                    ...o,
                    fecha_creacion: o.fecha_creacion?.toDate ? o.fecha_creacion.toDate() : new Date(o.fecha_creacion),
                    fecha_cierre: o.fecha_cierre?.toDate ? o.fecha_cierre.toDate() : (o.fecha_cierre ? new Date(o.fecha_cierre) : undefined)
                })) as Order[];
                this.orderHistory.set(history);
            }
        );
    }

    ngOnDestroy(): void {
        this.ordersSubscription?.unsubscribe();
        this.historySubscription?.unsubscribe();
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
        const linesToSend: OrderItem[] = this.newLines().map(line => ({
            ...line,
            enviado: true,
            agregado_por: currentUser?.id ?? 'desconocido',
            agregado_en: Date.now()
        }));
        const knownOrderId = this.getOrderByTable(tId)?.id;

        if (linesToSend.length === 0 && !knownOrderId) return false;

        const tableRef = doc(this.firestore, 'tables', tId);

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
                    const ref = doc(this.firestore, 'orders', id);
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
                        actualizado_en: Timestamp.now()
                    });
                    tx.update(tableRef, { estado: 'ocupada', id_orden_actual: orderRef.id });
                    return;
                }

                if (linesToSend.length === 0) throw new Error('No hay productos para crear la orden');

                const newOrderRef = doc(collection(this.firestore, 'orders'));
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
                    actualizado_en: Timestamp.now()
                });
                tx.update(tableRef, { estado: 'ocupada', id_orden_actual: newOrderRef.id });
            });

            // Limpiar carrito local solo si el servidor confirmó
            this.newLines.set([]);
            this.tableId.set(null);
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

    // Cerrar orden y procesar pago
    async closeOrder(orderId: string, method: 'efectivo' | 'transferencia'): Promise<boolean> {
        const order = this.activeOrders().find(o => o.id === orderId);
        if (!order) return false;

        try {
            // Crear el documento en order_history
            const closedOrder = {
                id_mesa: order.id_mesa,
                numero_mesa: order.numero_mesa,
                id_mesero: order.id_mesero,
                nombre_mesero: order.nombre_mesero,
                items: order.items,
                estado: 'pagada' as const,
                codigo_pago: order.codigo_pago,
                subtotal: order.subtotal,
                propina: 0,
                total: order.subtotal,
                metodo_pago: method,
                fecha_creacion: order.fecha_creacion instanceof Date ? Timestamp.fromDate(order.fecha_creacion) : order.fecha_creacion,
                fecha_cierre: Timestamp.now()
            };

            const historyRef = collection(this.firestore, 'order_history');
            await addDoc(historyRef, closedOrder);

            // Eliminar de órdenes activas
            const orderDoc = doc(this.firestore, 'orders', orderId);
            await deleteDoc(orderDoc);

            // Liberar la mesa
            await this.tableService.updateTableStatus(order.id_mesa, 'libre');

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
        const orderDoc = doc(this.firestore, 'orders', orderId);

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

    // Obtener historial completo para reportes de caja
    getOrderHistory(): Order[] {
        return this.orderHistory();
    }

    // Obtener TODAS las órdenes activas (para el cajero)
    readonly getAllActiveOrders = computed(() => {
        return this.activeOrders();
    });

    // 🔗 Unir Mesas — Fusionar órdenes de 2+ mesas en una cuenta unificada
    async mergeTables(tableIds: string[]): Promise<boolean> {
        if (tableIds.length < 2) return false;

        const ordersToMerge = tableIds
            .map(id => this.activeOrders().find(o => o.id_mesa === id))
            .filter((o): o is Order => o !== undefined);

        if (ordersToMerge.length < 2) return false;

        const primaryOrder = ordersToMerge[0];
        const mergedItems = ordersToMerge.flatMap(o => o.items);
        const mergedSubtotal = mergedItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

        try {
            // Actualizar la orden principal con todos los items
            const primaryDoc = doc(this.firestore, 'orders', primaryOrder.id);
            await updateDoc(primaryDoc, {
                items: mergedItems,
                subtotal: mergedSubtotal,
                total: mergedSubtotal
            });

            // Eliminar las órdenes secundarias y liberar sus mesas
            for (const order of ordersToMerge.slice(1)) {
                const orderDoc = doc(this.firestore, 'orders', order.id);
                await deleteDoc(orderDoc);
                await this.tableService.updateTableStatus(order.id_mesa, 'libre');
            }

            return true;
        } catch (error) {
            console.error('Error al fusionar mesas:', error);
            return false;
        }
    }

    // ✂️ Dividir Cuenta — Extraer items seleccionados a una nueva orden parcial
    async splitOrder(orderId: string, selectedItemIndices: number[]): Promise<Order | null> {
        const order = this.activeOrders().find(o => o.id === orderId);
        if (!order || selectedItemIndices.length === 0) return null;

        const splitItems = selectedItemIndices
            .sort((a, b) => b - a)
            .map(i => order.items[i])
            .filter(Boolean);

        if (splitItems.length === 0) return null;

        const remainingItems = order.items.filter((_, i) => !selectedItemIndices.includes(i));
        if (remainingItems.length === 0) return null;

        const splitSubtotal = splitItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
        const remainingSubtotal = remainingItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

        try {
            // Crear la orden parcial
            const splitOrderData = {
                id_mesa: order.id_mesa,
                numero_mesa: order.numero_mesa,
                id_mesero: order.id_mesero,
                nombre_mesero: order.nombre_mesero,
                items: splitItems,
                estado: 'en_caja' as const,
                codigo_pago: this.generatePaymentCode(),
                subtotal: splitSubtotal,
                propina: 0,
                total: splitSubtotal,
                fecha_creacion: order.fecha_creacion instanceof Date ? Timestamp.fromDate(order.fecha_creacion) : order.fecha_creacion
            };

            const ordersRef = collection(this.firestore, 'orders');
            const newDocRef = await addDoc(ordersRef, splitOrderData);

            // Actualizar la orden original
            const originalDoc = doc(this.firestore, 'orders', orderId);
            await updateDoc(originalDoc, {
                items: remainingItems,
                subtotal: remainingSubtotal,
                total: remainingSubtotal
            });

            return {
                ...splitOrderData,
                id: newDocRef.id,
                fecha_creacion: order.fecha_creacion
            } as Order;
        } catch (error) {
            console.error('Error al dividir orden:', error);
            return null;
        }
    }

    // 🛍️ Venta Directa (Para Llevar) — Sin mesa ni mesero asignado
    async createDirectSaleOrder(items: { product_id: string; nombre: string; precio: number; cantidad: number; notas?: string }[]): Promise<Order | null> {
        const orderItems = items.map(item => ({
            id_producto: item.product_id,
            nombre_producto: item.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            notas: item.notas || '',
            enviado: true
        }));

        const subtotal = orderItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

        const directOrderData = {
            id_mesa: 'para_llevar',
            numero_mesa: 0,
            id_mesero: 'caja',
            nombre_mesero: 'Venta Directa',
            items: orderItems,
            estado: 'en_caja' as const,
            codigo_pago: this.generatePaymentCode(),
            subtotal,
            propina: 0,
            total: subtotal,
            fecha_creacion: Timestamp.now()
        };

        try {
            const ordersRef = collection(this.firestore, 'orders');
            const docRef = await addDoc(ordersRef, directOrderData);

            return {
                ...directOrderData,
                id: docRef.id,
                fecha_creacion: new Date()
            } as Order;
        } catch (error) {
            console.error('Error al crear venta directa:', error);
            return null;
        }
    }

    // 🗑️ Borrar Todo el Historial (Cierre de Turno / Día)
    async clearOrderHistory(): Promise<boolean> {
        const history = this.orderHistory();
        if (history.length === 0) return true;

        try {
            const batch = writeBatch(this.firestore);
            history.forEach(order => {
                const orderDoc = doc(this.firestore, 'order_history', order.id!);
                batch.delete(orderDoc);
            });
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error al borrar historial de órdenes:', error);
            return false;
        }
    }
}

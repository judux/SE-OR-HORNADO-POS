import { Injectable, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import {
    Firestore, collection, collectionData, doc,
    addDoc, updateDoc, deleteDoc, setDoc, Timestamp, writeBatch
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Product, OrderItem, Order } from '../../shared/interfaces';
import { TableService } from './table.service';
import { AuthService } from '../auth/auth.service';
import { TenantService } from './tenant.service';

@Injectable({
    providedIn: 'root'
})
export class OrderService implements OnDestroy {
    // Estado del pedido actual (carrito del mesero — local, no en la nube)
    private currentItems = signal<OrderItem[]>([]);
    private tableId = signal<string | null>(null);

    // Lista de órdenes activas desde Firestore (tiempo real)
    private activeOrders = signal<Order[]>([]);

    // Historial de órdenes pagadas desde Firestore (tiempo real)
    private orderHistory = signal<Order[]>([]);

    private firestore = inject(Firestore);
    private tableService = inject(TableService);
    private authService = inject(AuthService);
    private tenant = inject(TenantService);

    private ordersSubscription?: Subscription;
    private historySubscription?: Subscription;

    // Señales derivadas (computed)
    readonly items = this.currentItems.asReadonly();
    readonly currentTable = this.tableId.asReadonly();

    readonly totalQuantity = computed(() => {
        return this.currentItems().reduce((sum, item) => sum + item.cantidad, 0);
    });

    readonly totalAmount = computed(() => {
        return this.currentItems().reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    });

    constructor() {
        // Re-suscribe a las órdenes e historial del restaurante activo cuando cambia el tenant.
        effect(() => {
            const id = this.tenant.restauranteId();
            this.ordersSubscription?.unsubscribe();
            this.historySubscription?.unsubscribe();

            if (!id) {
                this.activeOrders.set([]);
                this.orderHistory.set([]);
                return;
            }

            // Suscripción a órdenes activas en tiempo real
            const ordersRef = collection(this.firestore, `restaurants/${id}/orders`);
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
            const historyRef = collection(this.firestore, `restaurants/${id}/order_history`);
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
        }, { allowSignalWrites: true });
    }

    ngOnDestroy(): void {
        this.ordersSubscription?.unsubscribe();
        this.historySubscription?.unsubscribe();
    }

    // Establecer la mesa actual para el pedido
    setActiveTable(id: string | null): void {
        this.tableId.set(id);
        if (id === null) {
            this.clearCart();
        } else {
            // Cargar items de la orden existente si la hay
            const existingOrder = this.getOrderByTable(id);
            if (existingOrder) {
                // Marcar items existentes como enviados (candado 🔒)
                this.currentItems.set(
                    existingOrder.items.map(item => ({ ...item, enviado: true }))
                );
            } else {
                this.clearCart();
            }
        }
    }

    addToCart(product: Product, note: string = ''): void {
        this.currentItems.update(items => {
            const existingItemIndex = items.findIndex(
                item => item.id_producto === product.id && item.notas === note
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...items];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    cantidad: updatedItems[existingItemIndex].cantidad + 1
                };
                return updatedItems;
            }

            const newItem: OrderItem = {
                id_producto: product.id,
                nombre_producto: product.nombre,
                cantidad: 1,
                precio_unitario: product.precio,
                notas: note
            };

            return [...items, newItem];
        });
    }

    updateQuantity(index: number, delta: number): void {
        this.currentItems.update(items => {
            // 🔒 No permitir modificar items ya enviados
            if (items[index]?.enviado) return items;

            const updatedItems = [...items];
            const newQuantity = updatedItems[index].cantidad + delta;

            if (newQuantity <= 0) {
                return updatedItems.filter((_, i) => i !== index);
            }

            updatedItems[index] = { ...updatedItems[index], cantidad: newQuantity };
            return updatedItems;
        });
    }

    removeItem(index: number): void {
        this.currentItems.update(items => {
            if (items[index]?.enviado) return items;
            return items.filter((_, i) => i !== index);
        });
    }

    clearCart(): void {
        this.currentItems.set([]);
    }

    // Guardar orden (Nueva o Actualización) con su estado — ahora en Firestore
    async saveOrder(estadoFinal: 'pendiente' | 'en_caja'): Promise<boolean> {
        const tId = this.tableId();
        if (this.currentItems().length === 0 || !tId) return false;

        // Marcar TODOS los items como enviados al guardar
        const itemsToSave = this.currentItems().map(item => ({ ...item, enviado: true }));
        const totalAmount = itemsToSave.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

        const existingOrder = this.activeOrders().find(o => o.id_mesa === tId);

        try {
            if (existingOrder) {
                // Actualizar orden existente en Firestore
                const orderDoc = doc(this.firestore, this.tenant.path('orders'),existingOrder.id);
                await updateDoc(orderDoc, {
                    items: itemsToSave,
                    estado: estadoFinal,
                    subtotal: totalAmount,
                    total: totalAmount
                });
            } else {
                // Crear nueva orden en Firestore
                const currentUser = this.authService.user();
                const codigoPago = this.generatePaymentCode();
                const newOrder = {
                    id_mesa: tId,
                    numero_mesa: Number(tId.replace('mesa_', '')),
                    id_mesero: currentUser?.id ?? '1',
                    nombre_mesero: currentUser?.nombre ?? 'Desconocido',
                    items: itemsToSave,
                    estado: estadoFinal,
                    codigo_pago: codigoPago,
                    subtotal: totalAmount,
                    propina: 0,
                    total: totalAmount,
                    fecha_creacion: Timestamp.now()
                };
                const ordersRef = collection(this.firestore, this.tenant.path('orders'));
                await addDoc(ordersRef, newOrder);
            }

            // Marcar la mesa como ocupada
            await this.tableService.updateTableStatus(tId, 'ocupada');

            // Limpiar carrito local
            this.clearCart();
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

            const historyRef = collection(this.firestore, this.tenant.path('order_history'));
            await addDoc(historyRef, closedOrder);

            // Eliminar de órdenes activas
            const orderDoc = doc(this.firestore, this.tenant.path('orders'),orderId);
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
    async removeItemFromOrder(orderId: string, itemIndex: number): Promise<boolean> {
        const order = this.activeOrders().find(o => o.id === orderId);
        if (!order || itemIndex < 0 || itemIndex >= order.items.length) return false;

        try {
            const newItems = order.items.filter((_, i) => i !== itemIndex);
            const newSubtotal = newItems.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

            const orderDoc = doc(this.firestore, this.tenant.path('orders'),orderId);
            await updateDoc(orderDoc, {
                items: newItems,
                subtotal: newSubtotal,
                total: newSubtotal
            });
            return true;
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
            const primaryDoc = doc(this.firestore, this.tenant.path('orders'),primaryOrder.id);
            await updateDoc(primaryDoc, {
                items: mergedItems,
                subtotal: mergedSubtotal,
                total: mergedSubtotal
            });

            // Eliminar las órdenes secundarias y liberar sus mesas
            for (const order of ordersToMerge.slice(1)) {
                const orderDoc = doc(this.firestore, this.tenant.path('orders'),order.id);
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

            const ordersRef = collection(this.firestore, this.tenant.path('orders'));
            const newDocRef = await addDoc(ordersRef, splitOrderData);

            // Actualizar la orden original
            const originalDoc = doc(this.firestore, this.tenant.path('orders'),orderId);
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
            const ordersRef = collection(this.firestore, this.tenant.path('orders'));
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
                const orderDoc = doc(this.firestore, this.tenant.path('order_history'),order.id!);
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

import { Injectable, inject, computed, Injector } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
    Firestore, collection, collectionData, doc, docData, query, where, orderBy,
    Timestamp, writeBatch
} from '@angular/fire/firestore';
import { Observable, map, of, switchMap } from 'rxjs';
import { Order } from '../../shared/interfaces';
import { AuthService } from '../auth/auth.service';
import { TenantService } from '../tenant/tenant.service';
import { countItems } from './order.logic';

export interface Expense {
    id: string;
    motivo: string;
    monto: number;
    fecha: Date;
}

export interface ShiftSummary {
    inicio: Date;
    fin: Date;
    total_ventas: number;
    num_ventas: number;
    total_efectivo: number;
    total_transferencia: number;
    total_gastos: number;
    efectivo_esperado: number;
    productos: { nombre: string; cantidad: number }[];
}

function toDate(value: any): Date | undefined {
    if (!value) return undefined;
    return value.toDate ? value.toDate() : new Date(value);
}

export function toOrder(raw: any): Order {
    return {
        ...raw,
        fecha_creacion: toDate(raw.fecha_creacion) ?? new Date(0),
        fecha_cierre: toDate(raw.fecha_cierre),
        actualizado_en: toDate(raw.actualizado_en),
        enviado_en: toDate(raw.enviado_en)
    } as Order;
}

/**
 * Turnos de caja SIN borrado de datos.
 * - config/turno_actual guarda cuándo empezó el turno.
 * - La caja solo escucha ventas y gastos desde ese momento (menos lecturas y nada se borra).
 * - Cerrar el turno archiva un resumen en shifts/ y mueve el inicio del turno.
 *
 * Solo lo inyectan caja y admin: los celulares de los meseros nunca descargan el historial.
 */
@Injectable({
    providedIn: 'root'
})
export class ShiftService {
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private injector = inject(Injector);
    private tenant = inject(TenantService);

    // Inicio del turno del restaurante activo. Si aún no existe el documento, el turno abarca
    // todo el historial (no se oculta nada). Sin restaurante activo: null.
    readonly turnoInicio = toSignal(
        this.tenant.watch(
            rid => docData(doc(this.firestore, 'restaurants', rid, 'config', 'turno_actual')).pipe(
                map((data): Date | null => toDate((data as any)?.inicio) ?? new Date(0))
            ),
            null as Date | null
        ),
        { initialValue: null as Date | null }
    );

    readonly shiftSales = toSignal(
        toObservable(this.turnoInicio, { injector: this.injector }).pipe(
            switchMap(inicio => inicio ? this.salesSince(inicio) : of([] as Order[]))
        ),
        { initialValue: [] as Order[] }
    );

    readonly shiftExpenses = toSignal(
        toObservable(this.turnoInicio, { injector: this.injector }).pipe(
            switchMap(inicio => {
                if (!inicio) return of([] as Expense[]);
                const q = query(this.tenant.col('expenses'), where('fecha', '>=', Timestamp.fromDate(inicio)));
                return collectionData(q, { idField: 'id' }).pipe(
                    map(list => (list as any[]).map(e => ({ ...e, fecha: toDate(e.fecha) ?? new Date(0) }) as Expense))
                );
            })
        ),
        { initialValue: [] as Expense[] }
    );

    readonly totalExpenses = computed(() => this.shiftExpenses().reduce((sum, e) => sum + e.monto, 0));

    /** Ventas cobradas desde una fecha (para el turno o los reportes del admin). */
    salesSince(since: Date): Observable<Order[]> {
        const q = query(
            this.tenant.col('order_history'),
            where('fecha_cierre', '>=', Timestamp.fromDate(since)),
            orderBy('fecha_cierre', 'desc')
        );
        return collectionData(q, { idField: 'id' }).pipe(map(list => (list as any[]).map(toOrder)));
    }

    /** Resumen del turno actual (lo que se imprime y se archiva al cerrar). */
    buildSummary(): ShiftSummary {
        const sales = this.shiftSales();
        let total_efectivo = 0;
        let total_transferencia = 0;
        const productos = new Map<string, number>();
        for (const sale of sales) {
            if (sale.metodo_pago === 'efectivo') total_efectivo += sale.total;
            else if (sale.metodo_pago === 'transferencia') total_transferencia += sale.total;
            for (const item of sale.items) {
                productos.set(item.nombre_producto, (productos.get(item.nombre_producto) ?? 0) + item.cantidad);
            }
        }
        const total_gastos = this.totalExpenses();
        return {
            inicio: this.turnoInicio() ?? new Date(0),
            fin: new Date(),
            total_ventas: total_efectivo + total_transferencia,
            num_ventas: sales.length,
            total_efectivo,
            total_transferencia,
            total_gastos,
            efectivo_esperado: total_efectivo - total_gastos,
            productos: Array.from(productos.entries())
                .map(([nombre, cantidad]) => ({ nombre, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad)
        };
    }

    /**
     * Cierra el turno: archiva el resumen en shifts/ y abre uno nuevo desde ahora.
     * No borra ventas ni gastos.
     */
    async closeShift(): Promise<ShiftSummary | null> {
        const summary = this.buildSummary();
        const user = this.authService.user();
        const batch = writeBatch(this.firestore);
        const shiftRef = this.tenant.newDocRef('shifts');
        const now = Timestamp.now();

        batch.set(shiftRef, {
            ...summary,
            inicio: Timestamp.fromDate(summary.inicio),
            fin: now,
            ids_ventas: this.shiftSales().map(s => s.id),
            unidades_vendidas: this.shiftSales().reduce((sum: number, s) => sum + countItems(s.items), 0),
            cerrado_por: user?.id ?? 'desconocido',
            nombre_cerrado_por: user?.nombre ?? 'Desconocido'
        });
        batch.set(this.tenant.docRef('config', 'turno_actual'), { inicio: now, abierto_por: user?.id ?? 'desconocido' });

        try {
            await batch.commit();
            return summary;
        } catch (error) {
            console.error('Error al cerrar turno:', error);
            return null;
        }
    }
}

import { Injectable, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import {
    Firestore, collection, collectionData, doc,
    addDoc, deleteDoc, getDocs, writeBatch, Timestamp
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { TenantService } from './tenant.service';

export interface Expense {
    id: string;
    motivo: string;
    monto: number;
    fecha: Date;
}

@Injectable({
    providedIn: 'root'
})
export class PettyCashService implements OnDestroy {
    private firestore = inject(Firestore);
    private tenant = inject(TenantService);
    private expenses = signal<Expense[]>([]);
    private subscription?: Subscription;

    readonly allExpenses = this.expenses.asReadonly();

    readonly totalExpenses = computed(() =>
        this.expenses().reduce((sum, exp) => sum + exp.monto, 0)
    );

    constructor() {
        effect(() => {
            const id = this.tenant.restauranteId();
            this.subscription?.unsubscribe();

            if (!id) {
                this.expenses.set([]);
                return;
            }

            const expensesRef = collection(this.firestore, `restaurants/${id}/expenses`);
            this.subscription = collectionData(expensesRef, { idField: 'id' }).subscribe(
                (data) => {
                    const expenses = (data as any[]).map(e => ({
                        ...e,
                        fecha: e.fecha?.toDate ? e.fecha.toDate() : new Date(e.fecha)
                    })) as Expense[];
                    this.expenses.set(expenses);
                }
            );
        }, { allowSignalWrites: true });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    async addExpense(motivo: string, monto: number): Promise<boolean> {
        if (!motivo.trim() || monto <= 0) return false;

        try {
            const expensesRef = collection(this.firestore, this.tenant.path('expenses'));
            await addDoc(expensesRef, {
                motivo: motivo.trim(),
                monto,
                fecha: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error('Error al agregar gasto:', error);
            return false;
        }
    }

    async removeExpense(id: string): Promise<void> {
        try {
            const expenseDoc = doc(this.firestore, this.tenant.path('expenses'), id);
            await deleteDoc(expenseDoc);
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
        }
    }

    // Resetear al cierre de turno — borra todos los docs de expenses
    async clearExpenses(): Promise<void> {
        try {
            const expensesRef = collection(this.firestore, this.tenant.path('expenses'));
            const snapshot = await getDocs(expensesRef);
            const batch = writeBatch(this.firestore);
            snapshot.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
        } catch (error) {
            console.error('Error al limpiar gastos:', error);
        }
    }
}

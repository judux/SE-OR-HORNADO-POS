import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, deleteDoc, Timestamp } from '@angular/fire/firestore';
import { TenantService } from '../tenant/tenant.service';
import { ShiftService } from './shift.service';
import { AuthService } from '../auth/auth.service';

export type { Expense } from './shift.service';

@Injectable({
    providedIn: 'root'
})
export class PettyCashService {
    private firestore = inject(Firestore);
    private tenant = inject(TenantService);
    private shiftService = inject(ShiftService);
    private authService = inject(AuthService);

    // Solo los gastos del turno actual (los anteriores quedan archivados, no se borran)
    readonly allExpenses = this.shiftService.shiftExpenses;
    readonly totalExpenses = this.shiftService.totalExpenses;

    async addExpense(motivo: string, monto: number): Promise<boolean> {
        if (!motivo.trim() || monto <= 0) return false;

        try {
            const expensesRef = this.tenant.col('expenses');
            await addDoc(expensesRef, {
                motivo: motivo.trim(),
                monto,
                fecha: Timestamp.now(),
                registrado_por: this.authService.user()?.id ?? 'desconocido'
            });
            return true;
        } catch (error) {
            console.error('Error al agregar gasto:', error);
            return false;
        }
    }

    // Permite corregir un gasto mal registrado dentro del turno
    async removeExpense(id: string): Promise<void> {
        try {
            const expenseDoc = this.tenant.docRef('expenses', id);
            await deleteDoc(expenseDoc);
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
        }
    }
}

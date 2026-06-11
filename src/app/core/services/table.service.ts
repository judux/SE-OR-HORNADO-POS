import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import {
    Firestore, collection, collectionData, doc, updateDoc, deleteDoc, setDoc
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Table } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class TableService implements OnDestroy {
    private firestore = inject(Firestore);
    private tables = signal<Table[]>([]);
    private subscription: Subscription;

    readonly allTables = this.tables.asReadonly();

    constructor() {
        const tablesRef = collection(this.firestore, 'tables');
        this.subscription = collectionData(tablesRef, { idField: 'id' }).subscribe(
            (data) => {
                // Ordenar por numero_mesa para mantener el orden visual
                const sorted = (data as Table[]).sort((a, b) => a.numero_mesa - b.numero_mesa);
                this.tables.set(sorted);
            }
        );
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    getTableById(id: string): Table | undefined {
        return this.tables().find(t => t.id === id);
    }

    async updateTableStatus(id: string, estado: Table['estado']): Promise<void> {
        try {
            const tableDoc = doc(this.firestore, 'tables', id);
            await updateDoc(tableDoc, { estado });
        } catch (error) {
            console.error('Error al actualizar estado de mesa:', error);
        }
    }

    getTablesByStatus(estado: Table['estado']): Table[] {
        return this.tables().filter(t => t.estado === estado);
    }

    async addTable(capacidad: number): Promise<boolean> {
        try {
            // Obtener el número de mesa más alto actual
            const currentTables = this.tables();
            let maxNumber = 0;
            if (currentTables.length > 0) {
                maxNumber = Math.max(...currentTables.map(t => t.numero_mesa));
            }

            const nextNumber = maxNumber + 1;
            const tableId = `mesa_${nextNumber}`;

            const newTable: Table = {
                id: tableId,
                numero_mesa: nextNumber,
                capacidad: capacidad,
                estado: 'libre'
            };

            const tableDoc = doc(this.firestore, 'tables', tableId);
            await setDoc(tableDoc, newTable);
            return true;
        } catch (error) {
            console.error('Error al agregar mesa:', error);
            return false;
        }
    }

    async deleteTable(id: string): Promise<boolean> {
        try {
            const tableDoc = doc(this.firestore, 'tables', id);
            await deleteDoc(tableDoc);
            return true;
        } catch (error) {
            console.error('Error al eliminar mesa:', error);
            return false;
        }
    }
}

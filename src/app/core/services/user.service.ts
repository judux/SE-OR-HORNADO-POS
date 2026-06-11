import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import {
    Firestore, collection, collectionData, doc,
    addDoc, updateDoc, deleteDoc, query, where, getDocs
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { User } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class UserService implements OnDestroy {
    private firestore = inject(Firestore);
    private users = signal<User[]>([]);
    private subscription: Subscription;

    readonly allUsers = this.users.asReadonly();

    constructor() {
        const usersRef = collection(this.firestore, 'users');
        this.subscription = collectionData(usersRef, { idField: 'id' }).subscribe(
            (data) => {
                this.users.set(data as User[]);
            }
        );
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    getUserById(id: string): User | undefined {
        return this.users().find(u => u.id === id);
    }

    async addUser(user: Omit<User, 'id'>): Promise<boolean> {
        // Verificar que el PIN no esté en uso
        if (this.users().some(u => u.pin_acceso === user.pin_acceso)) {
            return false;
        }
        try {
            const usersRef = collection(this.firestore, 'users');
            await addDoc(usersRef, user);
            return true;
        } catch (error) {
            console.error('Error al agregar usuario:', error);
            return false;
        }
    }

    async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
        // Si se cambia el PIN, verificar que no esté en uso
        if (updates.pin_acceso) {
            const existing = this.users().find(u => u.pin_acceso === updates.pin_acceso && u.id !== id);
            if (existing) return false;
        }
        try {
            const userDoc = doc(this.firestore, 'users', id);
            await updateDoc(userDoc, { ...updates });
            return true;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return false;
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            const userDoc = doc(this.firestore, 'users', id);
            await deleteDoc(userDoc);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    }

    async toggleActivo(id: string): Promise<void> {
        const user = this.users().find(u => u.id === id);
        if (user) {
            const userDoc = doc(this.firestore, 'users', id);
            await updateDoc(userDoc, { activo: !user.activo });
        }
    }

    getRolLabel(rol: string): string {
        const labels: Record<string, string> = {
            'admin': '👑 Admin',
            'mesero': '📋 Mesero',
            'cajero': '💰 Cajero',
        };
        return labels[rol] || rol;
    }
}

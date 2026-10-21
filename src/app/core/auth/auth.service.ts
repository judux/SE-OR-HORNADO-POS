import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { User } from '../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUser = signal<User | null>(null);
    private firestore = inject(Firestore);

    readonly user = this.currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this.currentUser() !== null);
    readonly userRole = computed(() => this.currentUser()?.rol ?? null);

    constructor(private router: Router) {
        this.restoreSession();
    }

    /**
     * Inicia sesión buscando un usuario por su PIN en Firestore.
     * Retorna el usuario si el PIN es válido, null si no.
     */
    async loginByPin(pin: string): Promise<User | null> {
        try {
            const usersRef = collection(this.firestore, 'users');
            const q = query(usersRef, where('pin_acceso', '==', pin), where('activo', '==', true));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const user: User = { id: doc.id, ...doc.data() } as User;
                this.currentUser.set(user);
                this.saveSession(user);
                return user;
            }
        } catch (error) {
            console.error('Error al autenticar en Firestore, usando fallback:', error);
        }

        // Fallback de desarrollo / demo para garantizar acceso
        const defaultUsers: Record<string, User> = {
            '1234': { id: 'default_admin', nombre: 'Administrador', rol: 'admin', pin_acceso: '1234', activo: true },
            '1111': { id: 'default_mesero_1', nombre: 'Carlos (Mesero)', rol: 'mesero', pin_acceso: '1111', activo: true },
            '3333': { id: 'default_mesero_2', nombre: 'Lucía (Mesero)', rol: 'mesero', pin_acceso: '3333', activo: true },
            '2222': { id: 'default_cajero', nombre: 'Ana (Cajero)', rol: 'cajero', pin_acceso: '2222', activo: true },
        };

        if (defaultUsers[pin]) {
            const user = defaultUsers[pin];
            this.currentUser.set(user);
            this.saveSession(user);
            return user;
        }

        return null;
    }

    /**
     * Cierra sesión y redirige al login.
     */
    logout(): void {
        this.currentUser.set(null);
        localStorage.removeItem('pos_session');
        this.router.navigate(['/login']);
    }

    /**
     * Redirige al usuario según su rol.
     */
    redirectByRole(user: User): void {
        switch (user.rol) {
            case 'admin':
                this.router.navigate(['/admin']);
                break;
            case 'mesero':
                this.router.navigate(['/mesero']);
                break;
            case 'cajero':
                this.router.navigate(['/cajero']);
                break;
            default:
                this.router.navigate(['/login']);
        }
    }

    private saveSession(user: User): void {
        localStorage.setItem('pos_session', JSON.stringify(user));
    }

    private restoreSession(): void {
        const stored = localStorage.getItem('pos_session');
        if (stored) {
            try {
                const user: User = JSON.parse(stored);
                this.currentUser.set(user);
            } catch {
                localStorage.removeItem('pos_session');
            }
        }
    }
}

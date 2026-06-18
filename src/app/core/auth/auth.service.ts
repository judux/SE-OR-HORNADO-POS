import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { User } from '../../shared/interfaces';
import { TenantService } from '../services/tenant.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUser = signal<User | null>(null);
    private firestore = inject(Firestore);
    private tenant = inject(TenantService);

    readonly user = this.currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this.currentUser() !== null);
    readonly userRole = computed(() => this.currentUser()?.rol ?? null);

    constructor(private router: Router) {
        this.restoreSession();
    }

    /**
     * Inicia sesión buscando un usuario por su PIN dentro del restaurante activo.
     * Requiere que el tenant ya esté seleccionado (TenantService.setTenant).
     * Retorna el usuario si el PIN es válido, null si no.
     */
    async loginByPin(pin: string): Promise<User | null> {
        try {
            if (!this.tenant.isActive()) {
                console.error('loginByPin: no hay restaurante seleccionado.');
                return null;
            }

            const usersRef = collection(this.firestore, this.tenant.path('users'));
            const q = query(usersRef, where('pin_acceso', '==', pin), where('activo', '==', true));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            const user: User = { id: doc.id, ...doc.data() } as User;

            this.currentUser.set(user);
            this.saveSession(user);
            return user;
        } catch (error) {
            console.error('Error al autenticar:', error);
            return null;
        }
    }

    /**
     * Cierra sesión y redirige al login.
     */
    logout(): void {
        this.currentUser.set(null);
        localStorage.removeItem('pos_session');
        this.tenant.clearTenant();
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

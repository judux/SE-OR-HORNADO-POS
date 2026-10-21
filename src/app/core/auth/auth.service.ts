import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { query, where, getDocs, updateDoc } from '@angular/fire/firestore';
import { User } from '../../shared/interfaces';
import { TenantService } from '../tenant/tenant.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUser = signal<User | null>(null);
    private tenant = inject(TenantService);

    readonly user = this.currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this.currentUser() !== null);
    readonly userRole = computed(() => this.currentUser()?.rol ?? null);

    constructor(private router: Router) {
        this.restoreSession();
    }

    /**
     * Inicia sesión buscando un usuario por su PIN dentro del restaurante de este equipo.
     * Retorna el usuario si el PIN es válido y está activo, null si no.
     * Si Firestore no responde, el error se propaga: nunca se concede acceso sin validar el PIN.
     */
    async loginByPin(pin: string): Promise<User | null> {
        const rid = this.tenant.activeRid();
        if (!rid) throw new Error('Este equipo no tiene un restaurante activo');

        // Se filtra solo por PIN y el estado 'activo' se revisa aquí (no depende de índices compuestos)
        const snapshot = await getDocs(query(this.tenant.col('users'), where('pin_acceso', '==', pin.trim())));
        const match = snapshot.docs.find(d => d.data()['activo'] !== false);
        if (!match) return null;

        const user: User = { id: match.id, ...match.data(), rid } as User;
        this.currentUser.set(user);
        this.saveSession(user);
        return user;
    }

    /**
     * Si la cuenta de Google de este equipo es un administrador que aún no eligió su PIN
     * (recién aprobado, o se lo restablecieron), devuelve ese usuario.
     */
    async pendingPinSetup(): Promise<User | null> {
        const fbUser = this.tenant.currentUser();
        if (!fbUser || fbUser.isAnonymous || !this.tenant.activeRid()) return null;
        const snapshot = await getDocs(query(this.tenant.col('users'), where('google_uid', '==', fbUser.uid)));
        const pending = snapshot.docs.find(d => d.data()['pin_pendiente'] === true && d.data()['activo'] !== false);
        return pending ? ({ id: pending.id, ...pending.data() } as User) : null;
    }

    /** El administrador elige su propio PIN (único dentro del restaurante). */
    async setOwnPin(userId: string, pin: string): Promise<'ok' | 'taken' | 'invalid'> {
        if (!/^\d{4}$/.test(pin)) return 'invalid';
        const taken = await getDocs(query(this.tenant.col('users'), where('pin_acceso', '==', pin)));
        if (taken.docs.some(d => d.id !== userId)) return 'taken';
        await updateDoc(this.tenant.docRef('users', userId), { pin_acceso: pin, pin_pendiente: false });
        return 'ok';
    }

    /** La sesión del empleado solo vale en el restaurante donde inició sesión. */
    belongsToActiveRestaurant(): boolean {
        const user = this.currentUser();
        return !!user && !!user.rid && user.rid === this.tenant.activeRid();
    }

    /** Borra la sesión del empleado sin navegar (cuando cambia el restaurante del equipo). */
    clearSession(): void {
        this.currentUser.set(null);
        localStorage.removeItem('pos_session');
    }

    /**
     * Cierra sesión y redirige al login.
     */
    logout(): void {
        this.clearSession();
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
        // El PIN no se guarda en el navegador
        const { pin_acceso, ...sessionData } = user;
        localStorage.setItem('pos_session', JSON.stringify(sessionData));
    }

    private restoreSession(): void {
        const stored = localStorage.getItem('pos_session');
        if (stored) {
            try {
                const user: User = JSON.parse(stored);
                // Descartar sesiones antiguas: demo ('default_*') o sin restaurante (versión anterior)
                if (!user?.id || user.id.startsWith('default_') || !user.rid) {
                    localStorage.removeItem('pos_session');
                    return;
                }
                this.currentUser.set(user);
            } catch {
                localStorage.removeItem('pos_session');
            }
        }
    }
}

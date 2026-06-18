import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
    Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { SuperAdmin } from '../../shared/interfaces';

/**
 * Autenticación del super admin (dueño de la plataforma SaaS).
 *
 * A diferencia del login por PIN de los empleados, el super admin usa
 * Firebase Auth (email + password) por su nivel de privilegio: puede ver
 * y administrar TODOS los restaurantes del sistema.
 *
 * Un usuario solo es super admin si existe un documento en la colección
 * `super_admins/{uid}`. Estar autenticado en Firebase Auth no basta.
 */
@Injectable({
    providedIn: 'root'
})
export class SuperAdminService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);
    private router = inject(Router);

    private current = signal<SuperAdmin | null>(null);
    readonly superAdmin = this.current.asReadonly();
    readonly isLoggedIn = computed(() => this.current() !== null);

    constructor() {
        // Restaura la sesión de Firebase Auth al recargar la página
        onAuthStateChanged(this.auth, async (fbUser) => {
            if (fbUser) {
                const sa = await this.loadSuperAdmin(fbUser);
                this.current.set(sa);
            } else {
                this.current.set(null);
            }
        });
    }

    /**
     * Resuelve la sesión esperando a que Firebase Auth restaure el estado
     * y cargue el documento de super admin. Lo usa el guard en cada navegación
     * para no rechazar al usuario durante un refresh de página.
     */
    async resolveSession(): Promise<SuperAdmin | null> {
        const fbUser = await new Promise<FirebaseUser | null>((resolve) => {
            const unsub = onAuthStateChanged(this.auth, (u) => {
                unsub();
                resolve(u);
            });
        });

        if (!fbUser) {
            this.current.set(null);
            return null;
        }

        const sa = await this.loadSuperAdmin(fbUser);
        this.current.set(sa);
        return sa;
    }

    async login(email: string, password: string): Promise<SuperAdmin | null> {
        try {
            const cred = await signInWithEmailAndPassword(this.auth, email, password);
            const sa = await this.loadSuperAdmin(cred.user);
            if (!sa) {
                // Autenticó en Firebase pero no es super admin -> cerrar sesión
                await signOut(this.auth);
                return null;
            }
            this.current.set(sa);
            return sa;
        } catch (error) {
            console.error('Error de autenticación super admin:', error);
            return null;
        }
    }

    async logout(): Promise<void> {
        await signOut(this.auth);
        this.current.set(null);
        this.router.navigate(['/super-admin/login']);
    }

    /** Verifica el rol consultando super_admins/{uid} en Firestore. */
    private async loadSuperAdmin(fbUser: FirebaseUser): Promise<SuperAdmin | null> {
        try {
            const ref = doc(this.firestore, 'super_admins', fbUser.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                return null;
            }
            const data = snap.data();
            return {
                id: fbUser.uid,
                email: fbUser.email ?? '',
                nombre: data['nombre'] ?? 'Super Admin',
            };
        } catch (error) {
            console.error('Error al verificar super admin:', error);
            return null;
        }
    }
}

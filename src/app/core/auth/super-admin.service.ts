import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
    Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
    signOut, onAuthStateChanged, User as FirebaseUser
} from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { SuperAdmin } from '../../shared/interfaces';

/**
 * Autenticación del super admin (dueño de la plataforma SaaS).
 *
 * A diferencia del login por PIN de los empleados, el super admin usa
 * Firebase Auth (Google o email+password) por su nivel de privilegio:
 * puede ver y administrar TODOS los restaurantes del sistema.
 *
 * Un usuario solo es super admin si existe un documento en `super_admins`
 * cuyo campo `email` coincide con su correo. Estar autenticado no basta.
 * (Se verifica por correo y no por UID para que funcione con cualquier
 *  proveedor: Google y email/contraseña dan UIDs distintos al mismo correo.)
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
            this.current.set(fbUser ? await this.loadSuperAdmin(fbUser) : null);
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

        const sa = fbUser ? await this.loadSuperAdmin(fbUser) : null;
        this.current.set(sa);
        return sa;
    }

    async login(email: string, password: string): Promise<SuperAdmin | null> {
        try {
            const cred = await signInWithEmailAndPassword(this.auth, email, password);
            return await this.finishLogin(cred.user);
        } catch (error) {
            console.error('Error de autenticación super admin:', error);
            return null;
        }
    }

    async loginWithGoogle(): Promise<SuperAdmin | null> {
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(this.auth, provider);
            return await this.finishLogin(cred.user);
        } catch (error) {
            console.error('Error de autenticación super admin con Google:', error);
            return null;
        }
    }

    async logout(): Promise<void> {
        await signOut(this.auth);
        this.current.set(null);
        this.router.navigate(['/super-admin/login']);
    }

    /** Verifica permisos tras autenticar; cierra sesión si no es super admin. */
    private async finishLogin(fbUser: FirebaseUser): Promise<SuperAdmin | null> {
        const sa = await this.loadSuperAdmin(fbUser);
        if (!sa) {
            // Autenticó en Firebase pero no es super admin -> cerrar sesión
            await signOut(this.auth);
            return null;
        }
        this.current.set(sa);
        return sa;
    }

    /**
     * Verifica el rol. Primero busca un doc en super_admins cuyo campo `email`
     * coincida con el correo del usuario; como respaldo, busca super_admins/{uid}.
     */
    private async loadSuperAdmin(fbUser: FirebaseUser): Promise<SuperAdmin | null> {
        try {
            // 1) Buscar por correo (funciona con cualquier proveedor)
            if (fbUser.email) {
                const ref = collection(this.firestore, 'super_admins');
                const q = query(ref, where('email', '==', fbUser.email));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    return {
                        id: fbUser.uid,
                        email: fbUser.email,
                        nombre: data['nombre'] ?? 'Super Admin',
                    };
                }
            }

            // 2) Respaldo: doc con ID = uid (compatibilidad con la config anterior)
            const docRef = doc(this.firestore, 'super_admins', fbUser.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                return {
                    id: fbUser.uid,
                    email: fbUser.email ?? '',
                    nombre: snap.data()['nombre'] ?? 'Super Admin',
                };
            }

            return null;
        } catch (error) {
            console.error('Error al verificar super admin:', error);
            return null;
        }
    }
}

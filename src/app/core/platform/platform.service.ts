import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import {
    Firestore, collection, collectionData, doc, getDocs, query, orderBy, where,
    writeBatch, updateDoc, setDoc, Timestamp
} from '@angular/fire/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import {
    getAuth as getRawAuth, connectAuthEmulator as connectRawAuthEmulator,
    createUserWithEmailAndPassword as createRawUser, signOut as rawSignOut
} from 'firebase/auth';
import { Observable, map } from 'rxjs';
import { Restaurant } from '../../shared/interfaces';
import { environment } from '../../../environments/environment';
import { TenantService } from '../tenant/tenant.service';

export interface NewRestaurantInput {
    nombre: string;
    cuentaEmail: string;
    cuentaPassword: string;
    adminNombre: string;
    adminPin: string;
    copiarLegado: boolean;
}

export class PlatformError extends Error { }

/** Convierte "Señor Hornado" en "senor-hornado" (para el id del restaurante). */
export function slugify(text: string): string {
    return text
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        .slice(0, 30) || 'restaurante';
}

export function isValidPin(pin: string): boolean {
    return /^\d{4}$/.test(pin);
}

/**
 * Administración de la plataforma (solo el dueño de la plataforma).
 * Todo se hace desde la app: no hace falta entrar a la consola de Firebase.
 */
@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);
    private tenant = inject(TenantService);

    restaurants$(): Observable<Restaurant[]> {
        const q = query(collection(this.firestore, 'restaurants'), orderBy('creado_en', 'desc'));
        return collectionData(q, { idField: 'id' }).pipe(map(list => list as Restaurant[]));
    }

    /**
     * Crea la cuenta del dueño de la plataforma. Solo funciona UNA vez:
     * las reglas rechazan el reclamo si ya existe platform/owner.
     */
    async claimPlatform(nombre: string, email: string, password: string): Promise<void> {
        const cred = await createUserWithEmailAndPassword(this.auth, email.trim(), password);
        const uid = cred.user.uid;
        const batch = writeBatch(this.firestore);
        batch.set(doc(this.firestore, 'platform_admins', uid), { email: email.trim(), nombre: nombre.trim(), creado_en: Timestamp.now() });
        batch.set(doc(this.firestore, 'platform', 'owner'), { uid, email: email.trim(), creado_en: Timestamp.now() });
        try {
            await batch.commit();
        } catch (error) {
            // La plataforma ya tenía dueño: se borra la cuenta recién creada para no dejarla huérfana
            await cred.user.delete().catch(() => { });
            throw new PlatformError('Esta plataforma ya tiene dueño. Inicia sesión con esa cuenta.');
        }
        await this.tenant.refresh();
    }

    /** Cantidad de productos y mesas de la versión anterior (de un solo restaurante), para migrarlos. */
    async legacyCounts(): Promise<{ productos: number; mesas: number }> {
        try {
            const [p, t] = await Promise.all([
                getDocs(collection(this.firestore, 'products')),
                getDocs(collection(this.firestore, 'tables'))
            ]);
            return { productos: p.size, mesas: t.size };
        } catch {
            return { productos: 0, mesas: 0 };
        }
    }

    /**
     * Crea un restaurante completo:
     * 1. La cuenta del restaurante en Firebase Auth (en una instancia aparte, para no cerrar tu sesión).
     * 2. En un solo batch: el restaurante, el vínculo cuenta→restaurante, su primer admin y el turno inicial.
     * 3. Opcional: copia el menú y las mesas de la versión anterior.
     */
    async createRestaurant(input: NewRestaurantInput): Promise<string> {
        const nombre = input.nombre.trim();
        const email = input.cuentaEmail.trim().toLowerCase();
        if (!nombre) throw new PlatformError('Escribe el nombre del restaurante.');
        if (!email.includes('@')) throw new PlatformError('El correo de la cuenta no es válido.');
        if (input.cuentaPassword.length < 8) throw new PlatformError('La contraseña debe tener al menos 8 caracteres.');
        if (!input.adminNombre.trim()) throw new PlatformError('Escribe el nombre del administrador.');
        if (!isValidPin(input.adminPin)) throw new PlatformError('El PIN debe tener exactamente 4 dígitos.');

        const rid = `${slugify(nombre)}-${Math.random().toString(36).slice(2, 6)}`;
        const uid = await this.createAccountWithoutSwitchingSession(email, input.cuentaPassword);

        const batch = writeBatch(this.firestore);
        const now = Timestamp.now();
        batch.set(doc(this.firestore, 'restaurants', rid), {
            nombre,
            estado: 'activo',
            cuenta_email: email,
            cuenta_uid: uid,
            creado_en: now,
            creado_por: this.auth.currentUser?.uid ?? ''
        });
        batch.set(doc(this.firestore, 'devices', uid), { rid, email, creado_en: now });
        batch.set(doc(collection(this.firestore, 'restaurants', rid, 'users')), {
            nombre: input.adminNombre.trim(),
            rol: 'admin',
            pin_acceso: input.adminPin,
            activo: true
        });
        batch.set(doc(this.firestore, 'restaurants', rid, 'config', 'turno_actual'), { inicio: now, abierto_por: 'plataforma' });

        if (input.copiarLegado) {
            const [products, tables] = await Promise.all([
                getDocs(collection(this.firestore, 'products')),
                getDocs(collection(this.firestore, 'tables'))
            ]);
            products.forEach(p => batch.set(doc(this.firestore, 'restaurants', rid, 'products', p.id), p.data()));
            tables.forEach(t => batch.set(doc(this.firestore, 'restaurants', rid, 'tables', t.id), {
                ...t.data(), estado: 'libre', id_orden_actual: null
            }));
        }

        try {
            await batch.commit();
        } catch (error) {
            console.error('Error al crear restaurante:', error);
            throw new PlatformError(`Se creó la cuenta ${email} pero no el restaurante. Intenta de nuevo con otro correo.`);
        }
        return rid;
    }

    private async createAccountWithoutSwitchingSession(email: string, password: string): Promise<string> {
        const app = initializeApp(environment.firebase, `crear-cuenta-${Date.now()}`);
        try {
            const auth = getRawAuth(app);
            if (environment.useEmulators) {
                connectRawAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            }
            const cred = await createRawUser(auth, email, password);
            await rawSignOut(auth);
            return cred.user.uid;
        } catch (e: any) {
            const code = e?.code ?? '';
            if (code.includes('email-already-in-use')) throw new PlatformError('Ese correo ya tiene una cuenta. Usa otro correo para este restaurante.');
            if (code.includes('weak-password')) throw new PlatformError('La contraseña es muy débil.');
            if (code.includes('invalid-email')) throw new PlatformError('El correo no es válido.');
            throw new PlatformError('No se pudo crear la cuenta del restaurante. Revisa la conexión.');
        } finally {
            await deleteApp(app).catch(() => { });
        }
    }

    async setEstado(rid: string, estado: Restaurant['estado']): Promise<void> {
        await updateDoc(doc(this.firestore, 'restaurants', rid), { estado });
    }

    async rename(rid: string, nombre: string): Promise<void> {
        if (!nombre.trim()) throw new PlatformError('El nombre no puede quedar vacío.');
        await updateDoc(doc(this.firestore, 'restaurants', rid), { nombre: nombre.trim() });
    }

    /** Agrega otro administrador a un restaurante (p. ej. si el dueño olvidó su PIN). */
    async addAdmin(rid: string, nombre: string, pin: string): Promise<void> {
        if (!nombre.trim()) throw new PlatformError('Escribe el nombre del administrador.');
        if (!isValidPin(pin)) throw new PlatformError('El PIN debe tener exactamente 4 dígitos.');
        const usersRef = collection(this.firestore, 'restaurants', rid, 'users');
        const existing = await getDocs(query(usersRef, where('pin_acceso', '==', pin)));
        if (!existing.empty) throw new PlatformError('Ese PIN ya lo usa otra persona en este restaurante.');
        await setDoc(doc(usersRef), { nombre: nombre.trim(), rol: 'admin', pin_acceso: pin, activo: true });
    }
}

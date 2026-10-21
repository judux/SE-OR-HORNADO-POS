import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
    Firestore, collection, collectionData, doc, getDoc, getDocs, query, where,
    writeBatch, updateDoc, Timestamp
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Restaurant, Solicitud } from '../../shared/interfaces';
import { TenantService } from '../tenant/tenant.service';
import { restaurantCol, restaurantDoc, PLATFORM_COLLECTIONS as PC } from '../tenant/collections';
import { newJoinToken } from '../tenant/tokens';

export interface ApproveInput {
    nombreRestaurante: string;
    nombreAdmin: string;
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
 * Los restaurantes llegan como SOLICITUDES (cuenta de Google del futuro admin) y aquí se aprueban.
 */
@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);
    private tenant = inject(TenantService);

    restaurants$(): Observable<Restaurant[]> {
        // Sin orderBy en la consulta: Firestore excluiría restaurantes sin 'creado_en'. Se ordena aquí.
        return collectionData(collection(this.firestore, PC.restaurants), { idField: 'id' }).pipe(
            map(list => (list as Restaurant[]).sort((a, b) =>
                (b.creado_en?.toMillis?.() ?? 0) - (a.creado_en?.toMillis?.() ?? 0)))
        );
    }

    pendingRequests$(): Observable<Solicitud[]> {
        const q = query(collection(this.firestore, PC.solicitudes), where('estado', '==', 'pendiente'));
        return collectionData(q, { idField: 'uid' }).pipe(map(list => list as Solicitud[]));
    }

    /** ¿Ya tiene dueño la plataforma? (requiere sesión iniciada) */
    async ownerExists(): Promise<boolean> {
        return (await getDoc(doc(this.firestore, PC.platform, 'owner'))).exists();
    }

    /**
     * La cuenta actual (Google) reclama la plataforma. Solo funciona UNA vez:
     * las reglas rechazan el reclamo si ya existe platform/owner.
     */
    async claimPlatform(): Promise<void> {
        const user = this.auth.currentUser;
        if (!user) throw new PlatformError('Primero inicia sesión con Google.');
        const batch = writeBatch(this.firestore);
        const now = Timestamp.now();
        batch.set(doc(this.firestore, PC.platformAdmins, user.uid), { email: user.email ?? '', nombre: user.displayName ?? '', creado_en: now });
        batch.set(doc(this.firestore, PC.platform, 'owner'), { uid: user.uid, email: user.email ?? '', creado_en: now });
        try {
            await batch.commit();
        } catch {
            throw new PlatformError('Esta plataforma ya tiene dueño.');
        }
        await this.tenant.refresh();
    }

    // 'products' y 'tables' sueltos (sin restaurante) son de la versión anterior: solo se LEEN para copiarlos.
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
     * Aprueba una solicitud: crea el restaurante y vincula la cuenta de Google del solicitante
     * como su administrador, todo en un solo batch. El admin elige su propio PIN al entrar por primera vez.
     */
    async approveRequest(solicitud: Solicitud, input: ApproveInput): Promise<string> {
        const nombre = input.nombreRestaurante.trim();
        const nombreAdmin = input.nombreAdmin.trim();
        if (!nombre) throw new PlatformError('Escribe el nombre del restaurante.');
        if (!nombreAdmin) throw new PlatformError('Escribe el nombre del administrador.');

        const existingDevice = await getDoc(doc(this.firestore, PC.devices, solicitud.uid));
        if (existingDevice.exists()) throw new PlatformError('Esa cuenta de Google ya administra otro restaurante.');

        const rid = `${slugify(nombre)}-${Math.random().toString(36).slice(2, 6)}`;
        const now = Timestamp.now();
        const batch = writeBatch(this.firestore);

        batch.set(doc(this.firestore, PC.restaurants, rid), {
            nombre,
            estado: 'activo',
            cuenta_email: solicitud.email,
            admin_uid: solicitud.uid,
            creado_en: now,
            creado_por: this.auth.currentUser?.uid ?? ''
        });
        batch.set(doc(this.firestore, PC.devices, solicitud.uid), { rid, email: solicitud.email, tipo: 'admin', creado_en: now });
        batch.set(doc(restaurantCol(this.firestore, rid, 'users')), {
            nombre: nombreAdmin,
            rol: 'admin',
            activo: true,
            google_uid: solicitud.uid,
            pin_pendiente: true // el admin elige su PIN la primera vez que entra
        });
        batch.set(restaurantDoc(this.firestore, rid, 'private', 'acceso'), { token: newJoinToken(), actualizado_en: now });
        batch.set(restaurantDoc(this.firestore, rid, 'config', 'turno_actual'), { inicio: now, abierto_por: 'plataforma' });

        if (input.copiarLegado) {
            const [products, tables] = await Promise.all([
                getDocs(collection(this.firestore, 'products')),
                getDocs(collection(this.firestore, 'tables'))
            ]);
            products.forEach(p => batch.set(restaurantDoc(this.firestore, rid, 'products', p.id), p.data()));
            tables.forEach(t => batch.set(restaurantDoc(this.firestore, rid, 'tables', t.id), {
                ...t.data(), estado: 'libre', id_orden_actual: null
            }));
        }

        batch.update(doc(this.firestore, PC.solicitudes, solicitud.uid), { estado: 'aprobada', rid, resuelta_en: now });

        try {
            await batch.commit();
        } catch (error) {
            console.error('Error al aprobar solicitud:', error);
            throw new PlatformError('No se pudo crear el restaurante. Revisa la conexión e intenta de nuevo.');
        }
        return rid;
    }

    async rejectRequest(solicitud: Solicitud): Promise<void> {
        await updateDoc(doc(this.firestore, PC.solicitudes, solicitud.uid), { estado: 'rechazada', resuelta_en: Timestamp.now() });
    }

    async setEstado(rid: string, estado: Restaurant['estado']): Promise<void> {
        await updateDoc(doc(this.firestore, PC.restaurants, rid), { estado });
    }

    /**
     * Si el administrador olvidó su PIN: se borra y la próxima vez que entre con su Google elige uno nuevo.
     */
    async resetAdminPin(restaurant: Restaurant): Promise<void> {
        if (!restaurant.admin_uid) throw new PlatformError('Este restaurante no tiene un administrador con Google.');
        const users = await getDocs(query(restaurantCol(this.firestore, restaurant.id, 'users'), where('google_uid', '==', restaurant.admin_uid)));
        if (users.empty) throw new PlatformError('No se encontró al administrador de este restaurante.');
        const batch = writeBatch(this.firestore);
        users.forEach(u => batch.update(u.ref, { pin_acceso: null, pin_pendiente: true }));
        await batch.commit();
    }
}

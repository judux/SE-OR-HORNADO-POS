import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, Timestamp } from '@angular/fire/firestore';
import { Solicitud } from '../../shared/interfaces';
import { PLATFORM_COLLECTIONS as PC } from '../tenant/collections';
import { TenantService } from '../tenant/tenant.service';

/** Solicitud de registro del restaurante que hace la cuenta de Google actual. */
@Injectable({
    providedIn: 'root'
})
export class SolicitudService {
    private firestore = inject(Firestore);
    private tenant = inject(TenantService);

    async mine(): Promise<Solicitud | null> {
        const user = this.tenant.currentUser();
        if (!user) return null;
        const snap = await getDoc(doc(this.firestore, PC.solicitudes, user.uid));
        return snap.exists() ? ({ uid: snap.id, ...snap.data() } as Solicitud) : null;
    }

    async create(nombreRestaurante: string, nombreContacto: string, telefono: string): Promise<void> {
        const user = this.tenant.currentUser();
        if (!user || user.isAnonymous) throw new Error('Primero entra con tu cuenta de Google.');
        if (!nombreRestaurante.trim() || !nombreContacto.trim()) throw new Error('Completa el nombre del restaurante y el tuyo.');
        await setDoc(doc(this.firestore, PC.solicitudes, user.uid), {
            email: user.email ?? '',
            nombre_restaurante: nombreRestaurante.trim(),
            nombre_contacto: nombreContacto.trim(),
            telefono: telefono.trim(),
            estado: 'pendiente',
            creado_en: Timestamp.now()
        });
    }
}

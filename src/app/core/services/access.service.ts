import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { docData, setDoc, Timestamp } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { TenantService } from '../tenant/tenant.service';
import { newJoinToken, joinUrl } from '../tenant/tokens';

/**
 * Enlace único del restaurante para vincular los celulares del personal.
 * El código vive en restaurants/{rid}/private/acceso; generar uno nuevo invalida el anterior
 * para equipos NUEVOS (los ya vinculados siguen funcionando).
 */
@Injectable({
    providedIn: 'root'
})
export class AccessService {
    private tenant = inject(TenantService);

    private readonly token = toSignal(
        this.tenant.watch(
            rid => docData(this.tenant.docOf(rid, 'private', 'acceso')).pipe(map(d => (d as any)?.token as string | undefined ?? null)),
            null as string | null
        ),
        { initialValue: null as string | null }
    );

    readonly staffLink = computed(() => {
        const token = this.token();
        const rid = this.tenant.activeRid();
        return token && rid ? joinUrl(window.location.origin, rid, token) : null;
    });

    async regenerate(): Promise<void> {
        await setDoc(this.tenant.docRef('private', 'acceso'), { token: newJoinToken(), actualizado_en: Timestamp.now() });
    }
}

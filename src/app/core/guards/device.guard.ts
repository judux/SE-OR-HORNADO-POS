import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantService } from '../tenant/tenant.service';

/**
 * Exige que este equipo esté activado con la cuenta de un restaurante ACTIVO.
 * Sin esto, Firestore rechaza todas las lecturas (ni siquiera se puede validar un PIN).
 */
export const deviceGuard: CanActivateFn = async () => {
    const tenant = inject(TenantService);
    const router = inject(Router);

    const account = await tenant.whenResolved();
    if (account.kind === 'device' && tenant.activeRid()) {
        return true;
    }
    if (account.kind === 'platform') {
        return router.createUrlTree(['/plataforma/panel']);
    }
    // Sin sesión, cuenta sin restaurante o restaurante suspendido: la pantalla de activación lo explica
    return router.createUrlTree(['/activar']);
};

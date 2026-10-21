import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DeviceService } from '../auth/device.service';

/**
 * Guard que exige que el equipo esté activado con la cuenta de equipos.
 * Sin esto, Firestore rechaza todas las lecturas (ni siquiera se puede validar un PIN).
 */
export const deviceGuard: CanActivateFn = async () => {
    const deviceService = inject(DeviceService);
    const router = inject(Router);

    if (await deviceService.isActivated()) {
        return true;
    }
    return router.createUrlTree(['/activar']);
};

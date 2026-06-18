import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SuperAdminService } from '../auth/super-admin.service';

/**
 * Guard que protege las rutas del super admin.
 * Espera a que Firebase Auth resuelva el estado y se cargue el documento
 * de super admin antes de decidir, para no rechazar al usuario en un refresh.
 */
export const superAdminGuard: CanActivateFn = async () => {
    const superAdminService = inject(SuperAdminService);
    const router = inject(Router);

    const sa = await superAdminService.resolveSession();
    if (sa) {
        return true;
    }

    router.navigate(['/super-admin/login']);
    return false;
};

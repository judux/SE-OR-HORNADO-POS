import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TenantService } from '../tenant/tenant.service';

/**
 * Verifica que haya un empleado con sesión (PIN) y que pertenezca al restaurante de este equipo.
 * Redirige a /login si no.
 */
export const authGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const tenant = inject(TenantService);
    const router = inject(Router);

    await tenant.whenResolved();
    if (authService.belongsToActiveRestaurant()) {
        return true;
    }

    authService.clearSession();
    return router.createUrlTree(['/login']);
};

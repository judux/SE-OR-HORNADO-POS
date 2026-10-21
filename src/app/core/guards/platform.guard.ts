import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantService } from '../tenant/tenant.service';

/** Solo el dueño de la plataforma puede entrar al panel de restaurantes. */
export const platformGuard: CanActivateFn = async () => {
    const tenant = inject(TenantService);
    const router = inject(Router);

    const account = await tenant.whenResolved();
    return account.kind === 'platform' ? true : router.createUrlTree(['/plataforma']);
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guard factory que verifica si el usuario tiene uno de los roles permitidos.
 * Uso: canActivate: [roleGuard('admin')] o roleGuard('mesero', 'cajero')
 */
export function roleGuard(...allowedRoles: string[]): CanActivateFn {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const userRole = authService.userRole();

        if (userRole && allowedRoles.includes(userRole)) {
            return true;
        }

        // Si está logueado pero no tiene el rol, redirigir por su rol correcto
        const user = authService.user();
        if (user) {
            authService.redirectByRole(user);
            return false;
        }

        router.navigate(['/login']);
        return false;
    };
}

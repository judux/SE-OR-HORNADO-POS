import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { deviceGuard } from './core/guards/device.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'activar',
        loadComponent: () => import('./features/auth/device-setup/device-setup.component').then(m => m.DeviceSetupComponent)
    },
    { path: 'login', component: LoginComponent, canActivate: [deviceGuard] },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [deviceGuard, authGuard, roleGuard('admin')]
    },
    {
        path: 'mesero',
        loadComponent: () => import('./features/waiter/waiter-layout/waiter-layout.component').then(m => m.WaiterLayoutComponent),
        canActivate: [deviceGuard, authGuard, roleGuard('mesero')],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/waiter/table-selection/table-selection.component').then(m => m.TableSelectionComponent)
            },
            {
                path: 'mesa/:id',
                loadComponent: () => import('./features/waiter/order-taking/order-taking.component').then(m => m.OrderTakingComponent)
            }
        ]
    },
    {
        path: 'cajero',
        loadComponent: () => import('./features/cashier/cashier-layout/cashier-layout.component').then(m => m.CashierLayoutComponent),
        canActivate: [deviceGuard, authGuard, roleGuard('cajero')]
    },
    { path: '**', redirectTo: '/login' }
];

import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [authGuard, roleGuard('admin')]
    },
    {
        path: 'mesero',
        loadComponent: () => import('./features/waiter/waiter-layout/waiter-layout.component').then(m => m.WaiterLayoutComponent),
        canActivate: [authGuard, roleGuard('mesero')],
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
        canActivate: [authGuard, roleGuard('cajero')]
    },
    { path: '**', redirectTo: '/login' }
];

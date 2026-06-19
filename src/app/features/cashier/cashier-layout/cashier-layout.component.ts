import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TenantService } from '../../../core/services/tenant.service';
import { CashierDashboardComponent } from '../cashier-dashboard/cashier-dashboard.component';

@Component({
  selector: 'app-cashier-layout',
  standalone: true,
  imports: [CashierDashboardComponent],
  template: `
    <div class="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors duration-300">
      <!-- Header -->
      <header class="h-[80px] bg-dark-800 text-white px-6 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-4">
          @if (tenant.restaurant()?.banner_url; as banner) {
            <img [src]="banner" [alt]="tenant.restaurant()?.nombre" class="h-12 object-contain rounded-lg drop-shadow-sm">
          } @else if (tenant.restaurant()?.logo_url) {
            <img [src]="tenant.restaurant()?.logo_url" [alt]="tenant.restaurant()?.nombre" class="h-10 object-contain rounded-lg drop-shadow-sm">
          } @else {
            <div class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <span class="material-symbols-rounded text-white">storefront</span>
            </div>
          }
          <div class="border-l border-dark-600 pl-4 hidden sm:block">
            <h1 class="text-lg font-bold leading-none mb-1">Caja</h1>
            <p class="text-dark-300 text-xs">{{ authService.user()?.nombre }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button
            (click)="themeService.toggleTheme()"
            class="w-10 h-10 rounded-xl flex items-center justify-center bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-all active:scale-95"
            title="Alternar Tema Oscuro"
          >
            <span class="material-symbols-rounded text-xl">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <button
            (click)="authService.logout()"
            class="px-4 py-2 rounded-xl text-sm font-bold bg-dark-700 hover:bg-dark-600
                   text-white transition-all duration-200 active:scale-95 shadow-md flex items-center gap-2"
          >
            <span class="material-symbols-rounded text-[18px]">logout</span>
            <span class="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <!-- Content -->
      <main class="h-[calc(100vh-80px)]">
        <app-cashier-dashboard></app-cashier-dashboard>
      </main>
    </div>
  `,
})
export class CashierLayoutComponent {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public tenant = inject(TenantService);
}

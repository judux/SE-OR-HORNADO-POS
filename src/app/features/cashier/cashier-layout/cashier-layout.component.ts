import { Component, inject } from '@angular/core';
import { TenantService } from '../../../core/tenant/tenant.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { CashierDashboardComponent } from '../cashier-dashboard/cashier-dashboard.component';

@Component({
  selector: 'app-cashier-layout',
  standalone: true,
  imports: [CashierDashboardComponent],
  template: `
    <div class="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col">
      <!-- Header Apple Bar -->
      <header class="h-[72px] bg-dark-800/90 dark:bg-dark-900/90 backdrop-blur-xl border-b border-dark-700/50 text-white px-6 flex items-center justify-between shadow-lg sticky top-0 z-50 shrink-0">
        <div class="flex items-center gap-4">
          <span class="text-white font-extrabold text-base sm:text-lg tracking-tight truncate max-w-[45vw]">{{ tenant.restaurant()?.nombre }}</span>
          <div class="border-l border-dark-700 pl-4 hidden sm:block">
            <h1 class="text-base font-extrabold leading-none mb-0.5 tracking-tight">Módulo de Caja</h1>
            <p class="text-dark-300 text-xs font-medium flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {{ authService.user()?.nombre }} · CAJERO
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2.5">
          <button
            (click)="themeService.toggleTheme()"
            class="w-9 h-9 rounded-2xl flex items-center justify-center bg-dark-700/60 hover:bg-dark-600/80 text-dark-300 hover:text-white transition-all active:scale-95 border border-dark-600/50"
            title="Alternar Tema Oscuro"
          >
            <span class="material-symbols-rounded text-lg">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <button
            (click)="authService.logout()"
            class="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-dark-700/60 hover:bg-dark-600/80
                   text-white transition-all duration-200 active:scale-95 shadow-xs flex items-center gap-1.5 border border-dark-600/50"
          >
            <span class="material-symbols-rounded text-[17px]">logout</span>
            <span class="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-hidden">
        <app-cashier-dashboard></app-cashier-dashboard>
      </main>
    </div>
  `,
})
export class CashierLayoutComponent {
  public tenant = inject(TenantService);
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
}

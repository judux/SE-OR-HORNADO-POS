import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TenantService } from '../../../core/services/tenant.service';
import { OrderService } from '../../../core/services/order.service';
import { TableService } from '../../../core/services/table.service';

@Component({
  selector: 'app-waiter-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col">
      <!-- Header Mobile -->
      <header class="bg-dark-800 text-white px-3 sm:px-4 py-3 flex items-center justify-between gap-2 shadow-lg z-50 shrink-0">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          @if (isTakingOrder) {
            <!-- Si está tomando pedido mostrar botón atrás -->
            <button (click)="goBackToTables()" class="shrink-0 w-9 h-9 -ml-1 text-white/80 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
              <span class="material-symbols-rounded">arrow_back</span>
            </button>
          }

          @if (tenant.restaurant()?.banner_url; as banner) {
            <img [src]="banner" [alt]="tenant.restaurant()?.nombre" class="shrink-0 h-8 sm:h-11 object-contain rounded-lg drop-shadow-sm">
          } @else if (tenant.restaurant()?.logo_url) {
            <img [src]="tenant.restaurant()?.logo_url" [alt]="tenant.restaurant()?.nombre" class="shrink-0 h-8 sm:h-10 object-contain rounded-lg drop-shadow-sm">
          } @else {
            <div class="shrink-0 w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <span class="material-symbols-rounded text-white text-[20px]">storefront</span>
            </div>
          }

          <div class="border-l border-dark-600 pl-2 sm:pl-3 min-w-0">
            @if (isTakingOrder && currentTableNumber() !== null) {
              <h1 class="text-sm sm:text-base font-bold leading-tight truncate">Mesa {{ currentTableNumber() }}</h1>
            }
            <p class="text-dark-300 text-[10px] sm:text-xs font-medium tracking-wide truncate">{{ authService.user()?.nombre }} · MESERO</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            (click)="themeService.toggleTheme()"
            class="w-9 h-9 rounded-xl flex items-center justify-center bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-all active:scale-95"
            title="Alternar Tema Oscuro"
          >
            <span class="material-symbols-rounded text-base">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <button
            (click)="authService.logout()"
            class="w-9 h-9 sm:w-auto sm:px-3 rounded-xl text-xs font-medium bg-dark-700 hover:bg-dark-600
                   text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span class="material-symbols-rounded text-[16px]">logout</span>
            <span class="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <!-- Content (Router Outlet) -->
      <main class="flex-1 overflow-hidden relative">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class WaiterLayoutComponent {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public tenant = inject(TenantService);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private tableService = inject(TableService);

  isTakingOrder = false;

  /** Número de la mesa activa, para mostrarlo como contexto en el header. */
  currentTableNumber = computed(() => {
    const id = this.orderService.currentTable();
    if (!id) return null;
    return this.tableService.getTableById(id)?.numero_mesa ?? null;
  });

  constructor() {
    // Escuchar cambios de ruta para cambiar el header
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isTakingOrder = event.urlAfterRedirects.includes('/mesa/');
    });
  }

  goBackToTables(): void {
    // Vuelve a la selección de mesas sin confirmación.
    this.router.navigate(['/mesero']);
  }
}


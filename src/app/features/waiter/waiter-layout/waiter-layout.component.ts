import { Component, inject } from '@angular/core';
import { TenantService } from '../../../core/tenant/tenant.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-waiter-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="h-app bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col overflow-hidden">
      <!-- Header Mobile / Desktop -->
      <header class="bg-dark-800/90 dark:bg-dark-900/90 backdrop-blur-xl border-b border-dark-700/50 text-white px-4 py-3 flex items-center justify-between shadow-lg z-50 shrink-0 sticky top-0">
        <div class="flex items-center gap-3">
          @if (isTakingOrder) {
            <!-- Si está tomando pedido mostrar botón atrás -->
            <button (click)="goBackToTables()" class="p-2 -ml-1 text-white/80 hover:text-white rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center">
              <span class="material-symbols-rounded">arrow_back</span>
            </button>
          }
          
          <span class="text-white font-extrabold text-base sm:text-lg tracking-tight truncate max-w-[45vw]">{{ tenant.restaurant()?.nombre }}</span>
          
          <div class="border-l border-dark-700 pl-3">
            <h1 class="text-sm sm:text-base font-bold leading-tight tracking-tight">{{ isTakingOrder ? 'Tomar Pedido' : 'Plano de Mesas' }}</h1>
            <p class="text-dark-300 text-[10px] sm:text-xs font-medium tracking-wide flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {{ authService.user()?.nombre }} · MESERO
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
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
                   text-white border border-dark-600/50 transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-xs"
          >
            <span class="material-symbols-rounded text-[17px]">logout</span>
            <span class="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <!-- Content (Router Outlet) -->
      <main class="flex-1 min-h-0 overflow-hidden relative">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class WaiterLayoutComponent {
  public tenant = inject(TenantService);
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);

  isTakingOrder = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isTakingOrder = event.urlAfterRedirects.includes('/mesa/');
    });
  }

  async goBackToTables(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: '¿Salir del Pedido?',
      message: 'Si regresas a la lista de mesas, los ítems sin guardar en el carrito se descartarán.',
      confirmText: 'Salir sin guardar',
      cancelText: 'Continuar pidiendo',
      confirmStyle: 'danger',
      icon: 'warning'
    });

    if (confirmed) {
      this.router.navigate(['/mesero']);
    }
  }
}

import { Component, inject, input, output } from '@angular/core';
import { TenantService } from '../../../core/tenant/tenant.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Encabezado común de las vistas del restaurante (admin, caja y mesero).
 * - Celular: solo la sección y quién está (sin el nombre del negocio, para no amontonar).
 * - PC: nombre del negocio a la izquierda, luego la sección.
 * - Su fondo llega hasta arriba, detrás de la barra de estado del iPhone (.safe-header).
 * - Botones de 44 px (tamaño mínimo cómodo para el dedo).
 */
@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="safe-header pb-3 px-3 sm:px-6 shrink-0 z-50 bg-dark-800 dark:bg-dark-900 text-white border-b border-white/10 flex items-center gap-3">
      @if (showBack()) {
        <button (click)="back.emit()" aria-label="Volver"
          class="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center bg-white/10 hover:bg-white/15 active:scale-95 transition">
          <span class="material-symbols-rounded">arrow_back</span>
        </button>
      }

      <div class="flex items-center gap-4 min-w-0 flex-1">
        <span class="hidden lg:block font-extrabold text-lg tracking-tight truncate max-w-[20rem]">{{ tenant.restaurant()?.nombre }}</span>
        <span class="hidden lg:block w-px h-8 bg-white/15 shrink-0"></span>
        <div class="min-w-0">
          <h1 class="text-[17px] font-bold leading-tight tracking-tight truncate">{{ title() }}</h1>
          <p class="text-xs text-dark-300 font-medium flex items-center gap-1.5 min-w-0">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
            <span class="truncate">{{ authService.user()?.nombre }} · {{ role() }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button (click)="themeService.toggleTheme()" [attr.aria-label]="themeService.isDarkMode() ? 'Usar tema claro' : 'Usar tema oscuro'"
          class="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10 hover:bg-white/15 text-dark-200 hover:text-white active:scale-95 transition">
          <span class="material-symbols-rounded text-xl">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
        </button>
        <button (click)="authService.logout()" aria-label="Cerrar sesión"
          class="h-11 min-w-[44px] px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-sm font-semibold active:scale-95 transition">
          <span class="material-symbols-rounded text-xl">logout</span>
          <span class="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  `
})
export class AppHeaderComponent {
  public tenant = inject(TenantService);
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);

  title = input.required<string>();
  role = input.required<string>();
  showBack = input(false);
  back = output<void>();
}

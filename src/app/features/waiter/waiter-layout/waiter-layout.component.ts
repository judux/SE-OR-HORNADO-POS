import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-waiter-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col">
      <!-- Header Mobile -->
      <header class="bg-dark-800 text-white px-4 py-3 flex items-center justify-between shadow-lg z-50 shrink-0">
        <div class="flex items-center gap-3">
          @if (isTakingOrder) {
            <!-- Si está tomando pedido mostrar botón atrás -->
            <button (click)="goBackToTables()" class="p-2 -ml-2 text-white/80 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center mr-1">
              <span class="material-symbols-rounded">arrow_back</span>
            </button>
          }
          
          <img src="logo.png" alt="Señor Hornado" class="h-8 sm:h-10 object-contain invert drop-shadow-sm">
          
          <div class="border-l border-dark-600 pl-3">
            <h1 class="text-sm sm:text-base font-bold leading-tight">{{ isTakingOrder ? 'Nueva Orden' : 'Mesas' }}</h1>
            <p class="text-dark-300 text-[10px] sm:text-xs font-medium tracking-wide">{{ authService.user()?.nombre }} · MESERO</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="themeService.toggleTheme()"
            class="w-8 h-8 rounded-xl flex items-center justify-center bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-all active:scale-95"
            title="Alternar Tema Oscuro"
          >
            <span class="material-symbols-rounded text-base">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <button
            (click)="authService.logout()"
            class="px-3 py-2 rounded-xl text-xs font-medium bg-dark-700 hover:bg-dark-600
                   text-white transition-all duration-200 active:scale-95 flex items-center gap-1.5"
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
  private router = inject(Router);

  isTakingOrder = false;

  constructor() {
    // Escuchar cambios de ruta para cambiar el header
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isTakingOrder = event.urlAfterRedirects.includes('/mesa/');
    });
  }

  goBackToTables(): void {
    // Si la ruta maneja su propio estado cancelado (como OrderTakingComponent),
    // sería mejor que el botón <- del layout delegue o esté sincronizado, pero para mantenerlo
    // simple, podemos navegar a /mesero y que el guardado se purgue si procede.
    const confirmPrompt = window.confirm('Salir cancelará la orden actual. ¿Estás seguro?');
    if (confirmPrompt) {
      this.router.navigate(['/mesero']);
    }
  }
}


import { Component, signal, inject } from '@angular/core';
import { TenantService } from '../../../core/tenant/tenant.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ProductListComponent } from '../product-list/product-list.component';
import { UserListComponent } from '../user-list/user-list.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { TableListComponent } from '../table-list/table-list.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, ProductListComponent, UserListComponent, AdminDashboardComponent, TableListComponent],
  template: `
    <div class="h-app w-full max-w-full bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col overflow-hidden">
      <!-- Header Bar -->
      <header class="h-[72px] bg-dark-800/90 dark:bg-dark-900/90 backdrop-blur-xl border-b border-dark-700/50 text-white px-6 flex items-center justify-between shadow-lg sticky top-0 z-50 shrink-0">
        <div class="flex items-center gap-4">
          <span class="text-white font-extrabold text-base sm:text-lg tracking-tight truncate max-w-[45vw]">{{ tenant.restaurant()?.nombre }}</span>
          <div class="border-l border-dark-700 pl-4 hidden sm:block">
            <h1 class="text-base font-extrabold leading-none mb-0.5 tracking-tight">Administración</h1>
            <p class="text-dark-300 text-xs font-medium flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {{ authService.user()?.nombre }} · GERENCIA
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

      <!-- macOS Segmented Bar -->
      <div class="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-b border-dark-100 dark:border-dark-700/60 px-4 py-2 shrink-0 overflow-x-auto hide-scrollbar">
        <div class="max-w-6xl mx-auto flex items-center justify-start sm:justify-start">
          <div class="inline-flex p-1 bg-dark-100/80 dark:bg-dark-900/80 backdrop-blur-md rounded-2xl border border-dark-200/50 dark:border-dark-700/50 text-xs font-bold w-full sm:w-auto min-w-max">
            <button
              (click)="activeTab.set('dashboard')"
              class="flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              [class]="activeTab() === 'dashboard'
                ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'"
            >
              <span class="material-symbols-rounded text-base">dashboard</span>
              Dashboard
            </button>
            <button
              (click)="activeTab.set('productos')"
              class="flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              [class]="activeTab() === 'productos'
                ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'"
            >
              <span class="material-symbols-rounded text-base">restaurant_menu</span>
              Menú
            </button>
            <button
              (click)="activeTab.set('usuarios')"
              class="flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              [class]="activeTab() === 'usuarios'
                ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'"
            >
              <span class="material-symbols-rounded text-base">group</span>
              Usuarios
            </button>
            <button
              (click)="activeTab.set('mesas')"
              class="flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              [class]="activeTab() === 'mesas'
                ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'"
            >
              <span class="material-symbols-rounded text-base">table_restaurant</span>
              Mesas
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <main class="flex-1 p-4 sm:p-6 pb-safe overflow-auto">
        <div class="max-w-6xl mx-auto">
          @if (activeTab() === 'dashboard') {
            <app-admin-dashboard />
          }
          @if (activeTab() === 'productos') {
            <app-product-list />
          }
          @if (activeTab() === 'usuarios') {
            <app-user-list />
          }
          @if (activeTab() === 'mesas') {
            <app-table-list />
          }
        </div>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  public tenant = inject(TenantService);
  activeTab = signal<'dashboard' | 'productos' | 'usuarios' | 'mesas'>('dashboard');

  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
}

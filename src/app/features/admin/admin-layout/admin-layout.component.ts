import { Component, signal, inject } from '@angular/core';
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
    <div class="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col">
      <!-- Header -->
      <header class="bg-dark-800 text-white px-6 py-4 flex items-center justify-between shadow-lg shrink-0">
        <div class="flex items-center gap-4">
          <img src="logo.png" alt="Señor Hornado" class="h-16 object-contain invert drop-shadow-sm">
          <div class="border-l border-dark-600 pl-4 hidden sm:block">
            <p class="text-dark-300 text-xs sm:text-sm font-medium">Panel de Administración</p>
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
            class="px-4 py-2 rounded-xl text-sm font-medium bg-primary-500 hover:bg-primary-600
                   text-white transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            <span class="material-symbols-rounded text-[18px]">logout</span>
            <span class="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <!-- Tabs -->
      <div class="bg-white border-b border-dark-100 px-6 shrink-0">
        <div class="flex gap-1 max-w-6xl mx-auto">
          <button
            (click)="activeTab.set('dashboard')"
            class="px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px flex items-center gap-2"
            [class]="activeTab() === 'dashboard'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-dark-400 hover:text-dark-600'"
          >
            <span class="material-symbols-rounded text-lg">dashboard</span>
            Dashboard
          </button>
          <button
            (click)="activeTab.set('productos')"
            class="px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px flex items-center gap-2"
            [class]="activeTab() === 'productos'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-dark-400 hover:text-dark-600'"
          >
            <span class="material-symbols-rounded text-lg">restaurant_menu</span>
            Menú / Productos
          </button>
          <button
            (click)="activeTab.set('usuarios')"
            class="px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px flex items-center gap-2"
            [class]="activeTab() === 'usuarios'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-dark-400 hover:text-dark-600'"
          >
            <span class="material-symbols-rounded text-lg">group</span>
            Usuarios
          </button>
          <button
            (click)="activeTab.set('mesas')"
            class="px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px flex items-center gap-2"
            [class]="activeTab() === 'mesas'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-dark-400 hover:text-dark-600'"
          >
            <span class="material-symbols-rounded text-lg">table_restaurant</span>
            Mesas
          </button>
        </div>
      </div>

      <!-- Content -->
      <main class="flex-1 p-6 overflow-auto">
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
  activeTab = signal<'dashboard' | 'productos' | 'usuarios' | 'mesas'>('dashboard');

  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
}

import { Component, signal } from '@angular/core';
import { ProductListComponent } from '../product-list/product-list.component';
import { UserListComponent } from '../user-list/user-list.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { TableListComponent } from '../table-list/table-list.component';
import { AppHeaderComponent } from '../../../shared/components/app-header/app-header.component';
import { TabBarComponent, TabItem } from '../../../shared/components/tab-bar/tab-bar.component';

type AdminTab = 'dashboard' | 'productos' | 'usuarios' | 'mesas';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [ProductListComponent, UserListComponent, AdminDashboardComponent, TableListComponent, AppHeaderComponent, TabBarComponent],
  template: `
    <div class="h-app w-full bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col overflow-hidden">
      <app-header title="Administración" role="Gerencia" />
      <app-tab-bar [items]="tabs" [active]="activeTab()" (select)="activeTab.set($any($event))" />

      <main class="flex-1 min-h-0 overflow-y-auto">
        <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-safe">
          @switch (activeTab()) {
            @case ('dashboard') { <app-admin-dashboard /> }
            @case ('productos') { <app-product-list /> }
            @case ('usuarios') { <app-user-list /> }
            @case ('mesas') { <app-table-list /> }
          }
        </div>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  activeTab = signal<AdminTab>('dashboard');

  readonly tabs: TabItem[] = [
    { id: 'dashboard', label: 'Resumen', icon: 'monitoring' },
    { id: 'productos', label: 'Menú', icon: 'restaurant_menu' },
    { id: 'usuarios', label: 'Personal', icon: 'group' },
    { id: 'mesas', label: 'Mesas', icon: 'table_restaurant' },
  ];
}

import { Component } from '@angular/core';
import { CashierDashboardComponent } from '../cashier-dashboard/cashier-dashboard.component';
import { AppHeaderComponent } from '../../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-cashier-layout',
  standalone: true,
  imports: [CashierDashboardComponent, AppHeaderComponent],
  template: `
    <div class="h-app bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col overflow-hidden">
      <app-header title="Caja" role="Cajero" />
      <main class="flex-1 min-h-0 overflow-hidden">
        <app-cashier-dashboard></app-cashier-dashboard>
      </main>
    </div>
  `,
})
export class CashierLayoutComponent {}

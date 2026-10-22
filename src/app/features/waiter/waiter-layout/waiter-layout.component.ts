import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { AppHeaderComponent } from '../../../shared/components/app-header/app-header.component';
import { OrderService } from '../../../core/services/order.service';
import { TableService } from '../../../core/services/table.service';

@Component({
  selector: 'app-waiter-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppHeaderComponent],
  template: `
    <div class="h-app bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col overflow-hidden">
      <app-header [title]="title()" role="Mesero" [showBack]="!!tableId()" (back)="goBackToTables()" />

      <!-- Content (Router Outlet) -->
      <main class="flex-1 min-h-0 overflow-hidden relative">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class WaiterLayoutComponent {
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);
  private orderService = inject(OrderService);
  private tableService = inject(TableService);

  /** Mesa abierta (null en la lista de mesas). */
  readonly tableId = signal<string | null>(null);
  readonly title = computed(() => {
    const id = this.tableId();
    if (!id) return 'Mesas';
    const table = this.tableService.allTables().find(t => t.id === id);
    return table ? `Mesa ${table.numero_mesa}` : 'Tomar pedido';
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const match = /\/mesa\/([^/?#]+)/.exec(event.urlAfterRedirects);
      this.tableId.set(match ? decodeURIComponent(match[1]) : null);
    });
  }

  /** Volver a las mesas: solo pregunta si hay productos agregados que no se han enviado a caja. */
  async goBackToTables(): Promise<void> {
    if (this.orderService.hasNewItems()) {
      const confirmed = await this.confirmDialog.confirm({
        title: '¿Descartar pedido?',
        message: 'Hay productos agregados a esta comanda. Si vuelves sin enviarlos a caja, se perderán.',
        confirmText: 'Descartar',
        cancelText: 'Seguir pidiendo',
        confirmStyle: 'danger',
        icon: 'delete'
      });
      if (!confirmed) return;
    }
    this.orderService.clearCart();
    this.router.navigate(['/mesero']);
  }
}

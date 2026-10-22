import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { AppHeaderComponent } from '../../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-waiter-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppHeaderComponent],
  template: `
    <div class="h-app bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col overflow-hidden">
      <app-header [title]="isTakingOrder ? 'Tomar pedido' : 'Mesas'" role="Mesero"
        [showBack]="isTakingOrder" (back)="goBackToTables()" />

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

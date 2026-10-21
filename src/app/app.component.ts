import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ConnectionBannerComponent } from './shared/components/connection-banner/connection-banner.component';
import { UpdateBannerComponent } from './shared/components/update-banner/update-banner.component';
import { TenantService } from './core/tenant/tenant.service';

// Rutas que funcionan sin un restaurante activo
const PUBLIC_PREFIXES = ['/activar', '/plataforma', '/registro', '/unirse'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent, ConnectionBannerComponent, UpdateBannerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container />
    <app-confirm-dialog />
    <app-connection-banner />
    <app-update-banner />
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private tenant = inject(TenantService);
  private router = inject(Router);
  private title = inject(Title);

  constructor() {
    effect(() => {
      const account = this.tenant.account();
      const restaurant = this.tenant.restaurant();
      const activeRid = this.tenant.activeRid();

      this.title.setTitle(restaurant?.nombre ? `${restaurant.nombre} · POS` : 'Sistema POS');

      // Si el restaurante se suspende o el equipo pierde su sesión mientras se usa la app,
      // salir de inmediato a la pantalla que lo explica (los datos ya no cargan por las reglas).
      if (account.kind === 'loading') return;
      // location.pathname: al arrancar, router.url todavía es '/' aunque se haya abierto otra ruta
      const url = window.location.pathname;
      const isPublic = PUBLIC_PREFIXES.some(p => url.startsWith(p));
      if (!activeRid && !isPublic && account.kind !== 'platform') {
        // Fuera del effect: Angular no permite escribir signals dentro de un effect
        queueMicrotask(() => this.router.navigate(['/activar']));
      }
    });
  }
}

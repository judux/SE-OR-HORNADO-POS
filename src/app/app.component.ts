import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { ConnectionBannerComponent } from './shared/components/connection-banner/connection-banner.component';
import { TenantService } from './core/tenant/tenant.service';
import { PwaBrandingService } from './core/pwa/pwa-branding.service';
import { AppUpdateService } from './core/pwa/app-update.service';

// Rutas que funcionan sin un restaurante activo
const PUBLIC_PREFIXES = ['/activar', '/plataforma', '/registro', '/unirse'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent, ConnectionBannerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container />
    <app-confirm-dialog />
    <app-connection-banner />
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private tenant = inject(TenantService);
  private router = inject(Router);
  private title = inject(Title);
  // Se crea aquí para que el nombre e ícono de la app sigan al restaurante de este equipo
  private pwaBranding = inject(PwaBrandingService);
  // Versiones nuevas: se aplican solas en una pantalla segura, sin avisos
  private appUpdate = inject(AppUpdateService);

  constructor() {
    effect(() => {
      const account = this.tenant.account();
      const restaurant = this.tenant.restaurant();
      const activeRid = this.tenant.activeRid();

      this.title.setTitle(restaurant?.nombre ? `${restaurant.nombre} · KINO-POS` : 'KINO-POS');

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

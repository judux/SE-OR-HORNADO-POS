import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService, AccountKind } from '../../../core/tenant/tenant.service';
import { AuthService } from '../../../core/auth/auth.service';
import { GoogleSignInComponent } from '../../../shared/components/google-sign-in/google-sign-in.component';

/**
 * Pantalla de un equipo que todavía no pertenece a un restaurante (o cuyo restaurante está suspendido).
 * No tiene ningún enlace hacia la administración de la plataforma.
 */
@Component({
  selector: 'app-device-setup',
  standalone: true,
  imports: [GoogleSignInComponent],
  template: `
    <div class="min-h-[100dvh] w-full flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full max-w-sm">
        <div class="bg-dark-800/90 rounded-3xl p-7 border border-dark-700/80 shadow-2xl">
          @switch (tenant.account().kind) {
            @case ('loading') {
              <p class="text-center text-dark-300 py-8">Verificando este equipo...</p>
            }

            @case ('device') {
              @if (tenant.restaurant()?.estado === 'activo') {
                <div class="text-center">
                  <span class="material-symbols-rounded text-5xl text-emerald-400">verified</span>
                  <h1 class="text-white text-lg font-extrabold mt-2">{{ tenant.restaurant()?.nombre }}</h1>
                  <p class="text-dark-300 text-sm mt-1">Este equipo está listo</p>
                  <button (click)="goToLogin()" class="w-full mt-6 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold">
                    Ingresar con PIN
                  </button>
                  <button (click)="signOut()" class="w-full mt-3 py-3 rounded-2xl text-dark-300 hover:text-white text-sm font-semibold">
                    Desvincular este equipo
                  </button>
                </div>
              } @else {
                <div class="text-center">
                  <span class="material-symbols-rounded text-5xl text-red-400">block</span>
                  <h1 class="text-white text-lg font-extrabold mt-2">Restaurante suspendido</h1>
                  <p class="text-dark-300 text-sm mt-1">El acceso de {{ tenant.restaurant()?.nombre ?? 'este restaurante' }} está pausado. Comunícate con tu proveedor del sistema.</p>
                  <button (click)="signOut()" class="w-full mt-6 py-3 rounded-2xl bg-dark-700 text-white text-sm font-semibold">
                    Desvincular este equipo
                  </button>
                </div>
              }
            }

            @case ('error') {
              <div class="text-center">
                <span class="material-symbols-rounded text-5xl text-amber-400">wifi_off</span>
                <h1 class="text-white text-lg font-extrabold mt-2">No se pudo verificar este equipo</h1>
                <p class="text-dark-300 text-sm mt-1">Revisa la conexión a internet e intenta de nuevo.</p>
                <button (click)="tenant.refresh()" class="w-full mt-6 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold">
                  Reintentar
                </button>
              </div>
            }

            @case ('unlinked') {
              <div class="text-center">
                <span class="material-symbols-rounded text-5xl text-amber-400">hourglass_top</span>
                <h1 class="text-white text-lg font-extrabold mt-2">Tu cuenta aún no tiene restaurante</h1>
                <p class="text-dark-300 text-sm mt-1">{{ tenant.account().email || 'Esta cuenta' }} no está vinculada a ningún restaurante.</p>
                <button (click)="goToRegistro()" class="w-full mt-6 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold">
                  Ver o enviar mi solicitud
                </button>
                <button (click)="signOut()" class="w-full mt-3 py-3 rounded-2xl text-dark-300 hover:text-white text-sm font-semibold">
                  Usar otra cuenta
                </button>
              </div>
            }

            @default {
              <div class="text-center mb-6">
                <span class="material-symbols-rounded text-4xl text-amber-400">storefront</span>
                <h1 class="text-white text-lg font-extrabold mt-2">Bienvenido a KINO-POS</h1>
                <p class="text-dark-300 text-sm mt-1">Este equipo todavía no está vinculado a un restaurante.</p>
              </div>

              <div class="rounded-2xl bg-dark-900/70 border border-dark-700 p-4 mb-4">
                <p class="text-white font-bold text-sm flex items-center gap-2">
                  <span class="material-symbols-rounded text-base text-emerald-400">badge</span> ¿Eres mesero o cajero?
                </p>
                <p class="text-dark-300 text-sm mt-1">Pídele a tu administrador el <strong class="text-white">enlace de tu restaurante</strong> y ábrelo en este celular.</p>
              </div>

              <div class="rounded-2xl bg-dark-900/70 border border-dark-700 p-4">
                <p class="text-white font-bold text-sm flex items-center gap-2 mb-3">
                  <span class="material-symbols-rounded text-base text-amber-400">admin_panel_settings</span> ¿Eres el administrador?
                </p>
                <app-google-sign-in />
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class DeviceSetupComponent {
  public tenant = inject(TenantService);
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Al iniciar sesión aquí, la cuenta cambia de tipo y se navega según el resultado.
   * (No se usa el evento del botón: el botón se destruye al cambiar la vista y el evento se perdería.)
   * El primer estado al cargar la página no navega: así se puede ver "Este equipo está listo" o "Desvincular".
   */
  private kindOnLoad: AccountKind | null = null;
  private pendingRoute = false;
  private routeOnSignIn = effect(() => {
    const kind = this.tenant.account().kind;
    const activeRid = this.tenant.activeRid();
    if (kind === 'loading') return;
    if (this.kindOnLoad === null) { this.kindOnLoad = kind; return; }
    if (kind !== this.kindOnLoad) { this.kindOnLoad = kind; this.pendingRoute = true; }
    if (!this.pendingRoute) return;

    // Las acciones van fuera del effect (queueMicrotask): Angular no permite escribir signals dentro de un effect
    if (kind === 'device') {
      if (!activeRid) return; // esperar a que llegue el estado del restaurante
      this.pendingRoute = false;
      queueMicrotask(() => {
        this.authService.clearSession();
        this.goToLogin();
      });
    } else if (kind === 'platform') {
      this.pendingRoute = false;
      queueMicrotask(() => this.router.navigate(['/plataforma/panel']));
    } else if (kind === 'unlinked') {
      this.pendingRoute = false;
      // Cuenta de Google sin restaurante: registro / estado de su solicitud
      queueMicrotask(() => this.router.navigate(['/registro']));
    } else {
      this.pendingRoute = false;
    }
  });

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegistro(): void {
    this.router.navigate(['/registro']);
  }

  async signOut(): Promise<void> {
    this.authService.clearSession();
    await this.tenant.signOut();
  }
}

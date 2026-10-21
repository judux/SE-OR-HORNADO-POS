import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-device-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
                  <p class="text-dark-300 text-sm mt-1">Este equipo está activado</p>
                  <button (click)="goToLogin()" class="w-full mt-6 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold">
                    Ir al ingreso con PIN
                  </button>
                  <button (click)="deactivate()" class="w-full mt-3 py-3 rounded-2xl text-dark-300 hover:text-white text-sm font-semibold">
                    Desactivar este equipo
                  </button>
                </div>
              } @else {
                <div class="text-center">
                  <span class="material-symbols-rounded text-5xl text-red-400">block</span>
                  <h1 class="text-white text-lg font-extrabold mt-2">Restaurante suspendido</h1>
                  <p class="text-dark-300 text-sm mt-1">El acceso de {{ tenant.restaurant()?.nombre ?? 'este restaurante' }} está pausado. Comunícate con tu proveedor del sistema.</p>
                  <button (click)="deactivate()" class="w-full mt-6 py-3 rounded-2xl bg-dark-700 text-white text-sm font-semibold">
                    Usar otra cuenta
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
                <button (click)="deactivate()" class="w-full mt-3 py-3 rounded-2xl text-dark-300 hover:text-white text-sm font-semibold">
                  Usar otra cuenta
                </button>
              </div>
            }

            @case ('platform') {
              <div class="text-center">
                <span class="material-symbols-rounded text-5xl text-amber-400">admin_panel_settings</span>
                <h1 class="text-white text-lg font-extrabold mt-2">Cuenta de la plataforma</h1>
                <p class="text-dark-300 text-sm mt-1">Esta cuenta administra restaurantes; no se usa para tomar pedidos.</p>
                <a routerLink="/plataforma/panel" class="block w-full mt-6 py-3.5 rounded-2xl bg-primary-500 text-white font-bold">Ir al panel de plataforma</a>
                <button (click)="deactivate()" class="w-full mt-3 py-3 rounded-2xl text-dark-300 hover:text-white text-sm font-semibold">Cerrar sesión</button>
              </div>
            }

            @default {
              <div class="text-center mb-6">
                <span class="material-symbols-rounded text-4xl text-amber-400">phonelink_lock</span>
                <h1 class="text-white text-lg font-extrabold mt-2">Activar este equipo</h1>
                <p class="text-dark-300 text-sm mt-1">Usa la cuenta de tu restaurante. Solo se hace una vez por celular, tablet o PC.</p>
              </div>

              @if (tenant.account().kind === 'unlinked') {
                <p class="text-amber-300 text-sm font-semibold text-center bg-amber-500/10 border border-amber-500/30 rounded-2xl py-2.5 px-3 mb-4">
                  La cuenta {{ tenant.account().email }} no pertenece a ningún restaurante.
                  <button (click)="deactivate()" class="underline ml-1">Usar otra</button>
                </p>
              }

              <form (ngSubmit)="activate()" class="space-y-4">
                <div>
                  <label for="device-email" class="block text-xs font-bold text-dark-300 mb-1.5">Correo de la cuenta del restaurante</label>
                  <input id="device-email" type="email" name="email" [(ngModel)]="email" autocomplete="username"
                    class="w-full px-4 py-3.5 rounded-2xl bg-dark-900 border border-dark-600 text-white text-base focus:border-primary-500 outline-none" required>
                </div>
                <div>
                  <label for="device-password" class="block text-xs font-bold text-dark-300 mb-1.5">Contraseña</label>
                  <input id="device-password" type="password" name="password" [(ngModel)]="password" autocomplete="current-password"
                    class="w-full px-4 py-3.5 rounded-2xl bg-dark-900 border border-dark-600 text-white text-base focus:border-primary-500 outline-none" required>
                </div>

                @if (error()) {
                  <p class="text-red-400 text-sm font-bold text-center bg-red-500/15 border border-red-500/30 rounded-2xl py-2.5 px-3">{{ error() }}</p>
                }

                <button type="submit" [disabled]="isLoading() || !email || !password"
                  class="w-full py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold disabled:opacity-50">
                  {{ isLoading() ? 'Activando...' : 'Activar equipo' }}
                </button>
              </form>

              <a routerLink="/plataforma" class="block text-center text-dark-400 hover:text-dark-200 text-xs mt-6">Administración de la plataforma</a>
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

  email = '';
  password = '';
  error = signal('');
  isLoading = signal(false);

  async activate(): Promise<void> {
    this.error.set('');
    this.isLoading.set(true);
    try {
      const account = await this.tenant.signIn(this.email, this.password);
      this.password = '';
      if (account.kind === 'device' && this.tenant.activeRid()) {
        this.authService.clearSession();
        this.goToLogin();
      }
      // Otros casos (sin restaurante, suspendido, plataforma) los muestra la misma pantalla
    } catch (e: any) {
      const code = e?.code ?? '';
      if (code.includes('network')) {
        this.error.set('Sin conexión. Revisa el internet e intenta de nuevo.');
      } else if (code.includes('too-many-requests')) {
        this.error.set('Demasiados intentos. Espera unos minutos.');
      } else {
        this.error.set('Correo o contraseña incorrectos.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  async deactivate(): Promise<void> {
    this.authService.clearSession();
    await this.tenant.signOut();
  }
}

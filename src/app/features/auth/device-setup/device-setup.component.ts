import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeviceService } from '../../../core/auth/device.service';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-device-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[100dvh] w-full flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <img src="logo.png" alt="Señor Hornado" class="h-28 mx-auto object-contain mb-4 invert">
        </div>

        <div class="bg-dark-800/90 rounded-3xl p-7 border border-dark-700/80 shadow-2xl">
          @if (deviceService.device(); as device) {
            <div class="text-center">
              <span class="material-symbols-rounded text-5xl text-emerald-400">verified</span>
              <h1 class="text-white text-lg font-extrabold mt-2">Este equipo está activado</h1>
              <p class="text-dark-300 text-sm mt-1">Cuenta: {{ device.email }}</p>
              <button (click)="goToLogin()" class="w-full mt-6 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold">
                Ir al ingreso con PIN
              </button>
              <button (click)="deactivate()" class="w-full mt-3 py-3 rounded-2xl text-dark-300 hover:text-white text-sm font-semibold">
                Desactivar este equipo
              </button>
            </div>
          } @else {
            <div class="text-center mb-6">
              <span class="material-symbols-rounded text-4xl text-amber-400">phonelink_lock</span>
              <h1 class="text-white text-lg font-extrabold mt-2">Activar este equipo</h1>
              <p class="text-dark-300 text-sm mt-1">Solo se hace una vez por celular, tablet o PC. Lo debe hacer el administrador.</p>
            </div>

            <form (ngSubmit)="activate()" class="space-y-4">
              <div>
                <label for="device-email" class="block text-xs font-bold text-dark-300 mb-1.5">Correo de la cuenta de equipos</label>
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
          }
        </div>
      </div>
    </div>
  `
})
export class DeviceSetupComponent {
  public deviceService = inject(DeviceService);
  private authService = inject(AuthService);
  private router = inject(Router);

  email = environment.deviceEmail;
  password = '';
  error = signal('');
  isLoading = signal(false);

  async activate(): Promise<void> {
    this.error.set('');
    this.isLoading.set(true);
    try {
      await this.deviceService.activate(this.email, this.password);
      this.password = '';
      this.goToLogin();
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
    await this.deviceService.deactivate();
    this.authService.logout(); // borra la sesión de PIN y vuelve al inicio (el guard lleva a /activar)
  }
}

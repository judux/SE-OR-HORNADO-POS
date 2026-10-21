import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PlatformService, PlatformError } from '../../../core/platform/platform.service';

@Component({
  selector: 'app-platform-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[100dvh] w-full flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-6">
          <span class="material-symbols-rounded text-5xl text-amber-400">admin_panel_settings</span>
          <h1 class="text-white text-xl font-extrabold mt-2">Administración de la plataforma</h1>
          <p class="text-dark-300 text-sm mt-1">Crea y administra los restaurantes que usan el sistema.</p>
        </div>

        <div class="bg-dark-800/90 rounded-3xl p-7 border border-dark-700/80 shadow-2xl">
          @if (tenant.account().kind === 'device' || tenant.account().kind === 'unlinked') {
            <p class="text-amber-300 text-sm text-center mb-4">
              Hay otra cuenta abierta en este navegador ({{ tenant.account().email }}).
              <button (click)="signOutOther()" class="underline font-bold">Cerrarla</button> para continuar.
            </p>
          }

          <div class="flex bg-dark-900 rounded-2xl p-1 mb-5 text-sm font-bold">
            <button (click)="mode.set('login')" class="flex-1 py-2 rounded-xl" [class]="mode() === 'login' ? 'bg-dark-700 text-white' : 'text-dark-400'">Iniciar sesión</button>
            <button (click)="mode.set('claim')" class="flex-1 py-2 rounded-xl" [class]="mode() === 'claim' ? 'bg-dark-700 text-white' : 'text-dark-400'">Primera vez</button>
          </div>

          <form (ngSubmit)="submit()" class="space-y-4">
            @if (mode() === 'claim') {
              <p class="text-dark-300 text-xs bg-dark-900 rounded-2xl p-3">
                Crea la cuenta del <strong class="text-white">dueño de la plataforma</strong>. Esto solo se puede hacer una vez; después nadie más podrá reclamarla.
              </p>
              <div>
                <label for="pl-nombre" class="block text-xs font-bold text-dark-300 mb-1.5">Tu nombre</label>
                <input id="pl-nombre" name="nombre" [(ngModel)]="nombre" class="w-full px-4 py-3.5 rounded-2xl bg-dark-900 border border-dark-600 text-white outline-none focus:border-primary-500" required>
              </div>
            }
            <div>
              <label for="pl-email" class="block text-xs font-bold text-dark-300 mb-1.5">Correo</label>
              <input id="pl-email" type="email" name="email" [(ngModel)]="email" autocomplete="username" class="w-full px-4 py-3.5 rounded-2xl bg-dark-900 border border-dark-600 text-white outline-none focus:border-primary-500" required>
            </div>
            <div>
              <label for="pl-password" class="block text-xs font-bold text-dark-300 mb-1.5">Contraseña {{ mode() === 'claim' ? '(mínimo 8 caracteres)' : '' }}</label>
              <input id="pl-password" type="password" name="password" [(ngModel)]="password" [autocomplete]="mode() === 'claim' ? 'new-password' : 'current-password'" class="w-full px-4 py-3.5 rounded-2xl bg-dark-900 border border-dark-600 text-white outline-none focus:border-primary-500" required>
            </div>

            @if (error()) {
              <p class="text-red-400 text-sm font-bold text-center bg-red-500/15 border border-red-500/30 rounded-2xl py-2.5 px-3">{{ error() }}</p>
            }

            <button type="submit" [disabled]="isLoading()" class="w-full py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold disabled:opacity-50">
              {{ isLoading() ? 'Un momento...' : (mode() === 'claim' ? 'Crear cuenta de dueño' : 'Entrar') }}
            </button>
          </form>
        </div>

        <a routerLink="/activar" class="block text-center text-dark-400 hover:text-dark-200 text-xs mt-6">← Volver a activar un equipo de restaurante</a>
      </div>
    </div>
  `
})
export class PlatformLoginComponent {
  public tenant = inject(TenantService);
  private platform = inject(PlatformService);
  private router = inject(Router);

  mode = signal<'login' | 'claim'>('login');
  nombre = '';
  email = '';
  password = '';
  error = signal('');
  isLoading = signal(false);

  constructor() {
    // Si ya hay sesión de dueño, ir directo al panel
    effect(() => {
      if (this.tenant.account().kind === 'platform') {
        this.router.navigate(['/plataforma/panel']);
      }
    });
  }

  async signOutOther(): Promise<void> {
    await this.tenant.signOut();
  }

  async submit(): Promise<void> {
    this.error.set('');
    if (this.mode() === 'claim' && this.password.length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    this.isLoading.set(true);
    try {
      if (this.mode() === 'claim') {
        await this.platform.claimPlatform(this.nombre, this.email, this.password);
      } else {
        const account = await this.tenant.signIn(this.email, this.password);
        if (account.kind !== 'platform') {
          await this.tenant.signOut();
          this.error.set('Esa cuenta no es de administración de la plataforma.');
        }
      }
      this.password = '';
    } catch (e: any) {
      const code = e?.code ?? '';
      if (e instanceof PlatformError) this.error.set(e.message);
      else if (code.includes('email-already-in-use')) this.error.set('Ese correo ya tiene una cuenta. Usa "Iniciar sesión".');
      else if (code.includes('network')) this.error.set('Sin conexión. Revisa el internet.');
      else if (code.includes('too-many-requests')) this.error.set('Demasiados intentos. Espera unos minutos.');
      else this.error.set(this.mode() === 'claim' ? 'No se pudo crear la cuenta.' : 'Correo o contraseña incorrectos.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

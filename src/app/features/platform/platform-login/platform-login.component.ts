import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PlatformService, PlatformError } from '../../../core/platform/platform.service';
import { GoogleSignInComponent } from '../../../shared/components/google-sign-in/google-sign-in.component';

/**
 * /plataforma — acceso del dueño de la plataforma (con Google). Ninguna pantalla de los restaurantes
 * enlaza aquí; aun así, la seguridad real son las reglas: solo la cuenta dueña puede administrar.
 */
@Component({
  selector: 'app-platform-login',
  standalone: true,
  imports: [GoogleSignInComponent],
  template: `
    <div class="min-h-[100dvh] w-full flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-6">
          <span class="material-symbols-rounded text-5xl text-amber-400">admin_panel_settings</span>
          <h1 class="text-white text-2xl font-black mt-2 tracking-tight">KINO-POS</h1>
          <p class="text-dark-300 text-sm">Administración de la plataforma</p>
        </div>

        <div class="bg-dark-800/90 rounded-3xl p-7 border border-dark-700/80 shadow-2xl">
          @switch (view()) {
            @case ('cargando') {
              <p class="text-center text-dark-300 py-6">Un momento...</p>
            }
            @case ('entrar') {
              <app-google-sign-in (signedIn)="check()" />
            }
            @case ('reclamar') {
              <p class="text-dark-300 text-sm text-center">La plataforma todavía no tiene dueño.</p>
              <p class="text-white text-sm text-center font-bold mt-1">{{ tenant.account().email }}</p>
              <p class="text-dark-400 text-xs text-center mt-3">Esto se hace una sola vez: después nadie más podrá reclamarla.</p>
              <button (click)="claim()" [disabled]="busy()" class="w-full mt-5 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold disabled:opacity-50">
                {{ busy() ? 'Un momento...' : 'Ser el dueño de la plataforma' }}
              </button>
            }
            @case ('denegado') {
              <p class="text-amber-300 text-sm text-center">La cuenta <strong>{{ tenant.account().email }}</strong> no administra la plataforma.</p>
            }
          }

          @if (error()) {
            <p class="text-red-400 text-sm font-bold text-center mt-4">{{ error() }}</p>
          }
          @if (view() === 'reclamar' || view() === 'denegado') {
            <button (click)="signOut()" class="w-full mt-4 py-2 text-dark-400 hover:text-dark-200 text-xs">Usar otra cuenta de Google</button>
          }
        </div>
      </div>
    </div>
  `
})
export class PlatformLoginComponent {
  public tenant = inject(TenantService);
  private platform = inject(PlatformService);
  private router = inject(Router);

  view = signal<'cargando' | 'entrar' | 'reclamar' | 'denegado'>('cargando');
  error = signal('');
  busy = signal(false);

  constructor() {
    // Con sesión de dueño: directo al panel
    effect(() => {
      if (this.tenant.account().kind === 'platform') {
        queueMicrotask(() => this.router.navigate(['/plataforma/panel']));
      }
    });
    this.check();
  }

  async check(): Promise<void> {
    this.error.set('');
    const account = await this.tenant.whenResolved();
    const user = this.tenant.currentUser();
    if (account.kind === 'platform') return; // el effect redirige
    if (!user || user.isAnonymous) {
      if (user?.isAnonymous) await this.tenant.signOut(); // celular de personal: no sirve aquí
      this.view.set('entrar');
      return;
    }
    try {
      this.view.set((await this.platform.ownerExists()) ? 'denegado' : 'reclamar');
    } catch {
      this.error.set('Sin conexión. Revisa el internet.');
      this.view.set('entrar');
    }
  }

  async claim(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.platform.claimPlatform();
    } catch (e: any) {
      this.error.set(e instanceof PlatformError ? e.message : 'No se pudo completar. Revisa la conexión.');
      this.view.set('denegado');
    } finally {
      this.busy.set(false);
    }
  }

  async signOut(): Promise<void> {
    await this.tenant.signOut();
    this.view.set('entrar');
  }
}

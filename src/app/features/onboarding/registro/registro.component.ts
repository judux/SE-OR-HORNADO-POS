import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';
import { SolicitudService } from '../../../core/onboarding/solicitud.service';
import { GoogleSignInComponent } from '../../../shared/components/google-sign-in/google-sign-in.component';
import { Solicitud } from '../../../shared/interfaces';

/**
 * /registro — enlace que el dueño de la plataforma le pasa a un restaurante nuevo.
 * El futuro administrador entra con Google y envía su solicitud; queda "en revisión" hasta que se apruebe.
 */
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, GoogleSignInComponent],
  template: `
    <div class="min-h-[100dvh] w-full flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-6">
          <span class="material-symbols-rounded text-5xl text-amber-400">storefront</span>
          <h1 class="text-white text-xl font-extrabold mt-2">Registra tu restaurante</h1>
          <p class="text-dark-300 text-sm mt-1">Sistema de pedidos y caja para tu negocio.</p>
        </div>

        <div class="bg-dark-800/90 rounded-3xl p-7 border border-dark-700/80 shadow-2xl">
          @switch (view()) {
            @case ('cargando') {
              <p class="text-center text-dark-300 py-6">Un momento...</p>
            }

            @case ('entrar') {
              <p class="text-dark-300 text-sm mb-4 text-center">Entra con la cuenta de Google con la que vas a administrar tu restaurante.</p>
              <app-google-sign-in (signedIn)="load()" />
            }

            @case ('formulario') {
              <form (ngSubmit)="send()" class="space-y-4">
                <p class="text-dark-300 text-xs">Cuenta: <strong class="text-white">{{ tenant.account().email }}</strong></p>
                <label class="block">
                  <span class="text-xs font-bold text-dark-300">Nombre del restaurante</span>
                  <input name="restaurante" [(ngModel)]="nombreRestaurante" class="w-full mt-1.5 px-4 py-3.5 rounded-2xl bg-dark-900 border border-dark-600 text-white outline-none focus:border-primary-500" required>
                </label>
                <label class="block">
                  <span class="text-xs font-bold text-dark-300">Tu nombre</span>
                  <input name="contacto" [(ngModel)]="nombreContacto" class="w-full mt-1.5 px-4 py-3.5 rounded-2xl bg-dark-900 border border-dark-600 text-white outline-none focus:border-primary-500" required>
                </label>
                <label class="block">
                  <span class="text-xs font-bold text-dark-300">Teléfono / WhatsApp (opcional)</span>
                  <input name="telefono" type="tel" [(ngModel)]="telefono" class="w-full mt-1.5 px-4 py-3.5 rounded-2xl bg-dark-900 border border-dark-600 text-white outline-none focus:border-primary-500">
                </label>
                @if (error()) {
                  <p class="text-red-400 text-sm font-bold text-center">{{ error() }}</p>
                }
                <button type="submit" [disabled]="sending()" class="w-full py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold disabled:opacity-50">
                  {{ sending() ? 'Enviando...' : 'Enviar solicitud' }}
                </button>
              </form>
            }

            @case ('pendiente') {
              <div class="text-center">
                <span class="material-symbols-rounded text-5xl text-amber-400">hourglass_top</span>
                <h2 class="text-white font-extrabold mt-2">Solicitud en revisión</h2>
                <p class="text-dark-300 text-sm mt-1"><strong class="text-white">{{ solicitud()?.nombre_restaurante }}</strong> está pendiente de aprobación. Te avisaremos cuando esté listo; después solo entras aquí con tu Google.</p>
                <button (click)="load()" class="w-full mt-6 py-3 rounded-2xl bg-dark-700 text-white text-sm font-semibold">Revisar de nuevo</button>
              </div>
            }

            @case ('rechazada') {
              <div class="text-center">
                <span class="material-symbols-rounded text-5xl text-red-400">cancel</span>
                <h2 class="text-white font-extrabold mt-2">Solicitud no aprobada</h2>
                <p class="text-dark-300 text-sm mt-1">Comunícate con tu proveedor del sistema para más información.</p>
              </div>
            }
          }

          @if (view() !== 'entrar' && view() !== 'cargando') {
            <button (click)="signOut()" class="w-full mt-4 py-2 text-dark-400 hover:text-dark-200 text-xs">Usar otra cuenta de Google</button>
          }
        </div>
      </div>
    </div>
  `
})
export class RegistroComponent {
  public tenant = inject(TenantService);
  private solicitudes = inject(SolicitudService);
  private router = inject(Router);

  view = signal<'cargando' | 'entrar' | 'formulario' | 'pendiente' | 'rechazada'>('cargando');
  solicitud = signal<Solicitud | null>(null);
  nombreRestaurante = '';
  nombreContacto = '';
  telefono = '';
  error = signal('');
  sending = signal(false);

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.view.set('cargando');
    const account = await this.tenant.whenResolved();
    if (account.kind === 'device') { this.router.navigate(['/login']); return; }
    if (account.kind === 'platform') { this.router.navigate(['/plataforma/panel']); return; }
    const user = this.tenant.currentUser();
    if (account.kind === 'none' || !user || user.isAnonymous) { this.view.set('entrar'); return; }

    try {
      const mine = await this.solicitudes.mine();
      this.solicitud.set(mine);
      if (!mine) {
        this.nombreContacto = this.nombreContacto || user.displayName || '';
        this.view.set('formulario');
      } else if (mine.estado === 'pendiente') {
        this.view.set('pendiente');
      } else if (mine.estado === 'aprobada') {
        // Ya aprobada: volver a identificar la cuenta (ahora es administrador de un restaurante)
        await this.tenant.refresh();
        this.router.navigate(['/login']);
      } else {
        this.view.set('rechazada');
      }
    } catch {
      this.error.set('Sin conexión. Revisa el internet.');
      this.view.set('formulario');
    }
  }

  async send(): Promise<void> {
    this.error.set('');
    this.sending.set(true);
    try {
      await this.solicitudes.create(this.nombreRestaurante, this.nombreContacto, this.telefono);
      await this.load();
    } catch (e: any) {
      this.error.set(e?.message?.startsWith('Completa') || e?.message?.startsWith('Primero') ? e.message : 'No se pudo enviar. Revisa la conexión.');
    } finally {
      this.sending.set(false);
    }
  }

  async signOut(): Promise<void> {
    await this.tenant.signOut();
    this.view.set('entrar');
  }
}

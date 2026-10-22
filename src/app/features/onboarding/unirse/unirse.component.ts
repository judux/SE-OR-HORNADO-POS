import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * /unirse/:rid/:token — enlace único del restaurante que el administrador comparte con su personal.
 * Vincula este celular a ESE restaurante (sin cuenta de Google) y lleva al ingreso con PIN.
 */
@Component({
  selector: 'app-unirse',
  standalone: true,
  template: `
    <div class="min-h-app w-full flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full max-w-sm bg-dark-800/90 rounded-3xl p-7 border border-dark-700/80 shadow-2xl text-center">
        @switch (status()) {
          @case ('trabajando') {
            <span class="material-symbols-rounded text-5xl text-amber-400 animate-pulse">link</span>
            <p class="text-white font-bold mt-3">Vinculando este equipo...</p>
          }
          @case ('otro') {
            <span class="material-symbols-rounded text-5xl text-amber-400">swap_horiz</span>
            <h1 class="text-white font-extrabold mt-2">Este equipo ya está en otro lugar</h1>
            <p class="text-dark-300 text-sm mt-1">Está vinculado a <strong class="text-white">{{ tenant.restaurant()?.nombre ?? 'otra cuenta' }}</strong>. ¿Quieres cambiarlo a este restaurante?</p>
            <button (click)="switchAndJoin()" class="w-full mt-6 py-3.5 rounded-2xl bg-primary-500 text-white font-bold">Sí, cambiar</button>
            <button (click)="goToLogin()" class="w-full mt-3 py-3 rounded-2xl text-dark-300 text-sm font-semibold">No, mantener</button>
          }
          @case ('invalido') {
            <span class="material-symbols-rounded text-5xl text-red-400">link_off</span>
            <h1 class="text-white font-extrabold mt-2">Enlace no válido</h1>
            <p class="text-dark-300 text-sm mt-1">Este enlace venció, fue reemplazado o el restaurante está suspendido. Pídele uno nuevo a tu administrador.</p>
          }
          @case ('error') {
            <span class="material-symbols-rounded text-5xl text-amber-400">wifi_off</span>
            <h1 class="text-white font-extrabold mt-2">Sin conexión</h1>
            <p class="text-dark-300 text-sm mt-1">Se necesita internet para vincular el equipo la primera vez.</p>
            <button (click)="join()" class="w-full mt-6 py-3.5 rounded-2xl bg-primary-500 text-white font-bold">Reintentar</button>
          }
        }
      </div>
    </div>
  `
})
export class UnirseComponent {
  public tenant = inject(TenantService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  status = signal<'trabajando' | 'otro' | 'invalido' | 'error'>('trabajando');
  private rid = this.route.snapshot.paramMap.get('rid') ?? '';
  private token = this.route.snapshot.paramMap.get('token') ?? '';

  constructor() {
    this.join();
  }

  async join(): Promise<void> {
    this.status.set('trabajando');
    if (!this.rid || !this.token) { this.status.set('invalido'); return; }
    try {
      const result = await this.tenant.joinRestaurant(this.rid, this.token);
      if (result === 'joined' || result === 'already') {
        if (result === 'joined') this.authService.clearSession();
        this.goToLogin();
      } else if (result === 'other-restaurant') {
        this.status.set('otro');
      } else {
        this.status.set('invalido');
      }
    } catch (e: any) {
      this.status.set((e?.code ?? '').includes('network') ? 'error' : 'invalido');
    }
  }

  /** Desvincula el equipo de su restaurante actual y lo vincula a este. */
  async switchAndJoin(): Promise<void> {
    this.authService.clearSession();
    await this.tenant.signOut();
    await this.join();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

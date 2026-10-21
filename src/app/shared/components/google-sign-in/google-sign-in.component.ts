import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TenantService, AccountState } from '../../../core/tenant/tenant.service';
import { environment } from '../../../../environments/environment';

/**
 * Botón "Continuar con Google". En el emulador local muestra además un acceso con correo
 * (solo para pruebas; nunca aparece en producción).
 */
@Component({
  selector: 'app-google-sign-in',
  standalone: true,
  imports: [FormsModule],
  template: `
    <button type="button" (click)="google()" [disabled]="loading()"
      class="w-full py-3.5 rounded-2xl bg-white hover:bg-gray-100 text-gray-800 font-bold flex items-center justify-center gap-3 shadow disabled:opacity-60">
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/>
      </svg>
      {{ loading() ? 'Abriendo Google...' : 'Continuar con Google' }}
    </button>

    @if (error()) {
      <p class="text-red-400 text-sm font-bold text-center mt-3">{{ error() }}</p>
    }

    @if (isEmulator) {
      <details class="mt-4 text-left">
        <summary class="text-xs text-amber-300 cursor-pointer">Solo pruebas (emulador): entrar con correo</summary>
        <form (ngSubmit)="emailForTesting()" class="space-y-2 mt-2">
          <input name="email" [(ngModel)]="email" placeholder="correo" class="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-600 text-white text-sm">
          <input name="password" type="password" [(ngModel)]="password" placeholder="contraseña" class="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-600 text-white text-sm">
          <button type="submit" class="w-full py-2 rounded-xl bg-dark-700 text-white text-sm font-semibold">Entrar (prueba)</button>
        </form>
      </details>
    }
  `
})
export class GoogleSignInComponent {
  private tenant = inject(TenantService);
  @Output() signedIn = new EventEmitter<AccountState>();

  readonly isEmulator = environment.useEmulators;
  loading = signal(false);
  error = signal('');
  email = '';
  password = '';

  async google(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      this.signedIn.emit(await this.tenant.signInWithGoogle());
    } catch (e: any) {
      const code = e?.code ?? '';
      if (code.includes('popup-closed') || code.includes('cancelled-popup')) this.error.set('');
      else if (code.includes('popup-blocked')) this.error.set('El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e intenta de nuevo.');
      else if (code.includes('network')) this.error.set('Sin conexión. Revisa el internet.');
      else if (code.includes('operation-not-allowed')) this.error.set('El ingreso con Google no está habilitado todavía.');
      else if (code.includes('unauthorized-domain')) this.error.set(`Esta dirección (${window.location.hostname}) no está autorizada para entrar con Google. Avisa al soporte de KINO-POS.`);
      else this.error.set('No se pudo entrar con Google. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  async emailForTesting(): Promise<void> {
    this.error.set('');
    try {
      this.signedIn.emit(await this.tenant.signInWithEmailForTesting(this.email, this.password));
    } catch {
      this.error.set('Correo o contraseña incorrectos.');
    }
  }
}

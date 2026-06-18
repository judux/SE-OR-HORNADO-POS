import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SuperAdminService } from '../../../core/auth/super-admin.service';

@Component({
    selector: 'app-super-admin-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-primary-500 flex items-center justify-center mb-4">
            <span class="material-symbols-rounded text-white text-3xl">admin_panel_settings</span>
          </div>
          <h1 class="text-2xl font-black text-white">Panel de Plataforma</h1>
          <p class="text-dark-400 text-sm mt-1">Acceso de Super Administrador</p>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl p-8 border border-dark-100 dark:border-dark-700">
          @if (error()) {
            <div class="text-center mb-4 py-2 px-4 bg-primary-50 border border-primary-200 rounded-xl">
              <p class="text-primary-600 text-sm font-medium">{{ error() }}</p>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Correo</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                autocomplete="username"
                class="w-full px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-900/50 border border-dark-100 dark:border-dark-700
                       text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="tucorreo@dominio.com"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                autocomplete="current-password"
                class="w-full px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-900/50 border border-dark-100 dark:border-dark-700
                       text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold
                     transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              @if (isLoading()) {
                <span class="material-symbols-rounded animate-spin">progress_activity</span>
              } @else {
                Ingresar
              }
            </button>
          </form>

          <!-- Separador -->
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-dark-100 dark:bg-dark-700"></div>
            <span class="text-xs text-dark-400">o</span>
            <div class="flex-1 h-px bg-dark-100 dark:bg-dark-700"></div>
          </div>

          <!-- Login con Google -->
          <button
            type="button"
            (click)="onGoogle()"
            [disabled]="isLoading()"
            class="w-full h-12 rounded-xl bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700
                   hover:bg-dark-50 dark:hover:bg-dark-800 active:scale-95 text-dark-700 dark:text-dark-200 font-bold
                   transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 42c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.7 32.4 27 33 24 33c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 37.6 16.2 42 24 42z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.6C42.2 35.7 44 30.3 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SuperAdminLoginComponent {
    private superAdminService = inject(SuperAdminService);
    private router = inject(Router);

    email = '';
    password = '';
    error = signal('');
    isLoading = signal(false);

    async onSubmit(): Promise<void> {
        if (!this.email || !this.password) {
            this.error.set('Ingresa correo y contraseña.');
            return;
        }

        this.error.set('');
        this.isLoading.set(true);

        const sa = await this.superAdminService.login(this.email.trim(), this.password);

        if (sa) {
            this.router.navigate(['/super-admin']);
        } else {
            this.error.set('Credenciales inválidas o sin permiso de super admin.');
        }

        this.isLoading.set(false);
    }

    async onGoogle(): Promise<void> {
        this.error.set('');
        this.isLoading.set(true);

        const sa = await this.superAdminService.loginWithGoogle();

        if (sa) {
            this.router.navigate(['/super-admin']);
        } else {
            this.error.set('Esta cuenta de Google no tiene permiso de super admin.');
        }

        this.isLoading.set(false);
    }
}

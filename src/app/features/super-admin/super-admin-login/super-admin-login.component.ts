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
}

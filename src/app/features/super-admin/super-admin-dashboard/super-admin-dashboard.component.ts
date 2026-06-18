import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { SuperAdminService } from '../../../core/auth/super-admin.service';

@Component({
    selector: 'app-super-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-dark-50 dark:bg-dark-900">
      <!-- Header -->
      <header class="bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700 sticky top-0 z-10">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <span class="material-symbols-rounded text-white">storefront</span>
            </div>
            <div>
              <h1 class="font-black text-dark-800 dark:text-white leading-tight">Plataforma POS</h1>
              <p class="text-xs text-dark-400">{{ superAdmin()?.nombre }}</p>
            </div>
          </div>
          <button (click)="logout()" class="px-4 py-2 text-sm font-bold text-dark-500 hover:text-primary-600 flex items-center gap-1">
            <span class="material-symbols-rounded text-[18px]">logout</span> Salir
          </button>
        </div>
      </header>

      <main class="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <!-- KPIs -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700">
            <p class="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Restaurantes</p>
            <p class="text-3xl font-black text-dark-800 dark:text-white">{{ restaurants().length }}</p>
          </div>
          <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700">
            <p class="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Activos</p>
            <p class="text-3xl font-black text-green-600">{{ activeCount() }}</p>
          </div>
          <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700">
            <p class="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Plan Pro</p>
            <p class="text-3xl font-black text-purple-600">{{ proCount() }}</p>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-dark-800 dark:text-white">Restaurantes</h2>
          <button (click)="openCreate()" class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
            <span class="material-symbols-rounded text-[18px]">add</span> Nuevo
          </button>
        </div>

        <!-- Lista -->
        @if (restaurants().length === 0) {
          <div class="bg-white dark:bg-dark-800 rounded-2xl p-10 text-center border border-dark-100 dark:border-dark-700">
            <span class="material-symbols-rounded text-4xl text-dark-300 mb-2">storefront</span>
            <p class="text-dark-400 font-medium">Aún no hay restaurantes. Crea el primero.</p>
          </div>
        } @else {
          <div class="grid gap-3">
            @for (r of restaurants(); track r.id) {
              <div class="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-dark-100 dark:border-dark-700 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-dark-50 dark:bg-dark-900 flex items-center justify-center overflow-hidden shrink-0">
                  @if (r.logo_url) {
                    <img [src]="r.logo_url" [alt]="r.nombre" class="w-full h-full object-cover" />
                  } @else {
                    <span class="material-symbols-rounded text-dark-300">restaurant</span>
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-dark-800 dark:text-white truncate">{{ r.nombre }}</p>
                  <p class="text-xs text-dark-400 truncate">/r/{{ r.slug }}</p>
                </div>
                <span class="px-2 py-0.5 rounded-lg text-xs font-bold"
                  [class]="r.plan === 'pro' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-600' : 'bg-dark-50 dark:bg-dark-900 text-dark-500'">
                  {{ r.plan === 'pro' ? 'Pro' : 'Básico' }}
                </span>
                <button (click)="toggle(r.id, !r.activo)"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  [class]="r.activo
                    ? 'bg-green-50 dark:bg-green-900/40 text-green-700 hover:bg-green-100'
                    : 'bg-red-50 dark:bg-red-900/40 text-red-700 hover:bg-red-100'">
                  {{ r.activo ? 'Activo' : 'Suspendido' }}
                </button>
              </div>
            }
          </div>
        }
      </main>

      <!-- Modal Crear -->
      @if (showCreate()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-20" (click)="closeCreate()">
          <div class="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
              <h3 class="font-bold text-dark-800 dark:text-white">Nuevo Restaurante</h3>
              <button (click)="closeCreate()" class="text-dark-400 hover:text-dark-600">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>

            <form (ngSubmit)="create()" class="p-6 space-y-4">
              @if (formError()) {
                <div class="py-2 px-4 bg-primary-50 border border-primary-200 rounded-xl">
                  <p class="text-primary-600 text-sm font-medium">{{ formError() }}</p>
                </div>
              }

              <div>
                <label class="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Nombre del restaurante</label>
                <input name="nombre" [(ngModel)]="form.nombre" (ngModelChange)="onNombreChange()" required
                  class="w-full px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-900/50 border border-dark-100 dark:border-dark-700 text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>

              <div>
                <label class="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Identificador (URL)</label>
                <div class="flex items-center gap-1">
                  <span class="text-dark-400 text-sm">/r/</span>
                  <input name="slug" [(ngModel)]="form.slug" required
                    class="flex-1 px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-900/50 border border-dark-100 dark:border-dark-700 text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Plan</label>
                <select name="plan" [(ngModel)]="form.plan"
                  class="w-full px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-900/50 border border-dark-100 dark:border-dark-700 text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="basico">Básico</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div class="pt-2 border-t border-dark-100 dark:border-dark-700">
                <p class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-3">Primer Administrador</p>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Nombre del admin</label>
                    <input name="adminNombre" [(ngModel)]="form.adminNombre" required
                      class="w-full px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-900/50 border border-dark-100 dark:border-dark-700 text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">PIN del admin (4 dígitos)</label>
                    <input name="adminPin" [(ngModel)]="form.adminPin" maxlength="4" inputmode="numeric" required
                      class="w-full px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-900/50 border border-dark-100 dark:border-dark-700 text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 tracking-[0.5em]" />
                  </div>
                </div>
              </div>

              <button type="submit" [disabled]="isSaving()"
                class="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                @if (isSaving()) {
                  <span class="material-symbols-rounded animate-spin">progress_activity</span>
                } @else {
                  Crear Restaurante
                }
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class SuperAdminDashboardComponent {
    private restaurantService = inject(RestaurantService);
    private superAdminService = inject(SuperAdminService);

    restaurants = this.restaurantService.allRestaurants;
    superAdmin = this.superAdminService.superAdmin;

    activeCount = computed(() => this.restaurants().filter(r => r.activo).length);
    proCount = computed(() => this.restaurants().filter(r => r.plan === 'pro').length);

    showCreate = signal(false);
    isSaving = signal(false);
    formError = signal('');

    form = {
        nombre: '',
        slug: '',
        plan: 'basico' as 'basico' | 'pro',
        adminNombre: '',
        adminPin: '',
    };

    openCreate(): void {
        this.resetForm();
        this.showCreate.set(true);
    }

    closeCreate(): void {
        this.showCreate.set(false);
    }

    /** Autogenera el slug a partir del nombre mientras no se edite manualmente. */
    onNombreChange(): void {
        this.form.slug = this.restaurantService.normalizeSlug(this.form.nombre);
    }

    async create(): Promise<void> {
        this.formError.set('');

        if (!this.form.nombre.trim() || !this.form.slug.trim()) {
            this.formError.set('Nombre e identificador son obligatorios.');
            return;
        }
        if (!/^\d{4}$/.test(this.form.adminPin)) {
            this.formError.set('El PIN del admin debe tener exactamente 4 dígitos.');
            return;
        }
        if (!this.form.adminNombre.trim()) {
            this.formError.set('El nombre del admin es obligatorio.');
            return;
        }

        this.isSaving.set(true);

        const id = await this.restaurantService.createRestaurant(
            {
                nombre: this.form.nombre.trim(),
                slug: this.form.slug.trim(),
                plan: this.form.plan,
            },
            {
                nombre: this.form.adminNombre.trim(),
                pin_acceso: this.form.adminPin,
            }
        );

        this.isSaving.set(false);

        if (id) {
            this.closeCreate();
        } else {
            this.formError.set('No se pudo crear. El identificador puede estar en uso.');
        }
    }

    async toggle(id: string, activo: boolean): Promise<void> {
        await this.restaurantService.toggleActivo(id, activo);
    }

    logout(): void {
        this.superAdminService.logout();
    }

    private resetForm(): void {
        this.form = { nombre: '', slug: '', plan: 'basico', adminNombre: '', adminPin: '' };
        this.formError.set('');
    }
}

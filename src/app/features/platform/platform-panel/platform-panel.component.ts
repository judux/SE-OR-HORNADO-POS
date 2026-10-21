import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PlatformService, PlatformError, NewRestaurantInput } from '../../../core/platform/platform.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { Restaurant } from '../../../shared/interfaces';

@Component({
  selector: 'app-platform-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-[100dvh] bg-dark-50 dark:bg-dark-900">
      <header class="bg-dark-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-rounded text-amber-400">admin_panel_settings</span>
          <div>
            <h1 class="font-extrabold leading-tight">Plataforma</h1>
            <p class="text-xs text-dark-300">{{ tenant.account().email }}</p>
          </div>
        </div>
        <button (click)="logout()" class="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-sm font-semibold flex items-center gap-1.5">
          <span class="material-symbols-rounded text-[18px]">logout</span> Salir
        </button>
      </header>

      <main class="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-extrabold text-dark-900 dark:text-white">Restaurantes</h2>
            <p class="text-sm text-dark-500 dark:text-dark-400">{{ restaurants().length }} en total</p>
          </div>
          <button (click)="openCreate()" class="px-4 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold flex items-center gap-2">
            <span class="material-symbols-rounded">add_business</span> Nuevo restaurante
          </button>
        </div>

        @if (restaurants().length === 0) {
          <div class="bg-white dark:bg-dark-800 rounded-3xl p-10 text-center border border-dark-100 dark:border-dark-700">
            <span class="material-symbols-rounded text-5xl text-dark-300">storefront</span>
            <p class="font-bold text-dark-700 dark:text-dark-200 mt-2">Aún no hay restaurantes</p>
            <p class="text-sm text-dark-400">Crea el primero con el botón "Nuevo restaurante".</p>
          </div>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2">
            @for (r of restaurants(); track r.id) {
              <div class="bg-white dark:bg-dark-800 rounded-3xl p-5 border border-dark-100 dark:border-dark-700">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h3 class="font-extrabold text-dark-900 dark:text-white truncate">{{ r.nombre }}</h3>
                    <p class="text-xs text-dark-500 dark:text-dark-400 truncate">Cuenta: {{ r.cuenta_email }}</p>
                    <p class="text-[11px] text-dark-400 font-mono truncate">{{ r.id }}</p>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                    [class]="r.estado === 'activo' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'">
                    {{ r.estado === 'activo' ? 'Activo' : 'Suspendido' }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-2 mt-4">
                  <button (click)="toggleEstado(r)" class="px-3 py-2 rounded-xl text-sm font-semibold border"
                    [class]="r.estado === 'activo' ? 'border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300'">
                    {{ r.estado === 'activo' ? 'Suspender' : 'Reactivar' }}
                  </button>
                  <button (click)="openAddAdmin(r)" class="px-3 py-2 rounded-xl text-sm font-semibold border border-dark-200 dark:border-dark-600 text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700">
                    Agregar administrador
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </main>

      <!-- Crear restaurante -->
      @if (showCreate()) {
        <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" (click)="showCreate.set(false)">
          <form (ngSubmit)="create()" (click)="$event.stopPropagation()" class="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-lg max-h-[90dvh] overflow-y-auto p-6 space-y-4">
            <h3 class="text-lg font-extrabold text-dark-900 dark:text-white">Nuevo restaurante</h3>

            <fieldset class="space-y-3">
              <legend class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Restaurante</legend>
              <label class="block">
                <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">Nombre</span>
                <input name="nombre" [(ngModel)]="form.nombre" class="input-field mt-1" placeholder="Ej: Señor Hornado" required>
              </label>
            </fieldset>

            <fieldset class="space-y-3">
              <legend class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Cuenta para activar sus equipos</legend>
              <label class="block">
                <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">Correo</span>
                <input name="cuentaEmail" type="email" [(ngModel)]="form.cuentaEmail" class="input-field mt-1" placeholder="Ej: caja@senorhornado.com" autocomplete="off" required>
              </label>
              <label class="block">
                <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">Contraseña (mínimo 8 caracteres)</span>
                <input name="cuentaPassword" type="password" [(ngModel)]="form.cuentaPassword" class="input-field mt-1" autocomplete="new-password" required>
              </label>
              <p class="text-xs text-dark-400">El correo no tiene que existir de verdad; es el usuario con el que el restaurante activa sus celulares y su caja.</p>
            </fieldset>

            <fieldset class="space-y-3">
              <legend class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Administrador del restaurante</legend>
              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">Nombre</span>
                  <input name="adminNombre" [(ngModel)]="form.adminNombre" class="input-field mt-1" required>
                </label>
                <label class="block">
                  <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">PIN (4 dígitos)</span>
                  <input name="adminPin" [(ngModel)]="form.adminPin" class="input-field mt-1" inputmode="numeric" maxlength="4" autocomplete="off" required>
                </label>
              </div>
              <p class="text-xs text-dark-400">Con este PIN el administrador entra y crea a sus cajeros y meseros.</p>
            </fieldset>

            @if (legacy().productos + legacy().mesas > 0) {
              <label class="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <input type="checkbox" name="copiarLegado" [(ngModel)]="form.copiarLegado" class="mt-1">
                <span class="text-sm text-amber-900 dark:text-amber-200">
                  Copiar el menú ({{ legacy().productos }} productos) y las mesas ({{ legacy().mesas }}) de la versión anterior del sistema
                </span>
              </label>
            }

            @if (formError()) {
              <p class="text-red-600 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-950/40 rounded-2xl p-3">{{ formError() }}</p>
            }

            <div class="flex gap-3 pt-2">
              <button type="button" (click)="showCreate.set(false)" class="flex-1 py-3 rounded-2xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-white font-bold">Cancelar</button>
              <button type="submit" [disabled]="isSaving()" class="flex-1 py-3 rounded-2xl bg-primary-500 text-white font-bold disabled:opacity-50">
                {{ isSaving() ? 'Creando...' : 'Crear restaurante' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Agregar administrador -->
      @if (adminTarget(); as target) {
        <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" (click)="adminTarget.set(null)">
          <form (ngSubmit)="addAdmin()" (click)="$event.stopPropagation()" class="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <h3 class="text-lg font-extrabold text-dark-900 dark:text-white">Nuevo administrador</h3>
            <p class="text-sm text-dark-500">{{ target.nombre }}</p>
            <label class="block">
              <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">Nombre</span>
              <input name="adminNombre2" [(ngModel)]="adminForm.nombre" class="input-field mt-1" required>
            </label>
            <label class="block">
              <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">PIN (4 dígitos)</span>
              <input name="adminPin2" [(ngModel)]="adminForm.pin" class="input-field mt-1" inputmode="numeric" maxlength="4" autocomplete="off" required>
            </label>
            @if (formError()) {
              <p class="text-red-600 dark:text-red-400 text-sm font-bold">{{ formError() }}</p>
            }
            <div class="flex gap-3">
              <button type="button" (click)="adminTarget.set(null)" class="flex-1 py-3 rounded-2xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-white font-bold">Cancelar</button>
              <button type="submit" [disabled]="isSaving()" class="flex-1 py-3 rounded-2xl bg-primary-500 text-white font-bold disabled:opacity-50">Agregar</button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class PlatformPanelComponent {
  public tenant = inject(TenantService);
  private platform = inject(PlatformService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  restaurants = toSignal(this.platform.restaurants$().pipe(catchError(() => of([] as Restaurant[]))), { initialValue: [] as Restaurant[] });
  legacy = signal({ productos: 0, mesas: 0 });

  showCreate = signal(false);
  isSaving = signal(false);
  formError = signal('');
  form: NewRestaurantInput = this.emptyForm();

  adminTarget = signal<Restaurant | null>(null);
  adminForm = { nombre: '', pin: '' };

  private emptyForm(): NewRestaurantInput {
    return { nombre: '', cuentaEmail: '', cuentaPassword: '', adminNombre: '', adminPin: '', copiarLegado: false };
  }

  async openCreate(): Promise<void> {
    this.form = this.emptyForm();
    this.formError.set('');
    this.showCreate.set(true);
    const counts = await this.platform.legacyCounts();
    this.legacy.set(counts);
    this.form.copiarLegado = counts.productos + counts.mesas > 0 && this.restaurants().length === 0;
  }

  async create(): Promise<void> {
    if (this.isSaving()) return;
    this.formError.set('');
    this.isSaving.set(true);
    try {
      await this.platform.createRestaurant(this.form);
      this.toast.show({ message: `Restaurante "${this.form.nombre.trim()}" creado`, type: 'success', icon: 'storefront', duration: 4000 });
      this.form = this.emptyForm();
      this.showCreate.set(false);
    } catch (e: any) {
      this.formError.set(e instanceof PlatformError ? e.message : 'No se pudo crear el restaurante. Revisa la conexión.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleEstado(r: Restaurant): Promise<void> {
    const suspender = r.estado === 'activo';
    const ok = await this.confirmDialog.confirm({
      title: suspender ? `¿Suspender ${r.nombre}?` : `¿Reactivar ${r.nombre}?`,
      message: suspender
        ? 'Sus equipos dejarán de funcionar de inmediato. No se borra ningún dato.'
        : 'Sus equipos volverán a funcionar.',
      confirmText: suspender ? 'Suspender' : 'Reactivar',
      confirmStyle: suspender ? 'danger' : 'primary',
      icon: suspender ? 'block' : 'check_circle'
    });
    if (!ok) return;
    try {
      await this.platform.setEstado(r.id, suspender ? 'suspendido' : 'activo');
      this.toast.show({ message: suspender ? 'Restaurante suspendido' : 'Restaurante reactivado', type: 'success' });
    } catch {
      this.toast.show({ message: 'No se pudo cambiar el estado', type: 'error' });
    }
  }

  openAddAdmin(r: Restaurant): void {
    this.adminForm = { nombre: '', pin: '' };
    this.formError.set('');
    this.adminTarget.set(r);
  }

  async addAdmin(): Promise<void> {
    const target = this.adminTarget();
    if (!target || this.isSaving()) return;
    this.formError.set('');
    this.isSaving.set(true);
    try {
      await this.platform.addAdmin(target.id, this.adminForm.nombre, this.adminForm.pin);
      this.toast.show({ message: 'Administrador agregado', type: 'success' });
      this.adminTarget.set(null);
    } catch (e: any) {
      this.formError.set(e instanceof PlatformError ? e.message : 'No se pudo agregar el administrador.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.tenant.signOut();
    this.router.navigate(['/plataforma']);
  }
}

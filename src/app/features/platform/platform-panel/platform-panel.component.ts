import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { TenantService } from '../../../core/tenant/tenant.service';
import { PlatformService, PlatformError, ApproveInput } from '../../../core/platform/platform.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { Restaurant, Solicitud } from '../../../shared/interfaces';

@Component({
  selector: 'app-platform-panel',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="min-h-app bg-dark-50 dark:bg-dark-900">
      <header class="bg-dark-900 text-white px-4 sm:px-6 py-4 safe-header flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <span class="material-symbols-rounded text-amber-400">admin_panel_settings</span>
          <div class="min-w-0">
            <h1 class="font-extrabold leading-tight">KINO-POS · Plataforma</h1>
            <p class="text-xs text-dark-300 truncate">{{ tenant.account().email }}</p>
          </div>
        </div>
        <button (click)="logout()" class="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-sm font-semibold flex items-center gap-1.5">
          <span class="material-symbols-rounded text-[18px]">logout</span> Salir
        </button>
      </header>

      <main class="max-w-5xl mx-auto p-4 sm:p-6 pb-safe space-y-8">
        <!-- Enlace de registro para restaurantes nuevos -->
        <section class="bg-white dark:bg-dark-800 rounded-3xl p-5 border border-dark-100 dark:border-dark-700">
          <h2 class="font-extrabold text-dark-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-rounded text-primary-500">link</span> Enlace de registro para restaurantes nuevos
          </h2>
          <p class="text-sm text-dark-500 dark:text-dark-400 mt-1">Envíaselo al dueño del restaurante. Entra con su Google y su solicitud aparece aquí abajo.</p>
          <div class="flex flex-wrap gap-2 mt-3">
            <code class="flex-1 min-w-0 truncate px-3 py-2.5 rounded-xl bg-dark-50 dark:bg-dark-900 text-sm text-dark-800 dark:text-dark-200">{{ registroUrl }}</code>
            <button (click)="copy(registroUrl)" class="px-4 py-2.5 rounded-xl bg-primary-500 text-white font-bold text-sm">Copiar</button>
          </div>
        </section>

        <!-- Solicitudes -->
        <section>
          <h2 class="text-xl font-extrabold text-dark-900 dark:text-white">Solicitudes pendientes ({{ requests().length }})</h2>
          @if (requests().length === 0) {
            <p class="text-sm text-dark-500 dark:text-dark-400 mt-2">No hay solicitudes por revisar.</p>
          } @else {
            <div class="grid gap-4 sm:grid-cols-2 mt-3">
              @for (s of requests(); track s.uid) {
                <div class="bg-white dark:bg-dark-800 rounded-3xl p-5 border-2 border-amber-300 dark:border-amber-800">
                  <h3 class="font-extrabold text-dark-900 dark:text-white">{{ s.nombre_restaurante }}</h3>
                  <p class="text-sm text-dark-600 dark:text-dark-300">{{ s.nombre_contacto }} · {{ s.email }}</p>
                  @if (s.telefono) { <p class="text-sm text-dark-500">📞 {{ s.telefono }}</p> }
                  <div class="flex gap-2 mt-4">
                    <button (click)="openApprove(s)" class="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm">Aprobar</button>
                    <button (click)="reject(s)" class="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-semibold text-sm">Rechazar</button>
                  </div>
                </div>
              }
            </div>
          }
        </section>

        <!-- Restaurantes -->
        <section>
          <h2 class="text-xl font-extrabold text-dark-900 dark:text-white">Restaurantes ({{ restaurants().length }})</h2>
          @if (restaurants().length === 0) {
            <p class="text-sm text-dark-500 dark:text-dark-400 mt-2">Aún no hay restaurantes. Aprueba una solicitud para crear el primero.</p>
          } @else {
            <div class="grid gap-4 sm:grid-cols-2 mt-3">
              @for (r of restaurants(); track r.id) {
                <div class="bg-white dark:bg-dark-800 rounded-3xl p-5 border border-dark-100 dark:border-dark-700">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h3 class="font-extrabold text-dark-900 dark:text-white truncate">{{ r.nombre }}</h3>
                      <p class="text-xs text-dark-500 dark:text-dark-400 truncate">Admin: {{ r.cuenta_email }}</p>
                      @if (r.creado_en?.toDate) { <p class="text-[11px] text-dark-400">Desde {{ r.creado_en.toDate() | date:'dd/MM/yyyy' }}</p> }
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                      [class]="r.estado === 'activo' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'">
                      {{ r.estado === 'activo' ? 'Activo' : 'Suspendido' }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-4">
                    <button (click)="toggleEstado(r)" class="px-3 py-2 rounded-xl text-sm font-semibold border"
                      [class]="r.estado === 'activo' ? 'border-red-200 text-red-700 dark:border-red-900 dark:text-red-300' : 'border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300'">
                      {{ r.estado === 'activo' ? 'Suspender' : 'Reactivar' }}
                    </button>
                    @if (r.admin_uid) {
                      <button (click)="resetPin(r)" class="px-3 py-2 rounded-xl text-sm font-semibold border border-dark-200 dark:border-dark-600 text-dark-700 dark:text-dark-200">
                        Restablecer PIN del admin
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </section>
      </main>

      <!-- Aprobar solicitud -->
      @if (approving(); as s) {
        <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" (click)="approving.set(null)">
          <form (ngSubmit)="approve()" (click)="$event.stopPropagation()" class="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-md p-6 space-y-4">
            <h3 class="text-lg font-extrabold text-dark-900 dark:text-white">Aprobar restaurante</h3>
            <p class="text-sm text-dark-500">Cuenta de Google del administrador: <strong>{{ s.email }}</strong></p>
            <label class="block">
              <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">Nombre del restaurante</span>
              <input name="nombreRestaurante" [(ngModel)]="form.nombreRestaurante" class="input-field mt-1" required>
            </label>
            <label class="block">
              <span class="text-sm font-semibold text-dark-700 dark:text-dark-200">Nombre del administrador</span>
              <input name="nombreAdmin" [(ngModel)]="form.nombreAdmin" class="input-field mt-1" required>
            </label>
            <p class="text-xs text-dark-400">El administrador elegirá su propio PIN la primera vez que entre.</p>
            @if (legacy().productos + legacy().mesas > 0) {
              <label class="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <input type="checkbox" name="copiarLegado" [(ngModel)]="form.copiarLegado" class="mt-1">
                <span class="text-sm text-amber-900 dark:text-amber-200">Copiar el menú ({{ legacy().productos }} productos) y las mesas ({{ legacy().mesas }}) de la versión anterior</span>
              </label>
            }
            @if (formError()) {
              <p class="text-red-600 dark:text-red-400 text-sm font-bold">{{ formError() }}</p>
            }
            <div class="flex gap-3 pt-2">
              <button type="button" (click)="approving.set(null)" class="flex-1 py-3 rounded-2xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-white font-bold">Cancelar</button>
              <button type="submit" [disabled]="busy()" class="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold disabled:opacity-50">
                {{ busy() ? 'Creando...' : 'Aprobar y crear' }}
              </button>
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

  readonly registroUrl = `${window.location.origin}/registro`;
  restaurants = toSignal(this.platform.restaurants$().pipe(catchError(() => of([] as Restaurant[]))), { initialValue: [] as Restaurant[] });
  requests = toSignal(this.platform.pendingRequests$().pipe(catchError(() => of([] as Solicitud[]))), { initialValue: [] as Solicitud[] });
  legacy = signal({ productos: 0, mesas: 0 });

  approving = signal<Solicitud | null>(null);
  form: ApproveInput = { nombreRestaurante: '', nombreAdmin: '', copiarLegado: false };
  formError = signal('');
  busy = signal(false);

  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.show({ message: 'Enlace copiado', type: 'success', icon: 'content_copy' });
    } catch {
      this.toast.show({ message: 'No se pudo copiar; selecciónalo y cópialo a mano', type: 'warning' });
    }
  }

  async openApprove(s: Solicitud): Promise<void> {
    this.form = { nombreRestaurante: s.nombre_restaurante, nombreAdmin: s.nombre_contacto, copiarLegado: false };
    this.formError.set('');
    this.approving.set(s);
    const counts = await this.platform.legacyCounts();
    this.legacy.set(counts);
    // Sugerir copiar el menú anterior solo para el primer restaurante
    this.form.copiarLegado = counts.productos + counts.mesas > 0 && this.restaurants().length === 0;
  }

  async approve(): Promise<void> {
    const s = this.approving();
    if (!s || this.busy()) return;
    this.busy.set(true);
    this.formError.set('');
    try {
      await this.platform.approveRequest(s, this.form);
      this.toast.show({ message: `"${this.form.nombreRestaurante.trim()}" creado. Ya puede entrar con su Google.`, type: 'success', icon: 'storefront', duration: 5000 });
      this.approving.set(null);
    } catch (e: any) {
      this.formError.set(e instanceof PlatformError ? e.message : 'No se pudo aprobar. Revisa la conexión.');
    } finally {
      this.busy.set(false);
    }
  }

  async reject(s: Solicitud): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: `¿Rechazar "${s.nombre_restaurante}"?`,
      message: `La cuenta ${s.email} verá que su solicitud no fue aprobada.`,
      confirmText: 'Rechazar',
      confirmStyle: 'danger',
      icon: 'cancel'
    });
    if (!ok) return;
    try {
      await this.platform.rejectRequest(s);
      this.toast.show({ message: 'Solicitud rechazada', type: 'info' });
    } catch {
      this.toast.show({ message: 'No se pudo rechazar', type: 'error' });
    }
  }

  async toggleEstado(r: Restaurant): Promise<void> {
    const suspender = r.estado === 'activo';
    const ok = await this.confirmDialog.confirm({
      title: suspender ? `¿Suspender ${r.nombre}?` : `¿Reactivar ${r.nombre}?`,
      message: suspender ? 'Sus equipos dejarán de funcionar de inmediato. No se borra ningún dato.' : 'Sus equipos volverán a funcionar.',
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

  async resetPin(r: Restaurant): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: `¿Restablecer el PIN del administrador de ${r.nombre}?`,
      message: 'Su PIN actual dejará de funcionar. La próxima vez que entre con su Google elegirá uno nuevo.',
      confirmText: 'Restablecer',
      confirmStyle: 'primary',
      icon: 'key'
    });
    if (!ok) return;
    try {
      await this.platform.resetAdminPin(r);
      this.toast.show({ message: 'PIN restablecido. Avísale que entre con su Google.', type: 'success' });
    } catch (e: any) {
      this.toast.show({ message: e instanceof PlatformError ? e.message : 'No se pudo restablecer', type: 'error' });
    }
  }

  async logout(): Promise<void> {
    await this.tenant.signOut();
    this.router.navigate(['/plataforma']);
  }
}

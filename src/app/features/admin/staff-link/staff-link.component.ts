import { Component, inject } from '@angular/core';
import { AccessService } from '../../../core/services/access.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

/** Tarjeta con el enlace único del restaurante para el personal (copiar, compartir, regenerar). */
@Component({
  selector: 'app-staff-link',
  standalone: true,
  template: `
    <section class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700 mb-6">
      <h3 class="font-bold text-dark-800 dark:text-white flex items-center gap-2">
        <span class="material-symbols-rounded text-primary-500">share</span> Enlace para tu personal
      </h3>
      <p class="text-sm text-dark-500 dark:text-dark-400 mt-1">
        Envíalo a tus meseros y cajeros. Lo abren en su celular, queda vinculado a {{ tenant.restaurant()?.nombre }} y entran con el PIN que les crees aquí abajo.
      </p>
      @if (access.staffLink(); as link) {
        <code class="block mt-3 px-3 py-2.5 rounded-xl bg-dark-50 dark:bg-dark-900 text-xs text-dark-700 dark:text-dark-300 break-all">{{ link }}</code>
        <div class="flex flex-wrap gap-2 mt-3">
          <button (click)="copy(link)" class="px-4 py-2.5 rounded-xl bg-primary-500 text-white font-bold text-sm flex items-center gap-1.5">
            <span class="material-symbols-rounded text-base">content_copy</span> Copiar
          </button>
          @if (canShare) {
            <button (click)="share(link)" class="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center gap-1.5">
              <span class="material-symbols-rounded text-base">send</span> Compartir
            </button>
          }
          <button (click)="regenerate()" class="px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-600 text-dark-700 dark:text-dark-200 font-semibold text-sm">
            Generar enlace nuevo
          </button>
        </div>
      } @else {
        <p class="text-sm text-dark-400 mt-3">Cargando enlace...</p>
      }
    </section>
  `
})
export class StaffLinkComponent {
  public access = inject(AccessService);
  public tenant = inject(TenantService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly canShare = typeof navigator !== 'undefined' && !!navigator.share;

  async copy(link: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(link);
      this.toast.show({ message: 'Enlace copiado', type: 'success', icon: 'content_copy' });
    } catch {
      this.toast.show({ message: 'No se pudo copiar; selecciónalo y cópialo a mano', type: 'warning' });
    }
  }

  async share(link: string): Promise<void> {
    try {
      await navigator.share({ title: this.tenant.restaurant()?.nombre ?? 'Restaurante', text: 'Abre este enlace en tu celular para entrar al sistema del restaurante:', url: link });
    } catch { /* el usuario canceló */ }
  }

  async regenerate(): Promise<void> {
    const ok = await this.confirmDialog.confirm({
      title: '¿Generar un enlace nuevo?',
      message: 'El enlace anterior dejará de servir para celulares nuevos. Los que ya están vinculados siguen funcionando.',
      confirmText: 'Generar',
      confirmStyle: 'primary',
      icon: 'autorenew'
    });
    if (!ok) return;
    try {
      await this.access.regenerate();
      this.toast.show({ message: 'Enlace nuevo listo', type: 'success' });
    } catch {
      this.toast.show({ message: 'No se pudo generar. Revisa la conexión.', type: 'error' });
    }
  }
}

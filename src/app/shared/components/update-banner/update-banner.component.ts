import { Component, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * Avisa cuando hay una versión nueva publicada. No recarga sola para no perder
 * un pedido a medio armar: el usuario decide cuándo actualizar.
 */
@Component({
  selector: 'app-update-banner',
  standalone: true,
  template: `
    @if (updateReady()) {
      <div class="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-96 z-[90] bg-dark-900 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-dark-700">
        <span class="material-symbols-rounded text-amber-400">system_update</span>
        <p class="flex-1 text-sm font-semibold">Hay una versión nueva del sistema.</p>
        <button (click)="update()" class="px-4 py-2 rounded-xl bg-amber-500 text-dark-900 font-bold text-sm">Actualizar</button>
      </div>
    }
  `
})
export class UpdateBannerComponent {
  private swUpdate = inject(SwUpdate);
  updateReady = signal(false);

  constructor() {
    if (!this.swUpdate.isEnabled) return;
    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => this.updateReady.set(true));
    // Revisar si hay versión nueva al abrir y cada 5 minutos
    this.swUpdate.checkForUpdate().catch(() => {});
    setInterval(() => this.swUpdate.checkForUpdate().catch(() => {}), 5 * 60 * 1000);
  }

  async update(): Promise<void> {
    await this.swUpdate.activateUpdate();
    document.location.reload();
  }
}

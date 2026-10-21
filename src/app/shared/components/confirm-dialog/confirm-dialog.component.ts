import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialogService.activeDialog(); as dialog) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        [class.animate-fade-in]="!dialog.leaving"
        [class.animate-fade-out]="dialog.leaving"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"
             (click)="dialogService.respond(false)"></div>

        <!-- Dialog Card -->
        <div
          class="relative z-10 bg-white dark:bg-dark-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-dark-100 dark:border-dark-700"
          [class.animate-scale-in]="!dialog.leaving"
          (click)="$event.stopPropagation()"
        >
          <!-- Content -->
          <div class="p-6 text-center">
            @if (dialog.icon) {
              <div class="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                   [class]="dialog.confirmStyle === 'danger'
                     ? 'bg-red-100 dark:bg-red-900/40 text-red-500'
                     : 'bg-primary-100 dark:bg-primary-900/40 text-primary-500'">
                <span class="material-symbols-rounded text-3xl">{{ dialog.icon }}</span>
              </div>
            }
            <h3 class="text-lg font-bold text-dark-800 dark:text-white mb-2">{{ dialog.title }}</h3>
            <p class="text-sm text-dark-500 dark:text-dark-300 leading-relaxed">{{ dialog.message }}</p>
          </div>

          <!-- Actions — Apple-style stacked on mobile -->
          <div class="border-t border-dark-100 dark:border-dark-700 flex">
            <button
              (click)="dialogService.respond(false)"
              class="flex-1 py-3.5 text-sm font-semibold text-dark-500 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors border-r border-dark-100 dark:border-dark-700 active:bg-dark-100 dark:active:bg-dark-600"
            >
              {{ dialog.cancelText }}
            </button>
            <button
              (click)="dialogService.respond(true)"
              class="flex-1 py-3.5 text-sm font-bold transition-colors active:opacity-80"
              [class]="dialog.confirmStyle === 'danger'
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 active:bg-red-100'
                : 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:bg-primary-100'"
            >
              {{ dialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  public dialogService = inject(ConfirmDialogService);
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Toast Container — fixed top center -->
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none"
         style="padding-top: env(safe-area-inset-top);">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto max-w-sm w-full mx-4 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-xl"
          [class]="getToastClasses(toast)"
          [class.animate-toast-in]="!toast.leaving"
          [class.animate-toast-out]="toast.leaving"
          role="alert"
        >
          <span class="material-symbols-rounded text-xl shrink-0"
                [class]="getIconClass(toast)">
            {{ toast.icon }}
          </span>
          <p class="text-sm font-semibold flex-1 leading-snug">{{ toast.message }}</p>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
          >
            <span class="material-symbols-rounded text-base">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  public toastService = inject(ToastService);

  getToastClasses(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50/90 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'error':
        return 'bg-red-50/90 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-amber-50/90 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'info':
      default:
        return 'bg-blue-50/90 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  }

  getIconClass(toast: Toast): string {
    switch (toast.type) {
      case 'success': return 'text-emerald-500';
      case 'error':   return 'text-red-500';
      case 'warning': return 'text-amber-500';
      case 'info':
      default:        return 'text-blue-500';
    }
  }
}

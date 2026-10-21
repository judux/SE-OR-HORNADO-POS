import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'danger' | 'primary' | 'default';
  icon?: string;
}

interface ActiveDialog extends ConfirmDialogOptions {
  resolve: (value: boolean) => void;
  visible: boolean;
  leaving: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  activeDialog = signal<ActiveDialog | null>(null);

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.activeDialog.set({
        ...options,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        confirmStyle: options.confirmStyle || 'primary',
        resolve,
        visible: true,
        leaving: false,
      });
    });
  }

  /** Convenience: danger-styled confirmation */
  confirmDanger(title: string, message: string, confirmText = 'Eliminar'): Promise<boolean> {
    return this.confirm({ title, message, confirmText, confirmStyle: 'danger', icon: 'warning' });
  }

  respond(value: boolean): void {
    const dialog = this.activeDialog();
    if (!dialog) return;

    // Start exit animation
    this.activeDialog.set({ ...dialog, leaving: true });

    setTimeout(() => {
      dialog.resolve(value);
      this.activeDialog.set(null);
    }, 200);
  }
}

import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
  duration?: number;
  leaving?: boolean;
}

export interface ToastOptions {
  message: string;
  type?: Toast['type'];
  duration?: number;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  toasts = signal<Toast[]>([]);

  show(
    messageOrOptions: string | ToastOptions,
    type: Toast['type'] = 'info',
    duration = 3000,
    icon?: string
  ): void {
    let messageStr: string;
    let toastType: Toast['type'] = type;
    let toastDur = duration;
    let toastIcon = icon;

    if (typeof messageOrOptions === 'object') {
      messageStr = messageOrOptions.message;
      toastType = messageOrOptions.type || 'info';
      toastDur = messageOrOptions.duration ?? 3000;
      toastIcon = messageOrOptions.icon;
    } else {
      messageStr = messageOrOptions;
    }

    const id = this.nextId++;

    if (!toastIcon) {
      switch (toastType) {
        case 'success': toastIcon = 'check_circle'; break;
        case 'error':   toastIcon = 'error'; break;
        case 'warning': toastIcon = 'warning'; break;
        case 'info':    toastIcon = 'info'; break;
      }
    }

    const toast: Toast = { id, message: messageStr, type: toastType, icon: toastIcon, duration: toastDur, leaving: false };
    this.toasts.update(list => [...list, toast]);

    if (toastDur > 0) {
      setTimeout(() => this.dismiss(id), toastDur);
    }
  }

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 3500): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  dismiss(id: number): void {
    this.toasts.update(list =>
      list.map(t => t.id === id ? { ...t, leaving: true } : t)
    );
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, 200);
  }
}

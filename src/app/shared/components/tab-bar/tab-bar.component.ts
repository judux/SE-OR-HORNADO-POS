import { Component, input, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  /** Texto para celular, si el normal no cabe. */
  shortLabel?: string;
  icon: string;
  /** Número que se muestra junto a la pestaña (por ejemplo, tickets pendientes). */
  badge?: number | null;
}

/**
 * Barra de secciones común (admin y caja).
 * - Celular: todas las pestañas caben a lo ancho (ícono arriba, texto corto abajo), sin deslizar.
 * - PC: ícono y texto en línea, alineadas con el contenido.
 */
@Component({
  selector: 'app-tab-bar',
  standalone: true,
  template: `
    <nav class="shrink-0 bg-white dark:bg-dark-800 border-b border-dark-100 dark:border-dark-700/60 px-1 sm:px-6">
      <div class="max-w-screen-2xl mx-auto flex sm:gap-2">
        @for (tab of items(); track tab.id) {
          <button (click)="select.emit(tab.id)" [attr.aria-current]="active() === tab.id ? 'page' : null"
            class="relative flex-1 sm:flex-none min-w-0 min-h-[56px] px-1 sm:px-4 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 font-semibold transition-colors"
            [class]="active() === tab.id ? 'text-dark-900 dark:text-white' : 'text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'">
            <span class="relative">
              <span class="material-symbols-rounded text-[22px] sm:text-xl leading-none">{{ tab.icon }}</span>
              @if (tab.badge) {
                <span class="sm:hidden absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">{{ tab.badge }}</span>
              }
            </span>
            <span class="text-[11px] sm:text-sm leading-tight truncate max-w-full">
              <span class="sm:hidden">{{ tab.shortLabel ?? tab.label }}</span>
              <span class="hidden sm:inline">{{ tab.label }}</span>
            </span>
            @if (tab.badge) {
              <span class="hidden sm:flex min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-[11px] font-bold items-center justify-center">{{ tab.badge }}</span>
            }
            @if (active() === tab.id) {
              <span class="absolute bottom-0 inset-x-3 sm:inset-x-2 h-[3px] rounded-t-full bg-primary-500"></span>
            }
          </button>
        }
      </div>
    </nav>
  `
})
export class TabBarComponent {
  items = input.required<TabItem[]>();
  active = input.required<string>();
  select = output<string>();
}

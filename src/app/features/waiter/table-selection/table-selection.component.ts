import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableService } from '../../../core/services/table.service';
import { OrderService } from '../../../core/services/order.service';
import { Table } from '../../../shared/interfaces';

@Component({
  selector: 'app-table-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <!-- Header interno Apple Style -->
      <div class="mb-6 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-sm border border-dark-100 dark:border-dark-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold tracking-wider text-dark-400 dark:text-dark-300 uppercase mb-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Salón Principal
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-dark-800 dark:text-white tracking-tight">Selección de Mesa</h2>
          <p class="text-dark-400 dark:text-dark-300 text-sm mt-0.5">Toca una mesa para abrir o continuar un pedido</p>
        </div>
        
        <!-- Segmented Filter Control -->
        <div class="inline-flex p-1 bg-dark-100/70 dark:bg-dark-900/70 backdrop-blur-md rounded-2xl border border-dark-200/50 dark:border-dark-700/50 text-xs font-semibold w-full md:w-auto">
          <button 
            (click)="filterStatus.set('todos')"
            class="flex-1 md:flex-none px-4 py-2 rounded-xl transition-all duration-200"
            [class]="filterStatus() === 'todos' ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm' : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'"
          >
            Todas ({{ tableService.allTables().length }})
          </button>
          <button 
            (click)="filterStatus.set('libre')"
            class="flex-1 md:flex-none px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
            [class]="filterStatus() === 'libre' ? 'bg-white dark:bg-dark-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Libres ({{ countByStatus('libre') }})
          </button>
          <button 
            (click)="filterStatus.set('pendiente')"
            class="flex-1 md:flex-none px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
            [class]="filterStatus() === 'pendiente' ? 'bg-white dark:bg-dark-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'"
          >
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            Pendientes ({{ countByStatus('pendiente') }})
          </button>
          <button 
            (click)="filterStatus.set('en_caja')"
            class="flex-1 md:flex-none px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
            [class]="filterStatus() === 'en_caja' ? 'bg-white dark:bg-dark-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'"
          >
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            En Caja ({{ countByStatus('en_caja') }})
          </button>
        </div>
      </div>

      <!-- Cuadrícula de mesas Apple Squircle -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (table of filteredTables(); track table.id) {
          <button
            (click)="selectTable(table)"
            class="group relative aspect-square rounded-3xl p-4 flex flex-col items-center justify-between
                   transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-95 text-left border overflow-hidden"
            [class]="getTableClass(table)"
          >
            <!-- Background Specular Overlay -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>

            <!-- Top Row: Badge Capacidad & Indicator -->
            <div class="w-full flex items-center justify-between z-10">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md shadow-xs"
                    [class]="getBadgeClass(table)">
                {{ table.capacidad }} px
              </span>
              <span class="w-2.5 h-2.5 rounded-full shadow-xs" [class]="getStatusDotClass(table)"></span>
            </div>

            <!-- Middle: Mesa Number & Icon -->
            <div class="flex flex-col items-center justify-center text-center my-auto z-10">
              <div class="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110"
                   [class]="getIconBgClass(table)">
                <span class="material-symbols-rounded text-2xl">table_restaurant</span>
              </div>
              <span class="font-black text-xl text-dark-900 dark:text-white tracking-tight">Mesa {{ table.numero_mesa }}</span>
              <span class="text-[11px] font-bold uppercase tracking-wider mt-0.5" [class]="getStatusTextClass(table)">
                {{ formatTableState(table) }}
              </span>
            </div>
            
            <!-- Bottom: Waiter Info if occupied -->
            <div class="w-full z-10">
              @if (getWaiterName(table)) {
                <div class="w-full text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center justify-center gap-1 bg-white/70 dark:bg-dark-800/70 backdrop-blur-md text-dark-800 dark:text-white shadow-xs border border-dark-100/50 dark:border-dark-700/50">
                  <span class="material-symbols-rounded text-[13px] text-dark-400">person</span>
                  <span class="truncate max-w-[90px]">{{ getWaiterName(table) }}</span>
                </div>
              } @else {
                <div class="text-[10px] font-medium text-center opacity-60 text-dark-500 dark:text-dark-400">
                  Disponible
                </div>
              }
            </div>
          </button>
        }
      </div>
    </div>
  `,
})
export class TableSelectionComponent {
  public tableService = inject(TableService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  filterStatus = signal<'todos' | 'libre' | 'pendiente' | 'en_caja'>('todos');

  filteredTables = computed(() => {
    const filter = this.filterStatus();
    const tables = this.tableService.allTables();
    if (filter === 'todos') return tables;
    return tables.filter(t => {
      if (filter === 'libre') return t.estado === 'libre';
      const order = this.orderService.getOrderByTable(t.id);
      return order?.estado === filter;
    });
  });

  countByStatus(status: 'libre' | 'pendiente' | 'en_caja'): number {
    return this.tableService.allTables().filter(t => {
      if (status === 'libre') return t.estado === 'libre';
      const order = this.orderService.getOrderByTable(t.id);
      return order?.estado === status;
    }).length;
  }

  selectTable(table: Table): void {
    this.orderService.setActiveTable(table.id);
    this.router.navigate(['/mesero/mesa', table.id]);
  }

  getTableClass(table: Table): string {
    if (table.estado === 'libre') {
      return 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-emerald-500/5';
    }
    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') {
      return 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-600 shadow-amber-500/5';
    }
    if (order?.estado === 'en_caja') {
      return 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/40 hover:border-blue-400 dark:hover:border-blue-600 shadow-blue-500/5';
    }
    return 'bg-white dark:bg-dark-800 border-dark-100 dark:border-dark-700';
  }

  getBadgeClass(table: Table): string {
    if (table.estado === 'libre') return 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200';
    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') return 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200';
    if (order?.estado === 'en_caja') return 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200';
    return 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300';
  }

  getIconBgClass(table: Table): string {
    if (table.estado === 'libre') return 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-md';
    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') return 'bg-amber-500 text-white shadow-amber-500/30 shadow-md';
    if (order?.estado === 'en_caja') return 'bg-blue-500 text-white shadow-blue-500/30 shadow-md';
    return 'bg-dark-200 dark:bg-dark-700 text-dark-600 dark:text-dark-300';
  }

  getStatusDotClass(table: Table): string {
    if (table.estado === 'libre') return 'bg-emerald-500';
    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') return 'bg-amber-400 animate-pulse';
    if (order?.estado === 'en_caja') return 'bg-blue-500';
    return 'bg-dark-300';
  }

  getStatusTextClass(table: Table): string {
    if (table.estado === 'libre') return 'text-emerald-600 dark:text-emerald-400';
    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') return 'text-amber-600 dark:text-amber-400';
    if (order?.estado === 'en_caja') return 'text-blue-600 dark:text-blue-400';
    return 'text-dark-400';
  }

  formatTableState(table: Table): string {
    if (table.estado === 'libre') return 'Libre';
    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') return 'Pendiente';
    if (order?.estado === 'en_caja') return 'En Caja';
    return 'Ocupada';
  }

  getWaiterName(table: Table): string | null {
    const order = this.orderService.getOrderByTable(table.id);
    return order ? order.nombre_mesero : null;
  }
}

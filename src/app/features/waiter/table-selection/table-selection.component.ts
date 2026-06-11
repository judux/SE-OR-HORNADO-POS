import { Component } from '@angular/core';
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
    <div class="h-full flex flex-col">
      <!-- Header interno -->
      <div class="mb-6 bg-white dark:bg-dark-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-dark-100 dark:border-dark-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-300">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-dark-800 dark:text-white tracking-tight">Selección de Mesa</h2>
          <p class="text-dark-400 dark:text-dark-300 text-sm mt-1">Elige una mesa para tomar el pedido</p>
        </div>
        
        <!-- Leyenda de colores -->
        <div class="flex flex-wrap items-center gap-4 text-sm font-medium bg-dark-50 dark:bg-dark-900/50 py-2.5 px-5 rounded-2xl w-full md:w-auto">
           <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
            <span class="text-dark-600 dark:text-dark-300">Libre</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></span>
            <span class="text-dark-600 dark:text-dark-300">Pendiente</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500 shadow-sm border bg-opacity-90 border-blue-600"></span>
            <span class="text-dark-600 dark:text-dark-300">En Caja</span>
          </div>
        </div>
      </div>

      <!-- Cuadrícula de mesas -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (table of tableService.allTables(); track table.id) {
          <button
            (click)="selectTable(table)"
            class="relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center
                   transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            [class]="getTableClass(table)"
          >
            <!-- Badge Capacidad -->
            <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  [class]="getBadgeClass(table)">
              {{ table.capacidad }} px
            </span>

            <span class="material-symbols-rounded text-3xl mb-1">chair</span>
            <span class="font-bold text-lg">Mesa {{ table.numero_mesa }}</span>
            <span class="text-xs font-medium uppercase mt-1 opacity-80">
              {{ formatTableState(table) }}
            </span>
            
            @if (getWaiterName(table)) {
              <div class="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-white/60 text-dark-800 shadow-sm border border-dark-100">
                <span class="material-symbols-rounded text-[12px]">person</span>
                <span class="truncate max-w-[80px]" title="{{ getWaiterName(table) }}">{{ getWaiterName(table) }}</span>
              </div>
            }

            <div class="absolute inset-x-0 bottom-0 h-1 rounded-b-xl" [class]="getBorderClass(table)"></div>
          </button>
        }
      </div>
    </div>
  `,
})
export class TableSelectionComponent {
  constructor(
    public tableService: TableService,
    private orderService: OrderService,
    private router: Router
  ) { }

  selectTable(table: Table): void {
    if (table.estado === 'libre') {
      // Iniciar nuevo pedido para esta mesa
      this.orderService.setActiveTable(table.id);
      this.router.navigate(['/mesero/mesa', table.id]);
    } else {
      // Si está pendiente o en caja, cargamos la orden existente
      // alert(\`La mesa \${table.numero_mesa} ya está ocupada. Atendiendo pedido en curso...\`);
      this.orderService.setActiveTable(table.id);
      this.router.navigate(['/mesero/mesa', table.id]);
    }
  }

  getTableClass(table: Table): string {
    if (table.estado === 'libre') return 'border-green-500 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60';

    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/60';
    if (order?.estado === 'en_caja') return 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60';

    return 'border-dark-300 bg-dark-50 dark:bg-dark-800 text-dark-500 dark:text-dark-400'; // Fallback
  }

  getBadgeClass(table: Table): string {
    if (table.estado === 'libre') return 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100';
    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100';
    if (order?.estado === 'en_caja') return 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100';
    return 'bg-dark-200 dark:bg-dark-700 text-dark-800 dark:text-dark-100';
  }

  getBorderClass(table: Table): string {
    if (table.estado === 'libre') return 'bg-green-500';
    const order = this.orderService.getOrderByTable(table.id);
    if (order?.estado === 'pendiente') return 'bg-yellow-400';
    if (order?.estado === 'en_caja') return 'bg-blue-500';
    return 'bg-dark-300';
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

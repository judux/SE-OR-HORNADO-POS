import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700 shadow-sm flex items-center justify-between gap-4">
        <h2 class="text-xl font-bold text-dark-800 dark:text-white flex items-center gap-2">
          <span class="material-symbols-rounded text-primary-500">dashboard</span>
          Dashboard de Ventas
        </h2>
        <button (click)="clearHistory()" class="px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
          <span class="material-symbols-rounded text-[18px]">delete_history</span> Vaciar Historial
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
              <span class="material-symbols-rounded">payments</span>
            </div>
            <p class="text-xs font-bold text-dark-400 uppercase tracking-wider">Ventas Hoy</p>
          </div>
          <p class="text-3xl font-black text-dark-800 dark:text-white">$ {{ stats().totalSales | number:'1.0-0' }}</p>
          <p class="text-xs text-dark-400 dark:text-dark-300 mt-1">{{ stats().totalOrders }} órdenes</p>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span class="material-symbols-rounded">restaurant</span>
            </div>
            <p class="text-xs font-bold text-dark-400 uppercase tracking-wider">Items Vendidos</p>
          </div>
          <p class="text-3xl font-black text-dark-800 dark:text-white">{{ stats().totalItems }}</p>
          <p class="text-xs text-dark-400 dark:text-dark-300 mt-1">Platos y bebidas</p>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <span class="material-symbols-rounded">receipt_long</span>
            </div>
            <p class="text-xs font-bold text-dark-400 uppercase tracking-wider">Ticket Promedio</p>
          </div>
          <p class="text-3xl font-black text-dark-800 dark:text-white">$ {{ stats().avgTicket | number:'1.0-0' }}</p>
          <p class="text-xs text-dark-400 dark:text-dark-300 mt-1">Por orden</p>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <span class="material-symbols-rounded">star</span>
            </div>
            <p class="text-xs font-bold text-dark-400 uppercase tracking-wider">Producto Top</p>
          </div>
          <p class="text-xl font-black text-dark-800 dark:text-white leading-tight">{{ topProduct().name || 'N/A' }}</p>
          <p class="text-xs text-dark-400 dark:text-dark-300 mt-1">{{ topProduct().quantity || 0 }} uds vendidas</p>
        </div>
      </div>

      <!-- Productos más vendidos -->
      <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-dark-100 dark:border-dark-700">
          <h3 class="font-bold text-dark-800 dark:text-white flex items-center gap-2">
            <span class="material-symbols-rounded text-primary-500">trending_up</span>
            Productos Más Vendidos
          </h3>
        </div>
        @if (allProducts().length === 0) {
          <div class="p-8 text-center text-dark-400">
            <span class="material-symbols-rounded text-4xl mb-2 opacity-50">analytics</span>
            <p class="font-medium">Sin datos de ventas disponibles</p>
          </div>
        } @else {
          <div class="divide-y divide-dark-100 dark:divide-dark-700">
            @for (prod of allProducts(); track prod.name; let idx = $index) {
              <div class="flex items-center gap-4 px-5 py-3 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors">
                <span class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  [class]="idx < 3 ? 'bg-primary-50 text-primary-600' : 'bg-dark-50 text-dark-400'">
                  {{ idx + 1 }}
                </span>
                <span class="flex-1 font-medium text-dark-700 dark:text-dark-300">{{ prod.name }}</span>
                <!-- Simple bar -->
                <div class="w-32 bg-dark-50 dark:bg-dark-700 rounded-full h-2 overflow-hidden hidden sm:block">
                  <div class="h-full bg-primary-400 rounded-full" [style.width.%]="(prod.quantity / maxQuantity()) * 100"></div>
                </div>
                <span class="font-black text-primary-600 w-16 text-right">{{ prod.quantity }} uds</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Historial de Órdenes -->
      <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-dark-100 dark:border-dark-700">
          <h3 class="font-bold text-dark-800 dark:text-white flex items-center gap-2">
            <span class="material-symbols-rounded text-dark-400 dark:text-dark-500">history</span>
            Historial de Órdenes Recientes
          </h3>
        </div>
        @if (orderHistory().length === 0) {
          <div class="p-8 text-center text-dark-400">
            <p class="font-medium">Sin órdenes en el historial</p>
          </div>
        } @else {
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-dark-50 dark:bg-dark-900 border-b border-dark-100 dark:border-dark-700">
                <th class="p-4 text-xs font-bold text-dark-500 dark:text-dark-400 uppercase">Mesa</th>
                <th class="p-4 text-xs font-bold text-dark-500 uppercase">Mesero</th>
                <th class="p-4 text-xs font-bold text-dark-500 uppercase">Items</th>
                <th class="p-4 text-xs font-bold text-dark-500 uppercase">Método</th>
                <th class="p-4 text-xs font-bold text-dark-500 uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-100 dark:divide-dark-700">
              @for (order of orderHistory().slice(0, 20); track order.id) {
                <tr class="hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors">
                  <td class="p-4 font-bold text-dark-700 dark:text-dark-300">{{ order.numero_mesa === 0 ? 'Llevar' : 'Mesa ' + order.numero_mesa }}</td>
                  <td class="p-4 text-dark-600 dark:text-dark-400">{{ order.nombre_mesero }}</td>
                  <td class="p-4 text-dark-600 dark:text-dark-400">{{ order.items.length }} prod.</td>
                  <td class="p-4">
                    <span class="px-2 py-0.5 rounded-lg text-xs font-bold"
                      [class]="order.metodo_pago === 'efectivo' ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'">
                      {{ order.metodo_pago === 'efectivo' ? '💵 Efectivo' : '💳 Transf.' }}
                    </span>
                  </td>
                  <td class="p-4 text-right font-black text-dark-800 dark:text-white">$ {{ order.total | number:'1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  private orderService = inject(OrderService);

  orderHistory = computed(() => this.orderService.getOrderHistory());

  stats = computed(() => {
    const history = this.orderHistory();
    const totalSales = history.reduce((s, o) => s + o.total, 0);
    const totalItems = history.reduce((s, o) => s + o.items.reduce((si, i) => si + i.cantidad, 0), 0);
    return {
      totalSales,
      totalOrders: history.length,
      totalItems,
      avgTicket: history.length > 0 ? totalSales / history.length : 0
    };
  });

  allProducts = computed(() => {
    const history = this.orderHistory();
    const counts = new Map<string, number>();
    for (const o of history) for (const i of o.items) counts.set(i.nombre_producto, (counts.get(i.nombre_producto) || 0) + i.cantidad);
    return Array.from(counts.entries()).map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity);
  });

  maxQuantity = computed(() => {
    const prods = this.allProducts();
    return prods.length > 0 ? prods[0].quantity : 1;
  });

  topProduct = computed(() => {
    const prods = this.allProducts();
    return prods.length > 0 ? prods[0] : { name: '', quantity: 0 };
  });

  async clearHistory(): Promise<void> {
    const confirm = window.confirm('ATENCIÓN ADMINISTRADOR: ¿Estás completamente seguro de borrar TODO el historial de ventas actual? Esta acción no se puede deshacer.');
    if (!confirm) return;

    const success = await this.orderService.clearOrderHistory();
    if (success) {
      alert('Historial borrado exitosamente.');
    } else {
      alert('Error al borrar el historial.');
    }
  }
}

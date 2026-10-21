import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData, query, orderBy, limit } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs';
import { ShiftService } from '../../../core/services/shift.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { Order } from '../../../shared/interfaces';

type Periodo = 'hoy' | '7d' | '30d';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-dark-800 dark:text-white flex items-center gap-2">
          <span class="material-symbols-rounded text-primary-500">dashboard</span>
          Dashboard de Ventas
        </h2>
        <div class="flex bg-dark-100 dark:bg-dark-800 rounded-xl p-1 text-sm font-bold">
          @for (p of periodos; track p.value) {
            <button (click)="periodo.set(p.value)" class="px-3 py-1.5 rounded-lg transition-all"
              [class]="periodo() === p.value ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs' : 'text-dark-500 dark:text-dark-400'">
              {{ p.label }}
            </button>
          }
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
              <span class="material-symbols-rounded">payments</span>
            </div>
            <p class="text-xs font-bold text-dark-400 uppercase tracking-wider">Ventas {{ periodoLabel() }}</p>
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
                  <td class="p-4 font-bold text-dark-700 dark:text-dark-300">{{ order.id_mesa === 'para_llevar' ? 'Para llevar' : 'Mesa ' + order.numero_mesa }}</td>
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

      <!-- Turnos cerrados (archivados, nunca se borran) -->
      <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-dark-100 dark:border-dark-700">
          <h3 class="font-bold text-dark-800 dark:text-white flex items-center gap-2">
            <span class="material-symbols-rounded text-dark-400 dark:text-dark-500">inventory_2</span>
            Turnos cerrados
          </h3>
        </div>
        @if (shifts().length === 0) {
          <div class="p-8 text-center text-dark-400"><p class="font-medium">Aún no se ha cerrado ningún turno</p></div>
        } @else {
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-dark-50 dark:bg-dark-900 border-b border-dark-100 dark:border-dark-700">
                <th class="p-4 text-xs font-bold text-dark-500 uppercase">Cierre</th>
                <th class="p-4 text-xs font-bold text-dark-500 uppercase">Cerró</th>
                <th class="p-4 text-xs font-bold text-dark-500 uppercase text-right">Ventas</th>
                <th class="p-4 text-xs font-bold text-dark-500 uppercase text-right">Efectivo esperado</th>
                <th class="p-4 text-xs font-bold text-dark-500 uppercase text-right">Transferencias</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-100 dark:divide-dark-700">
              @for (shift of shifts(); track shift.id) {
                <tr>
                  <td class="p-4 text-dark-700 dark:text-dark-300">{{ shift.fin | date:'dd/MM HH:mm' }}</td>
                  <td class="p-4 text-dark-600 dark:text-dark-400">{{ shift.nombre_cerrado_por }}</td>
                  <td class="p-4 text-right font-bold text-dark-800 dark:text-white">$ {{ shift.total_ventas | number:'1.0-0' }} <span class="text-xs text-dark-400 font-normal">({{ shift.num_ventas }})</span></td>
                  <td class="p-4 text-right text-dark-700 dark:text-dark-300">$ {{ shift.efectivo_esperado | number:'1.0-0' }}</td>
                  <td class="p-4 text-right text-dark-700 dark:text-dark-300">$ {{ shift.total_transferencia | number:'1.0-0' }}</td>
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
  private shiftService = inject(ShiftService);
  private firestore = inject(Firestore);
  private tenant = inject(TenantService);

  readonly periodos: { value: Periodo; label: string }[] = [
    { value: 'hoy', label: 'Hoy' },
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
  ];
  periodo = signal<Periodo>('hoy');
  periodoLabel = computed(() => this.periodos.find(p => p.value === this.periodo())?.label.toLowerCase() === 'hoy' ? 'hoy' : `últimos ${this.periodos.find(p => p.value === this.periodo())?.label}`);

  // Ventas del periodo elegido (consulta filtrada por fecha: no descarga todo el historial)
  orderHistory = toSignal(
    toObservable(this.periodo).pipe(
      switchMap(p => this.tenant.watch(() => this.shiftService.salesSince(this.periodStart(p)), [] as Order[]))
    ),
    { initialValue: [] as Order[] }
  );

  // Últimos turnos archivados
  shifts = toSignal(
    this.tenant.watch(
      rid => collectionData(query(this.tenant.colOf(rid, 'shifts'), orderBy('fin', 'desc'), limit(15)), { idField: 'id' }).pipe(
        map(list => (list as any[]).map(s => ({ ...s, fin: s.fin?.toDate ? s.fin.toDate() : s.fin })))
      ),
      [] as any[]
    ),
    { initialValue: [] as any[] }
  );

  private periodStart(p: Periodo): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (p === '7d') d.setDate(d.getDate() - 6);
    if (p === '30d') d.setDate(d.getDate() - 29);
    return d;
  }

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
}

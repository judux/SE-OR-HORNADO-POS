import { Component, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { PettyCashService } from '../../../core/services/petty-cash.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { Order, Product } from '../../../shared/interfaces';

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-72px)] p-4 sm:p-6 bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col max-w-7xl mx-auto w-full">
      <!-- Header de Control de Caja -->
      <div class="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl p-5 rounded-3xl shadow-xs border border-dark-100 dark:border-dark-700/60">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
            <span class="material-symbols-rounded text-2xl">point_of_sale</span>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-dark-900 dark:text-white tracking-tight">Gestión de Caja</h2>
            <p class="text-dark-400 dark:text-dark-400 text-xs font-medium mt-0.5">Control de comandas, cobros y caja chica</p>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <!-- Segmented Tab Bar macOS style -->
          <div class="inline-flex p-1 bg-dark-100/80 dark:bg-dark-900/80 backdrop-blur-md rounded-2xl border border-dark-200/50 dark:border-dark-700/50 text-xs font-bold w-full sm:w-auto">
            <button (click)="activeTab.set('tickets')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all duration-200" [class]="activeTab() === 'tickets' ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs' : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'">
              Tickets ({{ orders().length }})
            </button>
            <button (click)="activeTab.set('cajaChica')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all duration-200" [class]="activeTab() === 'cajaChica' ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs' : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'">
              Caja Chica
            </button>
            <button (click)="activeTab.set('reportes')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all duration-200" [class]="activeTab() === 'reportes' ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs' : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'">
              Reportes
            </button>
            <button (click)="activeTab.set('cierre')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all duration-200" [class]="activeTab() === 'cierre' ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-xs' : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'">
              Cierre Turno
            </button>
          </div>
        </div>
      </div>

      <!-- Action Quick Bar (solo en tickets) -->
      @if (activeTab() === 'tickets') {
        <div class="flex flex-wrap gap-2 shrink-0 mb-4">
          <button (click)="showMergeModal.set(true)" class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 transition-all active:scale-95 flex items-center gap-1.5 shadow-xs">
            <span class="material-symbols-rounded text-base">link</span> Unir Mesas
          </button>
          <button (click)="openSplitModal()" class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 transition-all active:scale-95 flex items-center gap-1.5 shadow-xs">
            <span class="material-symbols-rounded text-base">call_split</span> Dividir Cuenta
          </button>
          <button (click)="showDirectSaleModal.set(true)" class="px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5 shadow-xs">
            <span class="material-symbols-rounded text-base">shopping_bag</span> Venta Directa / Para Llevar
          </button>
        </div>
      }

      <!-- Contenido Principal: Tickets -->
      @if (activeTab() === 'tickets') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 pb-6">
          @if (orders().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-dark-400 text-center px-6 py-12">
              <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <span class="material-symbols-rounded text-4xl">check_circle</span>
              </div>
              <p class="font-extrabold text-xl text-dark-800 dark:text-white mb-1">Sin tickets pendientes</p>
              <p class="text-xs text-dark-400">Todas las comandas registradas han sido cobradas o cerradas.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              @for (order of orders(); track order.id) {
                <button 
                  (click)="openPaymentModal(order)"
                  class="group bg-white dark:bg-dark-800 rounded-3xl p-5 border border-dark-100 dark:border-dark-700/80 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] text-left flex flex-col justify-between relative overflow-hidden"
                >
                  <!-- Accent Bar Top -->
                  <div class="absolute inset-x-0 top-0 h-1" [class]="getTimerBarClass(order)"></div>

                  <div>
                    <!-- Header Ticket -->
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <span class="inline-block px-3 py-1 bg-dark-900 text-white dark:bg-white dark:text-dark-900 rounded-full text-xs font-black uppercase tracking-wider mb-1.5 shadow-xs">
                          Mesa {{ order.numero_mesa }}
                        </span>
                        <p class="text-[11px] text-dark-400 font-medium truncate max-w-[120px] flex items-center gap-1">
                          <span class="material-symbols-rounded text-xs">person</span> {{ order.nombre_mesero }}
                        </p>
                      </div>
                      <div class="text-right">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider inline-flex items-center gap-1"
                              [class]="getTimerBadgeClass(order)">
                          <span class="material-symbols-rounded text-xs">schedule</span>
                          {{ getMinutesSince(order.fecha_creacion) }} min
                        </span>
                        <p class="text-[10px] text-dark-400 font-bold mt-1">{{ order.fecha_creacion | date:'HH:mm' }}</p>
                      </div>
                    </div>

                    <!-- Preview Items -->
                    <div class="space-y-1.5 text-xs mb-4">
                      @for (item of order.items.slice(0, 3); track item.id_producto) {
                        <div class="flex justify-between items-baseline gap-2">
                          <span class="font-black text-amber-600 dark:text-amber-400 shrink-0">{{ item.cantidad }}x</span>
                          <span class="text-dark-700 dark:text-dark-300 font-medium truncate">{{ item.nombre_producto }}</span>
                          <div class="flex-1 border-b border-dotted border-dark-200 dark:border-dark-700 relative -top-1"></div>
                          <span class="font-bold text-dark-900 dark:text-white shrink-0">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                        </div>
                      }
                      @if (order.items.length > 3) {
                        <p class="text-[11px] text-amber-600 dark:text-amber-400 font-semibold italic mt-1.5">+ {{ order.items.length - 3 }} productos más...</p>
                      }
                    </div>
                  </div>

                  <!-- Footer Ticket Total -->
                  <div class="pt-3 border-t border-dark-100 dark:border-dark-700/60 flex items-center justify-between shrink-0">
                    <span class="text-xs font-bold text-dark-400 uppercase tracking-wider">Total</span>
                    <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">$ {{ order.subtotal | number:'1.0-0' }}</span>
                  </div>
                </button>
              }
            </div>
          }
        </div>
      }

      <!-- Vista Caja Chica -->
      @if (activeTab() === 'cajaChica') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 pb-6">
          <div class="max-w-2xl mx-auto space-y-6">
            <div class="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-dark-100 dark:border-dark-700 shadow-xs">
              <h3 class="font-extrabold text-lg text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <span class="material-symbols-rounded text-lg">account_balance_wallet</span>
                </span>
                Registrar Gasto de Caja Chica
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5 block">Concepto / Motivo</label>
                  <input type="text" [ngModel]="expenseMotivo()" (ngModelChange)="expenseMotivo.set($event)"
                    class="input-field"
                    placeholder="Ej: Compra de carbón, servilletas, hielo..."/>
                </div>
                <div>
                  <label class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1.5 block">Monto Total ($)</label>
                  <input type="number" [ngModel]="expenseMonto()" (ngModelChange)="expenseMonto.set($event)"
                    class="input-field text-2xl font-black text-amber-600"
                    placeholder="0" min="0"/>
                </div>
                <button (click)="registerExpense()" [disabled]="!expenseMotivo() || expenseMonto() <= 0"
                  class="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 shadow-md">
                  <span class="material-symbols-rounded text-lg">remove_circle</span> Registrar Gasto
                </button>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-3 px-1">
                <h3 class="font-bold text-base text-dark-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-rounded text-dark-400">receipt_long</span> Gastos del Turno
                </h3>
                <span class="text-red-600 dark:text-red-400 font-black text-lg">- $ {{ pettyCashService.totalExpenses() | number:'1.0-0' }}</span>
              </div>
              @if (pettyCashService.allExpenses().length === 0) {
                <div class="bg-white dark:bg-dark-800 rounded-3xl p-8 border border-dark-100 dark:border-dark-700 text-center text-dark-400">
                  <span class="material-symbols-rounded text-4xl mb-2 opacity-40">savings</span>
                  <p class="font-bold text-sm">Sin gastos en este turno</p>
                </div>
              } @else {
                <div class="space-y-2">
                  @for (expense of pettyCashService.allExpenses(); track expense.id) {
                    <div class="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-dark-100 dark:border-dark-700 flex items-center justify-between shadow-xs">
                      <div>
                        <p class="font-bold text-sm text-dark-900 dark:text-white">{{ expense.motivo }}</p>
                        <p class="text-xs text-dark-400">{{ expense.fecha | date:'HH:mm' }}</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="font-extrabold text-red-600 dark:text-red-400 text-base">- $ {{ expense.monto | number:'1.0-0' }}</span>
                        <button (click)="pettyCashService.removeExpense(expense.id)" class="w-8 h-8 rounded-xl bg-dark-100 dark:bg-dark-700 text-dark-400 hover:text-red-500 flex items-center justify-center transition-colors">
                          <span class="material-symbols-rounded text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Vista Reportes -->
      @if (activeTab() === 'reportes') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 pb-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-dark-100 dark:border-dark-700 shadow-xs flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <span class="material-symbols-rounded text-3xl">payments</span>
              </div>
              <div>
                <p class="text-dark-400 text-xs font-bold uppercase tracking-wider mb-0.5">Ventas Totales del Día</p>
                <p class="text-3xl font-black text-dark-900 dark:text-white tracking-tight">$ {{ todayStats().totalSales | number:'1.0-0' }}</p>
                <p class="text-xs text-dark-400 mt-1 font-medium">{{ todayStats().totalOrders }} comandas cobradas</p>
              </div>
            </div>
            <div class="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-dark-100 dark:border-dark-700 shadow-xs flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <span class="material-symbols-rounded text-3xl">restaurant</span>
              </div>
              <div>
                <p class="text-dark-400 text-xs font-bold uppercase tracking-wider mb-0.5">Ítems Despachados</p>
                <p class="text-3xl font-black text-dark-900 dark:text-white tracking-tight">{{ todayStats().totalItemsSold }}</p>
                <p class="text-xs text-dark-400 mt-1 font-medium">Platos y bebidas vendidas</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-extrabold text-base text-dark-900 dark:text-white mb-3 flex items-center gap-2 px-1">
              <span class="material-symbols-rounded text-amber-500">trending_up</span> Top Productos Vendidos
            </h3>
            <div class="bg-white dark:bg-dark-800 rounded-3xl border border-dark-100 dark:border-dark-700 shadow-xs overflow-hidden">
              @if (topProducts().length === 0) {
                <div class="p-8 text-center text-dark-400">
                  <span class="material-symbols-rounded text-4xl mb-2 opacity-40">analytics</span>
                  <p class="font-bold text-sm">Sin datos de ventas en este turno</p>
                </div>
              } @else {
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-dark-50 dark:bg-dark-900/50 border-b border-dark-100 dark:border-dark-700">
                      <th class="p-4 text-xs font-extrabold text-dark-400 uppercase tracking-wider w-16 text-center">#</th>
                      <th class="p-4 text-xs font-extrabold text-dark-400 uppercase tracking-wider">Producto</th>
                      <th class="p-4 text-xs font-extrabold text-dark-400 uppercase tracking-wider text-right">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-dark-100 dark:divide-dark-700/50">
                    @for (prod of topProducts(); track prod.name; let idx = $index) {
                      <tr class="hover:bg-dark-50/50 dark:hover:bg-dark-700/30 transition-colors">
                        <td class="p-4 text-center font-black text-dark-400 text-sm">{{ idx + 1 }}</td>
                        <td class="p-4 font-bold text-dark-900 dark:text-white text-sm">{{ prod.name }}</td>
                        <td class="p-4 text-right font-black text-amber-600 dark:text-amber-400 text-sm">{{ prod.quantity }} uds</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>
        </div>
      }

      <!-- Vista Cierre de Turno -->
      @if (activeTab() === 'cierre') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 pb-6">
          <div class="max-w-3xl mx-auto space-y-4">
            <div class="bg-white dark:bg-dark-800 rounded-3xl border border-dark-100 dark:border-dark-700 shadow-xs overflow-hidden" id="shift-report">
              <div class="bg-dark-900 text-white p-6">
                <h3 class="text-2xl font-black tracking-tight">Reporte de Cierre de Caja</h3>
                <p class="text-dark-300 text-xs mt-1 font-medium">{{ today | date:'fullDate' }}</p>
              </div>
              <div class="p-6 space-y-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-4 text-center border border-emerald-200 dark:border-emerald-800/60">
                    <p class="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Ventas Totales</p>
                    <p class="text-2xl font-black text-emerald-800 dark:text-emerald-200">$ {{ todayStats().totalSales | number:'1.0-0' }}</p>
                  </div>
                  <div class="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 text-center border border-blue-200 dark:border-blue-800/60">
                    <p class="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Efectivo</p>
                    <p class="text-2xl font-black text-blue-800 dark:text-blue-200">$ {{ shiftBreakdown().totalEfectivo | number:'1.0-0' }}</p>
                  </div>
                  <div class="bg-purple-50 dark:bg-purple-950/40 rounded-2xl p-4 text-center border border-purple-200 dark:border-purple-800/60">
                    <p class="text-[10px] font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">Transferencias</p>
                    <p class="text-2xl font-black text-purple-800 dark:text-purple-200">$ {{ shiftBreakdown().totalTransferencia | number:'1.0-0' }}</p>
                  </div>
                  <div class="bg-red-50 dark:bg-red-950/40 rounded-2xl p-4 text-center border border-red-200 dark:border-red-800/60">
                    <p class="text-[10px] font-extrabold text-red-700 dark:text-red-300 uppercase tracking-wider mb-1">Gastos Caja</p>
                    <p class="text-2xl font-black text-red-800 dark:text-red-200">- $ {{ pettyCashService.totalExpenses() | number:'1.0-0' }}</p>
                  </div>
                </div>

                <div class="bg-dark-50 dark:bg-dark-900/50 rounded-2xl p-5 border border-dark-100 dark:border-dark-700">
                  <h4 class="font-extrabold text-dark-900 dark:text-white mb-3 text-base">Balance Neto en Caja</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between items-center text-dark-600 dark:text-dark-300">
                      <span>(+) Recaudado en Efectivo</span>
                      <span class="font-bold text-dark-900 dark:text-white">$ {{ shiftBreakdown().totalEfectivo | number:'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between items-center text-red-600 dark:text-red-400">
                      <span>(-) Gastos de Caja Chica</span>
                      <span class="font-bold">$ {{ pettyCashService.totalExpenses() | number:'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-3 border-t border-dark-200 dark:border-dark-700">
                      <span class="font-black text-dark-900 dark:text-white text-base">Efectivo Neto a Entregar</span>
                      <span class="font-black text-3xl text-emerald-600 dark:text-emerald-400 tracking-tight">$ {{ (shiftBreakdown().totalEfectivo - pettyCashService.totalExpenses()) | number:'1.0-0' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button (click)="printShiftReport()" class="py-3.5 rounded-2xl bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-800 dark:text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2 border border-dark-200 dark:border-dark-700">
                <span class="material-symbols-rounded text-lg">print</span> Imprimir Reporte
              </button>

              <button (click)="closeShift()" class="py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg">
                <span class="material-symbols-rounded text-lg">delete_history</span> Cerrar y Limpiar Caja
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de Cobro (con botones rápidos de billetes y vuelto) -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
             (click)="closePaymentModal()">
          
          <div class="bg-white dark:bg-dark-800 rounded-3xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden border border-dark-100 dark:border-dark-700"
               (click)="$event.stopPropagation()">
            
            <!-- Header Cobro -->
            <div class="px-6 py-4 bg-dark-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 class="text-xl font-extrabold tracking-tight">Cobrar Cuenta</h3>
                <p class="text-xs text-dark-300 font-medium">Mesa {{ selectedOrder()?.numero_mesa }} · {{ selectedOrder()?.nombre_mesero }}</p>
              </div>
              <button (click)="closePaymentModal()" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
            
            <!-- Código de Pago -->
            <div class="bg-amber-50 dark:bg-amber-950/40 px-6 py-3 border-b border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <span class="material-symbols-rounded text-lg">verified_user</span>
                <span class="text-xs font-bold uppercase tracking-wider">Código Seguridad:</span>
              </div>
              <span class="font-mono text-2xl font-black text-amber-900 dark:text-amber-100 tracking-widest">{{ selectedOrder()?.codigo_pago }}</span>
            </div>
            
            <!-- Items Consumidos -->
            <div class="p-6 flex-1 overflow-y-auto custom-scrollbar max-h-[35vh]">
              <h4 class="text-xs font-extrabold text-dark-400 uppercase tracking-wider mb-3 border-b border-dark-100 dark:border-dark-700 pb-2 flex items-center justify-between">
                Detalle de Consumo
                <span class="text-xs text-dark-400 normal-case font-normal">Toca 🗑️ para eliminar ítems</span>
              </h4>
              
              <div class="space-y-2">
                @for (item of selectedOrder()?.items; track item.line_id ?? $index) {
                  <div class="flex justify-between items-center text-xs py-1 border-b border-dark-50 dark:border-dark-700/40">
                    <div class="flex items-center gap-2 flex-1 pr-2">
                      <button (click)="removeItem(item.line_id)" class="text-dark-300 hover:text-red-500 transition-colors" title="Eliminar ítem">
                        <span class="material-symbols-rounded text-sm">delete</span>
                      </button>
                      <span class="font-black text-amber-600 dark:text-amber-400">{{ item.cantidad }}x</span>
                      <span class="font-medium text-dark-800 dark:text-white truncate">{{ item.nombre_producto }}</span>
                    </div>
                    <span class="font-bold text-dark-900 dark:text-white shrink-0">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Footer Pago + Denominaciones -->
            <div class="p-6 bg-dark-50/50 dark:bg-dark-900/50 shrink-0 border-t border-dark-100 dark:border-dark-700/60">
              <div class="flex justify-between items-center mb-4">
                <span class="text-xs font-bold text-dark-400 uppercase tracking-wider">Total a Pagar</span>
                <span class="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">$ {{ selectedOrder()?.subtotal | number:'1.0-0' }}</span>
              </div>

              <!-- Método de Pago Selector -->
              <div class="grid grid-cols-2 gap-2 mb-4">
                <button (click)="paymentMethod.set('efectivo')" 
                        class="py-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                        [class]="paymentMethod() === 'efectivo' ? 'border-dark-900 dark:border-white bg-dark-900 dark:bg-white text-white dark:text-dark-900 shadow-sm' : 'border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300'">
                  <span class="material-symbols-rounded text-lg">payments</span> Efectivo
                </button>
                <button (click)="paymentMethod.set('transferencia')" 
                        class="py-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                        [class]="paymentMethod() === 'transferencia' ? 'border-dark-900 dark:border-white bg-dark-900 dark:bg-white text-white dark:text-dark-900 shadow-sm' : 'border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300'">
                  <span class="material-symbols-rounded text-lg">send_money</span> Transferencia
                </button>
              </div>

              <!-- Quick Bill Denominations & Cambio -->
              @if (paymentMethod() === 'efectivo') {
                <div class="space-y-3 mb-5">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[10px] font-extrabold text-dark-400 uppercase tracking-wider mr-1">Billetes Rápido:</span>
                    @for (billete of billetes; track billete) {
                      <button (click)="billeteRecibido.set(billete)" class="px-2.5 py-2 bg-white dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-xs font-bold text-dark-800 dark:text-white hover:border-amber-500 transition-colors">$ {{ billete | number:'1.0-0' }}</button>
                    }
                    <button (click)="billeteRecibido.set(selectedOrder()?.subtotal || 0)" class="px-2.5 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors">Exacto</button>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-dark-400 font-black text-lg">$</span>
                    <input 
                      type="number" 
                      [ngModel]="billeteRecibido()" 
                      (ngModelChange)="billeteRecibido.set($event)"
                      class="input-field text-xl font-black text-dark-900 dark:text-white"
                      placeholder="Dinero recibido"
                      min="0"
                    />
                  </div>

                  @if (billeteRecibido() > 0) {
                    <div class="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-dark-700 border border-dark-100 dark:border-dark-600">
                      <span class="font-bold text-xs uppercase tracking-wider" [class]="cambio() >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
                        {{ cambio() >= 0 ? 'Vuelto a entregar' : 'Dinero insuficiente' }}
                      </span>
                      <span class="text-xl font-black" [class]="cambio() >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
                        $ {{ (cambio() >= 0 ? cambio() : cambio() * -1) | number:'1.0-0' }}
                      </span>
                    </div>
                  }
                </div>
              }

              <button
                (click)="confirmPayment()"
                class="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base transition-all active:scale-95 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span class="material-symbols-rounded">check_circle</span>
                Confirmar Cobro Exitoso
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Unir Mesas -->
      @if (showMergeModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md" (click)="showMergeModal.set(false)">
          <div class="bg-white dark:bg-dark-800 rounded-3xl max-w-md w-full shadow-2xl p-6 border border-dark-100 dark:border-dark-700" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-xl font-extrabold text-dark-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-rounded text-blue-500">link</span> Unir Mesas
              </h3>
              <button (click)="showMergeModal.set(false)" class="w-8 h-8 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center text-dark-400 hover:bg-dark-200">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
            <p class="text-xs text-dark-400 mb-4">Selecciona 2 o más mesas para fusionar sus comandes en un único ticket.</p>
            <div class="grid grid-cols-3 gap-2 mb-5">
              @for (order of orderService.getAllActiveOrders(); track order.id) {
                @if (order.numero_mesa > 0) {
                  <button (click)="toggleMergeSelection(order.id_mesa)"
                    class="py-3 rounded-2xl border-2 font-bold text-xs transition-all active:scale-95"
                    [class]="mergeSelection().includes(order.id_mesa) ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-200' : 'border-dark-100 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:border-dark-200 bg-white dark:bg-dark-800'">
                    Mesa {{ order.numero_mesa }}
                  </button>
                }
              }
            </div>
            <button (click)="confirmMerge()" [disabled]="mergeSelection().length < 2"
              class="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all active:scale-95 disabled:opacity-40 shadow-md">
              Unir {{ mergeSelection().length }} Mesas
            </button>
          </div>
        </div>
      }

      <!-- Modal Dividir Cuenta -->
      @if (showSplitModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md" (click)="showSplitModal.set(false)">
          <div class="bg-white dark:bg-dark-800 rounded-3xl max-w-md w-full shadow-2xl flex flex-col max-h-[80vh] border border-dark-100 dark:border-dark-700" (click)="$event.stopPropagation()">
            <div class="p-5 border-b border-dark-100 dark:border-dark-700 shrink-0">
              <div class="flex justify-between items-center mb-1">
                <h3 class="text-xl font-extrabold text-dark-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-rounded text-purple-500">call_split</span> Dividir Cuenta
                </h3>
                <button (click)="showSplitModal.set(false)" class="w-8 h-8 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center text-dark-400 hover:bg-dark-200">
                  <span class="material-symbols-rounded text-lg">close</span>
                </button>
              </div>
              @if (!splitOrderId()) {
                <p class="text-xs text-dark-400">Selecciona la mesa que quieres dividir:</p>
              } @else {
                <p class="text-xs text-dark-400">Selecciona los productos para la nueva cuenta separada:</p>
              }
            </div>
            <div class="p-5 overflow-y-auto custom-scrollbar flex-1">
              @if (!splitOrderId()) {
                <div class="grid grid-cols-2 gap-2">
                  @for (order of orders(); track order.id) {
                    <button (click)="selectOrderForSplit(order)" class="py-4 rounded-2xl border-2 border-dark-100 dark:border-dark-700 font-bold text-dark-700 dark:text-dark-200 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all text-xs">
                      Mesa {{ order.numero_mesa }}
                    </button>
                  }
                </div>
              } @else {
                <div class="space-y-2">
                  @for (item of splitOrderItems(); track $index; let idx = $index) {
                    <button (click)="toggleSplitItem(idx)"
                      class="w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all"
                      [class]="splitItemSelection().includes(idx) ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60' : 'border-dark-100 dark:border-dark-700 hover:border-dark-200'">
                      <div>
                        <p class="font-bold text-xs text-dark-900 dark:text-white">{{ item.cantidad }}x {{ item.nombre_producto }}</p>
                        @if (item.notas) { <p class="text-[11px] text-dark-400">{{ item.notas }}</p> }
                      </div>
                      <span class="font-bold text-xs text-dark-700 dark:text-dark-300">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                    </button>
                  }
                </div>
              }
            </div>
            @if (splitOrderId()) {
              <div class="p-5 border-t border-dark-100 dark:border-dark-700 shrink-0">
                <button (click)="confirmSplit()" [disabled]="splitItemSelection().length === 0"
                  class="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all active:scale-95 disabled:opacity-40 shadow-md">
                  Dividir ({{ splitItemSelection().length }} productos)
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Modal Venta Directa -->
      @if (showDirectSaleModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md" (click)="showDirectSaleModal.set(false)">
          <div class="bg-white dark:bg-dark-800 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh] border border-dark-100 dark:border-dark-700" (click)="$event.stopPropagation()">
            <div class="px-6 py-4 bg-amber-500 text-white rounded-t-3xl flex justify-between items-center shrink-0">
              <div>
                <h3 class="text-xl font-extrabold">Venta Directa / Para Llevar</h3>
                <p class="text-xs text-amber-100 font-medium">Comanda express sin mesa</p>
              </div>
              <button (click)="showDirectSaleModal.set(false)" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div class="grid grid-cols-2 gap-2 mb-4">
                @for (product of productService.availableProducts(); track product.id) {
                  <button (click)="addDirectSaleItem(product)"
                    class="p-3 rounded-2xl border border-dark-100 dark:border-dark-700 text-left hover:shadow-md transition-all active:scale-95 bg-dark-50/50 dark:bg-dark-900/40">
                    <p class="font-bold text-dark-900 dark:text-white text-xs leading-tight">{{ product.nombre }}</p>
                    <p class="text-amber-600 dark:text-amber-400 font-extrabold text-xs mt-1">$ {{ product.precio | number:'1.0-0' }}</p>
                  </button>
                }
              </div>
              @if (directSaleItems().length > 0) {
                <h4 class="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2 mt-4 border-t border-dark-100 dark:border-dark-700 pt-3">Resumen de venta</h4>
                <div class="space-y-1.5">
                  @for (item of directSaleItems(); track $index; let idx = $index) {
                    <div class="flex items-center justify-between bg-dark-50 dark:bg-dark-900/60 rounded-xl p-2 text-xs">
                      <div class="flex items-center gap-2">
                        <button (click)="removeDirectSaleItem(idx)" class="text-dark-400 hover:text-red-500">
                          <span class="material-symbols-rounded text-sm">close</span>
                        </button>
                        <span class="font-bold text-dark-800 dark:text-white">{{ item.cantidad }}x {{ item.nombre }}</span>
                      </div>
                      <span class="font-bold text-dark-700 dark:text-dark-300">$ {{ (item.precio * item.cantidad) | number:'1.0-0' }}</span>
                    </div>
                  }
                </div>
              }
            </div>
            @if (directSaleItems().length > 0) {
              <div class="p-6 border-t border-dark-100 dark:border-dark-700 shrink-0">
                <div class="flex justify-between items-center mb-4">
                  <span class="font-bold text-xs text-dark-400 uppercase tracking-wider">Total</span>
                  <span class="text-2xl font-black text-amber-600 dark:text-amber-400">$ {{ directSaleTotal() | number:'1.0-0' }}</span>
                </div>
                <button (click)="confirmDirectSale()"
                  class="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold transition-all active:scale-95 shadow-md">
                  Registrar Venta Directa
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; }
  `]
})
export class CashierDashboardComponent implements OnDestroy {
  public orderService = inject(OrderService);
  public productService = inject(ProductService);
  public pettyCashService = inject(PettyCashService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  orders = this.orderService.getOrdersForCashier;

  // View State
  activeTab = signal<'tickets' | 'reportes' | 'cajaChica' | 'cierre'>('tickets');

  // 🔔 Sonido de notificación para nuevos pedidos
  private previousOrderCount = 0;
  private orderWatcher = effect(() => {
    const currentCount = this.orders().length;
    if (currentCount > this.previousOrderCount && this.previousOrderCount > 0) {
      this.playNotificationSound();
      this.toast.show({
        message: '¡Nueva comanda recibida en caja!',
        type: 'info',
        icon: 'notifications_active',
        duration: 3000
      });
    }
    this.previousOrderCount = currentCount;
  });

  // Reports Computeds
  todayStats = computed(() => {
    const history = this.orderService.getOrderHistory();
    const totalOrders = history.length;
    let totalSales = 0;
    let totalItemsSold = 0;

    for (const order of history) {
      totalSales += order.total;
      totalItemsSold += order.items.reduce((sum, item) => sum + item.cantidad, 0);
    }

    return { totalOrders, totalSales, totalItemsSold };
  });

  topProducts = computed(() => {
    const history = this.orderService.getOrderHistory();
    const productCounts = new Map<string, number>();

    for (const order of history) {
      for (const item of order.items) {
        const current = productCounts.get(item.nombre_producto) || 0;
        productCounts.set(item.nombre_producto, current + item.cantidad);
      }
    }

    return Array.from(productCounts.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });

  // Modal State - Cobro (la orden se lee EN VIVO para que el total siempre sea el real)
  private selectedOrderId = signal<string | null>(null);
  selectedOrder = computed<Order | null>(() => {
    const id = this.selectedOrderId();
    if (!id) return null;
    return this.orderService.getAllActiveOrders().find(o => o.id === id) ?? null;
  });
  paymentMethod = signal<'efectivo' | 'transferencia'>('efectivo');
  billeteRecibido = signal<number>(0);
  // Billetes colombianos (COP) para el cobro rápido en efectivo
  readonly billetes = [2000, 5000, 10000, 20000, 50000, 100000];

  // Modal State - Unir Mesas
  showMergeModal = signal<boolean>(false);
  mergeSelection = signal<string[]>([]);

  // Modal State - Dividir Cuenta
  showSplitModal = signal<boolean>(false);
  splitOrderId = signal<string | null>(null);
  splitOrderItems = signal<any[]>([]);
  splitItemSelection = signal<number[]>([]);

  // Modal State - Venta Directa
  showDirectSaleModal = signal<boolean>(false);
  directSaleItems = signal<{ product_id: string; nombre: string; precio: number; cantidad: number }[]>([]);
  directSaleTotal = computed(() => this.directSaleItems().reduce((sum, item) => sum + (item.precio * item.cantidad), 0));

  // Caja Chica State
  expenseMotivo = signal<string>('');
  expenseMonto = signal<number>(0);
  today = new Date();

  shiftBreakdown = computed(() => {
    const history = this.orderService.getOrderHistory();
    let totalEfectivo = 0;
    let totalTransferencia = 0;
    for (const order of history) {
      if (order.metodo_pago === 'efectivo') totalEfectivo += order.total;
      else if (order.metodo_pago === 'transferencia') totalTransferencia += order.total;
    }
    return { totalEfectivo, totalTransferencia };
  });

  cambio = computed(() => {
    const order = this.selectedOrder();
    if (!order) return 0;
    return this.billeteRecibido() - order.subtotal;
  });

  getMinutesSince(date: Date): number {
    const diff = new Date().getTime() - date.getTime();
    return Math.floor(diff / 60000);
  }

  getTimerBarClass(order: Order): string {
    const min = this.getMinutesSince(order.fecha_creacion);
    if (min > 20) return 'bg-red-500 animate-pulse';
    if (min > 10) return 'bg-amber-400';
    return 'bg-emerald-500';
  }

  getTimerBadgeClass(order: Order): string {
    const min = this.getMinutesSince(order.fecha_creacion);
    if (min > 20) return 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 animate-pulse';
    if (min > 10) return 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200';
    return 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200';
  }

  openPaymentModal(order: Order): void {
    this.selectedOrderId.set(order.id);
    this.paymentMethod.set('efectivo');
    this.billeteRecibido.set(0);
  }

  closePaymentModal(): void {
    this.selectedOrderId.set(null);
  }

  async removeItem(lineId: string | undefined): Promise<void> {
    const order = this.selectedOrder();
    if (!order || !lineId) return;
    
    const confirm = await this.confirmDialog.confirm({
      title: '¿Eliminar producto?',
      message: '¿Estás seguro de quitar este producto de la comanda?',
      confirmText: 'Eliminar',
      confirmStyle: 'danger',
      icon: 'delete'
    });
    if (!confirm) return;

    const removed = await this.orderService.removeItemFromOrder(order.id, lineId);
    if (removed) {
      this.toast.show({ message: 'Producto eliminado del ticket', type: 'info', duration: 2000 });
    } else {
      this.toast.show({ message: 'No se pudo eliminar el producto. Intenta de nuevo.', type: 'error', icon: 'error' });
    }
  }

  async confirmPayment(): Promise<void> {
    const order = this.selectedOrder();
    if (order) {
      const success = await this.orderService.closeOrder(
        order.id,
        this.paymentMethod()
      );

      if (success) {
        this.toast.show({
          message: `Mesa ${order.numero_mesa} cobrada exitosamente`,
          type: 'success',
          icon: 'task_alt',
          duration: 3000
        });
        this.closePaymentModal();
      } else {
        this.toast.show({
          message: 'Error al procesar el pago. Intenta de nuevo.',
          type: 'error',
          icon: 'error'
        });
      }
    }
  }

  private playNotificationSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(1046, audioCtx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1318, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('No se pudo reproducir sonido de notificación:', e);
    }
  }

  toggleMergeSelection(tableId: string): void {
    this.mergeSelection.update(sel => 
      sel.includes(tableId) ? sel.filter(id => id !== tableId) : [...sel, tableId]
    );
  }

  async confirmMerge(): Promise<void> {
    if (this.mergeSelection().length < 2) return;
    const success = await this.orderService.mergeTables(this.mergeSelection());
    if (success) {
      this.toast.show({ message: '¡Mesas unidas exitosamente!', type: 'success', icon: 'link' });
      this.mergeSelection.set([]);
      this.showMergeModal.set(false);
    }
  }

  openSplitModal(): void {
    this.splitOrderId.set(null);
    this.splitOrderItems.set([]);
    this.splitItemSelection.set([]);
    this.showSplitModal.set(true);
  }

  selectOrderForSplit(order: Order): void {
    this.splitOrderId.set(order.id);
    this.splitOrderItems.set([...order.items]);
    this.splitItemSelection.set([]);
  }

  toggleSplitItem(index: number): void {
    this.splitItemSelection.update(sel =>
      sel.includes(index) ? sel.filter(i => i !== index) : [...sel, index]
    );
  }

  async confirmSplit(): Promise<void> {
    const orderId = this.splitOrderId();
    if (!orderId || this.splitItemSelection().length === 0) return;
    const result = await this.orderService.splitOrder(orderId, this.splitItemSelection());
    if (result) {
      this.toast.show({ message: 'Cuenta dividida exitosamente', type: 'success', icon: 'call_split' });
      this.showSplitModal.set(false);
    }
  }

  addDirectSaleItem(product: Product): void {
    this.directSaleItems.update(items => {
      const existing = items.findIndex(i => i.product_id === product.id);
      if (existing > -1) {
        const updated = [...items];
        updated[existing] = { ...updated[existing], cantidad: updated[existing].cantidad + 1 };
        return updated;
      }
      return [...items, { product_id: product.id, nombre: product.nombre, precio: product.precio, cantidad: 1 }];
    });
  }

  removeDirectSaleItem(index: number): void {
    this.directSaleItems.update(items => items.filter((_, i) => i !== index));
  }

  async confirmDirectSale(): Promise<void> {
    if (this.directSaleItems().length === 0) return;
    await this.orderService.createDirectSaleOrder(this.directSaleItems());
    this.toast.show({ message: 'Venta directa registrada', type: 'success', icon: 'shopping_bag' });
    this.directSaleItems.set([]);
    this.showDirectSaleModal.set(false);
  }

  async registerExpense(): Promise<void> {
    const success = await this.pettyCashService.addExpense(this.expenseMotivo(), this.expenseMonto());
    if (success) {
      this.toast.show({ message: 'Gasto de caja chica registrado', type: 'success', icon: 'payments' });
      this.expenseMotivo.set('');
      this.expenseMonto.set(0);
    }
  }

  printShiftReport(): void {
    const reportEl = document.getElementById('shift-report');
    if (!reportEl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Cierre de Turno - Señor Hornado</title>
      <style>body{font-family:system-ui,sans-serif;padding:20px;max-width:600px;margin:0 auto}
      h3{font-size:18px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #eee;text-align:left}
      .right{text-align:right}.bold{font-weight:bold}.total{font-size:20px;border-top:2px solid #333;padding-top:10px}</style>
      </head><body>${reportEl.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  async closeShift(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: '¿Cerrar Caja y Limpiar Historial?',
      message: 'ATENCIÓN: Esto imprimirá el reporte del turno y luego BORRARÁ permanentemente las ventas y gastos registrados hoy.',
      confirmText: 'Sí, Cerrar Caja',
      cancelText: 'Cancelar',
      confirmStyle: 'danger',
      icon: 'warning'
    });

    if (!confirmed) return;

    this.printShiftReport();

    const ordersDeleted = await this.orderService.clearOrderHistory();
    await this.pettyCashService.clearExpenses();

    if (ordersDeleted) {
      this.toast.show({ message: 'Caja cerrada y datos del turno reiniciados', type: 'success', icon: 'task_alt', duration: 4000 });
    } else {
      this.toast.show({ message: 'Error al limpiar el historial', type: 'error', icon: 'error' });
    }
  }

  ngOnDestroy(): void {}
}

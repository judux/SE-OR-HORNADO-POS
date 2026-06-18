import { Component, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { PettyCashService } from '../../../core/services/petty-cash.service';
import { TenantService } from '../../../core/services/tenant.service';
import { Order, Product } from '../../../shared/interfaces';

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-80px)] p-4 sm:p-6 bg-dark-50 dark:bg-dark-900 transition-colors duration-300 flex flex-col">
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white dark:bg-dark-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-dark-100 dark:border-dark-700 transition-colors duration-300">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center shrink-0">
            <span class="material-symbols-rounded text-2xl">point_of_sale</span>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-dark-800 dark:text-white tracking-tight">Caja <span class="text-dark-300 font-medium">/</span> Recepción de Pedidos</h2>
            <p class="text-dark-400 dark:text-dark-300 text-sm mt-1">Gestiona comandas y ventas del día</p>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div class="flex bg-dark-100 p-1 rounded-xl flex-wrap">
            <button (click)="activeTab.set('tickets')" class="px-4 py-2 text-sm font-bold rounded-lg transition-all" [class]="activeTab() === 'tickets' ? 'bg-white text-dark-800 shadow-sm' : 'text-dark-500 hover:text-dark-700'">Tickets</button>
            <button (click)="activeTab.set('cajaChica')" class="px-4 py-2 text-sm font-bold rounded-lg transition-all" [class]="activeTab() === 'cajaChica' ? 'bg-white text-dark-800 shadow-sm' : 'text-dark-500 hover:text-dark-700'">Caja Chica</button>
            <button (click)="activeTab.set('reportes')" class="px-4 py-2 text-sm font-bold rounded-lg transition-all" [class]="activeTab() === 'reportes' ? 'bg-white text-dark-800 shadow-sm' : 'text-dark-500 hover:text-dark-700'">Reportes</button>
            <button (click)="activeTab.set('cierre')" class="px-4 py-2 text-sm font-bold rounded-lg transition-all" [class]="activeTab() === 'cierre' ? 'bg-white text-dark-800 shadow-sm' : 'text-dark-500 hover:text-dark-700'">Cierre Turno</button>
          </div>
          
          @if (activeTab() === 'tickets') {
            <div class="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-primary-200 shadow-sm">
              <span>Pendientes:</span>
              <span class="bg-primary-500 text-white px-2 py-0.5 rounded-lg">{{ orders().length }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Action Buttons -->
      @if (activeTab() === 'tickets') {
        <div class="flex flex-wrap gap-2 shrink-0 mb-4">
          <button (click)="showMergeModal.set(true)" class="px-4 py-2 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <span class="material-symbols-rounded text-[18px]">link</span> Unir Mesas
          </button>
          <button (click)="openSplitModal()" class="px-4 py-2 rounded-xl text-sm font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <span class="material-symbols-rounded text-[18px]">call_split</span> Dividir Cuenta
          </button>
          <button (click)="showDirectSaleModal.set(true)" class="px-4 py-2 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <span class="material-symbols-rounded text-[18px]">shopping_bag</span> Venta Directa
          </button>
        </div>
      }

      <!-- Contenido Principal -->
      @if (activeTab() === 'tickets') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 pb-6">
          @if (orders().length === 0) {
          <div class="h-full flex flex-col items-center justify-center text-dark-400">
            <span class="material-symbols-rounded text-6xl mb-4 text-green-500 opacity-80">check_circle</span>
            <p class="font-bold text-xl text-dark-600 mb-1">Todo al día</p>
            <p class="text-sm">No hay comandas pendientes de cobro en este momento.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (order of orders(); track order.id) {
              <button 
                (click)="openPaymentModal(order)"
                class="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-dark-100 dark:border-dark-700 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 text-left flex flex-col"
              >
                <!-- Card Header -->
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <span class="inline-block px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 border border-red-100">
                      Mesa {{ order.numero_mesa }}
                    </span>
                    <p class="text-xs text-dark-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] flex items-center gap-1" title="{{ order.nombre_mesero }}">
                      <span class="material-symbols-rounded text-[14px]">person</span> {{ order.nombre_mesero }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold text-dark-800">{{ order.fecha_creacion | date:'HH:mm' }}</p>
                    <p class="text-xs text-dark-400">Hace <span class="font-medium text-dark-600">{{ getMinutesSince(order.fecha_creacion) }}</span> min</p>
                  </div>
                </div>

                <!-- Preview Items -->
                <div class="flex-1 mb-4 overflow-hidden mask-bottom">
                  <div class="space-y-1.5 text-sm pb-4">
                    @for (item of order.items.slice(0, 3); track item.id_producto) {
                      <div class="flex justify-between items-baseline gap-2">
                        <span class="font-bold text-dark-500 shrink-0">{{ item.cantidad }}x</span>
                        <span class="text-dark-700 whitespace-nowrap overflow-hidden text-ellipsis">{{ item.nombre_producto }}</span>
                        <div class="flex-1 border-b border-dashed border-dark-100 relative -top-1"></div>
                        <span class="font-bold text-dark-800 shrink-0">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                      </div>
                    }
                    @if (order.items.length > 3) {
                      <p class="text-xs text-primary-600 font-medium italic mt-2">+ {{ order.items.length - 3 }} productos más...</p>
                    }
                  </div>
                </div>

                <!-- Total Row -->
                <div class="pt-3 border-t border-dark-100 flex items-center justify-between shrink-0">
                  <span class="text-dark-500 text-sm font-medium">Total a Pagar</span>
                  <span class="text-xl font-black text-primary-600">$ {{ order.subtotal | number:'1.0-0' }}</span>
                </div>
              </button>
            }
          </div>
        }
        </div>
      }

      <!-- Vista Caja Chica -->
      @if (activeTab() === 'cajaChica') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 pb-6">
          <div class="max-w-2xl mx-auto">
            <div class="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-dark-100 dark:border-dark-700 shadow-sm mb-6">
              <h3 class="font-bold text-lg text-dark-800 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-rounded text-red-500">account_balance_wallet</span> Registrar Gasto
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1 block">Motivo</label>
                  <input type="text" [ngModel]="expenseMotivo()" (ngModelChange)="expenseMotivo.set($event)"
                    class="w-full border-2 border-dark-200 rounded-xl px-4 py-3 text-dark-800 font-medium focus:border-primary-500 focus:outline-none"
                    placeholder="Ej: Compra de servilletas, gas, hielo..."/>
                </div>
                <div>
                  <label class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-1 block">Monto ($)</label>
                  <input type="number" [ngModel]="expenseMonto()" (ngModelChange)="expenseMonto.set($event)"
                    class="w-full border-2 border-dark-200 rounded-xl px-4 py-3 text-2xl font-black text-dark-800 focus:border-primary-500 focus:outline-none"
                    placeholder="0" min="0"/>
                </div>
                <button (click)="registerExpense()" [disabled]="!expenseMotivo() || expenseMonto() <= 0"
                  class="w-full py-3 rounded-xl bg-red-500 text-white font-bold transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                  <span class="material-symbols-rounded">remove_circle</span> Registrar Gasto
                </button>
              </div>
            </div>

            <h3 class="font-bold text-lg text-dark-800 mb-4 flex items-center justify-between">
              <span class="flex items-center gap-2"><span class="material-symbols-rounded text-dark-400">receipt_long</span> Gastos del Turno</span>
              <span class="text-red-600 font-black">- $ {{ pettyCashService.totalExpenses() | number:'1.0-0' }}</span>
            </h3>
            @if (pettyCashService.allExpenses().length === 0) {
              <div class="bg-white dark:bg-dark-800 rounded-2xl p-8 border border-dark-100 dark:border-dark-700 text-center text-dark-400">
                <span class="material-symbols-rounded text-4xl mb-2 opacity-50">savings</span>
                <p class="font-medium">No hay gastos registrados en este turno</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (expense of pettyCashService.allExpenses(); track expense.id) {
                  <div class="bg-white dark:bg-dark-800 rounded-xl p-4 border border-dark-100 dark:border-dark-700 flex items-center justify-between">
                    <div>
                      <p class="font-bold text-dark-800 dark:text-gray-100">{{ expense.motivo }}</p>
                      <p class="text-xs text-dark-400">{{ expense.fecha | date:'HH:mm' }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="font-black text-red-600">- $ {{ expense.monto | number:'1.0-0' }}</span>
                      <button (click)="pettyCashService.removeExpense(expense.id)" class="w-7 h-7 rounded-lg bg-dark-50 text-dark-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500">
                        <span class="material-symbols-rounded text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Vista Reportes -->
      @if (activeTab() === 'reportes') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 pb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-dark-100 dark:border-dark-700 shadow-sm flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                <span class="material-symbols-rounded text-3xl">payments</span>
              </div>
              <div>
                <p class="text-dark-500 text-sm font-bold uppercase tracking-wider mb-1">Ventas Brutas Totales</p>
                <p class="text-3xl font-black text-dark-800">$ {{ todayStats().totalSales | number:'1.0-0' }}</p>
                <p class="text-xs text-dark-400 mt-1">De {{ todayStats().totalOrders }} órdenes completadas hoy</p>
              </div>
            </div>
            <div class="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-dark-100 dark:border-dark-700 shadow-sm flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <span class="material-symbols-rounded text-3xl">restaurant</span>
              </div>
              <div>
                <p class="text-dark-500 text-sm font-bold uppercase tracking-wider mb-1">Items Vendidos</p>
                <p class="text-3xl font-black text-dark-800">{{ todayStats().totalItemsSold }}</p>
                <p class="text-xs text-dark-400 mt-1">Platos y bebidas despachadas</p>
              </div>
            </div>
          </div>
          <h3 class="font-bold text-lg text-dark-800 mb-4 flex items-center gap-2">
            <span class="material-symbols-rounded text-primary-500">trending_up</span> Productos más vendidos
          </h3>
          <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 shadow-sm overflow-hidden">
            @if (topProducts().length === 0) {
              <div class="p-8 text-center text-dark-400">
                <span class="material-symbols-rounded text-4xl mb-2 opacity-50">analytics</span>
                <p class="font-medium">Aún no hay ventas registradas hoy</p>
              </div>
            } @else {
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-dark-50 border-b border-dark-100">
                    <th class="p-4 text-xs font-bold text-dark-500 uppercase tracking-wider w-16 text-center">#</th>
                    <th class="p-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Producto</th>
                    <th class="p-4 text-xs font-bold text-dark-500 uppercase tracking-wider text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-dark-100">
                  @for (prod of topProducts(); track prod.name; let idx = $index) {
                    <tr class="hover:bg-dark-50 transition-colors">
                      <td class="p-4 text-center font-bold text-dark-400">{{ idx + 1 }}</td>
                      <td class="p-4 font-bold text-dark-700">{{ prod.name }}</td>
                      <td class="p-4 text-right font-black text-primary-600">{{ prod.quantity }} uds</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      }

      <!-- Vista Cierre de Turno -->
      @if (activeTab() === 'cierre') {
        <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 pb-6">
          <div class="max-w-3xl mx-auto">
            <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 shadow-sm overflow-hidden" id="shift-report">
              <div class="bg-dark-800 dark:bg-dark-950 text-white p-6">
                <h3 class="text-xl font-bold">Cierre de Turno</h3>
                <p class="text-dark-300 text-sm">{{ today | date:'fullDate' }}</p>
              </div>
              <div class="p-6 space-y-6">
                <!-- Resumen de Ventas -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                    <p class="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Ventas Totales</p>
                    <p class="text-2xl font-black text-green-700">$ {{ todayStats().totalSales | number:'1.0-0' }}</p>
                  </div>
                  <div class="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                    <p class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">En Efectivo</p>
                    <p class="text-2xl font-black text-blue-700">$ {{ shiftBreakdown().totalEfectivo | number:'1.0-0' }}</p>
                  </div>
                  <div class="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                    <p class="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Transferencias</p>
                    <p class="text-2xl font-black text-purple-700">$ {{ shiftBreakdown().totalTransferencia | number:'1.0-0' }}</p>
                  </div>
                  <div class="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                    <p class="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Gastos</p>
                    <p class="text-2xl font-black text-red-700">- $ {{ pettyCashService.totalExpenses() | number:'1.0-0' }}</p>
                  </div>
                </div>

                <!-- Cuadre de Caja -->
                <div class="bg-dark-50 rounded-xl p-4 border border-dark-100">
                  <h4 class="font-bold text-dark-800 mb-3 text-lg">Cuadre de Caja</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-dark-600">Total efectivo recaudado</span>
                      <span class="font-bold text-dark-800">$ {{ shiftBreakdown().totalEfectivo | number:'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between items-center text-red-600">
                      <span>(-) Gastos caja chica</span>
                      <span class="font-bold">$ {{ pettyCashService.totalExpenses() | number:'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t-2 border-dark-200">
                      <span class="font-bold text-dark-800 text-lg">Efectivo neto en caja</span>
                      <span class="font-black text-2xl text-dark-800">$ {{ (shiftBreakdown().totalEfectivo - pettyCashService.totalExpenses()) | number:'1.0-0' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Desglose por producto -->
                <div>
                  <h4 class="font-bold text-dark-800 mb-3">Desglose por Producto</h4>
                  @if (topProducts().length === 0) {
                    <p class="text-dark-400 text-sm">Sin ventas registradas</p>
                  } @else {
                    <div class="bg-dark-50 rounded-xl divide-y divide-dark-100 border border-dark-100 overflow-hidden">
                      @for (prod of topProducts(); track prod.name) {
                        <div class="flex justify-between items-center px-4 py-2.5">
                          <span class="font-medium text-dark-700">{{ prod.name }}</span>
                          <span class="font-black text-primary-600">{{ prod.quantity }} uds</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <button (click)="printShiftReport()" class="mt-4 w-full py-3 rounded-xl bg-dark-100 text-dark-800 font-bold transition-all hover:bg-dark-200 active:scale-[0.98] flex items-center justify-center gap-2">
              <span class="material-symbols-rounded">print</span> Solo Imprimir Reporte
            </button>

            <button (click)="closeShift()" class="mt-3 w-full py-4 rounded-xl bg-red-600 text-white font-bold transition-all hover:bg-red-700 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg">
              <span class="material-symbols-rounded">delete_history</span> Cerrar Caja (Imprimir y Borrar Historial)
            </button>
          </div>
        </div>
      }

      
      <!-- Modal de Cobro (sin propinas, con cálculo de vuelto) -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm sm:items-stretch sm:py-10"
             (click)="closePaymentModal()">
          
          <div class="bg-white dark:bg-dark-800 rounded-[2rem] max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-8 duration-300 flex flex-col overflow-hidden"
               (click)="$event.stopPropagation()">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 bg-dark-800 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 class="text-xl font-bold leading-tight">Cobrar Cuenta</h3>
                <p class="text-xs text-dark-300">Mesa {{ selectedOrder()?.numero_mesa }} • Atendido por {{ selectedOrder()?.nombre_mesero }}</p>
              </div>
              <button (click)="closePaymentModal()" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
            
            <!-- Verificación de Seguridad -->
            <div class="bg-yellow-50 px-6 py-3 border-b border-yellow-200 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2 text-yellow-800">
                <span class="material-symbols-rounded">verified_user</span>
                <span class="text-sm font-bold leading-none mt-1">Código de Pago:</span>
              </div>
              <span class="font-mono text-2xl font-black text-yellow-900 tracking-widest">{{ selectedOrder()?.codigo_pago }}</span>
            </div>
            
            <!-- Detalle de la cuenta -->
            <div class="p-6 flex-1 overflow-y-auto custom-scrollbar bg-dark-50/50">
              <h4 class="text-xs font-bold text-dark-400 uppercase tracking-wider mb-4 border-b border-dark-100 pb-2 flex items-center justify-between">
                Detalle de Consumo
                <span class="text-primary-500 normal-case text-[10px]">Toca ❌ para eliminar items</span>
              </h4>
              
              <div class="space-y-3 mb-6">
                @for (item of selectedOrder()?.items; track $index; let idx = $index) {
                  <div class="group">
                    <div class="flex justify-between items-baseline gap-2">
                      <button (click)="removeItem(idx)" class="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 shrink-0" title="Eliminar item">
                        <span class="material-symbols-rounded text-sm">close</span>
                      </button>
                      <span class="font-black text-dark-600 w-6">{{ item.cantidad }}</span>
                      <span class="font-medium text-dark-800 flex-1">{{ item.nombre_producto }}</span>
                      <span class="font-bold text-dark-800">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                    </div>
                    @if (item.notas) {
                      <p class="text-xs text-dark-400 ml-8 inline-block px-1.5 py-0.5 bg-white border border-dark-100 rounded">Nota: {{ item.notas }}</p>
                    }
                  </div>
                }
              </div>

            </div>

            <!-- Footer Totales y Pago (sin propinas) -->
            <div class="p-6 bg-white dark:bg-dark-800 shrink-0 border-t border-dark-100 dark:border-dark-700 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
              
              <div class="flex justify-between items-end mb-6">
                <span class="text-dark-500 font-bold">Total a Cobrar</span>
                <span class="text-4xl font-black text-dark-800 leading-none">$ {{ selectedOrder()?.subtotal | number:'1.0-0' }}</span>
              </div>

              <!-- Selector de Pago -->
              <h4 class="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Método de Pago</h4>
              <div class="flex gap-2 mb-4">
                <button (click)="paymentMethod.set('efectivo')" class="flex-1 py-3 border-2 rounded-xl flex flex-col items-center gap-1 transition-colors"
                        [class]="paymentMethod() === 'efectivo' ? 'border-dark-800 bg-dark-800 text-white' : 'border-dark-100 hover:border-dark-200 text-dark-600'">
                  <span class="material-symbols-rounded text-2xl">payments</span>
                  <span class="text-xs font-bold">Efectivo</span>
                </button>
                <button (click)="paymentMethod.set('transferencia')" class="flex-1 py-3 border-2 rounded-xl flex flex-col items-center gap-1 transition-colors"
                        [class]="paymentMethod() === 'transferencia' ? 'border-dark-800 bg-dark-800 text-white' : 'border-dark-100 hover:border-dark-200 text-dark-600'">
                  <span class="material-symbols-rounded text-2xl">send_money</span>
                  <span class="text-xs font-bold">Transferencia</span>
                </button>
              </div>

              <!-- Cálculo de Vuelto (solo si efectivo) -->
              @if (paymentMethod() === 'efectivo') {
                <div class="bg-dark-50 rounded-xl p-4 mb-4 border border-dark-100">
                  <label class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2 block">Billete recibido</label>
                  <div class="flex items-center gap-2">
                    <span class="text-dark-400 font-bold text-lg">$</span>
                    <input 
                      type="number" 
                      [ngModel]="billeteRecibido()" 
                      (ngModelChange)="billeteRecibido.set($event)"
                      class="flex-1 bg-white border-2 border-dark-200 rounded-xl px-4 py-3 text-2xl font-black text-dark-800 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  @if (billeteRecibido() > 0) {
                    <div class="mt-3 flex items-center justify-between pt-3 border-t border-dark-200">
                      <span class="font-bold text-sm" [class]="cambio() >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ cambio() >= 0 ? 'Vuelto a entregar' : 'Falta dinero' }}
                      </span>
                      <span class="text-2xl font-black" [class]="cambio() >= 0 ? 'text-green-600' : 'text-red-600'">
                        $ {{ (cambio() >= 0 ? cambio() : cambio() * -1) | number:'1.0-0' }}
                      </span>
                    </div>
                  }
                </div>
              }

              <button
                (click)="confirmPayment()"
                class="w-full py-4 rounded-xl bg-green-500 text-white font-bold text-lg transition-all hover:bg-green-600 active:scale-[0.98] shadow-lg shadow-green-500/20"
              >
                Confirmar Pago Exitoso
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Unir Mesas -->
      @if (showMergeModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" (click)="showMergeModal.set(false)">
          <div class="bg-white dark:bg-dark-800 rounded-[2rem] max-w-md w-full shadow-2xl p-6" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-dark-800 flex items-center gap-2">
                <span class="material-symbols-rounded text-blue-500">link</span> Unir Mesas
              </h3>
              <button (click)="showMergeModal.set(false)" class="w-8 h-8 rounded-full bg-dark-50 flex items-center justify-center text-dark-400 hover:bg-dark-100">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
            <p class="text-sm text-dark-500 mb-4">Selecciona 2 o más mesas con pedido activo para fusionarlas en una sola cuenta.</p>
            <div class="grid grid-cols-3 gap-2 mb-4">
              @for (order of orderService.getAllActiveOrders(); track order.id) {
                @if (order.numero_mesa > 0) {
                  <button (click)="toggleMergeSelection(order.id_mesa)"
                    class="py-3 rounded-xl border-2 font-bold text-sm transition-all"
                    [class]="mergeSelection().includes(order.id_mesa) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-dark-100 text-dark-600 hover:border-dark-200 bg-white'">
                    Mesa {{ order.numero_mesa }}
                  </button>
                }
              }
            </div>
            <button (click)="confirmMerge()" [disabled]="mergeSelection().length < 2"
              class="w-full py-3 rounded-xl bg-blue-500 text-white font-bold transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100">
              Unir {{ mergeSelection().length }} Mesas
            </button>
          </div>
        </div>
      }

      <!-- Modal Dividir Cuenta -->
      @if (showSplitModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" (click)="showSplitModal.set(false)">
          <div class="bg-white dark:bg-dark-800 rounded-[2rem] max-w-md w-full shadow-2xl flex flex-col max-h-[80vh]" (click)="$event.stopPropagation()">
            <div class="p-6 border-b border-dark-100 dark:border-dark-700 shrink-0">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-xl font-bold text-dark-800 flex items-center gap-2">
                  <span class="material-symbols-rounded text-purple-500">call_split</span> Dividir Cuenta
                </h3>
                <button (click)="showSplitModal.set(false)" class="w-8 h-8 rounded-full bg-dark-50 flex items-center justify-center text-dark-400 hover:bg-dark-100">
                  <span class="material-symbols-rounded text-lg">close</span>
                </button>
              </div>
              @if (!splitOrderId()) {
                <p class="text-sm text-dark-500">Selecciona la mesa cuya cuenta quieres dividir:</p>
              } @else {
                <p class="text-sm text-dark-500">Selecciona los items que quieres cobrar por separado:</p>
              }
            </div>
            <div class="p-6 overflow-y-auto custom-scrollbar flex-1">
              @if (!splitOrderId()) {
                <div class="grid grid-cols-2 gap-2">
                  @for (order of orders(); track order.id) {
                    <button (click)="selectOrderForSplit(order)" class="py-4 rounded-xl border-2 border-dark-100 font-bold text-dark-600 hover:border-purple-400 hover:bg-purple-50 transition-all">
                      Mesa {{ order.numero_mesa }}
                    </button>
                  }
                </div>
              } @else {
                <div class="space-y-2">
                  @for (item of splitOrderItems(); track $index; let idx = $index) {
                    <button (click)="toggleSplitItem(idx)"
                      class="w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all"
                      [class]="splitItemSelection().includes(idx) ? 'border-purple-500 bg-purple-50' : 'border-dark-100 hover:border-dark-200'">
                      <div>
                        <p class="font-bold text-dark-800">{{ item.cantidad }}x {{ item.nombre_producto }}</p>
                        @if (item.notas) { <p class="text-xs text-dark-400">{{ item.notas }}</p> }
                      </div>
                      <span class="font-bold text-dark-600">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                    </button>
                  }
                </div>
              }
            </div>
            @if (splitOrderId()) {
              <div class="p-6 border-t border-dark-100 shrink-0">
                <button (click)="confirmSplit()" [disabled]="splitItemSelection().length === 0"
                  class="w-full py-3 rounded-xl bg-purple-500 text-white font-bold transition-all hover:bg-purple-600 active:scale-[0.98] disabled:opacity-50">
                  Dividir ({{ splitItemSelection().length }} items)
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Modal Venta Directa -->
      @if (showDirectSaleModal()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" (click)="showDirectSaleModal.set(false)">
          <div class="bg-white dark:bg-dark-800 rounded-[2rem] max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]" (click)="$event.stopPropagation()">
            <div class="px-6 py-4 bg-orange-500 text-white rounded-t-[2rem] flex justify-between items-center shrink-0">
              <div>
                <h3 class="text-xl font-bold">Venta Directa / Para Llevar</h3>
                <p class="text-xs text-orange-100">Sin asignación de mesa</p>
              </div>
              <button (click)="showDirectSaleModal.set(false)" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div class="grid grid-cols-2 gap-2 mb-4">
                @for (product of productService.availableProducts(); track product.id) {
                  <button (click)="addDirectSaleItem(product)"
                    class="p-3 rounded-xl border border-dark-100 text-left hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95">
                    <p class="font-bold text-dark-800 text-sm leading-tight">{{ product.nombre }}</p>
                    <p class="text-primary-600 font-bold text-sm mt-1">$ {{ product.precio | number:'1.0-0' }}</p>
                  </button>
                }
              </div>
              @if (directSaleItems().length > 0) {
                <h4 class="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2 mt-4 border-t border-dark-100 pt-4">Resumen del pedido</h4>
                <div class="space-y-2">
                  @for (item of directSaleItems(); track $index; let idx = $index) {
                    <div class="flex items-center justify-between bg-dark-50 rounded-xl p-2">
                      <div class="flex items-center gap-2">
                        <button (click)="removeDirectSaleItem(idx)" class="w-6 h-6 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100">
                          <span class="material-symbols-rounded text-sm">close</span>
                        </button>
                        <span class="font-bold text-dark-700 text-sm">{{ item.cantidad }}x {{ item.nombre }}</span>
                      </div>
                      <span class="font-bold text-dark-600 text-sm">$ {{ (item.precio * item.cantidad) | number:'1.0-0' }}</span>
                    </div>
                  }
                </div>
              }
            </div>
            @if (directSaleItems().length > 0) {
              <div class="p-6 border-t border-dark-100 shrink-0">
                <div class="flex justify-between items-center mb-4">
                  <span class="font-bold text-dark-500">Total</span>
                  <span class="text-2xl font-black text-dark-800">$ {{ directSaleTotal() | number:'1.0-0' }}</span>
                </div>
                <button (click)="confirmDirectSale()"
                  class="w-full py-3 rounded-xl bg-orange-500 text-white font-bold transition-all hover:bg-orange-600 active:scale-[0.98] shadow-lg">
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
    .mask-bottom {
      -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
      mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
  `]
})
export class CashierDashboardComponent implements OnDestroy {
  public orderService = inject(OrderService);
  public productService = inject(ProductService);
  public pettyCashService = inject(PettyCashService);
  public tenant = inject(TenantService);

  orders = this.orderService.getOrdersForCashier;

  // View State
  activeTab = signal<'tickets' | 'reportes' | 'cajaChica' | 'cierre'>('tickets');

  // 🔔 Sonido de notificación para nuevos pedidos
  private previousOrderCount = 0;
  private notificationAudio: HTMLAudioElement | null = null;
  private orderWatcher = effect(() => {
    const currentCount = this.orders().length;
    if (currentCount > this.previousOrderCount && this.previousOrderCount > 0) {
      this.playNotificationSound();
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

  // Modal State - Cobro
  selectedOrder = signal<Order | null>(null);
  paymentMethod = signal<'efectivo' | 'transferencia'>('efectivo');
  billeteRecibido = signal<number>(0);

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

  // Shift Breakdown
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

  // Cálculo de vuelto
  cambio = computed(() => {
    const order = this.selectedOrder();
    if (!order) return 0;
    return this.billeteRecibido() - order.subtotal;
  });

  getMinutesSince(date: Date): number {
    const diff = new Date().getTime() - date.getTime();
    return Math.floor(diff / 60000);
  }

  openPaymentModal(order: Order): void {
    this.selectedOrder.set(order);
    this.paymentMethod.set('efectivo');
    this.billeteRecibido.set(0);
  }

  closePaymentModal(): void {
    this.selectedOrder.set(null);
  }

  // 🔒 Solo el cajero puede eliminar items
  async removeItem(itemIndex: number): Promise<void> {
    const order = this.selectedOrder();
    if (!order) return;
    
    const confirm = window.confirm('¿Eliminar este producto de la orden?');
    if (!confirm) return;

    await this.orderService.removeItemFromOrder(order.id, itemIndex);
    // Refrescar el modal con la orden actualizada (esperar a que Firestore sincronice)
    setTimeout(() => {
      const updatedOrder = this.orderService.getOrderByTable(order.id_mesa);
      if (updatedOrder && updatedOrder.items.length > 0) {
        this.selectedOrder.set({ ...updatedOrder });
      } else {
        this.closePaymentModal();
      }
    }, 500);
  }

  async confirmPayment(): Promise<void> {
    const order = this.selectedOrder();
    if (order) {
      const success = await this.orderService.closeOrder(
        order.id,
        this.paymentMethod()
      );

      if (success) {
        alert(`¡Pago registrado con éxito! Mesa ${order.numero_mesa} fue liberada.`);
        this.closePaymentModal();
      } else {
        alert('Error al procesar el pago. Intenta de nuevo.');
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
      console.warn('No se pudo reproducir el sonido de notificación:', e);
    }
  }

  // --- Unir Mesas ---
  toggleMergeSelection(tableId: string): void {
    this.mergeSelection.update(sel => 
      sel.includes(tableId) ? sel.filter(id => id !== tableId) : [...sel, tableId]
    );
  }

  async confirmMerge(): Promise<void> {
    if (this.mergeSelection().length < 2) return;
    const success = await this.orderService.mergeTables(this.mergeSelection());
    if (success) {
      alert('¡Mesas unidas exitosamente!');
      this.mergeSelection.set([]);
      this.showMergeModal.set(false);
    }
  }

  // --- Dividir Cuenta ---
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
      alert('¡Cuenta dividida exitosamente! El nuevo ticket aparecerá en la lista.');
      this.showSplitModal.set(false);
    }
  }

  // --- Venta Directa ---
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
    alert('¡Venta directa registrada! Aparecerá como ticket para cobrar.');
    this.directSaleItems.set([]);
    this.showDirectSaleModal.set(false);
  }

  // --- Caja Chica ---
  async registerExpense(): Promise<void> {
    const success = await this.pettyCashService.addExpense(this.expenseMotivo(), this.expenseMonto());
    if (success) {
      alert('Gasto registrado correctamente.');
      this.expenseMotivo.set('');
      this.expenseMonto.set(0);
    }
  }

  // --- Cierre de Turno ---
  printShiftReport(): void {
    const reportEl = document.getElementById('shift-report');
    if (!reportEl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const nombreRest = this.tenant.restaurant()?.nombre ?? 'Restaurante';
    printWindow.document.write(`
      <html><head><title>Cierre de Turno - ${nombreRest}</title>
      <style>body{font-family:system-ui,sans-serif;padding:20px;max-width:600px;margin:0 auto}
      h3{font-size:18px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #eee;text-align:left}
      .right{text-align:right}.bold{font-weight:bold}.total{font-size:20px;border-top:2px solid #333;padding-top:10px}</style>
      </head><body>${reportEl.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  async closeShift(): Promise<void> {
    const confirm = window.confirm('ATENCIÓN: ¿Estás seguro de cerrar la caja? Esto va a imprimir el reporte y luego BORRARÁ permanentemente todas las ventas y gastos del día.');
    if (!confirm) return;

    // 1. Imprimir
    this.printShiftReport();

    // 2. Borrar historiales en Firebase
    const ordersDeleted = await this.orderService.clearOrderHistory();
    await this.pettyCashService.clearExpenses();

    if (ordersDeleted) {
      alert('¡Caja cerrada correctamente! El historial de ventas y gastos se ha limpiado.');
    } else {
      alert('Hubo un error al limpiar el historial. Revisa tu conexión.');
    }
  }

  ngOnDestroy(): void {
    // effect is automatically cleaned up
  }
}

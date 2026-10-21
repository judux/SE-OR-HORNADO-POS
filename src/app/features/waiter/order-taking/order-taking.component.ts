import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { TableService } from '../../../core/services/table.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { OrderItem, Product } from '../../../shared/interfaces';

@Component({
  selector: 'app-order-taking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-64px)] flex flex-col lg:flex-row gap-6 p-4 sm:p-6 bg-dark-50 dark:bg-dark-900 transition-colors duration-300">
      
      <!-- Panel Izquierdo: Catálogo de Menú -->
      <div class="flex-1 flex flex-col min-h-0">
        <!-- Header del Menú -->
        <div class="mb-4 shrink-0 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button (click)="goBack()" class="p-2 -ml-2 rounded-2xl text-dark-500 dark:text-dark-300 hover:bg-dark-200/60 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white transition-all active:scale-95 flex items-center justify-center">
              <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-dark-800 dark:text-white tracking-tight">Catálogo de Productos</h2>
              <p class="text-xs text-dark-400 dark:text-dark-400">Selecciona los platillos para agregar al pedido</p>
            </div>
          </div>
          <!-- Mesa Info Mobile -->
          <div class="lg:hidden bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-500/20 flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm">table_restaurant</span>
            Mesa {{ currentTable()?.numero_mesa }}
          </div>
        </div>

        <!-- Filtros de Categoría (Pill Segmented Scroll Horizontal) -->
        <div class="flex overflow-x-auto pb-3 mb-2 shrink-0 gap-2 snap-x hide-scrollbar">
          <button
            (click)="selectedCategory.set('todos')"
            class="snap-start shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap active:scale-95"
            [class]="selectedCategory() === 'todos'
              ? 'bg-dark-800 text-white dark:bg-white dark:text-dark-900 shadow-md'
              : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-100 dark:border-dark-700 hover:bg-dark-100/50 dark:hover:bg-dark-700'"
          >
            Todos los Productos
          </button>
          @for (cat of productService.getCategories(); track cat) {
            <button
              (click)="selectedCategory.set(cat)"
              class="snap-start shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap active:scale-95"
              [class]="selectedCategory() === cat
                ? 'bg-dark-800 text-white dark:bg-white dark:text-dark-900 shadow-md'
                : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-100 dark:border-dark-700 hover:bg-dark-100/50 dark:hover:bg-dark-700'"
            >
              {{ productService.getCategoryLabel(cat) }}
            </button>
          }
        </div>

        <!-- Grid de Productos -->
        <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-24 lg:pb-0">
            @for (product of filteredProducts(); track product.id) {
              <button
                (click)="openProductOptions(product)"
                [disabled]="!product.disponible"
                class="group relative bg-white dark:bg-dark-800 rounded-3xl p-4 border border-dark-100 dark:border-dark-700/80 text-left transition-all duration-200
                       hover:shadow-lg hover:-translate-y-1 active:scale-[0.97] flex flex-col justify-between h-full overflow-hidden
                       disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                <!-- Highlight line -->
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-primary-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div class="flex-1">
                  <div class="flex items-start justify-between gap-1 mb-1">
                    <h3 class="font-bold text-dark-800 dark:text-gray-100 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{{ product.nombre }}</h3>
                  </div>
                  @if (product.descripcion) {
                    <p class="text-[11px] text-dark-400 dark:text-dark-400 line-clamp-2 mb-2 font-normal">{{ product.descripcion }}</p>
                  }
                  @if (!product.disponible) {
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-dark-100 dark:bg-dark-700 text-dark-400 uppercase tracking-wider">
                      Agotado
                    </span>
                  }
                </div>

                <div class="mt-3 flex items-center justify-between w-full shrink-0 pt-2 border-t border-dark-50 dark:border-dark-700/40">
                  <span class="text-amber-600 dark:text-amber-400 font-extrabold text-base">$ {{ product.precio | number:'1.0-0' }}</span>
                  <div class="w-8 h-8 rounded-full bg-dark-100/70 dark:bg-dark-700 flex items-center justify-center text-dark-600 dark:text-dark-300 font-bold group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xs">
                    <span class="material-symbols-rounded text-base">add</span>
                  </div>
                </div>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Panel Derecho: Carrito de Compras -->
      <div class="w-full lg:w-96 bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl border border-dark-100 dark:border-dark-700/80 lg:rounded-3xl shadow-xl flex flex-col shrink-0
                  fixed lg:relative inset-x-0 bottom-0 lg:bottom-auto h-[70vh] lg:h-full z-40 transition-transform duration-300 ease-out
                  lg:translate-y-0"
           [class.translate-y-0]="isCartOpenMobile()"
           [class.translate-y-full]="!isCartOpenMobile()">
        
        <!-- Toggle Flotante Móvil -->
        <button (click)="isCartOpenMobile.set(!isCartOpenMobile())" 
                class="lg:hidden absolute -top-14 inset-x-4 h-12 bg-dark-800 text-white rounded-2xl font-bold flex items-center justify-between px-5 shadow-2xl border border-dark-700 backdrop-blur-md active:scale-98">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-amber-500 text-dark-900 flex items-center justify-center text-xs font-black">{{ orderService.totalQuantity() }}</span>
            <span>Ver Comanda</span>
          </div>
          <span class="text-amber-400 font-extrabold">$ {{ orderService.totalAmount() | number:'1.0-0' }}</span>
        </button>

        <!-- Header Carrito -->
        <div class="p-5 border-b border-dark-100 dark:border-dark-700/60 shrink-0 bg-dark-800 text-white lg:bg-transparent lg:text-dark-800 lg:dark:text-white rounded-t-none lg:rounded-t-3xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-extrabold tracking-tight">Comanda Actual</h2>
              <p class="text-xs opacity-70">Mesa {{ currentTable()?.numero_mesa }} · Capacidad {{ currentTable()?.capacidad }} personas</p>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <span class="material-symbols-rounded">receipt_long</span>
            </div>
          </div>
        </div>

        <!-- Lista de Items en Carrito -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
          @if (orderService.items().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-dark-400 text-center px-6 py-12">
              <div class="w-16 h-16 rounded-full bg-dark-100 dark:bg-dark-700/50 flex items-center justify-center mb-3">
                <span class="material-symbols-rounded text-3xl text-dark-300 dark:text-dark-500">restaurant_menu</span>
              </div>
              <p class="font-bold text-base text-dark-700 dark:text-dark-200 mb-1">Comanda vacía</p>
              <p class="text-xs text-dark-400">Toca cualquier producto del menú para comenzar a armar el pedido.</p>
            </div>
          } @else {
            @for (item of orderService.items(); track trackLine($index, item)) {
              @if (item.enviado) {
                <!-- 🔒 Item ya enviado a caja — BLOQUEADO -->
                <div class="bg-dark-100/50 dark:bg-dark-900/40 border border-dark-200/60 dark:border-dark-700/60 p-3.5 rounded-2xl opacity-75">
                  <div class="flex justify-between items-start mb-1">
                    <h4 class="font-bold text-xs text-dark-600 dark:text-dark-300 flex-1 leading-tight pr-2 flex items-center gap-1.5">
                      <span class="material-symbols-rounded text-sm text-dark-400">lock</span>
                      {{ item.nombre_producto }}
                    </h4>
                    <span class="font-bold text-xs text-dark-600 dark:text-dark-300 shrink-0">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                  </div>
                  @if (item.notas) {
                    <p class="text-[11px] text-dark-400 mb-1 px-2 py-0.5 rounded-lg bg-dark-200/50 dark:bg-dark-800 inline-block font-medium">📝 {{ item.notas }}</p>
                  }
                  <div class="flex items-center justify-between mt-1 pt-1 border-t border-dark-200/40 dark:border-dark-700/40">
                    <span class="text-[11px] font-bold text-dark-400">{{ item.cantidad }} × $ {{ item.precio_unitario | number:'1.0-0' }}</span>
                    <span class="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider">Enviado a Caja</span>
                  </div>
                </div>
              } @else {
                <!-- ✏️ Item NUEVO — editable -->
                <div class="bg-white dark:bg-dark-700/40 border border-emerald-200 dark:border-emerald-800/60 p-3.5 rounded-2xl shadow-xs">
                  <div class="flex justify-between items-start mb-1.5">
                    <h4 class="font-bold text-sm text-dark-900 dark:text-white flex-1 leading-tight pr-2 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
                      {{ item.nombre_producto }}
                    </h4>
                    <span class="font-extrabold text-sm text-dark-900 dark:text-white shrink-0">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                  </div>
                  @if (item.notas) {
                    <p class="text-xs text-amber-700 dark:text-amber-300 mb-2 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl font-medium border border-amber-200/50 dark:border-amber-800/40">📝 {{ item.notas }}</p>
                  }
                  <div class="flex items-center justify-between mt-2 pt-2 border-t border-dark-100 dark:border-dark-700/40">
                    <div class="flex items-center gap-1 bg-dark-100/80 dark:bg-dark-900/60 rounded-xl p-1">
                      <button (click)="orderService.updateQuantity(item.line_id!, -1)" class="w-7 h-7 rounded-lg bg-white dark:bg-dark-700 flex items-center justify-center text-dark-700 dark:text-dark-200 font-bold shadow-xs active:scale-90 transition-transform hover:text-red-500">
                        <span class="material-symbols-rounded text-base">{{ item.cantidad === 1 ? 'delete' : 'remove' }}</span>
                      </button>
                      <span class="w-7 text-center font-extrabold text-xs text-dark-900 dark:text-white">{{ item.cantidad }}</span>
                      <button (click)="orderService.updateQuantity(item.line_id!, 1)" class="w-7 h-7 rounded-lg bg-white dark:bg-dark-700 flex items-center justify-center text-dark-700 dark:text-dark-200 font-bold shadow-xs active:scale-90 transition-transform hover:text-emerald-500">
                        <span class="material-symbols-rounded text-base">add</span>
                      </button>
                    </div>
                    <span class="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Por Enviar</span>
                  </div>
                </div>
              }
            }
          }
        </div>

        <!-- Resumen y Enviar (Footer Carrito) -->
        <div class="p-4 sm:p-5 border-t border-dark-100 dark:border-dark-700/60 shrink-0 bg-white dark:bg-dark-800 lg:rounded-b-3xl mt-auto">
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-bold text-dark-400 uppercase tracking-wider">Total ({{ orderService.totalQuantity() }} items)</span>
            <span class="text-2xl font-black text-dark-900 dark:text-white tracking-tight">$ {{ orderService.totalAmount() | number:'1.0-0' }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              (click)="saveOrder('pendiente')"
              [disabled]="orderService.items().length === 0 || isSending()"
              class="py-3 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95
                     disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none
                     bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-center justify-center gap-1.5"
            >
              <span class="material-symbols-rounded text-base">hourglass_top</span>
              <span>Dejar Pendiente</span>
            </button>
            <button
              (click)="saveOrder('en_caja')"
              [disabled]="(hasNewItems() === false && !isOrderPending()) || isSending()"
              class="py-3 rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95
                     disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none flex items-center justify-center gap-1.5
                     bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              @if (isSending()) {
                <span>Enviando...</span>
              } @else {
                <span>Enviar a Caja</span>
                <span class="material-symbols-rounded text-base">send</span>
              }
            </button>
          </div>
        </div>
      </div>
      
      <!-- Overlay oscuro para Mobile cuando el cart está abierto -->
      @if (isCartOpenMobile()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden" (click)="isCartOpenMobile.set(false)"></div>
      }

      <!-- Modal de Opciones de Producto (Notas) Apple Sheet -->
      @if (selectedProduct()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
             (click)="closeProductOptions()">
          <div class="bg-white dark:bg-dark-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-dark-100 dark:border-dark-700"
               (click)="$event.stopPropagation()">
            
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-extrabold text-dark-900 dark:text-white leading-tight pr-4 tracking-tight">{{ selectedProduct()?.nombre }}</h3>
              <button (click)="closeProductOptions()" class="w-8 h-8 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center text-dark-500 dark:text-dark-300 hover:bg-dark-200">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
            
            <p class="text-amber-600 dark:text-amber-400 font-black text-xl mb-4">$ {{ selectedProduct()?.precio | number:'1.0-0' }}</p>

            @if (selectedProduct()?.descripcion) {
              <p class="text-dark-500 dark:text-dark-400 text-xs mb-5 bg-dark-50 dark:bg-dark-900/50 p-3 rounded-2xl border border-dark-100 dark:border-dark-700">
                {{ selectedProduct()?.descripcion }}
              </p>
            }

            <div class="space-y-4">
              <div class="flex items-center justify-between bg-dark-50 dark:bg-dark-900/50 p-2.5 rounded-2xl border border-dark-100 dark:border-dark-700">
                <span class="px-3 font-bold text-xs text-dark-600 dark:text-dark-300 uppercase tracking-wider">Cantidad</span>
                <div class="flex items-center gap-1">
                  <button (click)="productQuantity() > 1 && productQuantity.set(productQuantity() - 1)" 
                          class="w-9 h-9 rounded-xl bg-white dark:bg-dark-700 shadow-xs flex items-center justify-center font-bold text-lg active:scale-90 disabled:opacity-40"
                          [disabled]="productQuantity() <= 1">
                    <span class="material-symbols-rounded text-base">remove</span>
                  </button>
                  <span class="w-8 text-center font-black text-base text-dark-900 dark:text-white">{{ productQuantity() }}</span>
                  <button (click)="productQuantity.set(productQuantity() + 1)"
                          class="w-9 h-9 rounded-xl bg-white dark:bg-dark-700 shadow-xs flex items-center justify-center font-bold text-lg active:scale-90 text-amber-600 dark:text-amber-400">
                    <span class="material-symbols-rounded text-base">add</span>
                  </button>
                </div>
              </div>

              @if (selectedProduct()?.notas_permitidas) {
                <div>
                  <label class="block text-xs font-bold text-dark-700 dark:text-dark-300 mb-1.5 mt-3 flex items-center gap-1.5">
                    <span class="material-symbols-rounded text-base text-amber-500">edit_note</span> Observaciones de Preparación
                  </label>
                  <textarea
                    [(ngModel)]="productNote"
                    class="input-field min-h-[75px] text-xs"
                    placeholder="Ej: Sin ensalada, bien asado, extra salsa..."
                  ></textarea>
                  <!-- Sugerencias rápidas -->
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <button (click)="appendNote('Sin ensalada')" class="px-2.5 py-1 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 rounded-xl text-[11px] font-semibold text-dark-700 dark:text-dark-300 transition-colors">Sin ensalada</button>
                    <button (click)="appendNote('Sin cebolla')" class="px-2.5 py-1 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 rounded-xl text-[11px] font-semibold text-dark-700 dark:text-dark-300 transition-colors">Sin cebolla</button>
                    <button (click)="appendNote('Bien asado')" class="px-2.5 py-1 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 rounded-xl text-[11px] font-semibold text-dark-700 dark:text-dark-300 transition-colors">Bien asado</button>
                    <button (click)="appendNote('Para llevar')" class="px-2.5 py-1 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 rounded-xl text-[11px] font-semibold text-dark-700 dark:text-dark-300 transition-colors">Para llevar</button>
                  </div>
                </div>
              }
            </div>

            <button
              (click)="confirmAddToCart()"
              class="w-full mt-5 py-3.5 rounded-2xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-bold transition-all hover:opacity-95 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Agregar a Comanda</span>
              <span class="font-normal opacity-70 pl-2 border-l border-white/20 dark:border-dark-900/20">
                $ {{ (selectedProduct()!.precio * productQuantity()) | number:'1.0-0' }}
              </span>
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.3);
      border-radius: 20px;
    }
  `]
})
export class OrderTakingComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public productService = inject(ProductService);
  public orderService = inject(OrderService);
  private tableService = inject(TableService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  selectedCategory = signal<string>('todos');

  // Las líneas se identifican por line_id; las antiguas sin id usan su posición
  trackLine(index: number, item: OrderItem): string {
    return item.line_id ?? `idx_${index}`;
  }

  // UI State
  isCartOpenMobile = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);
  productQuantity = signal<number>(1);
  productNote = signal<string>('');
  isSending = signal<boolean>(false);

  hasNewItems = this.orderService.hasNewItems;

  isOrderPending = computed(() => {
    const tableId = this.orderService.currentTable();
    if (!tableId) return false;
    const order = this.orderService.getOrderByTable(tableId);
    return order?.estado === 'pendiente';
  });

  currentTable = computed(() => {
    const tableId = this.orderService.currentTable();
    if (!tableId) return null;
    return this.tableService.getTableById(tableId);
  });

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'todos') return this.productService.allProducts();
    return this.productService.allProducts().filter(p => p.categoria === cat);
  });

  constructor() {
    const mesaId = this.route.snapshot.paramMap.get('id');
    if (mesaId) {
      this.orderService.setActiveTable(mesaId);
    } else {
      this.router.navigate(['/mesero']);
    }
  }

  async goBack(): Promise<void> {
    if (this.hasNewItems()) {
      const confirm = await this.confirmDialog.confirm({
        title: '¿Descartar pedido?',
        message: 'Hay productos agregados a esta comanda. Si vuelves atrás sin enviar, se perderán.',
        confirmText: 'Descartar',
        cancelText: 'Continuar pidiendo',
        confirmStyle: 'danger',
        icon: 'delete'
      });

      if (!confirm) return;
    }
    this.orderService.clearCart();
    this.router.navigate(['/mesero']);
  }

  openProductOptions(product: Product): void {
    this.selectedProduct.set(product);
    this.productQuantity.set(1);
    this.productNote.set('');
  }

  closeProductOptions(): void {
    this.selectedProduct.set(null);
  }

  appendNote(noteText: string): void {
    const current = this.productNote().trim();
    if (current.length === 0) {
      this.productNote.set(noteText);
    } else {
      this.productNote.set(`${current}, ${noteText}`);
    }
  }

  confirmAddToCart(): void {
    const product = this.selectedProduct();
    if (product) {
      const note = this.productNote().trim();
      const qty = this.productQuantity();

      this.orderService.addToCart(product, note, qty);

      this.toast.show({
        message: `+${qty} ${product.nombre} agregado`,
        type: 'success',
        icon: 'check_circle',
        duration: 2000
      });

      this.closeProductOptions();
    }
  }

  async saveOrder(estadoFinal: 'pendiente' | 'en_caja'): Promise<void> {
    const currentTable = this.currentTable();
    if (!currentTable || this.isSending()) return;

    this.isSending.set(true);

    try {
      const success = await this.orderService.saveOrder(estadoFinal);

      if (success) {
        if (estadoFinal === 'en_caja') {
          this.toast.show({
            message: `Mesa ${currentTable.numero_mesa} enviada a caja`,
            type: 'success',
            icon: 'send',
            duration: 3000
          });
        } else {
          this.toast.show({
            message: `Mesa ${currentTable.numero_mesa} guardada como pendiente`,
            type: 'info',
            icon: 'schedule',
            duration: 3000
          });
        }
        this.router.navigate(['/mesero']);
      } else {
        this.toast.show({
          message: 'Error al guardar la orden. Intenta de nuevo.',
          type: 'error',
          icon: 'error'
        });
      }
    } catch (error) {
      this.toast.show({
        message: 'Error de conexión. Intenta de nuevo.',
        type: 'error',
        icon: 'wifi_off'
      });
    }

    this.isSending.set(false);
  }
}

import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { TableService } from '../../../core/services/table.service';
import { Product } from '../../../shared/interfaces';

@Component({
  selector: 'app-order-taking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 -m-4 sm:-m-6 p-4 sm:p-6 bg-dark-50 dark:bg-dark-900 transition-colors duration-300">
      
      <!-- Panel Izquierdo: Catálogo de Menú -->
      <div class="flex-1 flex flex-col min-h-0">
        <!-- Categorías dentro de una card larga -->
        <div class="mb-4 shrink-0 flex items-center gap-2">
          <div class="flex-1 min-w-0 bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 shadow-sm p-2">
            <div class="flex overflow-x-auto gap-2 snap-x hide-scrollbar">
              <button
                (click)="selectedCategory.set('todos')"
                class="snap-start shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                [class]="selectedCategory() === 'todos'
                  ? 'bg-dark-800 text-white shadow-sm'
                  : 'bg-dark-50 dark:bg-dark-900 text-dark-500 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'"
              >
                Todos
              </button>
              @for (cat of productService.getCategories(); track cat) {
                <button
                  (click)="selectedCategory.set(cat)"
                  class="snap-start shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                  [class]="selectedCategory() === cat
                    ? 'bg-dark-800 text-white shadow-sm'
                    : 'bg-dark-50 dark:bg-dark-900 text-dark-500 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'"
                >
                  {{ productService.getCategoryLabel(cat) }}
                </button>
              }
            </div>
          </div>
          <!-- Mesa (solo móvil) -->
          <div class="lg:hidden shrink-0 bg-primary-50 text-primary-700 px-3 py-2 rounded-xl text-sm font-bold border border-primary-200">
            Mesa {{ currentTable()?.numero_mesa }}
          </div>
        </div>

        <!-- Grid de Productos -->
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-20 lg:pb-0">
            @for (product of filteredProducts(); track product.id) {
              <button
                (click)="openProductOptions(product)"
                [disabled]="!product.disponible"
                class="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-dark-100 dark:border-dark-700 text-left transition-all duration-200
                       hover:shadow-md hover:-translate-y-1 active:scale-95 flex flex-col h-full
                       disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                [class.ring-2]="false" 
                [class.ring-primary-500]="false"
              >
                <div class="flex-1">
                  <h3 class="font-bold text-dark-800 dark:text-gray-100 leading-tight mb-1">{{ product.nombre }}</h3>
                  @if (!product.disponible) {
                    <span class="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-dark-100 text-dark-500 uppercase tracking-wider">
                      Agotado
                    </span>
                  }
                </div>
                <div class="mt-3 flex items-center justify-between w-full shrink-0">
                  <span class="text-primary-600 font-bold">$ {{ product.precio | number:'1.0-0' }}</span>
                  <div class="w-8 h-8 rounded-full bg-dark-50 dark:bg-dark-700/50 flex items-center justify-center text-dark-400 font-bold group-hover:bg-primary-50 dark:group-hover:bg-primary-900/40 group-hover:text-primary-500 transition-colors">
                    <span class="material-symbols-rounded text-lg">add</span>
                  </div>
                </div>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Panel Derecho: Carrito de Compras -->
      <div class="w-full lg:w-96 bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 lg:rounded-3xl shadow-xl lg:shadow-md flex flex-col shrink-0
                  fixed lg:relative inset-x-0 bottom-0 lg:bottom-auto h-[65vh] lg:h-auto z-40 transition-transform duration-300
                  lg:translate-y-0"
           [class.translate-y-0]="isCartOpenMobile()"
           [class.translate-y-full]="!isCartOpenMobile()">
        
        <!-- Toggle para Mobile -->
        <button (click)="isCartOpenMobile.set(!isCartOpenMobile())"
                class="lg:hidden absolute -top-12 inset-x-0 h-12 bg-dark-800 text-white rounded-t-3xl font-bold flex items-center justify-between px-6 shadow-lg">
          <span>Ver Pedido ({{ orderService.totalQuantity() }})</span>
          <span>$ {{ orderService.totalAmount() | number:'1.0-0' }}</span>
        </button>

        <!-- Header Carrito -->
        <div class="p-5 border-b border-dark-100 dark:border-dark-700 shrink-0 bg-dark-800 dark:bg-dark-900 lg:bg-transparent lg:dark:bg-transparent rounded-t-none lg:rounded-t-3xl">
          <div class="flex items-center justify-between lg:mb-2 text-white lg:text-dark-800">
            <h2 class="text-xl font-bold">Orden Actual</h2>
            <div class="bg-white/20 lg:bg-primary-50 lg:text-primary-700 px-3 py-1 rounded-full text-sm font-bold border border-transparent lg:border-primary-200">
              Mesa {{ currentTable()?.numero_mesa }}
            </div>
          </div>
          <p class="text-sm text-dark-300 lg:text-dark-400 hidden lg:block">Agrega productos tocando el menú</p>
        </div>

        <!-- Lista de Items en Carrito -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-dark-50/50 dark:bg-dark-900/50 lg:bg-transparent lg:dark:bg-transparent">
          @if (orderService.items().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-dark-400 text-center px-6">
              <span class="text-5xl mb-4 opacity-50">🍽️</span>
              <p class="font-medium text-lg text-dark-600 mb-1">La orden está vacía</p>
              <p class="text-sm">Selecciona productos del menú para comenzar el pedido.</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (item of orderService.items(); track $index) {
                @if (item.enviado) {
                  <!-- 🔒 Item ya enviado a caja — BLOQUEADO -->
                  <div class="bg-dark-50 dark:bg-dark-900/50 border border-dark-200 dark:border-dark-600 p-3 rounded-2xl opacity-80">
                    <div class="flex justify-between items-start mb-1">
                      <h4 class="font-bold text-dark-500 flex-1 leading-tight pr-2 flex items-center gap-1.5">
                        <span class="material-symbols-rounded text-sm text-dark-400">lock</span>
                        {{ item.nombre_producto }}
                      </h4>
                      <span class="font-bold text-dark-500 shrink-0">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                    </div>
                    @if (item.notas) {
                      <p class="text-xs text-dark-400 mb-1 px-2 py-1 rounded inline-block bg-dark-100">📝 {{ item.notas }}</p>
                    }
                    <div class="flex items-center justify-between mt-1">
                      <span class="text-xs font-bold text-dark-400 bg-dark-100 px-2 py-1 rounded-lg">{{ item.cantidad }} × $ {{ item.precio_unitario | number:'1.0-0' }}</span>
                      <span class="text-[10px] font-bold text-dark-400 uppercase tracking-wider">Enviado a Caja</span>
                    </div>
                  </div>
                } @else {
                  <!-- ✏️ Item NUEVO — editable -->
                  <div class="bg-white dark:bg-dark-800 border inset-0 lg:border-dark-100 dark:border-dark-700 p-3 rounded-2xl shadow-sm ring-2 ring-emerald-200 dark:ring-emerald-700/50">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-bold text-dark-800 flex-1 leading-tight pr-2 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                        {{ item.nombre_producto }}
                      </h4>
                      <span class="font-bold text-dark-600 shrink-0">$ {{ (item.precio_unitario * item.cantidad) | number:'1.0-0' }}</span>
                    </div>
                    @if (item.notas) {
                      <p class="text-xs text-primary-600 mb-3 bg-primary-50 px-2 py-1 rounded inline-block">📝 Nota: {{ item.notas }}</p>
                    }
                    <div class="flex items-center justify-between mt-1">
                      <div class="flex items-center gap-1 bg-dark-50 rounded-xl p-1 border border-dark-100">
                        <button (click)="orderService.updateQuantity($index, -1)" class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-dark-600 font-bold shadow-sm active:scale-95 transition-transform hover:text-primary-600">
                          <span class="material-symbols-rounded text-lg">{{ item.cantidad === 1 ? 'delete' : 'remove' }}</span>
                        </button>
                        <span class="w-8 text-center font-bold text-dark-800">{{ item.cantidad }}</span>
                        <button (click)="orderService.updateQuantity($index, 1)" class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-dark-600 font-bold shadow-sm active:scale-95 transition-transform hover:text-green-600">
                          <span class="material-symbols-rounded text-lg">add</span>
                        </button>
                      </div>
                      <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Nuevo</span>
                    </div>
                  </div>
                }
              }
            </div>
          }
        </div>

        <!-- Resumen y Enviar (Footer Carrito) -->
        <div class="p-5 border-t border-dark-100 dark:border-dark-700 shrink-0 bg-white dark:bg-dark-800 lg:rounded-b-3xl mt-auto shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <div class="flex justify-between items-center mb-4">
            <span class="text-dark-500 font-medium">Total ({{ orderService.totalQuantity() }} items)</span>
            <span class="text-2xl font-black text-dark-800">$ {{ orderService.totalAmount() | number:'1.0-0' }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <button
              (click)="saveOrder('pendiente')"
              [disabled]="orderService.items().length === 0 || isSending()"
              class="w-full py-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]
                     disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none
                     bg-yellow-400 hover:bg-yellow-500 text-yellow-900 flex items-center justify-center gap-2"
            >
              <span class="material-symbols-rounded">restaurant</span>
              <span>Dejar Pendiente</span>
            </button>
            <button
              (click)="saveOrder('en_caja')"
              [disabled]="(hasNewItems() === false && !isOrderPending()) || isSending()"
              class="w-full py-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]
                     disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
              [class]="isSending() ? 'bg-dark-300 text-dark-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'"
            >
              @if (isSending()) {
                <span>Enviando... ⏳</span>
              } @else {
                <span>Enviar a Caja</span>
                <span class="material-symbols-rounded">send</span>
              }
            </button>
          </div>
        </div>
      </div>
      
      <!-- Overlay oscuro para Mobile cuando el cart está abierto -->
      @if (isCartOpenMobile()) {
        <div class="fixed inset-0 bg-black/60 z-30 lg:hidden" (click)="isCartOpenMobile.set(false)"></div>
      }

      <!-- Modal de Opciones de Producto (Notas) -->
      @if (selectedProduct()) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
             (click)="closeProductOptions()">
          <div class="bg-white dark:bg-dark-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200"
               (click)="$event.stopPropagation()">
            
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-dark-800 leading-tight pr-4">{{ selectedProduct()?.nombre }}</h3>
              <button (click)="closeProductOptions()" class="w-8 h-8 rounded-full bg-dark-50 flex items-center justify-center text-dark-400 hover:bg-dark-100">
                <span class="material-symbols-rounded text-lg">close</span>
              </button>
            </div>
            
            <p class="text-primary-600 font-bold text-lg mb-6">$ {{ selectedProduct()?.precio | number:'1.0-0' }}</p>

            @if (selectedProduct()?.descripcion) {
              <p class="text-dark-500 text-sm mb-6 bg-dark-50 p-3 rounded-xl border border-dark-100">
                {{ selectedProduct()?.descripcion }}
              </p>
            }

            <div class="space-y-4">
              <div class="flex items-center justify-between bg-dark-50 p-2 rounded-2xl border border-dark-100">
                <span class="px-4 font-bold text-dark-600">Cantidad</span>
                <div class="flex items-center gap-1">
                  <button (click)="productQuantity() > 1 && productQuantity.set(productQuantity() - 1)" 
                          class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-xl active:scale-95 disabled:opacity-50"
                          [disabled]="productQuantity() <= 1">
                    <span class="material-symbols-rounded">remove</span>
                  </button>
                  <span class="w-10 text-center font-bold text-lg">{{ productQuantity() }}</span>
                  <button (click)="productQuantity.set(productQuantity() + 1)"
                          class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-xl active:scale-95 text-primary-600">
                    <span class="material-symbols-rounded">add</span>
                  </button>
                </div>
              </div>

              @if (selectedProduct()?.notas_permitidas) {
                <div>
                  <label class="block text-sm font-bold text-dark-700 mb-2 mt-4 flex items-center gap-2">
                    <span class="material-symbols-rounded text-lg text-primary-500">edit_note</span> Notas Especiales para Caja
                  </label>
                  <textarea
                    [(ngModel)]="productNote"
                    class="input-field min-h-[80px]"
                    placeholder="Ej: Sin ensalada, bien asado, extra limón..."
                  ></textarea>
                  <!-- Sugerencias rápidas -->
                  <div class="flex flex-wrap gap-2 mt-2">
                    <button (click)="appendNote('Sin ensalada')" class="px-3 py-1 bg-dark-50 hover:bg-dark-100 rounded-lg text-xs font-medium text-dark-600 transition-colors">Sin ensalada</button>
                    <button (click)="appendNote('Sin cebolla')" class="px-3 py-1 bg-dark-50 hover:bg-dark-100 rounded-lg text-xs font-medium text-dark-600 transition-colors">Sin cebolla</button>
                    <button (click)="appendNote('Bien asado')" class="px-3 py-1 bg-dark-50 hover:bg-dark-100 rounded-lg text-xs font-medium text-dark-600 transition-colors">Bien asado</button>
                    <button (click)="appendNote('Para llevar')" class="px-3 py-1 bg-dark-50 hover:bg-dark-100 rounded-lg text-xs font-medium text-dark-600 transition-colors">Para llevar</button>
                  </div>
                </div>
              }
            </div>

            <button
              (click)="confirmAddToCart()"
              class="w-full mt-6 py-4 rounded-xl bg-dark-800 text-white font-bold transition-all hover:bg-dark-900 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Agregar a la Orden</span>
              <span class="font-normal opacity-80 pl-2 border-l border-white/20">
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
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #e2e8f0;
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

  selectedCategory = signal<string>('todos');

  // UI State
  isCartOpenMobile = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);
  productQuantity = signal<number>(1);
  productNote = signal<string>('');
  isSending = signal<boolean>(false);

  // Computed: ¿Hay items nuevos (no enviados) para enviar?
  hasNewItems = computed(() => {
    return this.orderService.items().some(item => !item.enviado);
  });

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
    // Set table from URL params
    const mesaId = this.route.snapshot.paramMap.get('id');
    if (mesaId) {
      this.orderService.setActiveTable(mesaId);
    } else {
      this.router.navigate(['/mesero']);
    }
  }

  goBack(): void {
    if (this.orderService.items().length > 0) {
      const confirm = window.confirm('Tienes un pedido en curso. Si vuelves se perderá. ¿Estás seguro?');
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
      // Si agrega más de 1, llamamos addToCart múltiple o ajustamos la cantidad
      // OrderService addToCart por defecto agrega 1 y luego usamos updateQuantity si necesitamos más.
      // O podemos modificar addToCart para recibir cantidad. Modificaremos OrderService implícitamente desde aquí:

      const note = this.productNote().trim();

      // Llamamos addToCart (1 vez)
      this.orderService.addToCart(product, note);

      // Si hay más cantidad, ajustamos el índice recién agregado
      if (this.productQuantity() > 1) {
        // Encontramos el índice. Será el último si es nuevo, o el de la nota exacta.
        // Forma segura:
        const items = this.orderService.items();
        const lastIndex = items.findIndex(i => i.id_producto === product.id && i.notas === note);
        if (lastIndex > -1) {
          this.orderService.updateQuantity(lastIndex, this.productQuantity() - 1);
        }
      }

      this.closeProductOptions();

      // En móvil, abrir el carrito brevemente o animar para feedback (opcional)
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
          alert(`¡Pedido enviado a caja exitosamente para la Mesa ${currentTable.numero_mesa}!`);
        } else {
          alert(`Mesa ${currentTable.numero_mesa} marcada como pendiente.`);
        }
        this.router.navigate(['/mesero']);
      } else {
        alert('Error al guardar la orden. Intenta de nuevo.');
      }
    } catch (error) {
      alert('Error de conexión. Intenta de nuevo.');
    }

    this.isSending.set(false);
  }
}

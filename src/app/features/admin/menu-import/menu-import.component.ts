import { Component, computed, inject, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Category, MenuItemDraft, parseMenuText } from '../../../core/services/menu-import.logic';
import { ToastService } from '../../../shared/components/toast/toast.service';

const EXAMPLE = `PLATOS DE LA CASA
Hornado 15.000
Lechona 12.000

BEBIDAS
Gaseosa 4.000
Jugo natural 5.000`;

/**
 * Ventana para cargar el menú completo pegando el texto de la carta.
 * Muestra una vista previa antes de guardar; los productos que ya existen no se duplican.
 */
@Component({
  selector: 'app-menu-import',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="closed.emit()">
      <div class="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-4xl max-h-full shadow-2xl flex flex-col overflow-hidden" (click)="$event.stopPropagation()">
        <div class="px-5 sm:px-6 py-4 border-b border-dark-100 dark:border-dark-700 flex items-start justify-between gap-4 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-dark-800 dark:text-white">Pegar menú</h3>
            <p class="text-sm text-dark-400">Un producto por línea con su precio. El nombre de una sección (por ejemplo "BEBIDAS") pone esa categoría a lo que sigue; en la vista previa puedes cambiarla.</p>
          </div>
          <button (click)="closed.emit()" aria-label="Cerrar" class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto grid md:grid-cols-2 gap-4 p-5 sm:p-6">
          <div class="flex flex-col min-h-[220px]">
            <label for="menu-text" class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Texto del menú</label>
            <textarea id="menu-text" [value]="text()" (input)="text.set($any($event.target).value)" [placeholder]="example"
              class="flex-1 min-h-[220px] w-full p-3 rounded-2xl bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-600 text-dark-800 dark:text-white text-base sm:text-sm font-mono outline-none focus:border-primary-500 resize-none"></textarea>
          </div>

          <div class="flex flex-col min-w-0">
            <p class="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">
              Vista previa · {{ nuevos().length }} {{ nuevos().length === 1 ? 'producto nuevo' : 'productos nuevos' }}
            </p>
            <div class="rounded-2xl border border-dark-100 dark:border-dark-700 divide-y divide-dark-100 dark:divide-dark-700 overflow-hidden">
              @for (item of result().items; track item.nombre) {
                <div class="px-3 py-2 flex items-center gap-3 text-sm" [class.opacity-50]="item.duplicado">
                  <span class="flex-1 min-w-0 truncate font-medium text-dark-800 dark:text-white">{{ item.nombre }}</span>
                  <select (change)="setCategory(item.nombre, $any($event.target).value)" [disabled]="item.duplicado"
                    aria-label="Categoría" class="shrink-0 max-w-[45%] px-2 py-1 rounded-lg text-xs bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-200 border-0 outline-none">
                    @for (cat of productService.getCategories(); track cat) {
                      <option [value]="cat" [selected]="cat === categoryOf(item)">{{ productService.getCategoryLabel(cat) }}</option>
                    }
                  </select>
                  <span class="shrink-0 whitespace-nowrap font-bold text-dark-800 dark:text-white tabular-nums">$ {{ item.precio | number:'1.0-0' }}</span>
                  @if (item.duplicado) { <span class="shrink-0 text-xs text-dark-400">ya existe</span> }
                </div>
              } @empty {
                <p class="px-3 py-6 text-center text-sm text-dark-400">Pega el menú y aquí verás cómo queda.</p>
              }
            </div>

            @if (result().errores.length) {
              <div class="mt-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3">
                <p class="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">Estas líneas no se van a agregar:</p>
                @for (err of result().errores; track err.linea) {
                  <p class="text-xs text-amber-900 dark:text-amber-100"><span class="font-mono">Línea {{ err.linea }}:</span> "{{ err.texto }}" — {{ err.motivo }}</p>
                }
              </div>
            }
          </div>
        </div>

        <div class="px-5 sm:px-6 py-4 border-t border-dark-100 dark:border-dark-700 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 shrink-0">
          <button (click)="closed.emit()" class="h-11 px-5 rounded-2xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-white font-semibold">Cancelar</button>
          <button (click)="save()" [disabled]="nuevos().length === 0 || saving()"
            class="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold disabled:opacity-50">
            {{ saving() ? 'Guardando...' : 'Agregar ' + nuevos().length + (nuevos().length === 1 ? ' producto' : ' productos') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class MenuImportComponent {
  public productService = inject(ProductService);
  private toast = inject(ToastService);

  closed = output<void>();

  readonly example = EXAMPLE;
  text = signal('');
  saving = signal(false);
  /** Categorías cambiadas a mano en la vista previa (por nombre del producto). */
  private overrides = signal<Record<string, Category>>({});

  readonly result = computed(() =>
    parseMenuText(this.text(), this.productService.allProducts().map(p => p.nombre)));
  readonly nuevos = computed(() => this.result().items.filter(i => !i.duplicado));

  categoryOf(item: MenuItemDraft): Category {
    return this.overrides()[item.nombre] ?? item.categoria;
  }

  setCategory(nombre: string, categoria: Category): void {
    this.overrides.update(o => ({ ...o, [nombre]: categoria }));
  }

  async save(): Promise<void> {
    const items = this.nuevos();
    if (items.length === 0) return;
    this.saving.set(true);
    try {
      await this.productService.addProducts(items.map(i => ({
        nombre: i.nombre, precio: i.precio, categoria: this.categoryOf(i), disponible: true, notas_permitidas: true,
      })));
      this.toast.success(`${items.length} ${items.length === 1 ? 'producto agregado' : 'productos agregados'} al menú`);
      this.closed.emit();
    } catch {
      this.toast.error('No se pudo guardar el menú. Revisa la conexión e intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }
}

import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/interfaces';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header con filtro y botón agregar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-dark-800 dark:text-white">Menú del Restaurante</h2>
          <p class="text-dark-400 dark:text-dark-300 text-sm">{{ filteredProducts().length }} productos</p>
        </div>
        <button
          (click)="openForm()"
          class="btn-primary flex items-center gap-2 text-sm font-semibold"
        >
          <span class="material-symbols-rounded">add</span> Agregar Producto
        </button>
      </div>

      <!-- Filtro por categoría -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          (click)="selectedCategory.set('todos')"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          [class]="selectedCategory() === 'todos'
            ? 'bg-dark-800 text-white'
            : 'bg-white dark:bg-dark-800 text-dark-500 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-700'"
        >
          Todos
        </button>
        @for (cat of productService.getCategories(); track cat) {
          <button
            (click)="selectedCategory.set(cat)"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            [class]="selectedCategory() === cat
              ? 'bg-dark-800 text-white'
              : 'bg-white dark:bg-dark-800 text-dark-500 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-700'"
          >
            {{ productService.getCategoryLabel(cat) }}
          </button>
        }
      </div>

      <!-- Lista de productos -->
      <div class="grid gap-3">
        @for (product of filteredProducts(); track product.id) {
          <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-5 flex items-center justify-between
                      hover:shadow-md transition-shadow duration-200">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="font-semibold text-dark-800 dark:text-gray-100">{{ product.nombre }}</h3>
                @if (!product.disponible) {
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-600">
                    Agotado
                  </span>
                }
              </div>
              <p class="text-dark-400 dark:text-dark-300 text-sm">{{ product.descripcion || 'Sin descripción' }}</p>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-lg font-bold text-dark-800 dark:text-white">
                  $ {{ product.precio | number:'1.0-0' }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-500 dark:text-dark-300">
                  {{ productService.getCategoryLabel(product.categoria) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 ml-4">
              <!-- Toggle disponible -->
              <button
                (click)="productService.toggleDisponible(product.id)"
                class="w-12 h-7 rounded-full transition-all duration-200 relative"
                [class]="product.disponible ? 'bg-green-500' : 'bg-dark-300'"
                [title]="product.disponible ? 'Marcar como agotado' : 'Marcar como disponible'"
              >
                <div
                  class="w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-all duration-200"
                  [style.left]="product.disponible ? '1.5rem' : '0.25rem'"
                ></div>
              </button>

              <!-- Editar -->
              <button
                (click)="openForm(product)"
                class="p-2 rounded-xl hover:bg-dark-50 text-dark-400 hover:text-dark-700 transition-all flex items-center justify-center"
                title="Editar"
              >
                <span class="material-symbols-rounded text-xl">edit</span>
              </button>

              <!-- Eliminar -->
              <button
                (click)="confirmDelete(product)"
                class="p-2 rounded-xl hover:bg-primary-50 text-dark-400 hover:text-primary-500 transition-all flex items-center justify-center"
                title="Eliminar"
              >
                <span class="material-symbols-rounded text-xl">delete</span>
              </button>
            </div>
          </div>
        }

        @if (filteredProducts().length === 0) {
          <div class="text-center py-12 text-dark-400">
            <span class="material-symbols-rounded text-5xl mb-3 text-dark-300">restaurant</span>
            <p class="font-medium">No hay productos en esta categoría</p>
          </div>
        }
      </div>

      <!-- Modal de confirmación de eliminación -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
             (click)="deleteTarget.set(null)">
          <div class="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold text-dark-800 dark:text-white mb-2">¿Eliminar producto?</h3>
            <p class="text-dark-400 text-sm mb-6">
              Se eliminará <strong>{{ deleteTarget()!.nombre }}</strong> del menú. Esta acción no se puede deshacer.
            </p>
            <div class="flex gap-3">
              <button
                (click)="deleteTarget.set(null)"
                class="flex-1 py-3 rounded-xl border border-dark-200 text-dark-600 font-medium
                       hover:bg-dark-50 transition-all"
              >
                Cancelar
              </button>
              <button
                (click)="doDelete()"
                class="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium
                       hover:bg-primary-600 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de formulario -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
             (click)="closeForm()">
          <div class="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-auto"
               (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold text-dark-800 dark:text-white mb-6">
              {{ editingProduct() ? 'Editar Producto' : 'Nuevo Producto' }}
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-dark-600 mb-1">Nombre</label>
                <input
                  [(ngModel)]="formData.nombre"
                  class="input-field"
                  placeholder="Ej: Hornado Completo"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-dark-600 mb-1">Precio (COP)</label>
                <input
                  [(ngModel)]="formData.precio"
                  type="number"
                  class="input-field"
                  placeholder="18000"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-dark-600 mb-1">Categoría</label>
                <select [(ngModel)]="formData.categoria" class="input-field">
                  @for (cat of productService.getCategories(); track cat) {
                    <option [value]="cat">{{ productService.getCategoryLabel(cat) }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-dark-600 mb-1">Descripción (opcional)</label>
                <textarea
                  [(ngModel)]="formData.descripcion"
                  class="input-field"
                  rows="2"
                  placeholder="Descripción del plato..."
                ></textarea>
              </div>

              <div class="flex items-center gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.disponible"
                         class="w-5 h-5 rounded accent-primary-500" />
                  <span class="text-sm text-dark-600">Disponible</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.notas_permitidas"
                         class="w-5 h-5 rounded accent-primary-500" />
                  <span class="text-sm text-dark-600">Permite notas</span>
                </label>
              </div>
            </div>

            @if (formError()) {
              <p class="text-primary-500 text-sm mt-3">{{ formError() }}</p>
            }

            <div class="flex gap-3 mt-6">
              <button
                (click)="closeForm()"
                class="flex-1 py-3 rounded-xl border border-dark-200 text-dark-600 font-medium
                       hover:bg-dark-50 transition-all"
              >
                Cancelar
              </button>
              <button
                (click)="saveProduct()"
                class="flex-1 py-3 rounded-xl bg-dark-800 text-white font-medium
                       hover:bg-dark-900 transition-all"
              >
                {{ editingProduct() ? 'Guardar Cambios' : 'Agregar' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductListComponent {
  selectedCategory = signal<string>('todos');
  showForm = signal(false);
  editingProduct = signal<Product | null>(null);
  deleteTarget = signal<Product | null>(null);
  formError = signal('');

  formData = {
    nombre: '',
    precio: 0,
    categoria: 'almuerzos' as Product['categoria'],
    descripcion: '',
    disponible: true,
    notas_permitidas: true,
  };

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'todos') return this.productService.allProducts();
    return this.productService.allProducts().filter(p => p.categoria === cat);
  });

  constructor(public productService: ProductService) { }

  openForm(product?: Product): void {
    if (product) {
      this.editingProduct.set(product);
      this.formData = {
        nombre: product.nombre,
        precio: product.precio,
        categoria: product.categoria,
        descripcion: product.descripcion || '',
        disponible: product.disponible,
        notas_permitidas: product.notas_permitidas,
      };
    } else {
      this.editingProduct.set(null);
      this.formData = {
        nombre: '',
        precio: 0,
        categoria: 'almuerzos',
        descripcion: '',
        disponible: true,
        notas_permitidas: true,
      };
    }
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  async saveProduct(): Promise<void> {
    if (!this.formData.nombre.trim()) {
      this.formError.set('El nombre es obligatorio');
      return;
    }
    if (this.formData.precio <= 0) {
      this.formError.set('El precio debe ser mayor a 0');
      return;
    }

    if (this.editingProduct()) {
      await this.productService.updateProduct(this.editingProduct()!.id, this.formData);
    } else {
      await this.productService.addProduct(this.formData);
    }
    this.closeForm();
  }

  confirmDelete(product: Product): void {
    this.deleteTarget.set(product);
  }

  async doDelete(): Promise<void> {
    if (this.deleteTarget()) {
      await this.productService.deleteProduct(this.deleteTarget()!.id);
      this.deleteTarget.set(null);
    }
  }
}

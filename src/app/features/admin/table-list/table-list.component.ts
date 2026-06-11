import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableService } from '../../../core/services/table.service';

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-dark-100 dark:border-dark-700">
      <!-- Header -->
      <div class="p-6 border-b border-dark-100 dark:border-dark-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-xl font-bold text-dark-800 dark:text-gray-100">Gestión de Mesas</h2>
          <p class="text-sm text-dark-500 dark:text-dark-400 mt-1">Administra las mesas disponibles para el local</p>
        </div>
        <button
          (click)="openModal()"
          class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 shadow-sm hover:shadow flex items-center gap-2"
        >
          <span class="material-symbols-rounded text-[20px]">add</span>
          Nueva Mesa
        </button>
      </div>

      <!-- Desktop/Tablet View (Table) -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-dark-50 dark:bg-dark-900/50 text-dark-500 dark:text-dark-400 text-sm border-b border-dark-100 dark:border-dark-700">
            <tr>
              <th class="py-3 px-6 font-semibold">Mesa</th>
              <th class="py-3 px-6 font-semibold">Capacidad</th>
              <th class="py-3 px-6 font-semibold">Estado actual</th>
              <th class="py-3 px-6 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-100 dark:divide-dark-700">
            @for (table of tableService.allTables(); track table.id) {
              <tr class="hover:bg-dark-50 dark:hover:bg-dark-900/40 transition-colors">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                      <span class="material-symbols-rounded">chair_alt</span>
                    </div>
                    <div>
                      <p class="font-bold text-dark-800 dark:text-gray-200">Mesa {{ table.numero_mesa }}</p>
                      <p class="text-xs text-dark-400">ID: {{ table.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center gap-1 text-dark-600 dark:text-dark-300">
                    <span class="material-symbols-rounded text-sm">group</span>
                    {{ table.capacidad }} pers.
                  </div>
                </td>
                <td class="py-4 px-6">
                  <span class="px-3 py-1 rounded-full text-xs font-bold capitalize"
                        [class.bg-green-100]="table.estado === 'libre'"
                        [class.text-green-700]="table.estado === 'libre'"
                        [class.dark:bg-green-900]="table.estado === 'libre'"
                        [class.dark:text-green-400]="table.estado === 'libre'"
                        [class.bg-red-100]="table.estado === 'ocupada'"
                        [class.text-red-700]="table.estado === 'ocupada'"
                        [class.dark:bg-red-900]="table.estado === 'ocupada'"
                        [class.dark:text-red-400]="table.estado === 'ocupada'"
                        [class.bg-yellow-100]="table.estado === 'pagando'"
                        [class.text-yellow-700]="table.estado === 'pagando'"
                        [class.dark:bg-yellow-900]="table.estado === 'pagando'"
                        [class.dark:text-yellow-400]="table.estado === 'pagando'"
                  >
                    {{ table.estado.replace('_', ' ') }}
                  </span>
                </td>
                <td class="py-4 px-6 text-right">
                  <button
                    (click)="deleteTable(table.id, table.numero_mesa, table.estado)"
                    class="p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar Mesa"
                  >
                    <span class="material-symbols-rounded">delete</span>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
        
        @if (tableService.allTables().length === 0) {
          <div class="py-12 text-center text-dark-400 dark:text-dark-500">
            <span class="material-symbols-rounded text-4xl mb-2 opacity-50">table_bar</span>
            <p>No hay mesas configuradas temporalmente.</p>
          </div>
        }
      </div>

      <!-- Mobile View (Cards) -->
      <div class="sm:hidden p-4 space-y-4">
        @for (table of tableService.allTables(); track table.id) {
          <div class="bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 rounded-2xl p-4 shadow-sm">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                  <span class="material-symbols-rounded">chair_alt</span>
                </div>
                <div>
                  <h3 class="font-bold text-dark-800 dark:text-gray-200">Mesa {{ table.numero_mesa }}</h3>
                  <span class="px-2 py-0.5 mt-1 align-middle inline-block rounded-full text-[10px] font-bold capitalize"
                        [class.bg-green-100]="table.estado === 'libre'"
                        [class.text-green-700]="table.estado === 'libre'"
                        [class.bg-red-100]="table.estado === 'ocupada'"
                        [class.text-red-700]="table.estado === 'ocupada'"
                        [class.bg-yellow-100]="table.estado === 'pagando'"
                        [class.text-yellow-700]="table.estado === 'pagando'">
                    {{ table.estado.replace('_', ' ') }}
                  </span>
                </div>
              </div>
              <button
                (click)="deleteTable(table.id, table.numero_mesa, table.estado)"
                class="p-2 text-dark-400 hover:text-red-500 bg-dark-50 dark:bg-dark-900/40 rounded-xl"
              >
                <span class="material-symbols-rounded">delete</span>
              </button>
            </div>
            <div class="text-sm text-dark-500 dark:text-dark-400 flex items-center justify-between">
              <span><span class="material-symbols-rounded text-[16px] align-middle mr-1">group</span>Capacidad:</span>
              <span class="font-bold text-dark-700 dark:text-dark-300">{{ table.capacidad }} pers.</span>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal Nueva Mesa -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
           (click)="closeModal()">
        <div class="bg-white dark:bg-dark-800 rounded-3xl p-6 w-full max-w-sm shadow-xl"
             (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-dark-800 dark:text-white">Agregar Mesa</h3>
            <button (click)="closeModal()" class="text-dark-400 hover:text-dark-600 dark:hover:text-white">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>

          <form (ngSubmit)="saveTable()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-dark-700 dark:text-dark-200 mb-2">Capacidad (Personas)</label>
                <input
                  type="number"
                  [(ngModel)]="newTableCapacity"
                  name="capacidad"
                  required
                  min="1"
                  max="50"
                  class="w-full px-4 py-3 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-xl text-dark-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="Ej. 4"
                >
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex gap-3 text-sm mt-4">
                <span class="material-symbols-rounded text-blue-500 mt-0.5">info</span>
                <p class="text-blue-800 dark:text-blue-200 leading-tight">El número de mesa se asignará automáticamente en orden consecutivo.</p>
              </div>
            </div>

            <div class="flex gap-3 mt-8">
              <button
                type="button"
                (click)="closeModal()"
                class="flex-1 py-3 px-4 rounded-xl font-bold text-dark-600 dark:text-dark-300 bg-dark-50 dark:bg-dark-900 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                [disabled]="isSaving()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50 flex justify-center items-center"
                [disabled]="isSaving() || !newTableCapacity()"
              >
                @if (isSaving()) {
                  <span class="material-symbols-rounded animate-spin">refresh</span>
                } @else {
                  Crear Mesa
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class TableListComponent {
  public tableService = inject(TableService);

  showModal = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  newTableCapacity = signal<number | null>(4);

  openModal(): void {
    this.newTableCapacity.set(4);
    this.isSaving.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async saveTable(): Promise<void> {
    const cap = this.newTableCapacity();
    if (!cap || cap <= 0) return;

    this.isSaving.set(true);
    const success = await this.tableService.addTable(cap);
    this.isSaving.set(false);

    if (success) {
      this.closeModal();
    } else {
      alert('Hubo un error al crear la mesa.');
    }
  }

  async deleteTable(id: string, numero: number, estado: string): Promise<void> {
    if (estado !== 'libre') {
      alert('No puedes eliminar una mesa que no esté libre.');
      return;
    }

    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar la Mesa ${numero}?`);
    if (!confirm) return;

    const success = await this.tableService.deleteTable(id);
    if (!success) {
      alert('Hubo un error al eliminar la mesa.');
    }
  }
}

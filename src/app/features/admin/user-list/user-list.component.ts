import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/interfaces';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-dark-800 dark:text-white">Gestión de Usuarios</h2>
          <p class="text-dark-400 dark:text-dark-300 text-sm">{{ userService.allUsers().length }} usuarios registrados</p>
        </div>
        <button
          (click)="openForm()"
          class="btn-primary flex items-center gap-2 text-sm font-semibold"
        >
          <span class="material-symbols-rounded">person_add</span> Nuevo Usuario
        </button>
      </div>

      <!-- Lista de usuarios -->
      <div class="grid gap-3">
        @for (user of userService.allUsers(); track user.id) {
          <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-5 flex items-center justify-between
                      hover:shadow-md transition-shadow duration-200">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="font-semibold text-dark-800 dark:text-gray-100">{{ user.nombre }}</h3>
                @if (!user.activo) {
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-600">
                    Inactivo
                  </span>
                }
              </div>
              <div class="flex items-center gap-3 mt-2">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300">
                  {{ userService.getRolLabel(user.rol) }}
                </span>
                <span class="text-sm font-mono text-dark-400">
                  PIN: <span class="tracking-widest">{{ user.pin_acceso }}</span>
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 ml-4">
              <!-- Toggle activo -->
              <button
                (click)="userService.toggleActivo(user.id)"
                class="w-12 h-7 rounded-full transition-all duration-200 relative"
                [class]="user.activo ? 'bg-green-500' : 'bg-dark-300'"
                [title]="user.activo ? 'Desactivar usuario' : 'Activar usuario'"
              >
                <div
                  class="w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-all duration-200"
                  [style.left]="user.activo ? '1.5rem' : '0.25rem'"
                ></div>
              </button>

              <!-- Editar -->
              <button
                (click)="openForm(user)"
                class="p-2 rounded-xl hover:bg-dark-50 text-dark-400 hover:text-dark-700 transition-all flex items-center justify-center"
                title="Editar"
              >
                <span class="material-symbols-rounded text-xl">edit</span>
              </button>

              <!-- Eliminar -->
              <button
                (click)="confirmDelete(user)"
                class="p-2 rounded-xl hover:bg-primary-50 text-dark-400 hover:text-primary-500 transition-all flex items-center justify-center"
                title="Eliminar"
              >
                <span class="material-symbols-rounded text-xl">delete</span>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Modal de confirmación de eliminación -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
             (click)="deleteTarget.set(null)">
          <div class="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold text-dark-800 dark:text-white mb-2">¿Eliminar usuario?</h3>
            <p class="text-dark-400 dark:text-dark-300 text-sm mb-6">
              Se eliminará al usuario <strong>{{ deleteTarget()!.nombre }}</strong>. Esta acción no se puede deshacer.
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
              {{ editingUser() ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-dark-600 mb-1">Nombre Completo</label>
                <input
                  [(ngModel)]="formData.nombre"
                  class="input-field"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-dark-600 mb-1">Rol</label>
                <select [(ngModel)]="formData.rol" class="input-field">
                  <option value="admin">Administrador</option>
                  <option value="mesero">Mesero</option>
                  <option value="cajero">Cajero</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-dark-600 mb-1">PIN de Acceso (4 dígitos)</label>
                <input
                  [(ngModel)]="formData.pin_acceso"
                  type="text"
                  maxlength="4"
                  class="input-field text-lg font-mono tracking-widest"
                  placeholder="1234"
                  (keypress)="onlyNumbers($event)"
                />
              </div>

              <div class="flex items-center gap-3 mt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="formData.activo"
                         class="w-5 h-5 rounded accent-primary-500" />
                  <span class="text-sm text-dark-600">Usuario Activo</span>
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
                (click)="saveUser()"
                class="flex-1 py-3 rounded-xl bg-dark-800 text-white font-medium
                       hover:bg-dark-900 transition-all"
              >
                {{ editingUser() ? 'Guardar Cambios' : 'Crear Usuario' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserListComponent {
  showForm = signal(false);
  editingUser = signal<User | null>(null);
  deleteTarget = signal<User | null>(null);
  formError = signal('');

  formData = {
    nombre: '',
    rol: 'mesero' as User['rol'],
    pin_acceso: '',
    activo: true,
  };

  constructor(public userService: UserService) { }

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Solo permitir números (48-57)
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  openForm(user?: User): void {
    if (user) {
      this.editingUser.set(user);
      this.formData = {
        nombre: user.nombre,
        rol: user.rol,
        pin_acceso: user.pin_acceso,
        activo: user.activo,
      };
    } else {
      this.editingUser.set(null);
      this.formData = {
        nombre: '',
        rol: 'mesero',
        pin_acceso: '',
        activo: true,
      };
    }
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingUser.set(null);
  }

  async saveUser(): Promise<void> {
    this.formError.set('');

    if (!this.formData.nombre.trim()) {
      this.formError.set('El nombre es obligatorio');
      return;
    }
    if (this.formData.pin_acceso.length !== 4) {
      this.formError.set('El PIN debe tener exactamente 4 dígitos');
      return;
    }

    let success = false;
    if (this.editingUser()) {
      success = await this.userService.updateUser(this.editingUser()!.id, this.formData);
    } else {
      success = await this.userService.addUser(this.formData);
    }

    if (success) {
      this.closeForm();
    } else {
      this.formError.set('El PIN ingresado ya está asignado a otro usuario');
    }
  }

  confirmDelete(user: User): void {
    // Evitar borrar al único administrador inicial para no bloquearse
    if (user.id === '1') {
      alert('Por seguridad, no puedes eliminar al administrador principal desde este panel.');
      return;
    }
    this.deleteTarget.set(user);
  }

  async doDelete(): Promise<void> {
    if (this.deleteTarget()) {
      await this.userService.deleteUser(this.deleteTarget()!.id);
      this.deleteTarget.set(null);
    }
  }
}

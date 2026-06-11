import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full max-w-sm">
        <!-- Logo y Título -->
        <div class="text-center mb-8">
          <img src="logo.png" alt="Señor Hornado" class="h-40 mx-auto object-contain drop-shadow-sm mb-4 invert">
        </div>

        <!-- Card del PIN -->
        <div class="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl p-8 border border-dark-100 dark:border-dark-700">
          <p class="text-center text-dark-500 dark:text-dark-400 text-sm font-medium mb-6">Ingresa tu PIN de acceso</p>

          <!-- Indicador de dígitos -->
          <div class="flex justify-center gap-4 mb-6">
            @for (dot of [0, 1, 2, 3]; track dot) {
              <div
                class="w-4 h-4 rounded-full transition-all duration-200"
                [class]="dot < pin().length
                  ? 'bg-primary-500 scale-110 shadow-md shadow-primary-300'
                  : 'bg-dark-200'"
              ></div>
            }
          </div>

          <!-- Mensaje de error -->
          @if (error()) {
            <div class="text-center mb-4 py-2 px-4 bg-primary-50 border border-primary-200 rounded-xl">
              <p class="text-primary-600 text-sm font-medium">{{ error() }}</p>
            </div>
          }

          <!-- Mensaje de bienvenida -->
          @if (welcomeMessage()) {
            <div class="text-center mb-4 py-2 px-4 bg-green-50 border border-green-200 rounded-xl">
              <p class="text-green-600 text-sm font-medium">{{ welcomeMessage() }}</p>
            </div>
          }

          <!-- Teclado Numérico -->
          <div class="grid grid-cols-3 gap-3">
            @for (num of [1, 2, 3, 4, 5, 6, 7, 8, 9]; track num) {
              <button
                (click)="addDigit(num.toString())"
                class="h-16 rounded-2xl text-2xl font-bold text-dark-700 dark:text-dark-200 bg-dark-50 dark:bg-dark-900/50
                       hover:bg-dark-100 dark:hover:bg-dark-900 active:bg-dark-200 dark:active:bg-dark-950 active:scale-95
                       transition-all duration-150 select-none"
                [disabled]="isLoading()"
              >
                {{ num }}
              </button>
            }

            <!-- Fila inferior: borrar, 0, enter -->
            <button
              (click)="clearPin()"
              class="h-16 rounded-2xl text-sm font-semibold text-dark-400 dark:text-dark-500 bg-dark-50 dark:bg-dark-900/50
                     hover:bg-dark-100 dark:hover:bg-dark-900 active:bg-dark-200 dark:active:bg-dark-950 active:scale-95
                     transition-all duration-150 select-none"
            >
              Borrar
            </button>

            <button
              (click)="addDigit('0')"
              class="h-16 rounded-2xl text-2xl font-bold text-dark-700 dark:text-dark-200 bg-dark-50 dark:bg-dark-900/50
                     hover:bg-dark-100 dark:hover:bg-dark-900 active:bg-dark-200 dark:active:bg-dark-950 active:scale-95
                     transition-all duration-150 select-none"
              [disabled]="isLoading()"
            >
              0
            </button>

            <button
              (click)="deleteLastDigit()"
              class="h-16 rounded-2xl text-xl font-semibold text-dark-400 dark:text-dark-500 bg-dark-50 dark:bg-dark-900/50
                     hover:bg-dark-100 dark:hover:bg-dark-900 active:bg-dark-200 dark:active:bg-dark-950 active:scale-95
                     transition-all duration-150 select-none flex items-center justify-center"
            >
              <span class="material-symbols-rounded">backspace</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-dark-500 text-xs mt-6">
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  pin = signal('');
  error = signal('');
  welcomeMessage = signal('');
  isLoading = signal(false);

  constructor(private authService: AuthService) {
    // Si ya tiene sesión, redirigir
    if (this.authService.isLoggedIn()) {
      const user = this.authService.user();
      if (user) {
        this.authService.redirectByRole(user);
      }
    }
  }

  addDigit(digit: string): void {
    if (this.pin().length >= 4) return;

    this.error.set('');
    this.welcomeMessage.set('');
    this.pin.update(current => current + digit);

    // Auto-submit cuando se ingresan 4 dígitos
    if (this.pin().length === 4) {
      this.attemptLogin();
    }
  }

  deleteLastDigit(): void {
    this.pin.update(current => current.slice(0, -1));
    this.error.set('');
  }

  clearPin(): void {
    this.pin.set('');
    this.error.set('');
    this.welcomeMessage.set('');
  }

  private async attemptLogin(): Promise<void> {
    this.isLoading.set(true);

    try {
      const user = await this.authService.loginByPin(this.pin());

      if (user) {
        this.welcomeMessage.set(`¡Bienvenido, ${user.nombre}!`);
        setTimeout(() => {
          this.authService.redirectByRole(user);
        }, 800);
      } else {
        this.error.set('PIN incorrecto. Intenta de nuevo.');
        this.pin.set('');
      }
    } catch (error) {
      this.error.set('Error de conexión. Intenta de nuevo.');
      this.pin.set('');
    }

    this.isLoading.set(false);
  }
}

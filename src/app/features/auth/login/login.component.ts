import { Component, signal, computed, HostListener, inject } from '@angular/core';
import { TenantService } from '../../../core/tenant/tenant.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { User } from '../../../shared/interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen h-[100dvh] w-full max-w-full flex items-center justify-center bg-dark-900 p-4 relative overflow-hidden select-none touch-none">
      <!-- Subtle ambient glow background -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full max-w-sm relative z-10">
        <!-- Logo y Título -->
        <div class="text-center mb-8">
          <h1 class="text-white text-3xl sm:text-4xl font-black tracking-tight mb-2">{{ tenant.restaurant()?.nombre }}</h1>
        </div>

        <!-- Card del PIN — Dark Glass High Contrast -->
        <div class="bg-dark-800/90 dark:bg-dark-800/90 backdrop-blur-2xl rounded-3xl p-7 border border-dark-700/80 shadow-2xl"
             [class.animate-shake]="shakeActive()">
          @if (mode() !== 'login') {
            <p class="text-center text-amber-300 text-sm font-bold mb-2">Hola {{ setupUser()?.nombre }} 👋</p>
          }
          <p class="text-center text-dark-300 text-sm font-semibold mb-6 tracking-wide">{{ prompt() }}</p>

          <!-- Indicador de dígitos -->
          <div class="flex justify-center gap-4 mb-7">
            @for (dot of [0, 1, 2, 3]; track dot) {
              <div
                class="w-4 h-4 rounded-full transition-all duration-200"
                [class]="dot < pin().length
                  ? 'bg-primary-500 scale-125 shadow-lg shadow-primary-500/60'
                  : 'bg-dark-700 border border-dark-600 scale-100'"
                [style.transition-delay]="dot < pin().length ? (dot * 50) + 'ms' : '0ms'"
              ></div>
            }
          </div>

          <!-- Mensaje de error -->
          @if (error()) {
            <div class="text-center mb-4 py-2.5 px-4 bg-red-500/15 border border-red-500/30 rounded-2xl animate-slide-up">
              <p class="text-red-400 text-sm font-bold">{{ error() }}</p>
            </div>
          }

          <!-- Mensaje de bienvenida -->
          @if (welcomeMessage()) {
            <div class="text-center mb-4 py-2.5 px-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl animate-scale-in">
              <p class="text-emerald-400 text-sm font-bold">{{ welcomeMessage() }}</p>
            </div>
          }

          <!-- Teclado Numérico -->
          <div class="grid grid-cols-3 gap-3">
            @for (num of [1, 2, 3, 4, 5, 6, 7, 8, 9]; track num) {
              <button
                (click)="addDigit(num.toString())"
                class="h-16 rounded-2xl text-2xl font-bold text-white bg-dark-700/70
                       hover:bg-dark-600 active:bg-primary-500 active:text-white active:scale-95
                       transition-all select-none border border-dark-600/60 shadow-xs flex items-center justify-center"
                [style.transition-duration]="'100ms'"
                [disabled]="isLoading()"
              >
                {{ num }}
              </button>
            }

            <!-- Fila inferior: borrar, 0, backspace -->
            <button
              (click)="clearPin()"
              class="h-16 rounded-2xl text-xs font-bold text-dark-300 hover:text-white
                     bg-dark-700/50 hover:bg-dark-600 active:bg-dark-500 active:scale-95
                     transition-all select-none border border-dark-600/50 flex items-center justify-center uppercase tracking-wider"
              [style.transition-duration]="'100ms'"
            >
              Borrar
            </button>

            <button
              (click)="addDigit('0')"
              class="h-16 rounded-2xl text-2xl font-bold text-white bg-dark-700/70
                     hover:bg-dark-600 active:bg-primary-500 active:text-white active:scale-95
                     transition-all select-none border border-dark-600/60 shadow-xs flex items-center justify-center"
              [style.transition-duration]="'100ms'"
              [disabled]="isLoading()"
            >
              0
            </button>

            <button
              (click)="deleteLastDigit()"
              class="h-16 rounded-2xl text-xl font-bold text-dark-300 hover:text-white
                     bg-dark-700/50 hover:bg-dark-600 active:bg-dark-500 active:scale-95
                     transition-all select-none flex items-center justify-center border border-dark-600/50"
              [style.transition-duration]="'100ms'"
            >
              <span class="material-symbols-rounded">backspace</span>
            </button>
          </div>
        </div>

        <!-- Footer / keyboard hint -->
        <div class="mt-6 text-center">
          <p class="text-dark-400 text-xs flex items-center justify-center gap-1.5 font-medium">
            <span class="material-symbols-rounded text-sm">keyboard</span>
            Puedes ingresar con la pantalla o tu teclado numérico
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  public tenant = inject(TenantService);
  pin = signal('');
  error = signal('');
  welcomeMessage = signal('');
  isLoading = signal(false);
  shakeActive = signal(false);

  // Primer ingreso del administrador (o PIN restablecido): elige su propio PIN dos veces
  mode = signal<'login' | 'setup' | 'confirm'>('login');
  setupUser = signal<User | null>(null);
  private firstPin = '';
  prompt = computed(() => ({
    login: 'Ingresa tu PIN de acceso',
    setup: 'Crea tu PIN de 4 dígitos',
    confirm: 'Escríbelo otra vez para confirmar',
  }[this.mode()]));

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
  ) {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.user();
      if (user) {
        this.authService.redirectByRole(user);
        return;
      }
    }
    this.checkPendingSetup();
  }

  private async checkPendingSetup(): Promise<void> {
    try {
      const pending = await this.authService.pendingPinSetup();
      if (pending) {
        this.setupUser.set(pending);
        this.mode.set('setup');
      }
    } catch {
      // Sin conexión: se queda el ingreso normal por PIN
    }
  }


  /** Listen for physical keyboard input */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.isLoading()) return;

    // Number keys (main keyboard and numpad)
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      this.addDigit(event.key);
      return;
    }

    // Backspace
    if (event.key === 'Backspace') {
      event.preventDefault();
      this.deleteLastDigit();
      return;
    }

    // Escape — clear
    if (event.key === 'Escape') {
      event.preventDefault();
      this.clearPin();
      return;
    }
  }

  addDigit(digit: string): void {
    if (this.pin().length >= 4) return;

    this.error.set('');
    this.welcomeMessage.set('');
    this.pin.update(current => current + digit);

    // Auto-submit cuando se ingresan 4 dígitos
    if (this.pin().length === 4) {
      if (this.mode() === 'login') {
        this.attemptLogin();
      } else if (this.mode() === 'setup') {
        this.firstPin = this.pin();
        this.pin.set('');
        this.mode.set('confirm');
      } else {
        this.finishSetup();
      }
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

  private triggerShake(): void {
    this.shakeActive.set(true);
    setTimeout(() => this.shakeActive.set(false), 500);
  }

  private async finishSetup(): Promise<void> {
    const user = this.setupUser();
    if (!user) return;
    if (this.pin() !== this.firstPin) {
      this.error.set('Los PIN no coinciden. Empieza de nuevo.');
      this.triggerShake();
      this.pin.set('');
      this.mode.set('setup');
      return;
    }
    this.isLoading.set(true);
    try {
      const result = await this.authService.setOwnPin(user.id, this.pin());
      if (result === 'ok') {
        this.mode.set('login');
        await this.attemptLogin();
        return;
      }
      this.error.set(result === 'taken' ? 'Ese PIN ya lo usa otra persona del restaurante. Elige otro.' : 'El PIN debe tener 4 dígitos.');
      this.triggerShake();
      this.pin.set('');
      this.mode.set('setup');
    } catch {
      this.error.set('Error de conexión. Intenta de nuevo.');
      this.pin.set('');
      this.mode.set('setup');
    }
    this.isLoading.set(false);
  }

  private async attemptLogin(): Promise<void> {
    this.isLoading.set(true);

    try {
      const user = await this.authService.loginByPin(this.pin());

      if (user) {
        this.welcomeMessage.set(`¡Bienvenido, ${user.nombre}!`);
        this.toastService.success(`¡Bienvenido, ${user.nombre}!`);
        setTimeout(() => {
          this.authService.redirectByRole(user);
        }, 800);
      } else {
        this.error.set('PIN incorrecto. Intenta de nuevo.');
        this.triggerShake();
        this.pin.set('');
      }
    } catch (error) {
      this.error.set('Error de conexión. Intenta de nuevo.');
      this.toastService.error('Error de conexión. Verifica tu red e intenta de nuevo.');
      this.triggerShake();
      this.pin.set('');
    }

    this.isLoading.set(false);
  }
}

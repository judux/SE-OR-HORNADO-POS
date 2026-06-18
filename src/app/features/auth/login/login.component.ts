import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { Restaurant } from '../../../shared/interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div class="w-full" [class]="selectedRestaurant() ? 'max-w-sm' : 'max-w-4xl'">

        <!-- PASO 1: Selección de restaurante -->
        @if (!selectedRestaurant()) {
          <div class="text-center mb-8">
            <h1 class="text-2xl font-black text-white">Selecciona tu restaurante</h1>
            <p class="text-dark-400 text-sm mt-1">Elige dónde vas a trabajar</p>
          </div>

          @if (activeRestaurants().length === 0) {
            <div class="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl p-10 text-center text-dark-400 border border-dark-100 dark:border-dark-700">
              <span class="material-symbols-rounded text-4xl mb-2 opacity-50">storefront</span>
              <p class="font-medium">No hay restaurantes disponibles</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (r of activeRestaurants(); track r.id) {
                <button (click)="selectRestaurant(r)"
                  class="group bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-dark-100 dark:border-dark-700
                         overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] hover:border-primary-400">
                  <!-- Letrero (banner) -->
                  <div class="w-full aspect-[3/1] bg-dark-100 dark:bg-dark-900 flex items-center justify-center overflow-hidden">
                    @if (r.banner_url) {
                      <img [src]="r.banner_url" [alt]="r.nombre" class="w-full h-full object-cover" />
                    } @else if (r.logo_url) {
                      <img [src]="r.logo_url" [alt]="r.nombre" class="h-16 object-contain" />
                    } @else {
                      <span class="material-symbols-rounded text-dark-300 text-4xl">storefront</span>
                    }
                  </div>
                  <!-- Pie de la card -->
                  <div class="flex items-center gap-3 p-4">
                    <div class="w-10 h-10 rounded-xl bg-dark-50 dark:bg-dark-900 flex items-center justify-center overflow-hidden shrink-0 border border-dark-100 dark:border-dark-700">
                      @if (r.logo_url) {
                        <img [src]="r.logo_url" [alt]="r.nombre" class="w-full h-full object-cover" />
                      } @else {
                        <span class="material-symbols-rounded text-dark-300 text-[20px]">restaurant</span>
                      }
                    </div>
                    <span class="flex-1 font-bold text-dark-800 dark:text-white truncate">{{ r.nombre }}</span>
                    <span class="material-symbols-rounded text-dark-300 group-hover:text-primary-500 transition-colors">chevron_right</span>
                  </div>
                </button>
              }
            </div>
          }
        }

        <!-- PASO 2: PIN del restaurante seleccionado -->
        @if (selectedRestaurant(); as rest) {
          <div class="text-center mb-8">
            @if (rest.logo_url) {
              <img [src]="rest.logo_url" [alt]="rest.nombre" class="h-24 mx-auto object-contain mb-3 rounded-2xl">
            }
            <h1 class="text-xl font-black text-white">{{ rest.nombre }}</h1>
            <button (click)="backToList()" class="text-dark-400 text-xs mt-1 hover:text-primary-400 flex items-center gap-1 mx-auto">
              <span class="material-symbols-rounded text-[14px]">arrow_back</span> Cambiar restaurante
            </button>
          </div>

          <div class="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl p-8 border border-dark-100 dark:border-dark-700">
            <p class="text-center text-dark-500 dark:text-dark-400 text-sm font-medium mb-6">Ingresa tu PIN de acceso</p>

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

            @if (error()) {
              <div class="text-center mb-4 py-2 px-4 bg-primary-50 border border-primary-200 rounded-xl">
                <p class="text-primary-600 text-sm font-medium">{{ error() }}</p>
              </div>
            }

            @if (welcomeMessage()) {
              <div class="text-center mb-4 py-2 px-4 bg-green-50 border border-green-200 rounded-xl">
                <p class="text-green-600 text-sm font-medium">{{ welcomeMessage() }}</p>
              </div>
            }

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
        }

        <!-- Acceso super admin -->
        <p class="text-center mt-6">
          <a routerLink="/super-admin/login" class="text-dark-500 text-xs hover:text-primary-400 transition-colors">
            Acceso de administrador de plataforma
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private tenant = inject(TenantService);
  private restaurantService = inject(RestaurantService);

  pin = signal('');
  error = signal('');
  welcomeMessage = signal('');
  isLoading = signal(false);
  selectedRestaurant = signal<Restaurant | null>(null);

  activeRestaurants = computed(() =>
    this.restaurantService.allRestaurants().filter(r => r.activo)
  );

  constructor() {
    // Si ya tiene sesión activa, redirigir
    if (this.authService.isLoggedIn()) {
      const user = this.authService.user();
      if (user) {
        this.authService.redirectByRole(user);
      }
    }
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.tenant.setTenant(restaurant);
    this.selectedRestaurant.set(restaurant);
    this.clearPin();
  }

  backToList(): void {
    this.tenant.clearTenant();
    this.selectedRestaurant.set(null);
    this.clearPin();
  }

  addDigit(digit: string): void {
    if (this.pin().length >= 4) return;

    this.error.set('');
    this.welcomeMessage.set('');
    this.pin.update(current => current + digit);

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

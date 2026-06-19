import { Component, signal, inject, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';
import { ImageService } from '../../../core/services/image.service';
import { BrandColorService } from '../../../core/services/brand-color.service';
import { ImageCropperComponent } from '../../../shared/components/image-cropper/image-cropper.component';

type CropTarget = 'logo' | 'banner';

@Component({
    selector: 'app-branding',
    standalone: true,
    imports: [CommonModule, FormsModule, ImageCropperComponent],
    template: `
    <div class="space-y-6 max-w-3xl">
      <div>
        <h2 class="text-xl font-bold text-dark-800 dark:text-white flex items-center gap-2">
          <span class="material-symbols-rounded text-primary-500">storefront</span>
          Mi Restaurante
        </h2>
        <p class="text-dark-400 dark:text-dark-300 text-sm">Personaliza el logo y el letrero que ven tus clientes y empleados</p>
      </div>

      @if (message()) {
        <div class="py-2 px-4 rounded-xl text-sm font-medium"
             [class]="messageOk()
               ? 'bg-green-50 border border-green-200 text-green-700'
               : 'bg-primary-50 border border-primary-200 text-primary-600'">
          {{ message() }}
        </div>
      }

      <!-- Logo -->
      <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-5">
        <h3 class="font-bold text-dark-800 dark:text-white mb-1">Logo</h3>
        <p class="text-xs text-dark-400 mb-4">Aparece en la pantalla de inicio de sesión. Cuadrado se ve mejor.</p>

        <div class="flex items-center gap-5">
          <div class="w-24 h-24 rounded-2xl bg-dark-50 dark:bg-dark-900 flex items-center justify-center overflow-hidden shrink-0 border border-dark-100 dark:border-dark-700">
            @if (logoPreview()) {
              <img [src]="logoPreview()" alt="Logo" class="w-full h-full object-cover" />
            } @else {
              <span class="material-symbols-rounded text-dark-300 text-3xl">image</span>
            }
          </div>
          <div>
            <label class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-200 font-bold text-sm cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors">
              <span class="material-symbols-rounded text-[18px]">upload</span>
              Elegir imagen
              <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event, 'logo')" />
            </label>
            <p class="text-xs text-dark-400 mt-2">JPG o PNG · Se puede encuadrar</p>
          </div>
        </div>
      </div>

      <!-- Banner / Letrero -->
      <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-5">
        <h3 class="font-bold text-dark-800 dark:text-white mb-1">Letrero (Banner)</h3>
        <p class="text-xs text-dark-400 mb-4">Aparece en la pantalla de los meseros. Horizontal se ve mejor.</p>

        <div class="space-y-4">
          <div class="w-full aspect-[3/1] rounded-2xl bg-dark-50 dark:bg-dark-900 flex items-center justify-center overflow-hidden border border-dark-100 dark:border-dark-700">
            @if (bannerPreview()) {
              <img [src]="bannerPreview()" alt="Letrero" class="w-full h-full object-cover" />
            } @else {
              <span class="material-symbols-rounded text-dark-300 text-3xl">wallpaper</span>
            }
          </div>
          <label class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-200 font-bold text-sm cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors">
            <span class="material-symbols-rounded text-[18px]">upload</span>
            Elegir imagen
            <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event, 'banner')" />
          </label>
        </div>
      </div>

      <!-- Color institucional -->
      <div class="bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 p-5">
        <h3 class="font-bold text-dark-800 dark:text-white mb-1">Color institucional</h3>
        <p class="text-xs text-dark-400 mb-4">El color principal de botones y detalles. Déjalo por defecto o elige el tuyo.</p>

        <div class="flex flex-wrap items-center gap-3">
          <button (click)="setColor('')"
            class="w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center"
            [class]="colorPreview() === '' ? 'border-dark-800 dark:border-white scale-110' : 'border-transparent'"
            style="background:#dc2626" title="Por defecto">
            @if (colorPreview() === '') {
              <span class="material-symbols-rounded text-white text-[18px]">check</span>
            }
          </button>
          @for (c of presets; track c) {
            <button (click)="setColor(c)"
              class="w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center"
              [class]="colorPreview() === c ? 'border-dark-800 dark:border-white scale-110' : 'border-transparent'"
              [style.background]="c" [title]="c">
              @if (colorPreview() === c) {
                <span class="material-symbols-rounded text-white text-[18px]">check</span>
              }
            </button>
          }
          <label class="w-10 h-10 rounded-xl border-2 border-dashed border-dark-300 dark:border-dark-600 flex items-center justify-center cursor-pointer relative overflow-hidden" title="Color personalizado">
            <span class="material-symbols-rounded text-dark-400 text-[18px]">colorize</span>
            <input type="color" class="absolute inset-0 opacity-0 cursor-pointer"
              [value]="colorPreview() || '#dc2626'" (input)="setColor($any($event.target).value)" />
          </label>
        </div>
      </div>

      <!-- Guardar -->
      <div class="flex items-center gap-3">
        <button
          (click)="save()"
          [disabled]="isSaving() || !hasChanges()"
          class="px-6 h-12 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          @if (isSaving()) {
            <span class="material-symbols-rounded animate-spin">progress_activity</span> Guardando...
          } @else {
            <span class="material-symbols-rounded text-[18px]">save</span> Guardar cambios
          }
        </button>
        @if (hasChanges()) {
          <button (click)="discard()" class="px-4 h-12 text-dark-500 font-bold text-sm hover:text-dark-700">
            Descartar
          </button>
        }
      </div>
    </div>

    <!-- Editor de recorte (modal) -->
    @if (cropperSrc() && cropperTarget()) {
      <app-image-cropper
        [imageSrc]="cropperSrc()!"
        [aspectRatio]="cropperTarget() === 'banner' ? 3 : 1"
        [outputWidth]="cropperTarget() === 'banner' ? 1200 : 400"
        [outputHeight]="cropperTarget() === 'banner' ? 400 : 400"
        (confirmed)="onCropConfirmed($event)"
        (cancelled)="closeCropper()" />
    }
  `,
})
export class BrandingComponent implements OnDestroy {
    private tenant = inject(TenantService);
    private imageService = inject(ImageService);
    private brandColor = inject(BrandColorService);

    readonly presets = ['#dc2626', '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#db2777', '#0d9488', '#ca8a04'];

    private savedLogo = computed(() => this.tenant.restaurant()?.logo_url ?? '');
    private savedBanner = computed(() => this.tenant.restaurant()?.banner_url ?? '');
    private savedColor = computed(() => this.tenant.restaurant()?.color_primary ?? '');

    private newLogo = signal<string | null>(null);
    private newBanner = signal<string | null>(null);
    private newColor = signal<string | null>(null);

    isSaving = signal(false);
    message = signal('');
    messageOk = signal(false);

    logoPreview = computed(() => this.newLogo() ?? this.savedLogo());
    bannerPreview = computed(() => this.newBanner() ?? this.savedBanner());
    colorPreview = computed(() => this.newColor() ?? this.savedColor());

    hasChanges = computed(() =>
        this.newLogo() !== null || this.newBanner() !== null || this.newColor() !== null
    );

    // Estado del editor de recorte
    cropperSrc = signal<string | null>(null);
    cropperTarget = signal<CropTarget | null>(null);

    setColor(hex: string): void {
        this.newColor.set(hex);
        this.brandColor.apply(hex || null);
        this.message.set('');
    }

    /** Al elegir un archivo abre el editor de recorte en vez de guardar directo. */
    async onFileSelected(event: Event, target: CropTarget): Promise<void> {
        const file = (event.target as HTMLInputElement).files?.[0];
        // Reset el input para que pueda re-elegir el mismo archivo
        (event.target as HTMLInputElement).value = '';
        if (!file) return;

        try {
            const dataUrl = await this.imageService.readAsDataUrl(file);
            this.cropperSrc.set(dataUrl);
            this.cropperTarget.set(target);
        } catch {
            this.showMessage('No se pudo leer la imagen.', false);
        }
    }

    onCropConfirmed(dataUrl: string): void {
        if (this.cropperTarget() === 'logo') {
            this.newLogo.set(dataUrl);
        } else {
            this.newBanner.set(dataUrl);
        }
        this.closeCropper();
        this.message.set('');
    }

    closeCropper(): void {
        this.cropperSrc.set(null);
        this.cropperTarget.set(null);
    }

    async save(): Promise<void> {
        if (!this.hasChanges()) return;
        this.isSaving.set(true);

        const updates: { logo_url?: string; banner_url?: string; color_primary?: string } = {};
        if (this.newLogo() !== null) updates.logo_url = this.newLogo()!;
        if (this.newBanner() !== null) updates.banner_url = this.newBanner()!;
        if (this.newColor() !== null) updates.color_primary = this.newColor()!;

        const ok = await this.tenant.updateCurrentRestaurant(updates);
        this.isSaving.set(false);

        if (ok) {
            this.newLogo.set(null);
            this.newBanner.set(null);
            this.newColor.set(null);
            this.showMessage('Cambios guardados correctamente.', true);
        } else {
            this.showMessage('No se pudieron guardar los cambios.', false);
        }
    }

    discard(): void {
        this.newLogo.set(null);
        this.newBanner.set(null);
        this.newColor.set(null);
        this.brandColor.apply(this.savedColor() || null);
        this.message.set('');
    }

    private showMessage(text: string, ok: boolean): void {
        this.message.set(text);
        this.messageOk.set(ok);
    }

    ngOnDestroy(): void {
        if (this.newColor() !== null) {
            this.brandColor.apply(this.savedColor() || null);
        }
    }
}

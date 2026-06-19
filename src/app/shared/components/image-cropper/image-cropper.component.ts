import {
    Component, signal, output, input, ElementRef, ViewChild,
    AfterViewInit, HostListener, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CropResult {
    dataUrl: string;
    /** Relación de aspecto usada (ancho / alto) */
    aspectRatio: number;
}

/**
 * Modal de recorte / encuadre de imágenes.
 *
 * Uso:
 *   <app-image-cropper
 *     [imageSrc]="srcDataUrl"
 *     [aspectRatio]="3"
 *     [outputWidth]="1200"
 *     [outputHeight]="400"
 *     (confirmed)="onBannerCropped($event)"
 *     (cancelled)="cropperOpen.set(false)" />
 *
 * El usuario arrastra y hace zoom; al confirmar se exporta el área
 * visible como JPEG base64 (outputWidth × outputHeight px).
 */
@Component({
    selector: 'app-image-cropper',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" (click)="onBackdrop()">
      <div class="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-dark-800 dark:text-white">Ajustar imagen</h3>
            <p class="text-xs text-dark-400 mt-0.5">Arrastra para mover · Rueda del ratón o el slider para zoom</p>
          </div>
          <button (click)="cancel()" class="text-dark-400 hover:text-dark-600 dark:hover:text-dark-200">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- Viewport de recorte -->
        <div class="px-6 pt-5">
          <div
            #cropContainer
            class="relative overflow-hidden rounded-2xl bg-dark-100 dark:bg-dark-900 cursor-grab select-none border-2 border-dashed border-primary-300"
            [style.aspect-ratio]="aspectRatio()"
            (mousedown)="startDrag($event)"
            (touchstart)="startTouch($event)"
            (wheel)="onWheel($event)">

            @if (imgLoaded()) {
              <img
                [src]="imageSrc()"
                alt=""
                draggable="false"
                class="absolute pointer-events-none"
                [style.width.px]="imgW()"
                [style.height.px]="imgH()"
                [style.left.px]="posX()"
                [style.top.px]="posY()" />
            }

            <!-- Cruz central de referencia -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div class="absolute w-full h-px bg-white"></div>
              <div class="absolute h-full w-px bg-white"></div>
            </div>
          </div>
        </div>

        <!-- Controles de zoom -->
        <div class="px-6 pt-4 pb-2 flex items-center gap-3">
          <span class="material-symbols-rounded text-dark-400 text-[20px]">zoom_out</span>
          <input
            type="range"
            class="flex-1 h-2 accent-primary-500 cursor-pointer"
            [min]="minZoom()"
            [max]="maxZoom()"
            [step]="0.01"
            [value]="zoom()"
            (input)="onSlider($any($event.target).value)" />
          <span class="material-symbols-rounded text-dark-400 text-[20px]">zoom_in</span>
          <span class="text-xs text-dark-400 w-12 text-right">{{ (zoom() / minZoom() * 100) | number:'1.0-0' }}%</span>
        </div>

        <!-- Botón centrar -->
        <div class="px-6 pb-2 flex gap-2">
          <button (click)="resetView()" class="text-xs text-dark-400 hover:text-primary-500 flex items-center gap-1">
            <span class="material-symbols-rounded text-[16px]">center_focus_strong</span> Centrar
          </button>
          <button (click)="fitCover()" class="text-xs text-dark-400 hover:text-primary-500 flex items-center gap-1">
            <span class="material-symbols-rounded text-[16px]">fit_screen</span> Ajustar
          </button>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-6 pt-2 flex justify-end gap-3 border-t border-dark-100 dark:border-dark-700">
          <button (click)="cancel()"
            class="px-5 h-11 rounded-xl text-dark-500 font-bold text-sm hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors">
            Cancelar
          </button>
          <button (click)="confirm()"
            class="px-6 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold text-sm transition-all flex items-center gap-2">
            <span class="material-symbols-rounded text-[18px]">check</span>
            Confirmar recorte
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ImageCropperComponent implements AfterViewInit, OnChanges {
    @ViewChild('cropContainer') containerRef!: ElementRef<HTMLDivElement>;

    readonly imageSrc = input.required<string>();
    readonly aspectRatio = input<number>(3);     // ancho / alto del viewport
    readonly outputWidth = input<number>(1200);
    readonly outputHeight = input<number>(400);

    readonly confirmed = output<string>();        // emite el dataUrl recortado
    readonly cancelled = output<void>();

    // Imagen cargada
    private img = new Image();
    imgLoaded = signal(false);

    // Dimensiones del contenedor (en px en pantalla)
    private cW = 0;
    private cH = 0;

    // Estado del visor
    zoom = signal(1);
    minZoom = signal(0.1);
    maxZoom = signal(5);
    posX = signal(0);
    posY = signal(0);
    imgW = signal(0);
    imgH = signal(0);

    // Drag
    private dragging = false;
    private lastX = 0;
    private lastY = 0;

    ngAfterViewInit(): void {
        this.initContainer();
    }

    ngOnChanges(): void {
        this.loadImage();
    }

    private loadImage(): void {
        this.imgLoaded.set(false);
        this.img = new Image();
        this.img.onload = () => {
            this.imgLoaded.set(true);
            this.initContainer();
        };
        this.img.src = this.imageSrc();
    }

    private initContainer(): void {
        if (!this.containerRef || !this.imgLoaded()) return;
        const el = this.containerRef.nativeElement;
        this.cW = el.clientWidth;
        this.cH = el.clientHeight || this.cW / this.aspectRatio();
        this.fitCover();
    }

    /** Ajusta la imagen para que cubra el viewport (como object-fit: cover). */
    fitCover(): void {
        if (!this.img.naturalWidth) return;
        const coverZoom = Math.max(this.cW / this.img.naturalWidth, this.cH / this.img.naturalHeight);
        this.minZoom.set(coverZoom);
        this.maxZoom.set(coverZoom * 4);
        this.setZoom(coverZoom);
        this.centerImage();
    }

    /** Centra la imagen en el viewport manteniendo el zoom actual. */
    resetView(): void {
        this.centerImage();
    }

    private centerImage(): void {
        this.posX.set((this.cW - this.imgW()) / 2);
        this.posY.set((this.cH - this.imgH()) / 2);
    }

    private setZoom(z: number): void {
        const clamped = Math.min(Math.max(z, this.minZoom()), this.maxZoom());
        this.zoom.set(clamped);
        this.imgW.set(this.img.naturalWidth * clamped);
        this.imgH.set(this.img.naturalHeight * clamped);
        this.clampPosition();
    }

    onSlider(val: string): void {
        const prevZ = this.zoom();
        const newZ = parseFloat(val);
        // Zoom hacia el centro del viewport
        const cx = this.cW / 2;
        const cy = this.cH / 2;
        const ratioX = (cx - this.posX()) / (this.imgW());
        const ratioY = (cy - this.posY()) / (this.imgH());
        this.setZoom(newZ);
        this.posX.set(cx - ratioX * this.imgW());
        this.posY.set(cy - ratioY * this.imgH());
        this.clampPosition();
    }

    onWheel(event: WheelEvent): void {
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        const newZ = this.zoom() * delta;
        const ratioX = (mouseX - this.posX()) / this.imgW();
        const ratioY = (mouseY - this.posY()) / this.imgH();
        this.setZoom(newZ);
        this.posX.set(mouseX - ratioX * this.imgW());
        this.posY.set(mouseY - ratioY * this.imgH());
        this.clampPosition();
    }

    // --- Drag mouse ---
    startDrag(event: MouseEvent): void {
        this.dragging = true;
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        (event.currentTarget as HTMLElement).style.cursor = 'grabbing';
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.dragging) return;
        this.posX.update(x => x + event.clientX - this.lastX);
        this.posY.update(y => y + event.clientY - this.lastY);
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        this.clampPosition();
    }

    @HostListener('document:mouseup')
    onMouseUp(): void {
        this.dragging = false;
        if (this.containerRef) {
            this.containerRef.nativeElement.style.cursor = 'grab';
        }
    }

    // --- Drag touch ---
    startTouch(event: TouchEvent): void {
        if (event.touches.length === 1) {
            this.dragging = true;
            this.lastX = event.touches[0].clientX;
            this.lastY = event.touches[0].clientY;
        }
    }

    @HostListener('document:touchmove', ['$event'])
    onTouchMove(event: TouchEvent): void {
        if (!this.dragging || event.touches.length !== 1) return;
        this.posX.update(x => x + event.touches[0].clientX - this.lastX);
        this.posY.update(y => y + event.touches[0].clientY - this.lastY);
        this.lastX = event.touches[0].clientX;
        this.lastY = event.touches[0].clientY;
        this.clampPosition();
    }

    @HostListener('document:touchend')
    onTouchEnd(): void {
        this.dragging = false;
    }

    /** Evita que la imagen deje bordes vacíos en el viewport. */
    private clampPosition(): void {
        const minX = this.cW - this.imgW();
        const minY = this.cH - this.imgH();
        this.posX.update(x => Math.min(0, Math.max(x, minX)));
        this.posY.update(y => Math.min(0, Math.max(y, minY)));
    }

    confirm(): void {
        if (!this.img.naturalWidth || !this.cW) return;

        // Calcula qué región de la imagen original es visible en el viewport
        const z = this.zoom();
        const srcX = -this.posX() / z;
        const srcY = -this.posY() / z;
        const srcW = this.cW / z;
        const srcH = this.cH / z;

        const canvas = document.createElement('canvas');
        canvas.width = this.outputWidth();
        canvas.height = this.outputHeight();
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(this.img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);

        this.confirmed.emit(canvas.toDataURL('image/jpeg', 0.88));
    }

    cancel(): void {
        this.cancelled.emit();
    }

    onBackdrop(): void {
        this.cancel();
    }
}

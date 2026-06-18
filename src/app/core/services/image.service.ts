import { Injectable } from '@angular/core';

/**
 * Convierte imágenes seleccionadas por el usuario en data URLs (base64)
 * reducidas de tamaño, para guardarlas directamente en Firestore sin
 * necesitar Firebase Storage (que requiere plan de pago).
 */
@Injectable({
    providedIn: 'root'
})
export class ImageService {
    /**
     * Lee un archivo de imagen, lo redimensiona manteniendo la proporción
     * (sin agrandar) y lo devuelve como data URL JPEG comprimido.
     */
    async fileToResizedDataUrl(
        file: File,
        maxWidth: number,
        maxHeight: number,
        quality = 0.8
    ): Promise<string> {
        const dataUrl = await this.readAsDataUrl(file);
        const img = await this.loadImage(dataUrl);

        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No se pudo procesar la imagen.');
        }
        ctx.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL('image/jpeg', quality);
    }

    private readAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
            reader.readAsDataURL(file);
        });
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Archivo de imagen inválido.'));
            img.src = src;
        });
    }
}

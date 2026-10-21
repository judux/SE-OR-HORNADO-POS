import { Injectable, effect, inject } from '@angular/core';
import { TenantService } from '../tenant/tenant.service';
import { AccessService } from '../services/access.service';
import { brandColor, initials, restaurantManifest } from './pwa-branding.logic';

/**
 * Cada restaurante tiene "su propia app": cuando este equipo pertenece a un restaurante, el manifest,
 * el ícono y el nombre de la PWA se cambian a los del restaurante ANTES de instalarla.
 * Sin restaurante (plataforma, registro, bienvenida) se usa la marca KINO-POS (public/manifest.webmanifest).
 *
 * Todo se hace en el navegador (plan gratuito): el ícono se dibuja con las iniciales del restaurante.
 *
 * La app instalada abre con el enlace del restaurante: en iPhone cada app de la pantalla de inicio
 * tiene su propio almacenamiento (no ve la sesión de Safari), así que al abrirla por primera vez
 * se vincula sola y va directo al PIN.
 */
@Injectable({
    providedIn: 'root'
})
export class PwaBrandingService {
    private tenant = inject(TenantService);
    private access = inject(AccessService);
    private readonly defaults = this.captureDefaults();
    private appliedFor: string | null = null;

    constructor() {
        // Solo toca el DOM (no escribe signals), así que puede ir dentro del effect
        effect(() => {
            const restaurant = this.tenant.restaurant();
            const kind = this.tenant.account().kind;
            const staffLink = this.access.staffLink();
            if (kind === 'device' && restaurant?.id && restaurant.nombre) {
                const key = `${restaurant.id}|${restaurant.nombre}|${staffLink}`;
                if (key !== this.appliedFor) {
                    this.applyRestaurant(restaurant.id, restaurant.nombre, staffLink);
                    this.appliedFor = key;
                }
            } else if (kind !== 'loading' && this.appliedFor !== null) {
                this.restoreDefaults();
                this.appliedFor = null;
            }
        });
    }

    private applyRestaurant(rid: string, nombre: string, staffLink: string | null): void {
        const color = brandColor(rid);
        const letters = initials(nombre);
        const icons = [192, 512].map(size => ({ size, src: drawIcon(letters, color, size) }));
        const manifest = restaurantManifest({ rid, nombre, origin: window.location.origin, icons, color, startUrl: staffLink ?? undefined });
        const href = 'data:application/manifest+json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest));

        this.link('manifest').href = href;
        this.link('apple-touch-icon').href = drawIcon(letters, color, 180);
        this.meta('apple-mobile-web-app-title').content = manifest['short_name'] as string;
        this.meta('theme-color').content = color;
    }

    private restoreDefaults(): void {
        this.link('manifest').href = this.defaults.manifest;
        this.link('apple-touch-icon').href = this.defaults.appleIcon;
        this.meta('apple-mobile-web-app-title').content = this.defaults.appleTitle;
        this.meta('theme-color').content = this.defaults.themeColor;
    }

    private captureDefaults() {
        return {
            manifest: this.link('manifest').getAttribute('href') ?? 'manifest.webmanifest',
            appleIcon: this.link('apple-touch-icon').getAttribute('href') ?? 'apple-touch-icon.png',
            appleTitle: this.meta('apple-mobile-web-app-title').content || 'KINO-POS',
            themeColor: this.meta('theme-color').content || '#171717',
        };
    }

    private link(rel: string): HTMLLinkElement {
        let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.rel = rel;
            document.head.appendChild(el);
        }
        return el;
    }

    private meta(name: string): HTMLMetaElement {
        let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.name = name;
            document.head.appendChild(el);
        }
        return el;
    }
}

/** Ícono cuadrado con las iniciales (fondo a sangre, letras dentro de la zona segura de Android). */
function drawIcon(letters: string, color: string, size: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.round(size * (letters.length > 1 ? 0.36 : 0.46))}px system-ui, -apple-system, "Segoe UI", Arial, sans-serif`;
    ctx.fillText(letters, size / 2, size / 2 + size * 0.02);
    return canvas.toDataURL('image/png');
}

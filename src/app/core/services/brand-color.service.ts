import { Injectable, inject, effect } from '@angular/core';
import { TenantService } from './tenant.service';

/** Pesos de mezcla para generar cada tono a partir del color base (tono 500). */
const SHADES: { key: number; mix: 'white' | 'black'; weight: number }[] = [
    { key: 50, mix: 'white', weight: 0.95 },
    { key: 100, mix: 'white', weight: 0.90 },
    { key: 200, mix: 'white', weight: 0.75 },
    { key: 300, mix: 'white', weight: 0.55 },
    { key: 400, mix: 'white', weight: 0.30 },
    { key: 500, mix: 'white', weight: 0 },
    { key: 600, mix: 'black', weight: 0.15 },
    { key: 700, mix: 'black', weight: 0.32 },
    { key: 800, mix: 'black', weight: 0.48 },
    { key: 900, mix: 'black', weight: 0.65 },
];

/**
 * Aplica el color institucional de cada restaurante generando una paleta
 * completa (50–900) a partir de un solo color base y sobrescribiendo las
 * variables CSS --c-primary-*. Si el restaurante no tiene color propio,
 * revierte a la paleta por defecto definida en styles.css.
 */
@Injectable({
    providedIn: 'root'
})
export class BrandColorService {
    private tenant = inject(TenantService);

    constructor() {
        // Aplica el color cada vez que cambia el restaurante activo.
        effect(() => {
            // '' o undefined -> null -> revierte al color por defecto
            const color = this.tenant.restaurant()?.color_primary || null;
            this.apply(color);
        });
    }

    /** Aplica un color base (hex) o revierte a los valores por defecto si es null. */
    apply(hex: string | null): void {
        const root = document.documentElement;

        if (!hex) {
            // Quitar overrides -> vuelve a la paleta de :root (rojo por defecto)
            SHADES.forEach(s => root.style.removeProperty(`--c-primary-${s.key}`));
            return;
        }

        const base = this.hexToRgb(hex);
        if (!base) return;

        for (const shade of SHADES) {
            const target = shade.mix === 'white' ? 255 : 0;
            const r = Math.round(base.r * (1 - shade.weight) + target * shade.weight);
            const g = Math.round(base.g * (1 - shade.weight) + target * shade.weight);
            const b = Math.round(base.b * (1 - shade.weight) + target * shade.weight);
            root.style.setProperty(`--c-primary-${shade.key}`, `${r} ${g} ${b}`);
        }
    }

    private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const clean = hex.replace('#', '').trim();
        const full = clean.length === 3
            ? clean.split('').map(c => c + c).join('')
            : clean;
        if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
        return {
            r: parseInt(full.slice(0, 2), 16),
            g: parseInt(full.slice(2, 4), 16),
            b: parseInt(full.slice(4, 6), 16),
        };
    }
}

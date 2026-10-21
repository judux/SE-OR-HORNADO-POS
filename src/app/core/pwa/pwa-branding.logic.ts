/**
 * Lógica pura de la marca de la PWA por restaurante (sin DOM): se puede probar con tests unitarios.
 */

/** Hasta dos iniciales: "Señor Hornado" → "SH", "Asadero" → "AS". */
export function initials(name: string): string {
    const words = name.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().split(/\s+/).filter(w => /[a-z0-9]/i.test(w));
    if (words.length === 0) return 'R';
    if (words.length === 1) return words[0].replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

/** Color estable por restaurante (siempre el mismo para el mismo id), con buen contraste para texto blanco. */
export function brandColor(seed: string): string {
    const palette = ['#b45309', '#b91c1c', '#047857', '#1d4ed8', '#7c3aed', '#be185d', '#0f766e', '#c2410c', '#4338ca', '#15803d'];
    let hash = 0;
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return palette[hash % palette.length];
}

/** Nombre corto para debajo del ícono (los teléfonos muestran ~15 caracteres). */
export function shortName(name: string): string {
    const clean = name.trim();
    return clean.length <= 15 ? clean : clean.split(/\s+/)[0].slice(0, 15);
}

export interface RestaurantManifestInput {
    rid: string;
    nombre: string;
    origin: string;
    icons: { src: string; size: number }[];
    color: string;
}

/** Manifest de la PWA de un restaurante (id propio: el teléfono la trata como una app distinta). */
export function restaurantManifest(input: RestaurantManifestInput): Record<string, unknown> {
    return {
        id: `/?app=${encodeURIComponent(input.rid)}`,
        name: input.nombre,
        short_name: shortName(input.nombre),
        description: `${input.nombre} · pedidos y caja (KINO-POS)`,
        start_url: `${input.origin}/`,
        scope: `${input.origin}/`,
        display: 'standalone',
        background_color: '#171717',
        theme_color: input.color,
        lang: 'es',
        icons: input.icons.map(i => ({ src: i.src, sizes: `${i.size}x${i.size}`, type: 'image/png', purpose: 'any maskable' }))
    };
}

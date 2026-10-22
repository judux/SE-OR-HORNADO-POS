/**
 * Lectura del menú pegado como texto (lógica pura, con pruebas en menu-import.logic.spec.ts).
 *
 * Acepta lo que normalmente se copia de una carta:
 *   BEBIDAS                      ← línea sin precio que nombra una categoría: aplica a las siguientes
 *   Gaseosa 4.000
 *   Jugo natural - $5.000
 *   Hornado; 15000; platos       ← también "nombre; precio; categoría"
 */
import { Product } from '../../shared/interfaces';

export type Category = Product['categoria'];

export interface MenuItemDraft {
    nombre: string;
    precio: number;
    categoria: Category;
    /** Ya hay un producto con ese nombre en el menú: no se vuelve a crear. */
    duplicado: boolean;
}

export interface MenuLineError {
    linea: number;
    texto: string;
    motivo: string;
}

export interface MenuParseResult {
    items: MenuItemDraft[];
    errores: MenuLineError[];
}

/** Palabras (en singular, sin tildes) que identifican cada categoría en el título de una sección. */
const CATEGORY_TOKENS: Record<string, Category> = {
    almuerzo: 'almuerzos', corriente: 'almuerzos', ejecutivo: 'almuerzos',
    bandeja: 'bandejas',
    plato: 'platos', casa: 'platos', especial: 'platos', fuerte: 'platos',
    sopa: 'sopas', caldo: 'sopas',
    bebida: 'bebidas', refresco: 'bebidas', jugo: 'bebidas', licor: 'bebidas',
    porcion: 'porciones', adicional: 'porciones', extra: 'porciones', acompanamiento: 'porciones', entrada: 'porciones',
};
/** Palabras de relleno permitidas en un título ("Platos DE LA casa", "Sopas Y caldos"). */
const CONNECTORS = new Set(['y', 'e', 'de', 'del', 'la', 'el', 'las', 'los', 'menu', 'dia', 'nuestros', 'nuestras']);

export function normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function categoryOfToken(token: string): Category | undefined {
    return CATEGORY_TOKENS[token]
        ?? (token.endsWith('es') ? CATEGORY_TOKENS[token.slice(0, -2)] : undefined)
        ?? (token.endsWith('s') ? CATEGORY_TOKENS[token.slice(0, -1)] : undefined);
}

/**
 * Categoría que nombra el título de una sección, o null si no lo es.
 * Estricto a propósito: "Jugo natural" (un producto sin precio) NO es un título.
 */
export function matchCategory(text: string): Category | null {
    const tokens = normalize(text).replace(/[^a-z ]/g, ' ').split(' ').filter(Boolean);
    let found: Category | null = null;
    for (const token of tokens) {
        const cat = categoryOfToken(token);
        if (cat) found ??= cat;
        else if (!CONNECTORS.has(token)) return null;
    }
    return found;
}

/**
 * Precio en pesos: "15.000", "$ 15,000", "15000", "15.500". Los separadores de miles se ignoran.
 * Devuelve null si no hay un número razonable (más de 0 y menos de 10 millones).
 */
export function parsePrice(text: string): number | null {
    const digits = text.replace(/[^\d]/g, '');
    if (!digits) return null;
    const value = Number(digits);
    return value > 0 && value < 10_000_000 ? value : null;
}

/** Último número de la línea (el precio suele ir al final). */
const TRAILING_PRICE = /^(.*?)[\s:;\-–—|.]*\$?\s*(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:cop|pesos)?\s*$/i;

export function parseMenuText(text: string, existingNames: string[] = [], defaultCategory: Category = 'platos'): MenuParseResult {
    const existing = new Set(existingNames.map(normalize));
    const seen = new Set<string>();
    const items: MenuItemDraft[] = [];
    const errores: MenuLineError[] = [];
    let current: Category = defaultCategory;

    text.split(/\r?\n/).forEach((raw, index) => {
        const linea = index + 1;
        const line = raw.replace(/^[\s•*·\-–—\d.)]+(?=[a-záéíóúñ])/i, '').trim();
        if (!line) return;

        // Formato con separador: nombre; precio; categoría (o con tabuladores, desde una hoja de cálculo)
        const parts = line.split(/\s*[;\t]\s*/).filter(Boolean);
        if (parts.length >= 2) {
            const precio = parsePrice(parts[1]);
            const categoria = parts[2] ? matchCategory(parts[2]) : current;
            if (precio === null) {
                errores.push({ linea, texto: raw.trim(), motivo: 'No se entiende el precio' });
            } else if (parts[2] && !categoria) {
                errores.push({ linea, texto: raw.trim(), motivo: `Categoría desconocida: "${parts[2]}"` });
            } else {
                push(parts[0], precio, categoria ?? current, linea, raw);
            }
            return;
        }

        const match = TRAILING_PRICE.exec(line);
        if (match && match[1].trim()) {
            const precio = parsePrice(match[2]);
            if (precio === null) {
                errores.push({ linea, texto: raw.trim(), motivo: 'No se entiende el precio' });
            } else {
                push(match[1], precio, current, linea, raw);
            }
            return;
        }

        // Sin precio: puede ser el título de una sección
        const categoria = matchCategory(line.replace(/[:]+$/, ''));
        if (categoria) {
            current = categoria;
        } else {
            errores.push({ linea, texto: raw.trim(), motivo: 'Falta el precio (o es una sección que no existe)' });
        }
    });

    return { items, errores };

    function push(nombreRaw: string, precio: number, categoria: Category, linea: number, raw: string): void {
        const nombre = nombreRaw.replace(/[\s:;\-–—|.$]+$/, '').replace(/\s+/g, ' ').trim();
        if (!nombre) {
            errores.push({ linea, texto: raw.trim(), motivo: 'Falta el nombre' });
            return;
        }
        const key = normalize(nombre);
        if (seen.has(key)) {
            errores.push({ linea, texto: raw.trim(), motivo: 'Está repetido en la lista' });
            return;
        }
        seen.add(key);
        items.push({ nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1), precio, categoria, duplicado: existing.has(key) });
    }
}

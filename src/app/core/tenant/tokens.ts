/**
 * Código secreto del enlace del personal de un restaurante.
 * 32 caracteres aleatorios (crypto): imposible de adivinar. Las reglas exigen al menos 20.
 */
export function newJoinToken(length = 32): string {
    const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789'; // sin caracteres que se confunden (l, 1, o, 0)
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}

/**
 * Saca el restaurante y el código de un enlace del personal pegado a mano
 * (con o sin dominio, con espacios o texto alrededor). null si no es un enlace válido.
 */
export function parseJoinLink(text: string): { rid: string; token: string } | null {
    const match = /\/unirse\/([^/\s?#]+)\/([^/\s?#]+)/.exec(text ?? '');
    if (!match) return null;
    try {
        return { rid: decodeURIComponent(match[1]), token: decodeURIComponent(match[2]) };
    } catch {
        return null;
    }
}

/** Enlace que el administrador comparte con su personal. */
export function joinUrl(origin: string, rid: string, token: string): string {
    return `${origin}/unirse/${encodeURIComponent(rid)}/${encodeURIComponent(token)}`;
}

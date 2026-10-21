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

/** Enlace que el administrador comparte con su personal. */
export function joinUrl(origin: string, rid: string, token: string): string {
    return `${origin}/unirse/${encodeURIComponent(rid)}/${encodeURIComponent(token)}`;
}

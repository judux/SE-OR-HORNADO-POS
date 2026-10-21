import { newJoinToken, joinUrl } from './tokens';

describe('tokens del enlace del personal', () => {
    it('genera códigos largos (las reglas exigen al menos 20 caracteres)', () => {
        expect(newJoinToken().length).toBe(32);
        expect(newJoinToken().length).toBeGreaterThanOrEqual(20);
    });

    it('genera códigos distintos cada vez', () => {
        const codes = new Set(Array.from({ length: 50 }, () => newJoinToken()));
        expect(codes.size).toBe(50);
    });

    it('solo usa caracteres seguros para una URL', () => {
        expect(newJoinToken()).toMatch(/^[a-z2-9]+$/);
    });

    it('arma el enlace del restaurante', () => {
        expect(joinUrl('https://pos.app', 'senor-hornado-ab12', 'xyz')).toBe('https://pos.app/unirse/senor-hornado-ab12/xyz');
    });
});

import { newJoinToken, joinUrl, parseJoinLink } from './tokens';

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

    it('lee un enlace del personal pegado a mano', () => {
        expect(parseJoinLink('https://kino-pos.web.app/unirse/senor-hornado-ab12/abc23def45ghi67jkm89npq'))
            .toEqual({ rid: 'senor-hornado-ab12', token: 'abc23def45ghi67jkm89npq' });
        expect(parseJoinLink('  Entra aquí: kino-pos.web.app/unirse/r1/tok?x=1 '))
            .toEqual({ rid: 'r1', token: 'tok' });
        expect(parseJoinLink('https://kino-pos.web.app/registro')).toBeNull();
        expect(parseJoinLink('')).toBeNull();
    });
});

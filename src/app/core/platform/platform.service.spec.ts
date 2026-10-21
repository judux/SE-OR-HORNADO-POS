import { slugify, isValidPin } from './platform.service';

describe('platform helpers', () => {
    it('slugify quita tildes, ñ y espacios', () => {
        expect(slugify('Señor Hornado')).toBe('senor-hornado');
        expect(slugify('  Asadero  El Paisa #2 ')).toBe('asadero-el-paisa-2');
    });

    it('slugify nunca devuelve vacío', () => {
        expect(slugify('!!!')).toBe('restaurante');
    });

    it('isValidPin exige exactamente 4 dígitos', () => {
        expect(isValidPin('1004')).toBeTrue();
        expect(isValidPin('104')).toBeFalse();
        expect(isValidPin('10045')).toBeFalse();
        expect(isValidPin('12a4')).toBeFalse();
        expect(isValidPin(' 1004')).toBeFalse();
    });
});

import { initials, brandColor, shortName, restaurantManifest, platformManifest } from './pwa-branding.logic';

describe('marca de la PWA por restaurante', () => {
    it('saca iniciales del nombre', () => {
        expect(initials('Señor Hornado')).toBe('SH');
        expect(initials('Asadero')).toBe('AS');
        expect(initials('  parrilla  don pedro ')).toBe('PD');
        expect(initials('***')).toBe('R');
    });

    it('da siempre el mismo color al mismo restaurante', () => {
        expect(brandColor('senor-hornado-ab12')).toBe(brandColor('senor-hornado-ab12'));
        expect(brandColor('x')).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('acorta el nombre para debajo del ícono', () => {
        expect(shortName('Señor Hornado')).toBe('Señor Hornado');
        expect(shortName('El Asadero')).toBe('El Asadero');
        expect(shortName('Parrilla Don Pedro Gourmet')).toBe('Parrilla');
        expect(shortName('KFC')).toBe('KFC');
    });

    it('arma un manifest con id propio por restaurante', () => {
        const m = restaurantManifest({ rid: 'senor-hornado-ab12', nombre: 'Señor Hornado', origin: 'https://kino-pos.web.app', icons: [{ src: 'data:x', size: 192 }], color: '#b45309' });
        expect(m['id']).toBe('/?app=senor-hornado-ab12');
        expect(m['name']).toBe('Señor Hornado');
        expect(m['start_url']).toBe('https://kino-pos.web.app/');
        expect((m['icons'] as any[])[0].sizes).toBe('192x192');
    });

    it('abre la app instalada con el enlace del restaurante cuando se conoce', () => {
        const m = restaurantManifest({ rid: 'r1', nombre: 'X', origin: 'https://kino-pos.web.app', icons: [], color: '#000000', startUrl: 'https://kino-pos.web.app/unirse/r1/tok' });
        expect(m['start_url']).toBe('https://kino-pos.web.app/unirse/r1/tok');
        expect(m['scope']).toBe('https://kino-pos.web.app/');
    });

    it('la app de la plataforma abre en el panel y tiene id propio', () => {
        const m = platformManifest('https://kino-pos.web.app');
        expect(m['start_url']).toBe('https://kino-pos.web.app/plataforma');
        expect(m['id']).toBe('/?app=plataforma');
        expect((m['icons'] as any[])[0].src).toBe('https://kino-pos.web.app/icons/kino-192.png');
    });
});

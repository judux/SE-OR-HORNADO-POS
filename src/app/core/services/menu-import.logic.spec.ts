import { matchCategory, parseMenuText, parsePrice } from './menu-import.logic';

describe('pegar el menú como texto', () => {
    it('entiende precios en pesos con o sin separadores', () => {
        expect(parsePrice('15.000')).toBe(15000);
        expect(parsePrice('$ 15,000')).toBe(15000);
        expect(parsePrice('4000')).toBe(4000);
        expect(parsePrice('gratis')).toBeNull();
        expect(parsePrice('0')).toBeNull();
    });

    it('reconoce las categorías por sus palabras', () => {
        expect(matchCategory('BEBIDAS')).toBe('bebidas');
        expect(matchCategory('Sopas y caldos')).toBe('sopas');
        expect(matchCategory('Porciones adicionales')).toBe('porciones');
        expect(matchCategory('Bandejas')).toBe('bandejas');
        expect(matchCategory('Postres')).toBeNull();
        expect(matchCategory('Jugo natural')).toBeNull();
        expect(matchCategory('Platos de la casa')).toBe('platos');
    });

    it('lee secciones y productos con el precio al final', () => {
        const { items, errores } = parseMenuText([
            'PLATOS DE LA CASA',
            'Hornado 15.000',
            'Lechona - $12.000',
            '',
            'Bebidas:',
            '• Gaseosa 4.000',
            '1. Jugo natural: 5000',
        ].join('\n'));
        expect(errores).toEqual([]);
        expect(items.map(i => [i.nombre, i.precio, i.categoria])).toEqual([
            ['Hornado', 15000, 'platos'],
            ['Lechona', 12000, 'platos'],
            ['Gaseosa', 4000, 'bebidas'],
            ['Jugo natural', 5000, 'bebidas'],
        ]);
    });

    it('acepta "nombre; precio; categoría" y columnas pegadas de una hoja de cálculo', () => {
        const { items, errores } = parseMenuText('Sancocho; 12.000; sopas\nCerveza\t5000\tbebidas');
        expect(errores).toEqual([]);
        expect(items.map(i => i.categoria)).toEqual(['sopas', 'bebidas']);
    });

    it('marca lo que ya existe y reporta las líneas que no entiende', () => {
        const { items, errores } = parseMenuText('Hornado 15000\nPostres\nArepa 2.500\nArepa 3000', ['hornado']);
        expect(items.find(i => i.nombre === 'Hornado')?.duplicado).toBeTrue();
        expect(items.find(i => i.nombre === 'Arepa')?.duplicado).toBeFalse();
        expect(errores.map(e => e.linea)).toEqual([2, 4]);
    });
});

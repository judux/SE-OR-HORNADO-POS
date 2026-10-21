import {
    addProductToNewLines, changeNewLineQuantity, mergeLines,
    sumItems, countItems, calculateChange
} from './order.logic';
import { OrderItem } from '../../shared/interfaces';

const hornado = { id: 'p1', nombre: 'Hornado', precio: 15000 };
const gaseosa = { id: 'p2', nombre: 'Gaseosa', precio: 4000 };

function sentLine(id: string, cantidad = 1): OrderItem {
    return { line_id: id, id_producto: 'p1', nombre_producto: 'Hornado', cantidad, precio_unitario: 15000, notas: '', enviado: true };
}

describe('order.logic', () => {
    it('agrega una línea nueva con la cantidad pedida', () => {
        const lines = addProductToNewLines([], hornado, 'sin ensalada', 2);
        expect(lines.length).toBe(1);
        expect(lines[0].cantidad).toBe(2);
        expect(lines[0].notas).toBe('sin ensalada');
        expect(lines[0].line_id).toBeTruthy();
        expect(lines[0].enviado).toBeFalse();
    });

    it('combina el mismo producto con la misma nota', () => {
        let lines = addProductToNewLines([], hornado, '', 1);
        lines = addProductToNewLines(lines, hornado, '', 3);
        expect(lines.length).toBe(1);
        expect(lines[0].cantidad).toBe(4);
    });

    it('separa el mismo producto con notas distintas', () => {
        let lines = addProductToNewLines([], hornado, '', 1);
        lines = addProductToNewLines(lines, hornado, 'bien asado', 1);
        expect(lines.length).toBe(2);
    });

    it('elimina la línea cuando la cantidad llega a 0', () => {
        const lines = addProductToNewLines([], gaseosa, '', 1);
        const result = changeNewLineQuantity(lines, lines[0].line_id!, -1);
        expect(result.length).toBe(0);
    });

    it('mergeLines no duplica líneas ya presentes (reenvío idempotente)', () => {
        const existing = [sentLine('a'), sentLine('b')];
        const incoming = [sentLine('b'), sentLine('c')];
        const merged = mergeLines(existing, incoming);
        expect(merged.map(l => l.line_id)).toEqual(['a', 'b', 'c']);
    });

    it('mergeLines conserva las líneas existentes aunque el carrito local no las tenga (recarga de página)', () => {
        const existing = [sentLine('a', 2), sentLine('b')];
        const merged = mergeLines(existing, [sentLine('c')]);
        expect(merged.length).toBe(3);
        expect(sumItems(merged)).toBe(15000 * 4);
    });

    it('calcula totales y cantidades', () => {
        let lines = addProductToNewLines([], hornado, '', 2);
        lines = addProductToNewLines(lines, gaseosa, '', 1);
        expect(sumItems(lines)).toBe(34000);
        expect(countItems(lines)).toBe(3);
    });

    it('calcula el vuelto', () => {
        expect(calculateChange(50000, 37500)).toBe(12500);
        expect(calculateChange(20000, 37500)).toBe(-17500);
    });
});

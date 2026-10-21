import { OrderItem } from '../../shared/interfaces';

/**
 * Lógica pura de pedidos: sin Firebase ni Angular, para poder probarla con tests unitarios.
 */

export function newLineId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function lineTotal(item: Pick<OrderItem, 'precio_unitario' | 'cantidad'>): number {
    return item.precio_unitario * item.cantidad;
}

export function sumItems(items: Pick<OrderItem, 'precio_unitario' | 'cantidad'>[]): number {
    return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function countItems(items: Pick<OrderItem, 'cantidad'>[]): number {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
}

/**
 * Agrega un producto a las líneas NUEVAS (aún no enviadas).
 * Solo se combina con otra línea nueva del mismo producto y la misma nota;
 * nunca toca las líneas ya enviadas a caja.
 */
export function addProductToNewLines(
    newLines: OrderItem[],
    product: { id: string; nombre: string; precio: number },
    note: string,
    quantity: number
): OrderItem[] {
    if (quantity <= 0) return newLines;

    const index = newLines.findIndex(l => l.id_producto === product.id && (l.notas ?? '') === note);
    if (index > -1) {
        const updated = [...newLines];
        updated[index] = { ...updated[index], cantidad: updated[index].cantidad + quantity };
        return updated;
    }

    return [
        ...newLines,
        {
            line_id: newLineId(),
            id_producto: product.id,
            nombre_producto: product.nombre,
            cantidad: quantity,
            precio_unitario: product.precio,
            notas: note,
            enviado: false
        }
    ];
}

/** Cambia la cantidad de una línea nueva; si llega a 0 la elimina. */
export function changeNewLineQuantity(newLines: OrderItem[], lineId: string, delta: number): OrderItem[] {
    return newLines
        .map(l => (l.line_id === lineId ? { ...l, cantidad: l.cantidad + delta } : l))
        .filter(l => l.cantidad > 0);
}

/**
 * Une las líneas que ya están en la orden con las nuevas, sin duplicar line_id.
 * Esto hace que reenviar el mismo pedido sea seguro (idempotente).
 */
export function mergeLines(existing: OrderItem[], incoming: OrderItem[]): OrderItem[] {
    const ids = new Set(existing.map(l => l.line_id).filter(Boolean));
    const fresh = incoming.filter(l => !ids.has(l.line_id));
    return [...existing, ...fresh];
}

/** Vuelto a entregar; negativo si el dinero recibido no alcanza. */
export function calculateChange(received: number, total: number): number {
    return received - total;
}

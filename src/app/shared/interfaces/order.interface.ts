export interface OrderItem {
    id_producto: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    notas?: string;
    enviado?: boolean; // 🔒 true = ya sincronizado con caja, no editable por mesero
}

export interface Order {
    id: string;
    id_mesa: string;
    numero_mesa: number;
    id_mesero: string;
    nombre_mesero: string;
    items: OrderItem[];
    estado: 'pendiente' | 'en_caja' | 'pagada' | 'cancelada';
    codigo_pago: string; // Código alfanumérico único para seguridad
    subtotal: number;
    propina: number;
    total: number;
    metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia';
    fecha_creacion: Date;
    fecha_cierre?: Date;
}

export interface Table {
    id: string;
    numero_mesa: number;
    capacidad: number;
    estado: 'libre' | 'ocupada' | 'pagando';
    id_orden_actual?: string | null; // orden abierta de la mesa (evita crear dos órdenes a la vez)
}

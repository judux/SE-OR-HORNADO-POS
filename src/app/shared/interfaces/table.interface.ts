export interface Table {
    id: string;
    numero_mesa: number;
    capacidad: number;
    estado: 'libre' | 'ocupada' | 'pagando';
}

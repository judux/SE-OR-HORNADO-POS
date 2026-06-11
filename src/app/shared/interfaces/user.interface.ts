export interface User {
    id: string;
    nombre: string;
    rol: 'mesero' | 'cajero' | 'admin';
    pin_acceso: string;
    activo: boolean;
}

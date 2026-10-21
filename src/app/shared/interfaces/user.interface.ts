export interface User {
    id: string;
    nombre: string;
    rol: 'mesero' | 'cajero' | 'admin';
    pin_acceso: string;
    activo: boolean;
    rid?: string; // restaurante de la sesión (solo en la sesión guardada en el equipo)
}

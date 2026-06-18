export interface User {
    id: string;
    nombre: string;
    rol: 'mesero' | 'cajero' | 'admin';
    pin_acceso: string;
    activo: boolean;
}

/**
 * Super administrador del sistema (dueño de la plataforma SaaS).
 * Vive fuera de cualquier restaurante y usa Firebase Auth (email + password),
 * no PIN. Gestiona todos los restaurantes del sistema.
 */
export interface SuperAdmin {
    id: string;       // uid de Firebase Auth
    email: string;
    nombre: string;
}

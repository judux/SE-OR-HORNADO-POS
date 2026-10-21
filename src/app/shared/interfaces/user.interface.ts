export interface User {
    id: string;
    nombre: string;
    rol: 'mesero' | 'cajero' | 'admin';
    pin_acceso: string;
    activo: boolean;
    rid?: string; // restaurante de la sesión (solo en la sesión guardada en el equipo)
    google_uid?: string; // administrador vinculado a una cuenta de Google
    pin_pendiente?: boolean; // true = debe elegir su PIN la próxima vez que entre con Google
}

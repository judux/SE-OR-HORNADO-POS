export interface Restaurant {
    id: string;
    nombre: string;
    estado: 'activo' | 'suspendido';
    cuenta_email: string; // cuenta con la que se activan los equipos del restaurante
    cuenta_uid?: string;
    admin_uid?: string; // UID de Google del administrador del restaurante
    creado_en?: any;
    creado_por?: string;
}

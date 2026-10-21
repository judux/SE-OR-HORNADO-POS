export interface Restaurant {
    id: string;
    nombre: string;
    estado: 'activo' | 'suspendido';
    cuenta_email: string; // cuenta con la que se activan los equipos del restaurante
    cuenta_uid?: string;
    creado_en?: any;
    creado_por?: string;
}

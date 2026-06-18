export interface Restaurant {
    id: string;
    nombre: string;
    slug: string;              // Identificador para URL: /r/:slug/login (único en todo el sistema)
    activo: boolean;           // El super admin puede suspender un restaurante
    plan: 'basico' | 'pro';    // Tipo de suscripción
    logo_url?: string;         // Aparece en login y recibos
    banner_url?: string;       // Letrero que aparece en la vista del mesero
    color_primary?: string;    // Color institucional (hex). Si falta, usa el rojo por defecto
    direccion?: string;
    telefono?: string;
    fecha_creacion: Date;
}

export interface Restaurant {
    id: string;
    nombre: string;
    slug: string;              // Identificador para URL: /r/:slug/login (único en todo el sistema)
    activo: boolean;           // El super admin puede suspender un restaurante
    plan: 'basico' | 'pro';    // Tipo de suscripción
    logo_url?: string;         // Aparece en login y recibos
    banner_url?: string;       // Letrero que aparece en la vista del mesero
    color_primary?: string;    // Color institucional (hex). Si falta, usa el rojo por defecto
    // Cómo se muestra la tarjeta en la pantalla de selección de restaurante.
    // Si falta, se deduce: con letrero -> 'letrero', sin letrero -> 'logo_nombre'.
    card_estilo?: 'letrero' | 'letrero_nombre' | 'logo_nombre';
    direccion?: string;
    telefono?: string;
    fecha_creacion: Date;
}

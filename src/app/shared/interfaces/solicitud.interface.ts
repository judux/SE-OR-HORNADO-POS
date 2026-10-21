/** Solicitud de registro de un restaurante nuevo (la crea el futuro admin con su cuenta de Google). */
export interface Solicitud {
    uid: string; // = id del documento = UID de Google del solicitante
    email: string;
    nombre_contacto: string;
    nombre_restaurante: string;
    telefono?: string;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    rid?: string; // restaurante creado al aprobar
    creado_en?: any;
}

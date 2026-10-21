import { Firestore, collection, doc, CollectionReference, DocumentReference } from '@angular/fire/firestore';

/**
 * ÚNICO lugar donde se definen las rutas de datos.
 *
 * Toda colección de un restaurante vive en restaurants/{rid}/{nombre}. Si agregas una colección:
 *   1. Agrégala aquí (RESTAURANT_COLLECTIONS).
 *   2. Agrega su bloque `match` en firestore.rules (sin regla, Firestore la niega).
 *   3. Agrega casos en scripts/test-rules-emulator.mjs (al menos: el equipo de OTRO restaurante no puede leerla).
 *   4. Ejecuta `npm run verify`.
 * Ver docs/arquitectura.md.
 */
export const RESTAURANT_COLLECTIONS = [
    'users',          // personal (PIN, rol)
    'products',       // menú
    'tables',         // mesas
    'orders',         // comandas abiertas
    'order_history',  // ventas cobradas (solo se crean)
    'expenses',       // gastos de caja chica
    'shifts',         // turnos cerrados (solo se crean)
    'config',         // configuración (p. ej. turno_actual)
    'private',        // datos sensibles del restaurante (p. ej. código del enlace del personal)
] as const;

export type RestaurantCollection = typeof RESTAURANT_COLLECTIONS[number];

/** Colecciones de la plataforma (fuera de los restaurantes). */
export const PLATFORM_COLLECTIONS = {
    restaurants: 'restaurants',
    devices: 'devices',
    platformAdmins: 'platform_admins',
    platform: 'platform',
    solicitudes: 'solicitudes',
} as const;

export function restaurantCol(firestore: Firestore, rid: string, name: RestaurantCollection): CollectionReference {
    return collection(firestore, PLATFORM_COLLECTIONS.restaurants, rid, name);
}

export function restaurantDoc(firestore: Firestore, rid: string, name: RestaurantCollection, id: string): DocumentReference {
    return doc(firestore, PLATFORM_COLLECTIONS.restaurants, rid, name, id);
}

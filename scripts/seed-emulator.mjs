// Carga datos de PRUEBA en el emulador local de Firestore (npm run seed:emu).
// Solo habla con localhost: nunca toca el proyecto de producción.
// Requiere que el emulador esté corriendo (npm run emulators).

const PROJECT = 'demo-senor-hornado';
const BASE = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`;
// "Bearer owner" es el token especial del emulador que ignora las reglas (solo existe en el emulador)
const HEADERS = { 'Content-Type': 'application/json', Authorization: 'Bearer owner' };

function toValue(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === 'string') return { stringValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
    return { mapValue: { fields: toFields(v) } };
}

function toFields(obj) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toValue(v)]));
}

async function put(collection, id, data) {
    const res = await fetch(`${BASE}/${collection}/${id}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ fields: toFields(data) })
    });
    if (!res.ok) throw new Error(`${collection}/${id}: ${res.status} ${await res.text()}`);
}

async function wipe() {
    const res = await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`No se pudo limpiar el emulador: ${res.status}`);
}

const users = [
    { id: 'u_admin', nombre: 'Admin Prueba', rol: 'admin', pin_acceso: '9001', activo: true },
    { id: 'u_mesero1', nombre: 'Mesero Uno', rol: 'mesero', pin_acceso: '1111', activo: true },
    { id: 'u_mesero2', nombre: 'Mesero Dos', rol: 'mesero', pin_acceso: '3333', activo: true },
    { id: 'u_cajero', nombre: 'Cajero Prueba', rol: 'cajero', pin_acceso: '2222', activo: true },
];

const products = [
    { id: 'p_hornado', nombre: 'Hornado', precio: 15000, categoria: 'platos', disponible: true, notas_permitidas: true },
    { id: 'p_bandeja', nombre: 'Bandeja Paisa', precio: 22500, categoria: 'bandejas', disponible: true, notas_permitidas: true },
    { id: 'p_almuerzo', nombre: 'Almuerzo del día', precio: 13000, categoria: 'almuerzos', disponible: true, notas_permitidas: true },
    { id: 'p_sancocho', nombre: 'Sancocho', precio: 12000, categoria: 'sopas', disponible: true, notas_permitidas: true },
    { id: 'p_gaseosa', nombre: 'Gaseosa', precio: 4000, categoria: 'bebidas', disponible: true, notas_permitidas: false },
    { id: 'p_jugo', nombre: 'Jugo natural', precio: 5000, categoria: 'bebidas', disponible: true, notas_permitidas: true },
    { id: 'p_arepa', nombre: 'Arepa', precio: 2500, categoria: 'porciones', disponible: true, notas_permitidas: false },
    { id: 'p_agotado', nombre: 'Chicharrón (agotado)', precio: 9000, categoria: 'porciones', disponible: false, notas_permitidas: false },
];

await wipe();
for (const { id, ...u } of users) await put('users', id, u);
for (const { id, ...p } of products) await put('products', id, p);
for (let n = 1; n <= 6; n++) {
    await put('tables', `mesa_${n}`, { id: `mesa_${n}`, numero_mesa: n, capacidad: 4, estado: 'libre', id_orden_actual: null });
}
console.log(`Emulador listo: ${users.length} usuarios, ${products.length} productos, 6 mesas.`);
console.log('PINs de prueba (solo emulador): admin 9001 · mesero 1111 / 3333 · cajero 2222');

// Prepara el EMULADOR local para parecerse a la producción actual (npm run seed:emu).
// Solo habla con localhost: nunca toca el proyecto de producción.
// Requiere que el emulador esté corriendo (npm run emulators).
//
// Estado que deja: menú y mesas de la versión anterior (colecciones sueltas), sin plataforma ni
// restaurantes. Desde la app: /plataforma → "Primera vez" → crear restaurante (copiando el menú).

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
    const fs = await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
    if (!fs.ok) throw new Error(`No se pudo limpiar Firestore del emulador: ${fs.status}`);
    const auth = await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
    if (!auth.ok) throw new Error(`No se pudo limpiar Auth del emulador: ${auth.status}`);
}

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
for (const { id, ...p } of products) await put('products', id, p);
for (let n = 1; n <= 4; n++) {
    await put('tables', `mesa_${n}`, { id: `mesa_${n}`, numero_mesa: n, capacidad: 4, estado: 'libre' });
}
console.log(`Emulador listo (como producción): ${products.length} productos y 4 mesas de la versión anterior.`);

if (!process.argv.includes('--demo')) {
    console.log('Siguiente paso: http://localhost:4200/plataforma → entrar y reclamar la plataforma.');
    process.exit(0);
}

// --demo: plataforma, dos restaurantes con su admin (cuenta "Google" simulada con correo en el emulador),
// personal, códigos de enlace y una solicitud pendiente.
async function account(email) {
    const res = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'clave-de-prueba-123', returnSecureToken: true })
    });
    if (!res.ok) throw new Error(`No se pudo crear ${email}: ${res.status}`);
    return (await res.json()).localId;
}

const ownerUid = await account('dueno@prueba.app');
await put('platform_admins', ownerUid, { email: 'dueno@prueba.app', nombre: 'Dueño Prueba' });
await put('platform', 'owner', { uid: ownerUid, email: 'dueno@prueba.app' });

const restaurantes = [
    { rid: 'senor-hornado-demo', nombre: 'Señor Hornado', email: 'johan@prueba.app', token: 'demo-codigo-senor-hornado-123456', copiar: true,
      admin: ['Johan', '4821'], personal: [['Carlos', 'mesero', '1111'], ['Ana', 'cajero', '2222']] },
    { rid: 'asadero-prueba-demo', nombre: 'Asadero Prueba', email: 'asadero@prueba.app', token: 'demo-codigo-asadero-prueba-12345', copiar: false,
      admin: ['Admin Asadero', '4821'], personal: [] },
];
for (const r of restaurantes) {
    const uid = await account(r.email);
    await put('restaurants', r.rid, { nombre: r.nombre, estado: 'activo', cuenta_email: r.email, admin_uid: uid, creado_por: ownerUid });
    await put('devices', uid, { rid: r.rid, email: r.email, tipo: 'admin' });
    await put(`restaurants/${r.rid}/config`, 'turno_actual', { abierto_por: 'plataforma' });
    await put(`restaurants/${r.rid}/private`, 'acceso', { token: r.token });
    await put(`restaurants/${r.rid}/users`, 'admin', { nombre: r.admin[0], rol: 'admin', pin_acceso: r.admin[1], activo: true, google_uid: uid, pin_pendiente: false });
    for (const [i, [nombre, rol, pin]] of r.personal.entries()) {
        await put(`restaurants/${r.rid}/users`, `u${i}`, { nombre, rol, pin_acceso: pin, activo: true });
    }
    if (r.copiar) {
        for (const { id, ...p } of products) await put(`restaurants/${r.rid}/products`, id, p);
        for (let n = 1; n <= 4; n++) {
            await put(`restaurants/${r.rid}/tables`, `mesa_${n}`, { id: `mesa_${n}`, numero_mesa: n, capacidad: 4, estado: 'libre' });
        }
    }
}

// Solicitud pendiente de un restaurante nuevo (para probar aprobar)
const pedroUid = await account('pedro@prueba.app');
await put('solicitudes', pedroUid, { email: 'pedro@prueba.app', nombre_restaurante: 'Parrilla Don Pedro', nombre_contacto: 'Pedro', telefono: '300 000 0000', estado: 'pendiente' });

console.log('Demo creada (contraseña de todas las cuentas: clave-de-prueba-123):');
console.log('  Plataforma: dueno@prueba.app  → http://localhost:4200/plataforma');
console.log('  Señor Hornado: admin johan@prueba.app (PIN 4821) · mesero 1111 · cajero 2222');
console.log('    Enlace del personal: http://localhost:4200/unirse/senor-hornado-demo/demo-codigo-senor-hornado-123456');
console.log('  Asadero Prueba: admin asadero@prueba.app (PIN 4821)');
console.log('  Solicitud pendiente: pedro@prueba.app → "Parrilla Don Pedro"');

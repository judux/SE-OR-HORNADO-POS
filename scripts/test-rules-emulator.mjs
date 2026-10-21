// Pruebas de las reglas de Firestore (multi-restaurante) contra el EMULADOR.
// Uso: npm run emulators   (en otra terminal)   y luego   npm run test:rules
// ATENCIÓN: borra los datos del emulador antes de empezar (nunca toca producción).

const PROJECT = 'demo-senor-hornado';
const ROOT = `projects/${PROJECT}/databases/(default)/documents`;
const FS = `http://127.0.0.1:8080/v1/${ROOT}`;
const AUTH = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
const RUN = Date.now().toString(36);

// --- utilidades ---------------------------------------------------------------
async function account(email, password = 'clave-de-prueba-123') {
    const body = JSON.stringify({ email, password, returnSecureToken: true });
    const headers = { 'Content-Type': 'application/json' };
    let r = await fetch(`${AUTH}/accounts:signUp?key=demo-api-key`, { method: 'POST', headers, body });
    if (!r.ok) r = await fetch(`${AUTH}/accounts:signInWithPassword?key=demo-api-key`, { method: 'POST', headers, body });
    const j = await r.json();
    return { token: j.idToken, uid: j.localId };
}

// Cuenta "de Google" en el emulador (token falso que el emulador acepta)
async function googleAccount(email) {
    const postBody = `id_token=${encodeURIComponent(JSON.stringify({ sub: email, email, email_verified: true }))}&providerId=google.com`;
    const r = await fetch(`${AUTH}/accounts:signInWithIdp?key=demo-api-key`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postBody, requestUri: 'http://localhost', returnSecureToken: true })
    });
    const j = await r.json();
    return { token: j.idToken, uid: j.localId };
}

// Cuenta anónima (celular del personal que entra con el enlace del restaurante)
async function anonAccount() {
    const r = await fetch(`${AUTH}/accounts:signUp?key=demo-api-key`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true })
    });
    const j = await r.json();
    return { token: j.idToken, uid: j.localId };
}

const S = v => ({ stringValue: v }), I = v => ({ integerValue: String(v) });
const fields = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) =>
    [k, typeof v === 'number' ? I(v) : typeof v === 'boolean' ? { booleanValue: v } : Array.isArray(v) ? { arrayValue: { values: v } } : S(v)]));

async function call(method, path, token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const r = await fetch(`${FS}/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return r.status;
}
const get = (path, token) => call('GET', path, token);
const put = (path, token, data) => call('PATCH', path, token, { fields: fields(data) });
const del = (path, token) => call('DELETE', path, token);
async function commit(token, docs) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const writes = docs.map(([path, data]) => ({ update: { name: `${ROOT}/${path}`, fields: fields(data) } }));
    const r = await fetch(`${FS}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes }) });
    return r.status;
}

let failures = 0;
function check(name, status, shouldAllow) {
    // Bloqueado = 403. Cualquier otro error (400, 500...) es un fallo de la prueba.
    const ok = shouldAllow ? status >= 200 && status < 300 : status === 403;
    if (!ok) failures++;
    console.log(`${ok ? '✅' : '❌'} ${name} → ${status} (${shouldAllow ? 'debe permitir' : 'debe bloquear'})`);
}

// --- limpiar el emulador para empezar desde cero ------------------------------
await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });

const owner = await account(`dueno-${RUN}@prueba.app`);
const stranger = await account(`extrano-${RUN}@prueba.app`);
const devA = await account(`a-${RUN}@prueba.app`);
const devB = await account(`b-${RUN}@prueba.app`);
const A = `rest-a-${RUN}`, B = `rest-b-${RUN}`;
const TOKEN_A = `codigo-secreto-a-${RUN}-xxxxxxxx`;
const TOKEN_B = `codigo-secreto-b-${RUN}-yyyyyyyy`;
const sale = { estado: 'pagada', total: 1000, metodo_pago: 'efectivo', items: [{ mapValue: { fields: { nombre_producto: S('X') } } }] };

console.log('\n— Preparación (todo debe permitirse) —');
check('Dueño reclama la plataforma', await commit(owner.token, [
    [`platform_admins/${owner.uid}`, { email: 'dueno' }],
    ['platform/owner', { uid: owner.uid }]
]), true);
check('Dueño crea el restaurante A y vincula su cuenta', await commit(owner.token, [
    [`restaurants/${A}`, { nombre: 'A', estado: 'activo' }],
    [`devices/${devA.uid}`, { rid: A }],
    [`restaurants/${A}/users/admin`, { nombre: 'Admin A', rol: 'admin', pin_acceso: '1111', activo: true }],
    [`restaurants/${A}/products/p1`, { nombre: 'Hornado', precio: 15000 }],
    [`restaurants/${A}/private/acceso`, { token: TOKEN_A }]
]), true);
check('Dueño crea el restaurante B y vincula su cuenta', await commit(owner.token, [
    [`restaurants/${B}`, { nombre: 'B', estado: 'activo' }],
    [`devices/${devB.uid}`, { rid: B }],
    [`restaurants/${B}/products/p1`, { nombre: 'Bandeja', precio: 20000 }],
    [`restaurants/${B}/private/acceso`, { token: TOKEN_B }]
]), true);
check('Equipo B registra una venta propia', await put(`restaurants/${B}/order_history/v1`, devB.token, sale), true);

console.log('\n— Reclamar la plataforma —');
check('Un extraño intenta reclamar la plataforma otra vez', await commit(stranger.token, [
    [`platform_admins/${stranger.uid}`, { email: 'x' }],
    ['platform/owner', { uid: stranger.uid }]
]), false);
check('Un extraño intenta hacerse admin de plataforma solo', await put(`platform_admins/${stranger.uid}`, stranger.token, { email: 'x' }), false);

console.log('\n— Sin cuenta de restaurante —');
check('Sin sesión: leer el menú de A', await get(`restaurants/${A}/products/p1`, null), false);
check('Cuenta sin restaurante: leer el menú de A', await get(`restaurants/${A}/products/p1`, stranger.token), false);
check('Cuenta sin restaurante: crear un restaurante', await put(`restaurants/hack-${RUN}`, stranger.token, { nombre: 'H', estado: 'activo' }), false);
check('Cuenta sin restaurante: vincularse a A', await put(`devices/${stranger.uid}`, stranger.token, { rid: A }), false);

console.log('\n— Separación entre restaurantes (lo más importante) —');
check('Equipo A lee su propio menú', await get(`restaurants/${A}/products/p1`, devA.token), true);
check('Equipo A lee el menú de B', await get(`restaurants/${B}/products/p1`, devA.token), false);
check('Equipo A lee las ventas de B', await get(`restaurants/${B}/order_history/v1`, devA.token), false);
check('Equipo A crea una orden en B', await put(`restaurants/${B}/orders/o1`, devA.token, { items: [], total: 0 }), false);
check('Equipo A crea un usuario en B', await put(`restaurants/${B}/users/hack`, devA.token, { nombre: 'H', rol: 'admin', pin_acceso: '0000', activo: true }), false);
check('Equipo A lee el documento del restaurante B', await get(`restaurants/${B}`, devA.token), false);
check('Equipo A lee el vínculo de la cuenta B', await get(`devices/${devB.uid}`, devA.token), false);
check('Equipo A cambia su vínculo hacia B', await put(`devices/${devA.uid}`, devA.token, { rid: B }), false);

console.log('\n— Ventas: solo crear —');
check('Equipo A registra una venta válida', await put(`restaurants/${A}/order_history/v1`, devA.token, sale), true);
check('Equipo A modifica esa venta', await put(`restaurants/${A}/order_history/v1`, devA.token, sale), false);
check('Equipo A borra esa venta', await del(`restaurants/${A}/order_history/v1`, devA.token), false);
check('Equipo A registra una venta con total negativo', await put(`restaurants/${A}/order_history/v2`, devA.token, { ...sale, total: -5 }), false);

console.log('\n— Suspensión —');
check('Equipo A intenta cambiar el estado de su restaurante', await put(`restaurants/${A}`, devA.token, { nombre: 'A', estado: 'activo' }), false);
check('Dueño suspende A', await put(`restaurants/${A}`, owner.token, { nombre: 'A', estado: 'suspendido' }), true);
check('Equipo A (suspendido) lee su menú', await get(`restaurants/${A}/products/p1`, devA.token), false);
check('Equipo A (suspendido) ve que está suspendido', await get(`restaurants/${A}`, devA.token), true);
check('Dueño reactiva A', await put(`restaurants/${A}`, owner.token, { nombre: 'A', estado: 'activo' }), true);
check('Equipo A (reactivado) lee su menú', await get(`restaurants/${A}/products/p1`, devA.token), true);

console.log('\n— Privacidad del dueño de la plataforma —');
check('Dueño lista los restaurantes', await get('restaurants', owner.token), true);
check('Dueño agrega un administrador a A', await put(`restaurants/${A}/users/admin2`, owner.token, { nombre: 'Admin 2', rol: 'admin', pin_acceso: '2222', activo: true }), true);
check('Dueño lee las ventas de A', await get(`restaurants/${A}/order_history/v1`, owner.token), false);
check('Dueño lee las órdenes de A', await get(`restaurants/${A}/orders`, owner.token), false);

console.log('\n— Solicitudes de registro (cuenta de Google) —');
const solicitante = await googleAccount(`nuevo-${RUN}@gmail.com`);
const otroGoogle = await googleAccount(`otro-${RUN}@gmail.com`);
const anonimo = await anonAccount();
const solicitud = { estado: 'pendiente', nombre_restaurante: 'Asadero Nuevo', nombre_contacto: 'Pedro', email: 'x' };
check('Cuenta Google crea su solicitud', await put(`solicitudes/${solicitante.uid}`, solicitante.token, solicitud), true);
check('Cuenta Google crea una solicitud a nombre de otro', await put(`solicitudes/${otroGoogle.uid}x`, otroGoogle.token, solicitud), false);
check('Cuenta anónima crea una solicitud', await put(`solicitudes/${anonimo.uid}`, anonimo.token, solicitud), false);
check('Solicitud creada ya aprobada', await put(`solicitudes/${otroGoogle.uid}`, otroGoogle.token, { ...solicitud, estado: 'aprobada' }), false);
check('El solicitante lee su solicitud', await get(`solicitudes/${solicitante.uid}`, solicitante.token), true);
check('Otra cuenta lee una solicitud ajena', await get(`solicitudes/${solicitante.uid}`, otroGoogle.token), false);
check('El solicitante se aprueba a sí mismo', await put(`solicitudes/${solicitante.uid}`, solicitante.token, { ...solicitud, estado: 'aprobada' }), false);
check('El solicitante se vincula solo a un restaurante (sin código)', await put(`devices/${solicitante.uid}`, solicitante.token, { rid: A }), false);
check('Dueño lista las solicitudes', await get('solicitudes', owner.token), true);
check('Dueño aprueba la solicitud', await put(`solicitudes/${solicitante.uid}`, owner.token, { ...solicitud, estado: 'aprobada', rid: A }), true);

console.log('\n— Enlace del personal (código secreto del restaurante) —');
const personal = await anonAccount();
const intruso = await anonAccount();
const vincular = (cuenta, rid, token) => put(`devices/${cuenta.uid}`, cuenta.token, { rid, token, tipo: 'personal' });
check('Celular sin vincular lee el menú de A', await get(`restaurants/${A}/products/p1`, personal.token), false);
check('Vincularse a A con un código incorrecto', await vincular(intruso, A, 'codigo-falso-0000000000000'), false);
check('Vincularse a A con el código de B', await vincular(intruso, A, TOKEN_B), false);
check('Vincularse a A con el código correcto', await vincular(personal, A, TOKEN_A), true);
check('Celular vinculado lee el menú de A', await get(`restaurants/${A}/products/p1`, personal.token), true);
check('Celular vinculado a A lee el menú de B', await get(`restaurants/${B}/products/p1`, personal.token), false);
check('Celular vinculado a A se cambia a B (con código de B)', await vincular(personal, B, TOKEN_B), false);
check('Celular vinculado lee el código del enlace de B', await get(`restaurants/${B}/private/acceso`, personal.token), false);
check('Vincularse con un tipo distinto (intento de escalar)', await put(`devices/${intruso.uid}`, intruso.token, { rid: A, token: TOKEN_A, tipo: 'admin' }), false);
check('Dueño suspende A', await put(`restaurants/${A}`, owner.token, { nombre: 'A', estado: 'suspendido' }), true);
const tarde = await anonAccount();
check('Vincularse a A (suspendido) con el código correcto', await vincular(tarde, A, TOKEN_A), false);
check('Dueño reactiva A', await put(`restaurants/${A}`, owner.token, { nombre: 'A', estado: 'activo' }), true);

console.log('\n— Cada colección de restaurante registrada en collections.ts está aislada —');
// Si se agrega una colección a RESTAURANT_COLLECTIONS sin su regla (o con una regla que deja ver a
// otros restaurantes), esta sección falla y avisa antes de desplegar.
const { readFileSync } = await import('node:fs');
const registry = readFileSync(new URL('../src/app/core/tenant/collections.ts', import.meta.url), 'utf8');
const listBlock = registry.match(/RESTAURANT_COLLECTIONS = \[([\s\S]*?)\] as const/)?.[1] ?? '';
const registered = [...listBlock.matchAll(/'([a-z_]+)'/g)].map(m => m[1]);
if (registered.length === 0) { console.log('❌ No se pudo leer RESTAURANT_COLLECTIONS'); failures++; }
for (const col of registered) {
    check(`[${col}] su equipo puede listarla`, await get(`restaurants/${A}/${col}`, devA.token), true);
    check(`[${col}] el equipo de otro restaurante NO`, await get(`restaurants/${A}/${col}`, devB.token), false);
    check(`[${col}] sin sesión NO`, await get(`restaurants/${A}/${col}`, null), false);
}

console.log('\n— Versión anterior (colecciones sueltas) —');
check('Dueño lee el menú anterior', await get('products', owner.token), true);
check('Equipo A lee el menú anterior', await get('products', devA.token), false);
check('Equipo A escribe en una colección desconocida', await put(`hackeo/${RUN}`, devA.token, { a: 'b' }), false);

console.log(failures === 0 ? '\nTodas las reglas se comportan como se espera.' : `\n${failures} caso(s) fallaron.`);
process.exit(failures === 0 ? 0 : 1);

// Pruebas de las reglas de Firestore contra el EMULADOR (npm run emulators).
// Uso: node scripts/test-rules-emulator.mjs
// Crea cuentas de prueba en el emulador de Auth y verifica qué se permite y qué se bloquea.

const PROJECT = 'demo-senor-hornado';
const FS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`;
const AUTH = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
const DEVICE_EMAIL = 'equipos@senorhornado.app';
const RUN = `prueba_${Date.now()}`; // id único por ejecución

async function tokenFor(email, password) {
    let r = await fetch(`${AUTH}/accounts:signUp?key=demo-api-key`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    if (!r.ok) {
        r = await fetch(`${AUTH}/accounts:signInWithPassword?key=demo-api-key`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });
    }
    return (await r.json()).idToken;
}

const S = v => ({ stringValue: v }), I = v => ({ integerValue: String(v) });
const sale = { fields: { estado: S('pagada'), total: I(1000), metodo_pago: S('efectivo'), items: { arrayValue: { values: [{ mapValue: { fields: { nombre_producto: S('X') } } }] } } } };

async function req(method, path, token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const r = await fetch(`${FS}/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return r.status;
}

const device = await tokenFor(DEVICE_EMAIL, 'clave-de-prueba-123');
const stranger = await tokenFor('extrano@ejemplo.com', 'otra-clave-123');

const cases = [
    ['Sin sesión: leer usuarios (PINs)', 'GET', 'users', null, null, false],
    ['Sin sesión: borrar una mesa', 'DELETE', 'tables/mesa_1', null, null, false],
    ['Cuenta ajena: leer productos', 'GET', 'products', stranger, null, false],
    ['Cuenta ajena: crear venta falsa', 'PATCH', 'order_history/falsa_1', stranger, sale, false],
    ['Equipo: leer productos', 'GET', 'products', device, null, true],
    ['Equipo: crear venta válida', 'PATCH', `order_history/${RUN}_1`, device, sale, true],
    ['Equipo: modificar una venta existente', 'PATCH', `order_history/${RUN}_1`, device, sale, false],
    ['Equipo: borrar una venta', 'DELETE', `order_history/${RUN}_1`, device, null, false],
    ['Equipo: venta con total negativo', 'PATCH', `order_history/${RUN}_2`, device, { fields: { ...sale.fields, total: I(-5) } }, false],
    ['Equipo: crear colección desconocida', 'PATCH', 'hackeo/x', device, { fields: { a: S('b') } }, false],
];

let failures = 0;
for (const [name, method, path, token, body, shouldAllow] of cases) {
    const status = await req(method, path, token, body);
    // Bloqueado = 403 (permiso denegado). Cualquier otro error (400, 500...) es un fallo de la prueba.
    const ok = shouldAllow ? (status >= 200 && status < 300) : status === 403;
    if (!ok) failures++;
    console.log(`${ok ? '✅' : '❌'} ${name} → ${status} (${shouldAllow ? 'debe permitir' : 'debe bloquear'})`);
}
console.log(failures === 0 ? '\nTodas las reglas se comportan como se espera.' : `\n${failures} caso(s) fallaron.`);
process.exit(failures === 0 ? 0 : 1);

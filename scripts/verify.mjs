// npm run verify — revisa TODO antes de desplegar. Si algo falla, no despliegues.
//   1. Build de producción (errores de tipos, plantillas, imports).
//   2. Pruebas unitarias (lógica de pedidos, totales, vuelto, PIN, etc.).
//   3. Pruebas de reglas de Firestore (separación entre restaurantes, ventas solo-crear, etc.).
//      Si el emulador ya está corriendo se usa ese (OJO: borra sus datos); si no, se levanta uno temporal.
import { spawnSync } from 'node:child_process';
import net from 'node:net';

function run(title, command) {
    console.log(`\n=== ${title} ===`);
    const started = Date.now();
    const result = spawnSync(command, { stdio: 'inherit', shell: true });
    const secs = ((Date.now() - started) / 1000).toFixed(0);
    if (result.status !== 0) {
        console.error(`\n❌ FALLÓ: ${title} (${secs} s). No despliegues hasta corregirlo.`);
        process.exit(1);
    }
    console.log(`✅ ${title} (${secs} s)`);
}

function portInUse(port) {
    return new Promise(resolve => {
        const socket = net.connect({ port, host: '127.0.0.1' });
        socket.once('connect', () => { socket.end(); resolve(true); });
        socket.once('error', () => resolve(false));
    });
}

run('Build de producción', 'npx ng build --configuration production');
run('Pruebas unitarias', 'npx ng test --watch=false --browsers=ChromeHeadless');

if (await portInUse(8080) && await portInUse(9099)) {
    run('Reglas de Firestore (emulador ya abierto)', 'node scripts/test-rules-emulator.mjs');
} else {
    run('Reglas de Firestore (emulador temporal)',
        'npx firebase emulators:exec --only firestore,auth --project demo-senor-hornado "node scripts/test-rules-emulator.mjs"');
}

console.log('\n✅ Todo verificado. Se puede desplegar.');

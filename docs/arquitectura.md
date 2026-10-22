# Arquitectura del sistema POS multi-restaurante

> Léelo antes de hacer cambios grandes. Explica **cómo está armado** el sistema y **las reglas que no se deben romper**.

## 1. Vista general

```
Navegador (Angular 18, PWA)                      Firebase (plan Spark)
┌───────────────────────────────┐               ┌──────────────────────────────┐
│ features/  (pantallas)        │               │ Authentication               │
│   waiter · cashier · admin    │               │  - cuenta de cada restaurante│
│   platform · auth             │               │  - dueño de la plataforma    │
│        │                      │               │                              │
│ core/services (lógica)        │  Firestore    │ Firestore                    │
│   order · shift · product ... │ ────────────▶ │  restaurants/{rid}/...       │
│        │                      │  (reglas)     │  devices/{uid} → rid         │
│ core/tenant  (rutas y cuenta) │               │  platform_admins/{uid}       │
│   TenantService + collections │               │  platform/owner              │
└───────────────────────────────┘               └──────────────────────────────┘
```

## 2. Las tres identidades

| Identidad | Cómo se autentica | Qué puede hacer |
|---|---|---|
| **Dueño de la plataforma** | Firebase Auth (correo y contraseña). Su UID está en `platform_admins/` | Crear restaurantes, sus cuentas y su primer admin; suspender y reactivar. **No** ve ventas |
| **Equipo de un restaurante** | Firebase Auth con la cuenta del restaurante. `devices/{uid}` → `rid` | Todo dentro de `restaurants/{rid}/`, solo mientras el restaurante esté `activo` |
| **Empleado** (admin, cajero o mesero) | PIN dentro de un equipo ya activado (`restaurants/{rid}/users`) | Lo que su rol permite en la interfaz (ver la limitación en la sección 6) |

## 3. Reglas de oro (no romper)

1. **Ningún servicio construye rutas de Firestore a mano.** Todo pasa por `core/tenant/collections.ts` y `TenantService`:
   - `tenant.col(nombre)` y `tenant.docRef(nombre, id)` para operaciones del restaurante activo.
   - `tenant.watch(rid => ...)` para listeners; se vuelven a suscribir si cambia el restaurante y no se caen si las reglas rechazan.
   - Los nombres de colección están **tipados**: un nombre mal escrito no compila.
2. **Toda colección nueva necesita su regla** en `firestore.rules`. Sin regla, Firestore la niega. `npm run verify` lo detecta solo, porque prueba cada colección registrada.
3. **Las ventas (`order_history`) y los turnos (`shifts`) nunca se editan ni se borran.** Para corregir algo se crea un registro nuevo (por ejemplo, una anulación).
4. **El dinero se escribe en transacciones o batches.** Cobrar, unir, dividir y guardar comandas son atómicos e idempotentes; una venta usa el **mismo id** que su orden.
5. **La lógica de cálculo va en archivos puros** (`order.logic.ts`) con pruebas unitarias. No se calculan totales dentro de los componentes.
6. **Dentro de un `effect()` nunca se escriben signals ni se navega directamente.** Angular 18 lo bloquea (error NG0600) y la acción se pierde sin aviso visible. Las acciones van en `queueMicrotask(() => ...)` o en `untracked(...)`. Este error ya causó dos fallas: el aviso de comandas y el paso automático al PIN.
7. **Antes de desplegar: `npm run verify`.** O directamente `npm run deploy`, que verifica primero y solo despliega si todo pasa.
8. **Pantallas de celular: nunca `100vh`, `100dvh` ni `h-screen`.** En el iPhone instalado no coinciden con la pantalla (dejan una franja abajo o meten contenido bajo la barra de estado). Se usa `h-app` / `min-h-app` (alto útil real, medido en `core/pwa/viewport.ts`) y `pb-safe` en las zonas con contenido abajo, para no quedar bajo la barra de inicio. Las ventanas `fixed inset-0` ya respetan esas zonas desde `styles.css`.

## 4. Receta: agregar una función nueva (ejemplo: "recetas")

1. **Modelo:** agrega la interfaz en `shared/interfaces/` y expórtala en `index.ts`.
2. **Ruta:** agrega `'recetas'` en `RESTAURANT_COLLECTIONS` (`core/tenant/collections.ts`).
3. **Regla:** agrega en `firestore.rules`, dentro de `match /restaurants/{rid}`:
   ```
   match /recetas/{id} {
     allow read, write: if isDeviceOf(rid);
   }
   ```
4. **Servicio:** crea `core/services/receta.service.ts` siguiendo el patrón de `product.service.ts`: `tenant.watch(...)` para leer y `tenant.col('recetas')` para escribir.
5. **Lógica de cálculo:** si la hay, va en un archivo `*.logic.ts` con su `*.spec.ts`.
6. **Pantalla:** va en `features/...` y solo llama al servicio.
7. **Si la colección tiene reglas especiales** (solo crear, validaciones), agrega casos a `scripts/test-rules-emulator.mjs`.
8. Ejecuta `npm run verify`, prueba en el emulador (sección 7) y despliega con `npm run deploy`.

## 5. Flujo de una comanda (para entender las piezas)

1. **Mesero:** las líneas nuevas viven en el celular (`newLines`). Al enviar, `OrderService.saveOrder` abre una **transacción**: lee la orden en el servidor, agrega solo las líneas nuevas (sin duplicar `line_id`), recalcula el total y marca `enviado_en`.
2. **Caja:** escucha `orders` en vivo. Detecta comandas nuevas o actualizadas por `enviado_en` y suena el aviso.
3. **Cobro:** `closeOrder` hace, en una **transacción**, tres cosas: crea `order_history/{mismoId}`, borra la orden y libera la mesa si no le quedan otras órdenes.
4. **Cierre de turno:** `ShiftService.closeShift` archiva un resumen en `shifts/` y mueve `config/turno_actual.inicio`. **No borra nada.**

## 6. Limitaciones conocidas (plan gratuito)

Detalle y solución con plan de pago en `docs/pendientes.md`, sección A.
- **Roles en el cliente:** el rol del empleado (mesero, cajero o admin) se valida en el dispositivo. Las reglas garantizan el restaurante, no el rol.
- **PINs legibles:** los PINs los pueden leer los equipos activados del mismo restaurante.
- **Sin modo offline completo:** sin señal, la app avisa y no envía. Las transacciones requieren conexión.

## 7. Entornos

| Entorno | Para qué | Cómo |
|---|---|---|
| **Emulador local** | Desarrollar y probar sin tocar datos reales | `npm run emulators`, luego `node scripts/seed-emulator.mjs --demo` y `npm run start:emu` |
| **Producción** | El restaurante real | `npm run deploy` (verifica antes de desplegar) |

El emulador usa el proyecto `demo-senor-hornado`, que **no puede** conectarse a producción por diseño.

## 8. Mapa de archivos clave

| Archivo | Responsabilidad |
|---|---|
| `core/tenant/collections.ts` | Nombres y rutas de todas las colecciones |
| `core/tenant/tenant.service.ts` | Qué cuenta hay (equipo o plataforma), qué restaurante y si está activo |
| `core/platform/platform.service.ts` | Crear restaurantes, suspender, agregar admins |
| `core/services/order.service.ts` | Comandas, cobro, unir y dividir (transacciones) |
| `core/services/order.logic.ts` | Cálculos puros (totales, líneas, vuelto, avisos) |
| `core/services/shift.service.ts` | Turnos, ventas del turno y reportes por fecha |
| `core/guards/*` | Quién puede entrar a cada pantalla |
| `firestore.rules` | Seguridad real (el cliente se puede manipular; las reglas no) |
| `scripts/test-rules-emulator.mjs` | Pruebas de seguridad (incluye una revisión automática de cada colección) |
| `scripts/verify.mjs` | Verificación completa antes de desplegar |

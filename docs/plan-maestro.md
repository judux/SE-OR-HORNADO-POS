# Plan maestro: Señor Hornado POS, del piloto al producto comercial

> **Fecha del plan:** martes 20 de octubre de 2026. **Prueba piloto:** sábado 24 de octubre de 2026 (quedan 3 días hábiles).
> **Base:** revisión directa del repositorio (`main`, commit `252d0a1` más los cambios sin commit) y un `ng build` que compiló sin errores.
> **Decisiones que ya tomaste:** el sábado se usa solo el plan Spark (gratis) y Blaze queda para después. No habrá pantalla de cocina. Dispositivos: celulares de los meseros y una tablet o PC en caja, sin impresora térmica. La base de datos actual solo tiene datos de prueba.
> **Qué pasa al aprobar:** copio este plan a `docs/plan-maestro.md` dentro del repo y empiezo el Sprint 1 por la tarea T-01.

---

## Estado del Sprint 1 (actualizado el 20 de octubre de 2026, noche)

| Tarea | Estado | Evidencia |
|---|---|---|
| T-01 Guardar el estado actual | ✅ Hecho | Commit `559d54d` y tag `pre-piloto` |
| T-02 Quitar los PINs maestros | ✅ Hecho y verificado | P-01 |
| T-04a Reglas de Firestore | ✅ Hecho y verificado | `npm run test:rules`: 10/10 |
| T-04b Cuenta de dispositivo | ✅ Hecho y verificado | Pantalla `/activar`; flujo completo con las reglas cerradas |
| T-05 Pedidos por líneas con ID | ✅ Hecho y verificado | P-03 a P-07 |
| T-07 Cobro atómico e idempotente | ✅ Hecho y verificado | P-09, P-10, P-13, P-14, P-15 |
| T-08 Turnos archivados sin borrado | ✅ Hecho y verificado | P-16, P-17 |
| T-09 Billetes en COP | ✅ Hecho y verificado | P-09 |
| T-10 Aviso de comandas | ✅ Hecho y verificado | Avisos de nueva y de actualizada |
| T-11 Conexión honesta | ✅ Hecho y verificado | P-11 (sin red simulado) |
| T-12 Limpieza menor | ✅ Hecho | — |
| Extra | ✅ Aviso de versión nueva de la PWA; entorno de emulador (`npm run emulators`, `seed:emu`, `start:emu`); íconos en caché para usar sin conexión (falta verificar en modo avión); formato `es-CO` | — |
| T-13 Datos reales | 🟡 Admin creado y datos de prueba borrados; falta cargar menú, mesas y personal reales | `docs/guia-despliegue-piloto.md`, pasos 1–2 y 6 |
| T-14 Despliegue y activación | 🟡 Desplegado a producción el 20 de octubre (sitio y reglas). Falta activar cada dispositivo | Versión `main-2NGUVYYI.js` en vivo; acceso sin sesión → 403 |
| T-15 Ensayo general | ⏳ Pendiente (viernes) | `docs/piloto-2026-10-24.md` |

**Hallazgos nuevos durante la implementación** (no estaban en la auditoría inicial):
- **A-28:** el aviso sonoro de comandas **nunca funcionó**. El `effect` escribía en un signal y Angular 18 lo bloquea (NG0600). Ya está corregido en T-10.
- **A-29:** usar `track item.x ?? $index` compila pero falla al ejecutar en Angular 18 y deja vacía la lista de la comanda. Se detectó probando en el navegador, no con el build.
- **A-30 (Sprint 2):**
  - La caja no muestra las notas de preparación ("sin ensalada") en el detalle del cobro.
  - ~~Las fechas salen en inglés~~: corregido con la configuración regional `es-CO` (commit `c4b5ced`).
  - El texto escrito en las notas se ve muy tenue.

## Contexto

La app ya cubre casi todo el flujo del PRD: login por PIN, mesas, pedidos con candado, caja, unir y dividir cuentas, venta directa, caja chica y cierre de turno. Funciona en una demo, pero **todavía no es confiable para vender en un restaurante real**. Tiene tres tipos de problemas:

1. **Errores de lógica** que pueden borrar ítems de una comanda o duplicar y perder ventas.
2. **Un cierre de turno que borra el historial de ventas para siempre.**
3. **Seguridad inexistente:** la base de datos está abierta y hay PINs maestros escritos en el código.

La meta es corregir lo que pone en riesgo el dinero y los datos antes del sábado, usar la prueba para aprender y, después, evolucionar paso a paso hacia una plataforma para varios restaurantes **sin reescribir la app**.

---

## 1. Resumen ejecutivo

**Qué debemos conseguir:** que el sábado cada comanda llegue completa a caja, que cada venta quede registrada **una sola vez** y que nada borre ventas por accidente. Si algo falla, el restaurante sigue operando con papel.

**Principales riesgos, ordenados:**

| # | Riesgo | Efecto real en el restaurante |
|---|---|---|
| R1 | Si el mesero recarga la página o abre la mesa directamente, al guardar se **borran los platos ya enviados** | Comanda incompleta y cobro de menos |
| R2 | El cobro hace 3 escrituras separadas, no una sola operación | Una venta duplicada o perdida si se cae la red |
| R3 | El cierre de turno **borra para siempre** las ventas y los gastos | Se pierde el día si alguien toca el botón por error; no hay reportes mensuales |
| R4 | La base de datos está abierta y existen PINs maestros (`1234` = admin) | Cualquiera con el enlace puede borrar todo o entrar como administrador |
| R5 | Sin conexión, el botón se queda en "Enviando..." y no hay aviso | El mesero no sabe si el pedido llegó y lo vuelve a enviar o lo pierde |
| R6 | Los botones rápidos de billetes son de $5, $10... y los precios están en pesos (p. ej. 15.000) | Errores al calcular el vuelto |

**Sobre "en mi pueblo no hay hackers":** el riesgo no es un hacker local. La app está publicada en internet, la configuración de Firebase viaja dentro del JavaScript que descarga cualquier navegador y hay bots que buscan bases de Firestore abiertas. También cuenta cualquier persona que tenga el enlace, como un exempleado o un curioso. Además, la regla abierta no protege ni contra **tus propios errores de código**. Arreglarlo en el plan Spark cuesta $0 y unas 3–4 horas, así que lo incluyo como tarea crítica en una versión mínima (T-04a).

---

## 2. Plan de emergencia para el sábado

### 2.1 Qué entra en el piloto y qué no

| Funcionalidad | Existe en el código | ¿Va el sábado? |
|---|---|---|
| Login por PIN | Sí, pero con PINs maestros y sesión manipulable | **Sí**, quitando los PINs maestros (T-02) |
| Mesas y estados por color | Sí | Sí |
| Toma de pedidos, notas y cantidades | Sí, con los errores R1 y R7 | **Sí, tras T-05** |
| Envío a caja con bloqueo de doble toque | Sí (`isSending`) | Sí, con un límite de tiempo honesto (T-11) |
| Aviso sonoro en caja | Sí, pero no suena con la primera comanda | Sí, tras T-10 |
| Eliminar un ítem desde caja | Sí, por índice (frágil) | Sí, tras T-05 (por identificador de línea) |
| Cobro en efectivo o transferencia con vuelto | Sí | **Sí, tras T-07 y T-09** |
| Unir mesas y dividir cuenta | Sí, sin operación atómica y con el error de dos órdenes en la misma mesa | **Solo si pasan las pruebas del viernes.** Si no, se ocultan los botones y se usa el procedimiento manual |
| Venta directa (para llevar) | Sí | Sí, tras T-07 |
| Caja chica | Sí | Sí |
| Cierre de turno | Sí, pero **borra datos** | **Sí, tras T-08** (archiva en vez de borrar) |
| Botón "Borrar historial" del admin | Sí | **Se elimina** |
| Dashboard del admin | Sí | Sí, solo para consultar |
| Impresión de recibos o comandas | No existe; solo se imprime el reporte de cierre con `window.print` | **No.** El restaurante sigue usando su documento fiscal actual |
| Descuentos e impuestos | No existen | **No.** Los precios del menú son el valor final (confirmar con el dueño) |
| Modo sin conexión con cola local | No existe | **No.** Se muestra un aviso de "Sin conexión" y se usa el plan de respaldo |
| Vista de cocina | No existe y está fuera del alcance | No |

> ⚠️ **Tema fiscal:** el "recibo de control interno" **no reemplaza** la factura electrónica ni el documento equivalente POS electrónico de la DIAN. Durante el piloto, el restaurante debe seguir expidiendo lo que expide hoy. La obligación concreta depende de su régimen tributario y **la debe confirmar un contador** (ver la Fase 8).

### 2.2 Cronograma

| Día | Bloque | Tareas |
|---|---|---|
| Mar 20 (noche) | Base segura | T-01 commit y rama · T-02 quitar PINs maestros · T-09 billetes en COP · T-12 limpieza menor |
| Mié 21 | Integridad de pedidos | T-05 carrito y líneas con ID · T-07 cobro atómico e idempotente |
| Jue 22 | Integridad de caja y acceso | T-08 cierre de turno sin borrar · T-04a reglas mínimas · T-04b cuenta de dispositivo · T-10 aviso · T-11 conexión |
| Vie 23 (mañana) | Datos y despliegue | T-13 cargar el menú, las mesas y el personal reales · T-14 desplegar e instalar la PWA en cada equipo |
| Vie 23 (tarde) | Ensayo general | T-15 recorrer el guion de pruebas en los dispositivos reales. **A las 6 p. m. se congela el código** |
| Sáb 24 | Piloto | Operar con el respaldo en papel a mano y anotar cada incidencia |
| Dom 25 / Lun 26 | Retrospectiva | Analizar las incidencias y reordenar el backlog |

Si el tiempo no alcanza, **el orden de recorte es:** T-11 y luego T-10 (se compensan con el procedimiento manual). Después se ocultan unir y dividir. **Nunca** se recortan T-02, T-05, T-07, T-08 ni T-04a.

### 2.3 Guion de pruebas (T-15, en los dispositivos reales)

Cada caso se marca como ✅ o ❌. Lo ideal es hacerlo con dos personas: una de mesero y otra de cajero.

| ID | Escenario | Resultado esperado |
|---|---|---|
| P-01 | Ingresar el PIN `1234` si no existe en la base | Rechazado |
| P-02 | Ingresar un PIN válido de mesero y luego abrir `/cajero` escribiendo la URL | Redirige a la vista del mesero |
| P-03 | Pedir 2 hornados con la nota "sin ensalada" y 1 gaseosa, y enviar a caja | La caja ve 3 unidades en 2 líneas, con el total correcto y aviso sonoro |
| P-04 | Tocar "Enviar a caja" 5 veces seguidas muy rápido | Una sola comanda |
| P-05 | Enviar a caja, **recargar la página** en la mesa, agregar 1 jugo y reenviar | La caja ve los 3 ítems originales más el jugo, sin perder ninguno |
| P-06 | Agregar un producto igual a otro ya enviado (mismo producto y nota) con cantidad 3 | Aparece una línea nueva con cantidad 3; la línea con candado no cambia |
| P-07 | La caja elimina un ítem y, al mismo tiempo, el mesero agrega otro y reenvía | El ítem eliminado **no reaparece** y el nuevo sí llega |
| P-08 | Dos meseros abren la misma mesa y ambos agregan ítems | Llegan los ítems de los dos |
| P-09 | Cobrar en efectivo con un billete de 50.000 para una cuenta de 37.500 | El vuelto es 12.500 |
| P-10 | Tocar dos veces "Confirmar pago" | Una sola venta en el historial |
| P-11 | Activar el modo avión en el celular y enviar | Se ve un aviso claro de "Sin conexión, el pedido NO se envió". Nunca queda "Enviando..." para siempre |
| P-12 | Activar el modo avión en caja y cobrar | Se ve un error o aviso; al volver la conexión no hay ventas duplicadas |
| P-13 | Dividir una cuenta y cobrar una parte | La mesa sigue ocupada con el resto |
| P-14 | Unir las mesas 2 y 3 y cobrar | Un solo cobro con todos los ítems; las dos mesas quedan libres |
| P-15 | Hacer una venta directa y cobrarla | Aparece en el historial como "Para llevar" |
| P-16 | Registrar un gasto de 10.000 y ver el cuadre | El efectivo esperado baja en 10.000 |
| P-17 | Cerrar el turno | Se imprime el reporte, el turno queda **archivado** y el admin todavía ve esas ventas en el dashboard |
| P-18 | Marcar un producto como agotado desde el admin | En menos de 2 s el mesero lo ve deshabilitado |
| P-19 | Reproducir la prueba P-03 en cada celular real (Android e iPhone si hay) | Funciona y los botones se pueden tocar con una mano |
| P-20 | Medir la señal en cada terraza (celular y Wi-Fi) | Se anota dónde hay señal y dónde no, para el plan de respaldo |
| P-21 | Escribir a mano, desde otro navegador sin sesión, en la base con la configuración pública | Rechazado por las reglas (T-04) |

### 2.4 Criterios para decidir si se usa el sistema el sábado

**Se usa (GO) si se cumplen todas estas condiciones:**

1. P-01, P-03, P-04, P-05, P-07, P-09, P-10, P-17 y P-21 pasan en los dispositivos reales.
2. `ng build` compila sin errores y el despliegue en Firebase Hosting está verificado en cada equipo, que muestra la versión nueva.
3. Están cargados el menú, los precios y las mesas reales, y cada empleado tiene un PIN único.
4. El dueño conoce y acepta el procedimiento de respaldo.

**Se deshabilita la función correspondiente** si fallan P-13 o P-14 (unir o dividir: se ocultan los botones) o P-11 (se refuerza el aviso y se usa el respaldo).

**No se usa (NO-GO)** si falla P-05, P-07, P-09 o P-10. En ese caso se opera con papel y se usa el sábado solo para observar el flujo real.

### 2.5 Procedimiento manual de respaldo

- **Antes:** el restaurante tiene a mano su comandero de papel y su talonario habitual.
- **Si cae la red o la app falla más de 5 minutos:** se pasa a papel en todo el local, no solo en una mesa, para no mezclar sistemas. La caja anota la hora del cambio.
- **Ítems en duda** (no se sabe si el pedido llegó): el mesero confirma **verbalmente con caja** antes de reenviar.
- **Unir o dividir** (si se ocultan): se cobra cada mesa por separado y la caja anota a mano el reparto.
- **Al cierre:** se compara el total del sistema con el efectivo contado más las transferencias. Las ventas en papel se suman aparte y se registra la diferencia.
- **Registro de incidencias:** una hoja con la hora, quién, qué pasó y qué se hizo. Es la principal entrada para el Sprint 2.

---

## 3. Auditoría técnica (realizada sobre el repositorio)

**Cómo leer la columna "Evidencia":**

- **Confirmado (código):** se ve directamente en el código.
- **Confirmado (razonado):** se deduce del flujo del código, pero no se ha reproducido ejecutando la app. Se reproducirá en T-15.
- **Riesgo:** no es un error, pero puede causar daño.
- **Por verificar:** falta información.

| ID | Hallazgo | Archivo | Evidencia | Gravedad | Probabilidad | Urgencia |
|---|---|---|---|---|---|---|
| A-01 | Reglas `allow read, write: if true` | `firestore.rules:8` | Confirmado (código) | Crítica | Media | Antes del sábado |
| A-02 | PINs maestros fijos (1234, 1111, 3333, 2222) que funcionan aunque el PIN no exista en la base, más botones de demo en el login | `auth.service.ts:43`, `login.component.ts:113` | Confirmado (código) | Crítica | Alta | Antes del sábado |
| A-03 | Sesión guardada como JSON en `localStorage` y guards solo en el cliente; no se usa Firebase Auth | `auth.service.ts:89`, `core/guards/*` | Confirmado (código) | Alta | Baja (piloto) | Sprint 3 |
| A-04 | PINs en texto plano, legibles por cualquiera y sin límite de intentos | `users` (Firestore) | Confirmado (código) | Alta | Media | Sprint 3 |
| A-05 | Al recargar una mesa, el carrito arranca vacío y al guardar sobrescribe `items` | `order-taking.component.ts:374`, `order.service.ts:79,153` | Confirmado (razonado) | **Crítica** | Alta | Antes del sábado |
| A-06 | `addToCart` suma la cantidad a líneas ya enviadas, y si la cantidad es mayor que 1 se ignora | `order.service.ts:97`, `order-taking:422` | Confirmado (código) | Alta | Alta | Antes del sábado |
| A-07 | El mesero sobrescribe la orden con su copia local; gana el último que guarda | `order.service.ts:153` | Confirmado (código) | Alta | Media | Antes del sábado |
| A-08 | Cobrar, unir y dividir no son atómicos (varios `await` seguidos) | `order.service.ts:230,302,339` | Confirmado (código) | Crítica | Baja-media | Antes del sábado |
| A-09 | Dividir crea dos órdenes con el mismo `id_mesa`: `getOrderByTable` devuelve solo la primera y cobrar una libera la mesa | `order.service.ts:339`, `cashier-dashboard:743` | Confirmado (razonado) | Alta | Media | Antes del sábado o se oculta |
| A-10 | `.sort()` modifica la selección en su lugar y no se puede dividir por cantidad | `order.service.ts:344` | Confirmado (código) | Media | Media | Sprint 2 |
| A-11 | El cierre de turno y el admin **borran** `order_history` y `expenses` | `cashier-dashboard:891`, `admin-dashboard` | Confirmado (código) | **Crítica** | Media | Antes del sábado |
| A-12 | `writeBatch` falla con más de 500 operaciones | `order.service.ts:437` | Confirmado (código) | Media | Baja | Se resuelve con A-11 |
| A-13 | Los listeners descargan **colecciones completas**, incluido `order_history` en **cada** dispositivo (también en los celulares de los meseros, porque `OrderService` es global) | `order.service.ts` constructor | Confirmado (código) | Alta (costos) | Alta con el tiempo | Antes del sábado (va con T-08) |
| A-14 | Sin conexión, `addDoc` no se resuelve y la interfaz queda en "Enviando..."; no hay cola local | `app.config.ts`, `order.service.ts` | Confirmado (código) | Alta | Depende de la señal | Aviso antes del sábado; offline-first en el Sprint 2 |
| A-15 | El aviso no suena con la primera comanda ni con las comandas actualizadas; además, el navegador puede bloquear el audio si nadie ha tocado la pantalla | `cashier-dashboard:611` | Confirmado (código) | Media | Alta | Antes del sábado |
| A-16 | Botones de billetes de $5 a $100, cuando los precios están en COP | `cashier-dashboard:399` | Confirmado (código) más el documento de diseño (precio 15000) | Media | Alta | Antes del sábado |
| A-17 | El ícono de Material Symbols se carga desde Google Fonts y el Service Worker no lo guarda en caché: sin red, los íconos se ven como texto (por ejemplo, "arrow_back") | `index.html`, `ngsw-config.json` | Riesgo (por verificar en el dispositivo) | Media | Media | Sprint 2 |
| A-18 | `src/app/shared/components/` **no está en git**, pero ya se importa: un clon del repo no compila | `git status` | Confirmado | Alta | Segura | Hoy |
| A-19 | La protección del admin principal compara contra `id === '1'`, que nunca coincide | `user-list.component.ts:274` | Confirmado (código) | Media | Media | Sprint 3 |
| A-20 | `environment.ts` y `environment.prod.ts` apuntan al **mismo** proyecto: no hay entorno de pruebas | `src/environments/*` | Confirmado | Alta | Segura | Sprint 2 |
| A-21 | Solo existe un archivo de pruebas (`toast.service.spec.ts`) | `src/**/*.spec.ts` | Confirmado | Alta | — | Desde el Sprint 2 |
| A-22 | `cashier-dashboard` tiene 916 líneas con 5 pantallas y 4 ventanas modales | — | Confirmado | Media (mantenimiento) | — | Sprint 4 |
| A-23 | El estado de mesa `pagando` nunca se usa; las mesas quedan en `ocupada` aunque la orden siga `pendiente` | `table.interface.ts` | Confirmado | Baja | — | Sprint 2 |
| A-24 | Detalles menores: `console.log` en cada actualización de órdenes · `lang="en"` · `user-scalable=no` · el manifest dice "restaurante-pos" con el color por defecto de Angular · los temporizadores de comanda no se refrescan solos · `confirmDirectSale` ignora los errores · hay dos diálogos de "salir" seguidos en la vista del mesero | varios | Confirmado | Baja | — | Sprint 2 / UX |
| A-25 | El bundle inicial pesa 690 kB, frente a un límite de 512 kB (mayormente Firebase) | `ng build` | Confirmado | Baja | — | Sprint 4 |
| A-26 | Node 25 (versión impar, sin soporte a largo plazo) | aviso del build | Confirmado | Baja | — | Sprint 2: pasar a Node 22 LTS |
| A-27 | El cálculo de impuestos y descuentos no existe | — | Confirmado | Por verificar (depende del régimen) | — | Fase 8 |

**Pendiente de verificar** (no se puede comprobar desde el código): la señal real en las terrazas, el modelo de los celulares, si el proyecto Firebase de tu app de finanzas es **otro** proyecto, y qué documento fiscal expide hoy el restaurante.

---

## 4. Arquitectura objetivo (evolución incremental)

### 4.1 Principios

- **No reescribir.** Se conservan Angular, Signals, la estructura `core/features/shared` y el uso de Firestore en tiempo real.
- **Separar en tres capas, de forma gradual:**
  - Componentes: solo la interfaz.
  - Servicios de dominio, como `OrderService`: las reglas del negocio.
  - Repositorios: el acceso a Firestore.

  Las funciones de cálculo (totales, vuelto, división) se mueven a archivos puros `*.logic.ts`, que se pueden probar sin Firebase.
- **El cliente propone y el servidor confirma lo que mueve dinero.**
  - Hasta tener Blaze, la defensa son las reglas de Firestore.
  - Con Blaze, el cierre de venta pasa por Cloud Functions.

### 4.2 Modelo de pedido corregido (base de T-05 y T-07, válido en Spark)

- Cada línea tiene un `line_id` único (`crypto.randomUUID()`), además de `agregado_por` y `agregado_en`.
- El mesero **nunca reescribe** `items`. Solo agrega líneas nuevas con `arrayUnion(...nuevas)` y suma con `increment(subtotalNuevas)`.
  - Son operaciones atómicas en el servidor, así que el recargo de página y la caja trabajando al mismo tiempo dejan de pisarse.
  - Reenviar es **idempotente**: como cada línea tiene su `line_id`, enviar dos veces no la duplica.
- El carrito se convierte en una vista que se calcula sola:
  - Líneas enviadas: salen de la orden en Firestore, siempre actualizadas, incluso después de recargar.
  - Líneas nuevas: viven solo en el dispositivo.
- Al crear una orden se genera el ID una sola vez (`doc(collection(...))`) y se usa `setDoc`. Si se reintenta, no aparece una orden duplicada.
- El cobro se hace en **una sola operación** con `writeBatch`:
  - `order_history/{mismoIdDeLaOrden}`: el ID repetido impide la doble venta.
  - Se borra `orders/{id}`.
  - La mesa queda libre **solo si no hay otra orden activa para esa mesa**.
- Para eliminar en caja se usa el `line_id` en vez del índice.

### 4.3 Turnos sin borrado (T-08)

- `config/turno_actual { inicio, abierto_por }`.
- Los listeners de `order_history` y `expenses` filtran con `where('fecha_cierre', '>=', inicio)`. Esto también resuelve el problema de costos A-13.
- Cerrar el turno crea `shifts/{id}` con el resumen (totales, desglose por producto, gastos, cuadre de caja) y mueve `turno_actual.inicio`. **No borra nada.**
- El dashboard del admin consulta por rango de fechas: hoy, la semana o el mes.

### 4.4 Autenticación y autorización

| Etapa | Mecanismo | Plan | Qué protege |
|---|---|---|---|
| **Sábado (T-04a/b)** | Una **cuenta de dispositivo** en Firebase Auth (correo y contraseña) que el dueño inicia una vez en cada equipo. Después se entra con el PIN, como hoy. Las reglas exigen `request.auth != null` y que el UID esté en `devices/{uid}`. Sin PINs maestros. `order_history` y `shifts` solo admiten crear, nunca editar ni borrar | Spark | Bloquea a los extraños de internet y el borrado de ventas. **No impide** que un empleado con un celular autorizado se haga pasar por otro rol |
| **Sprint 3 (con Blaze)** | La Cloud Function `loginWithPin(restaurantId, pin)` compara contra el PIN **cifrado** (un *hash* que no se puede revertir) en `staff_private`, que el cliente no puede leer. Limita los intentos y emite un *custom token* con los permisos `{rid, role}` (*custom claims*). Las reglas validan el rol en cada operación | Blaze (dentro de la cuota gratuita) | Roles reales verificados en el servidor y fin de la manipulación de `localStorage` |
| **Sprint 3** | La Cloud Function `closeSale(orderId, pago)` recalcula el total con los precios del producto, escribe la venta y el registro de auditoría, y libera la mesa | Blaze | Totales y precios que el cliente no puede falsear |
| Opcional | Firebase App Check (gratis, con cuotas según el proveedor) | Spark/Blaze | Frena el abuso de la configuración pública desde fuera de la app |

### 4.5 Trazabilidad, respaldos, entornos y pruebas

- **Auditoría:** colección `audit` donde solo se puede agregar (las reglas permiten crear, nunca editar ni borrar). Registra la eliminación de ítems en caja, anulaciones, cierres de turno y cambios de precio.
- **Respaldos:**
  - Hoy (Spark): un script local con el Admin SDK que exporta las colecciones a JSON cada semana. Consume lecturas.
  - Con Blaze: copias programadas de Firestore (diarias o semanales, retención de hasta 14 semanas) y PITR (recuperar el estado de cualquier momento de los últimos 7 días). Ambas cuestan; **hay que confirmar el precio vigente antes de activarlas.**
- **Entornos:** dos proyectos, `senor-hornado-dev` y el de producción, y el **Emulator Suite** de Firebase para trabajar en local (necesita Java, que ya tienes).
- **Pruebas:**
  - Jasmine para los archivos `*.logic.ts` y los servicios.
  - `@firebase/rules-unit-testing` para las reglas. Es la única dependencia nueva y se justifica porque prueba la seguridad.
  - Pruebas automáticas de punta a punta con Playwright, más adelante.

---

## 5. Varios restaurantes (Fase 4, solo diseño, se implementa después del Sprint 3)

### 5.1 Alternativas para separar los datos

| Opción | Ventajas | Desventajas | Veredicto |
|---|---|---|---|
| **A. Subcolecciones `restaurants/{rid}/orders/...`** | Reglas simples: una sola condición, `request.auth.token.rid == rid`. Es casi imposible filtrar datos por olvidar un `where`. Se exporta o borra un restaurante completo con facilidad | Las métricas globales necesitan *collection group queries* o contadores agregados | ✅ **Recomendada** |
| B. Colecciones raíz con un campo `restaurantId` | Facilita las consultas globales | Cada consulta y cada regla deben filtrar bien, y un olvido expone datos de otra empresa | ❌ Más riesgo |
| C. Un proyecto Firebase por restaurante | Aislamiento total y cuotas gratuitas separadas | Despliegues y reglas multiplicados y un panel global complejo: no se mantiene con un equipo de una persona | ❌ No por ahora |

### 5.2 Modelo propuesto

```
platform/                         ← solo tú (claim platform_admin)
  restaurants_index/{rid}         ← nombre, estado, plan, contadores agregados
restaurants/{rid}                 ← nombre, NIT, estado: activo|suspendido|baja, config
  ├─ staff/{uid}                  ← nombre, rol, activo (sin PIN)
  ├─ staff_private/{uid}          ← hash del PIN (ilegible para clientes)
  ├─ products/{id}  · categories/{id} · areas/{id} · tables/{id}
  ├─ orders/{id}    · sales/{id}  · shifts/{id} · expenses/{id}
  ├─ audit/{id}     (append-only)
  └─ devices/{uid}
```

- **Reglas base:** `match /restaurants/{rid}/{doc=**} { allow read: if request.auth.token.rid == rid && ... }`, con validaciones por rol en cada colección. Hay **pruebas automáticas** que intentan leer con un `rid` ajeno y deben fallar.
- **Suspensión:** el campo de estado del restaurante pasa a suspendido, se revocan los tokens y los claims se marcan como suspendidos. Así no hace falta leer el documento del restaurante en cada operación (cada `get()` en una regla cuenta como lectura).
- **Altas:** la Function `createRestaurant` (solo para `platform_admin`) crea el restaurante y el primer administrador, y deja una guía inicial en tres pasos: menú, mesas y personal.
- **Bajas:**
  1. Se exportan los datos (JSON o CSV) para entregarlos al restaurante.
  2. Se hace una baja lógica.
  3. Se conservan los registros de ventas durante el plazo legal (**hay que verificarlo con un contador**; la norma comercial suele hablar de años, no de meses) y después se borran de forma definitiva.
- **Panel global:** una ruta perezosa `/plataforma`, protegida por claim. Muestra el estado y los contadores **agregados** de cada restaurante, sin abrir sus ventas en detalle.
- **Migración desde la estructura actual:** como los datos actuales son de prueba, se migra en limpio. Se crea `restaurants/senor-hornado` y se mueven las colecciones. Los servicios reciben el `rid` desde la sesión, de modo que se cambia una ruta base y no cada componente.
- **Dependencias:** Blaze y Functions (Sprint 3), auditoría y pruebas de reglas.

---

## 6. Plan de costos (Firebase)

### 6.1 Límites vigentes, verificados en firebase.google.com/pricing el 20 de octubre de 2026

| Servicio | Spark (gratis, **se corta** al superar el límite) | Blaze (mismas cuotas gratis, **cobra** el excedente) |
|---|---|---|
| Firestore | 1 GiB almacenado · 50.000 lecturas, 20.000 escrituras y 20.000 borrados **por día** · 10 GiB/mes de salida | El excedente se cobra según la tarifa de Google Cloud, que varía por región |
| Hosting | 10 GB almacenados · **360 MB/día** de transferencia | $0,026/GB almacenado · $0,15/GB transferido |
| Authentication | 50.000 usuarios activos al mes | El SMS por teléfono se cobra por mensaje (**no lo usaremos**) |
| Cloud Functions | **No disponible** | 2 millones de invocaciones al mes gratis, luego $0,40 por millón · requiere tarjeta |
| Cloud Storage | Desde el 3 de febrero de 2026 **requiere Blaze** según varias fuentes (no está confirmado en la página oficial) | — (no se usa: no subimos imágenes) |
| Copias y PITR | No figuran en la página de precios | Cuestan; **hay que verificar el precio antes de activarlas** |

### 6.2 Qué usamos hoy

Firestore, Hosting y el Service Worker. Firebase Auth está configurado, pero el login no lo usa.

### 6.3 Escenario estimado para Señor Hornado (supuestos explícitos)

**Supuestos:** 5 dispositivos (4 meseros y 1 caja), 80 comandas al día, unas 5 escrituras por comanda, cada equipo abre o recarga la app 10 veces al día, menú de unos 60 productos y 15 mesas.

| Concepto | Hoy (sin filtrar el historial) | Tras T-08 (solo el turno actual) |
|---|---|---|
| Lecturas al abrir la app | 5 × 10 × (60 + 15 + 10 + **todo el historial**) | 5 × 10 × ~170 ≈ 8.500 |
| Lecturas por cambios en vivo | ~400 escrituras × 5 equipos ≈ 2.000 | ≈ 2.000 |
| **Total diario** | Mes 1: ~15.000 · **mes 3 (unas 7.200 ventas): más de 360.000, el sistema se corta en Spark** | **≈ 10.000–12.000 (alrededor del 25 % de la cuota)** |
| Escrituras al día | ~500 (2,5 % de la cuota) | ~500 |

**Conclusión:** para un restaurante pequeño, el plan Spark alcanza **si se corrige A-13**. El riesgo económico real no es el precio. Es un error de código que se repita en bucle (un listener o un efecto que escribe sin parar) o una consulta sin filtro. En Spark eso **corta el servicio a mitad del turno**; en Blaze **cobra**.

### 6.4 Cuándo pasar a Blaze

Cuando hagan falta Functions (Sprint 3) o haya más de 3 o 4 restaurantes en el proyecto.

- **Cálculo de referencia:** 10 restaurantes × 12.000 lecturas ≈ 120.000 al día, unas 70.000 por encima de la cuota. Eso son unos 2,1 millones de lecturas al mes, que a ~$0,03 por cada 100.000 (tarifa de referencia de terceros) da **menos de 1 USD al mes**. Hay que confirmar la tarifa de la región.
- **Tu app de finanzas:** las cuotas de Spark son **por proyecto**, así que no consume la cuota del POS si está en otro proyecto (**confirmar**). Blaze se activa proyecto por proyecto, así que puedes activarlo solo en el POS.

### 6.5 Controles de costos

- Revisar a diario la pestaña *Usage* de Firestore durante el piloto.
- **Con Blaze:**
  - Configurar una alerta de presupuesto en Cloud Billing (por ejemplo, 1 USD y 5 USD). **Ojo: la alerta solo avisa, no detiene los cargos.**
  - Opcional: una función que desactive la facturación al superar el presupuesto. Es un patrón oficial de Google, pero tiene consecuencias.
- **En el código:**
  - Consultas siempre filtradas y con límite.
  - Los listeners solo existen en las vistas que los necesitan; quitar del celular del mesero el historial de ventas.
  - Nunca escribir dentro de un `effect()`.
  - Contadores agregados en vez de recorrer colecciones.

---

## 7. Hoja de ruta por fases y sprints

| Sprint | Fecha aproximada | Objetivo | Entregable verificable |
|---|---|---|---|
| **S1: Piloto seguro** | 20 al 23 de octubre | Integridad de pedidos y ventas, acceso mínimo, datos reales | Guion P-01 a P-21 ejecutado y decisión de GO o NO-GO |
| Piloto | 24 de octubre | Operación real | Registro de incidencias |
| **S2: Estabilización** | 2 semanas | Corregir lo aprendido · offline-first real (`persistentLocalCache` y estado de "pendiente de sincronizar") · íconos en caché · proyecto `-dev` y emuladores · primeras pruebas unitarias y de reglas · Node 22 LTS · unir y dividir robustos (por línea y por cantidad) · estado de mesa `pagando` | Pruebas automáticas en verde y un segundo piloto sin incidencias críticas |
| **S3: Seguridad profesional** | 2–3 semanas | Blaze con alertas · `loginWithPin` con hash, límite de intentos y claims · `closeSale` en el servidor · auditoría · reglas por rol · copias programadas | Las pruebas de reglas demuestran que un mesero no puede cobrar ni borrar ventas, y que alguien sin sesión no puede ni leer |
| **S4: Calidad y UX** | 2 semanas | Dividir `cashier-dashboard` · sistema de diseño con *tokens* · modo de alto contraste para usar al sol · estados de carga y error coherentes · bundle más liviano | Prueba de usabilidad con el personal real: una comanda en menos de 30 s sin ayuda |
| **S5: Varios restaurantes** | 3–4 semanas | Migración a `restaurants/{rid}` · `createRestaurant` · panel `/plataforma` · suspensión y exportación | Pruebas automáticas de aislamiento entre dos restaurantes de prueba |
| **S6: Preparación comercial** | Continuo | Documentación, términos y privacidad (con abogado), modelo de precios con entrevistas, integración DIAN con un proveedor autorizado (con contador), soporte | Primer restaurante externo en piloto |

**Dependencias clave:**

- T-05 va antes de T-07, y T-07 antes de unir y dividir.
- T-08 va antes de los reportes.
- Blaze va antes de S3, y S3 antes de S5. Multi-tenant nunca va antes de auth con claims.
- La DIAN va antes de vender a restaurantes que estén obligados a facturar electrónicamente.

### 7.1 Funcionalidades futuras (Fase 6)

| Funcionalidad | Tipo | Valor | Dificultad | Riesgo | Costo operativo | Prioridad |
|---|---|---|---|---|---|---|
| Offline-first real | Necesaria (terrazas) | Muy alto | Media | Medio | Bajo | S2 |
| Auditoría e historial de anulaciones | Necesaria (antifraude) | Alto | Baja | Bajo | Bajo | S3 |
| Turnos y cuadre de caja con arqueo | Necesaria | Alto | Baja | Bajo | Bajo | S2 |
| Unir y dividir por cantidad | Necesaria | Alto | Media | Medio | Bajo | S2 |
| Impresión de tickets en impresora térmica | Ventaja | Alto | Media-alta (Web Bluetooth/USB o un puente local) | Medio | Hardware | Después de S4, según la demanda |
| Integración DIAN mediante proveedor autorizado | **Necesaria para vender** a quienes están obligados | Muy alto | Alta | Alto (legal) | **Cobro por documento del proveedor** | S6, con contador |
| Reportes por rango de fechas y exportación a CSV | Ventaja | Alto | Baja | Bajo | Bajo | S2–S4 |
| Vista de cocina | Ventaja (otros restaurantes) | Medio | Media | Bajo | Lecturas adicionales | Después de S5 |
| Áreas o terrazas y mapa de mesas | Ventaja | Medio | Media | Bajo | Bajo | S4 |
| Inventario de insumos y recetas | Lujo prematuro | Medio | Alta | Medio | Medio | Después de tener clientes pagando |
| Planes de suscripción y cobro automático | Lujo prematuro | — | Alta | Alto | Comisiones | Cuando haya más de 5 clientes |
| Indicadores del dueño (ticket promedio, horas pico) | Ventaja | Medio | Baja | Bajo | Bajo | S4 |
| Notificaciones push | Lujo prematuro | Bajo | Media | Bajo | Bajo | Más adelante |

### 7.2 UI/UX (Fase 5): mejoras justificadas

1. **Velocidad del mesero:** una barra fija de "Comanda (n) · $total" abajo, al alcance del pulgar. Los productos más usados van primero. Los controles miden como mínimo 48 px. Se elimina el diálogo de salida duplicado (A-24).
2. **Prevención de errores:** las confirmaciones quedan solo para acciones destructivas o de dinero. Para lo demás, un "Deshacer" de 5 segundos. El candado 🔒 debe verse bien. Al enviar a caja, se muestra un resumen de lo nuevo.
3. **Trabajo al sol:** un modo de alto contraste, sin degradados ni transparencias en la vista del mesero, y texto de al menos 16 px.
4. **Caja:** teclado numérico grande para el efectivo, billetes en COP y el vuelto en grande. Un aviso visible para activar el sonido, porque el navegador exige tocar la pantalla primero. Temporizadores que se actualizan solos.
5. **Estados:** cada acción tiene un estado de cargando, de confirmado (✔ con la hora) y de error con una salida clara. Siempre hay un indicador de conexión visible.
6. **Identidad:** *tokens* de color y tipografía propios de Señor Hornado. El manifest y el `theme-color` deben coincidir. Se usa `lang="es"` y se quita `user-scalable=no`.
7. **Validación:** observar al personal el sábado (dónde dudan y dónde se equivocan) en lugar de suponer. Eso alimenta el Sprint 4.

### 7.3 Preparación para vender (Fase 8)

- **Producto:**
  - Alta guiada de nuevos restaurantes (menú, mesas y personal en menos de 30 minutos).
  - Manual de una página por rol.
  - Canal de soporte, como un WhatsApp dedicado, con horario definido.
  - Actualizaciones con el aviso de "nueva versión disponible" del Service Worker (`SwUpdate`).
- **Confiabilidad:** copias verificadas con una restauración de prueba, un procedimiento documentado de recuperación ante fallos y un estado del servicio.
- **Legal (requiere asesoría profesional, aquí no invento nada):**
  - **Contador:** qué documento fiscal debe emitir cada cliente (la Resolución DIAN 000165 de 2023 creó el documento equivalente POS electrónico, sus plazos vencieron en 2024 y hoy está compilado en la Resolución Única 000227 de 2025), impuesto al consumo o IVA en restaurantes, y plazo de conservación de los registros.
  - **Abogado:** términos del servicio, política de tratamiento de datos (Ley 1581 de 2012: tú serías el "encargado" y el restaurante el "responsable") y tu figura legal para facturar el servicio.
- **Negocio:**
  - **No invento precios de mercado.** Primero hay que entrevistar a 5–10 restaurantes del municipio: qué usan, cuánto pagan, qué les molesta y si están obligados a facturar electrónicamente.
  - Calcular el costo por cliente: Firebase (≈ $0 a centavos), el proveedor DIAN (por documento) y tu tiempo de soporte.
- **Métricas de valor:**
  - Tiempo de la toma de pedido hasta la caja.
  - Diferencias en el cuadre de caja.
  - Ítems anulados.
  - Comandas perdidas (objetivo: 0).
  - Satisfacción del personal.

---

## 8. Primer sprint: tareas detalladas

> Método: un tablero Kanban con las columnas *Por hacer, En curso, En verificación y Hecho*. **Hecho** significa que el código está escrito, `ng build` compila, pasaron las pruebas indicadas y la verificación quedó anotada. Cada tarea va en su propio commit. Las correcciones críticas nunca se mezclan con cambios visuales.

**T-01 · Guardar el estado actual** · Crítica · 15 min
- **Problema:** `shared/components/` no está en git (A-18) y hay 15 archivos modificados sin commit.
- **Implementación:**
  1. Agregar `.venv/` y `coverage/` a `.gitignore`.
  2. Commit de "estado previo al piloto".
  3. Crear la rama `piloto-sabado`.
  4. Poner un tag de la versión actual para poder volver atrás.
- **Aceptación:** `git status` queda limpio y un clon nuevo compila.

**T-02 · Quitar PINs maestros y botones de demo** · Crítica · 45 min
- **Archivos:** `auth.service.ts`, `login.component.ts`.
- **Implementación:**
  - Eliminar `defaultUsers` y el bloque de botones `fillPin`.
  - Si Firestore falla, mostrar "Sin conexión" en lugar de entrar.
- **Riesgo:** quedarse sin admin. Antes de desplegar hay que crear un admin real en Firestore (va con T-13).
- **Pruebas:** P-01 y P-02.
- **Aceptación:** el PIN `1234` se rechaza si no existe y el login no muestra ningún PIN.

**T-04a · Reglas mínimas de Firestore** · Crítica · 1–1,5 h (con T-04b)
- **Archivo:** `firestore.rules`.
- **Implementación:**
  - Exigir una cuenta de dispositivo registrada.
  - `order_history`, `shifts` y `audit`: solo crear, nunca editar ni borrar.
  - Denegar todo lo demás por defecto.
- **Prueba:** con el emulador, más P-21.
- **Aceptación:** una escritura sin sesión se rechaza, el borrado de una venta se rechaza y el flujo normal sigue funcionando.

**T-04b · Cuenta de dispositivo (Firebase Auth)** · Alta · 2 h
- **Archivos:** `auth.service.ts`, un nuevo `device-setup.component.ts`, `app.routes.ts` y los guards.
- **Implementación:** si no hay sesión de Firebase Auth, se muestra la pantalla "Activar este equipo" con el correo y la contraseña que tiene el dueño. La sesión persiste. Después aparece el PIN, como hoy.
- **Riesgo:** bloquear al personal el sábado. Por eso se activan los equipos el viernes.
- **Aceptación:** un navegador nuevo no puede leer el menú sin activarse primero.

**T-05 · Pedidos por líneas con ID (corrige A-05, A-06 y A-07)** · Crítica · 4 h
- **Archivos:**
  - `order.service.ts`.
  - `order-taking.component.ts`, la plantilla que usa `items()` e índices.
  - `order.interface.ts`, que recibe `line_id`, `agregado_en` y `agregado_por`.
  - La eliminación en caja dentro de `cashier-dashboard`.
- **Implementación:** según la sección 4.2.
  - Las líneas enviadas se leen en vivo desde la orden y las nuevas viven en el dispositivo.
  - Para guardar se usa `arrayUnion` con `increment`.
  - `addToCart(product, note, qty)` solo combina líneas nuevas entre sí.
  - Para eliminar en caja se usa una transacción que filtra por `line_id` y recalcula el subtotal.
  - Las órdenes antiguas sin `line_id` se descartan, porque son datos de prueba.
- **Pruebas:** P-03, P-05, P-06, P-07 y P-08, más pruebas unitarias del cálculo de totales en `order.logic.ts`.
- **Aceptación:** ninguna recarga ni concurrencia hace perder o revivir líneas.

**T-07 · Cobro atómico e idempotente** · Crítica · 3 h
- **Archivos:** `order.service.ts` (`closeOrder`, `createDirectSaleOrder`, `mergeTables`, `splitOrder`) y `cashier-dashboard` (un estado `isPaying` y el manejo de errores en la venta directa).
- **Implementación:**
  - `writeBatch` con la venta en `order_history/{orderId}`.
  - La mesa queda libre solo si no tiene otras órdenes.
  - Dividir copia las líneas con `line_id`.
  - Se corrige la mutación causada por `.sort()`.
- **Pruebas:** P-09, P-10, P-12, P-13, P-14 y P-15.
- **Aceptación:** con doble toque o un corte de red hay como máximo una venta por orden, y la suma del historial coincide con lo cobrado.

**T-08 · Turnos archivados sin borrado (corrige A-11, A-12 y A-13)** · Crítica · 3–4 h
- **Archivos:**
  - `order.service.ts` y `petty-cash.service.ts`, para que los listeners filtren por fecha.
  - `cashier-dashboard` (`closeShift`) y `admin-dashboard`: se quita el botón "Borrar historial" y se agrega un filtro de fechas.
  - Un nuevo `shift.service.ts`.
- **Implementación:** según la sección 4.3. El historial deja de escucharse en las vistas del mesero.
- **Pruebas:** P-16 y P-17, más comprobar en la consola de Firebase que siguen las ventas del turno cerrado.
- **Aceptación:** cerrar el turno no borra ningún documento, y el turno nuevo arranca en 0 en caja sin que el admin pierda el histórico.

**T-09 · Billetes en COP** · Alta · 15 min
- **Archivo:** `cashier-dashboard`.
- **Cambio:** los botones pasan a 2.000, 5.000, 10.000, 20.000, 50.000 y 100.000, más el botón "Exacto".
- **Prueba:** P-09.

**T-10 · Aviso de comandas confiable** · Alta · 1 h
- **Archivo:** `cashier-dashboard`.
- **Implementación:**
  - Detectar los IDs nuevos y las órdenes con `actualizado_en` más reciente, en lugar de comparar cuántas hay.
  - Suena también con la primera comanda.
  - Un botón "🔔 Activar sonido" al entrar, por la política de audio de los navegadores.
- **Prueba:** P-03, incluida la primera comanda del día.

**T-11 · Conexión honesta** · Alta · 1,5 h
- **Archivos:** un nuevo `connection.service.ts`, `order-taking` y los layouts.
- **Implementación:**
  - Indicador visible de conectado o sin conexión.
  - Si no hay conexión, el envío se bloquea con el mensaje "No enviado".
  - Si no hay confirmación en 10 s, aparece el aviso "No confirmado, confirma con caja". Gracias a T-05, reenviar no duplica.
- **Prueba:** P-11.

**T-12 · Limpieza menor** · Baja · 20 min
- Quitar el `console.log`, poner `lang="es"`, nombre y color reales en el manifest, y quitar `user-scalable=no`.
- Va en un commit separado de los cambios de lógica.

**T-13 · Datos reales** · Crítica · 1–2 h (contigo y el dueño)
- Borrar los datos de prueba.
- Cargar el menú con los precios reales, las mesas y el personal con PINs únicos (incluido un admin real).
- Registrar los dispositivos.
- **Aceptación:** el dueño revisa los precios del menú en pantalla y los aprueba.

**T-14 · Despliegue y activación de equipos** · Crítica · 1 h
- `ng build` y luego `firebase deploy --only hosting,firestore:rules`.
- En cada celular: abrir la app, instalar la PWA, activar el equipo y comprobar que tiene la versión nueva, recargando para que el Service Worker se actualice.
- **Aceptación:** todos los equipos muestran la misma versión.

**T-15 · Ensayo general y decisión** · Crítica · 2 h
- Ejecutar P-01 a P-21 y aplicar los criterios de la sección 2.4.
- **Evidencia:** la tabla de resultados queda guardada en `docs/piloto-2026-10-24.md`.

**Cómo verifico cada tarea:**

1. Explico el objetivo antes de tocar el código.
2. Hago el cambio mínimo.
3. Ejecuto `ng build` y `ng test`.
4. Corro las pruebas de reglas en el emulador cuando corresponde.
5. Pruebo manualmente los casos indicados en el navegador, en la vista móvil, y al final en los dispositivos reales.
6. Reviso el diff para descartar regresiones.

---

## 9. Información pendiente (lo mínimo)

1. **Señal en las terrazas:** ¿hay Wi-Fi o datos en las 3? Si se puede, haz P-20 antes del viernes.
2. **Menú real:** la lista de productos con precios y categorías. ¿Los precios ya incluyen el impuesto al consumo o el IVA?
3. **Personal del sábado:** cuántos meseros y cajeros habrá, y qué celulares tienen (Android o iPhone, y su antigüedad).
4. **Qué documento fiscal entrega hoy el restaurante** (factura en papel, tiquete POS, factura electrónica) y si tiene contador.
5. **¿Tu app de finanzas está en otro proyecto de Firebase?** Esto confirma que las cuotas no se comparten.
6. **¿El dueño del restaurante está de acuerdo** con el piloto y con el procedimiento de respaldo en papel?

---

## Fuentes consultadas

- [Firebase Pricing (oficial)](https://firebase.google.com/pricing): cuotas de Spark y Blaze, consultado el 20 de octubre de 2026.
- [Cloud Functions FAQ (oficial)](https://firebase.google.com/docs/functions/faq-and-troubleshooting): cuota gratuita en Blaze.
- [Firestore disaster recovery (oficial)](https://firebase.google.com/docs/firestore/disaster-recovery): copias de hasta 14 semanas y PITR de 7 días.
- [Magora: Firebase pricing 2026](https://magora-systems.com/firebase-pricing/) y [DEV: Spark vs Blaze](https://dev.to/androve2k/spark-vs-blaze-the-firebase-pricing-guide-i-wish-id-read-sooner-onb): cambio de Cloud Storage de febrero de 2026, fuente de terceros que hay que confirmar.
- [Siemprealdia: calendario de facturación electrónica](https://siemprealdia.co/colombia/calendario-del-sistema-de-facturacion-electronica/), [Sovos: documento equivalente POS electrónico](https://sovos.com/co/iva/documento-equivalente-electronico-pos/) y [DIAN, comunicado 013 de 2024](https://www.dian.gov.co/Prensa/Paginas/NG-Comunicado-de-Prensa-013-2024.aspx): contexto fiscal; **requiere validación de un contador**.

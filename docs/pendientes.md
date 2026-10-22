# Pendientes: lo que queda para más adelante

> Aquí se anota todo lo que se decidió **no** hacer todavía y por qué.
> Las secciones van ordenadas por cuándo tiene sentido hacerlo.
> Cada punto dice qué se gana y qué cuesta.

## A. Cuando pases a un plan de pago (Blaze)

Blaze cobra por uso, pero mantiene las mismas cuotas gratis. Hay que poner alertas de presupuesto desde el primer día.

| Pendiente | Por qué todavía no | Qué se gana |
|---|---|---|
| **Roles validados en el servidor** con Cloud Functions y *custom claims* (`rid`, `rol`) | Las Functions requieren Blaze | Hoy el rol (mesero, cajero o admin) se valida en el dispositivo: alguien con conocimientos técnicos y un equipo activado podría hacerse pasar por otro rol **dentro de su restaurante**. Con claims, las reglas lo bloquean |
| **Login por PIN en el servidor** (`loginWithPin`): PIN cifrado y límite de intentos | Requiere Functions | Hoy los PINs se guardan legibles para los equipos activados del mismo restaurante |
| **Cierre de venta en el servidor** (`closeSale`), recalculando el total con los precios del catálogo | Requiere Functions | Que nadie pueda registrar una venta con precios alterados |
| **Reglas sin lecturas extra:** pasar de `get()` sobre `devices/` a claims del token | Requiere Admin SDK (Functions) | Cada operación ahorra 1–2 lecturas facturables |
| **Copias de seguridad programadas** y recuperación a un momento anterior (PITR) | Tienen costo; hay que verificar el precio vigente | Recuperarse de un borrado o error grave |
| **Métricas globales por restaurante** (ventas del día, último uso) con contadores que actualiza una Function | Requiere Functions | Un panel de plataforma con indicadores sin leer las ventas de cada restaurante |
| **Eliminar cuentas de Authentication** al dar de baja un restaurante | Desde el cliente solo se puede desactivar, no borrar cuentas ajenas | Una baja limpia |

## B. Mejoras que no requieren pagar (Sprint 2 en adelante)

- **Modo sin conexión real:** guardar el pedido en el celular y enviarlo al volver la señal (`persistentLocalCache` más un estado de "pendiente de sincronizar").
- **Notas de preparación en la caja:** el detalle del cobro no muestra "sin ensalada".
- **Dividir la cuenta por cantidad:** cobrar 1 de 3 cervezas.
- **Categorías del menú por restaurante:** hoy son fijas (almuerzos, bandejas, platos, sopas, bebidas y porciones).
- **Pruebas automáticas de punta a punta** con Playwright.
- **Dividir `cashier-dashboard`**, que tiene más de 900 líneas, en componentes más pequeños.
- **Bundle más liviano:** hoy pesa unos 700 kB, frente al límite configurado de 512 kB.
- **Node 22 LTS** en lugar de Node 25.
- **Texto de notas con poco contraste** en la ventana de producto del mesero.
- **Proyecto de pruebas separado** (`-dev`) en Firebase, además del emulador local.
- **Actualizaciones de la app:** desde el 21 de octubre se aplican solas, sin aviso: al abrir la app o al pasar por una pantalla segura (PIN, bienvenida o plataforma), nunca en medio de un pedido (`core/pwa/app-update.service.ts`). Falta confirmarlo en un celular real.
- **Zoom bloqueado** por pedido del dueño. Quien necesite letra más grande no puede ampliar; si alguien lo pide, se agrega un tamaño de letra configurable.
- **Probar en celulares reales el ingreso con Google:** sobre todo en iPhone con la app instalada en la pantalla de inicio, donde las ventanas emergentes de Google a veces fallan. Si pasa, se cambia a `signInWithRedirect` con el dominio de autenticación propio.
- **Proveedor Anónimo:** no se pudo comprobar en producción sin crear una cuenta. Se comprueba la primera vez que un mesero abra el enlace del restaurante.
- **Lista de celulares vinculados por restaurante**, para que el admin pueda desvincular uno perdido. Hoy, generar un enlace nuevo solo evita celulares nuevos.
- **Celulares anónimos que nunca se usaron:** quedan como cuentas sin uso en Authentication. Limpiarlas requiere Admin SDK (sección A).
- **Verificación del equipo más rápida al abrir:** hoy tarda 2–4 s porque espera Firebase Auth y dos lecturas (`platform_admins` y `devices`). Se puede guardar el último resultado en el dispositivo y verificarlo en segundo plano.
- **Logo propio por restaurante:** hoy se muestra el nombre en texto. Subir imágenes requiere Cloud Storage, que desde febrero de 2026 exige Blaze, así que va en la sección A.
- **Dominio propio** (por ejemplo `kinopos.com`): hoy la app está en `kino-pos.web.app`, gratis. Un dominio cuesta la compra anual y se conecta en Hosting sin pagar Blaze.
- **Nombre en la ventana de Google:** al ingresar con Google aparece `senor-hornado-pos-8412.firebaseapp.com`. Para que diga KINO-POS hay que cambiar el nombre público del proyecto en la consola (Configuración del proyecto) y, para el dominio, usar uno propio.
- **Cuentas antiguas de correo (`equipos@senorhornado.app` y las que se hayan creado con el flujo de correo y contraseña):** quedó sin uso, porque no pertenece a ningún restaurante y no tiene acceso. Se puede borrar desde la consola de Authentication cuando quieras.
- **Varias cuentas en un mismo celular Android:** en Android las apps instaladas desde el mismo sitio comparten la sesión, así que un celular es de la plataforma **o** de un restaurante, no de los dos. En iPhone sí funciona, porque cada app tiene su propio almacenamiento. Solución futura: sesiones separadas por restaurante (una instancia de Firebase Auth por app).
- **Un dueño con varios restaurantes en la misma cuenta de Google:** hoy cada cuenta administra un solo restaurante, porque el equipo queda vinculado a uno. Para varios locales habría que agregar un selector de restaurante.
- **Más de un administrador de plataforma** (por ejemplo, un socio o soporte): hoy solo existe el dueño.
- **Editar el nombre de un restaurante y cambiar la contraseña de su cuenta** desde el panel de plataforma. Hoy solo se puede crear, suspender, reactivar y agregar administradores.

## C. Antes de vender a otros restaurantes (requiere asesoría)

- **Facturación electrónica DIAN**, con un proveedor tecnológico autorizado. Hay que confirmar con un contador qué documento debe emitir cada cliente.
- **Términos del servicio y política de tratamiento de datos** (Ley 1581 de 2012), con un abogado.
- **Plazo legal de conservación de los registros de venta:** confirmar con un contador antes de permitir bajas definitivas.
- **Modelo de precios:** primero entrevistar a 5–10 restaurantes del municipio.

## D. Decisiones tomadas (para recordar el porqué)

- **21 de octubre de 2026:** se construye la plataforma multi-restaurante dentro del plan gratuito (Spark). Las reglas usan `get()` sobre `devices/{uid}`, aceptando 1–2 lecturas extra por operación, porque los *custom claims* requieren Blaze.
- **21 de octubre de 2026:** el dueño de la plataforma **no** puede leer ventas, órdenes ni gastos de los restaurantes, por privacidad. Solo administra restaurantes, cuentas y el primer admin.
- **21 de octubre de 2026:** el producto se llama **KINO-POS** y vive en `kino-pos.web.app`. La dirección anterior queda solo como redirección. Cada restaurante instala "su" app con nombre e ícono propios, generados en el navegador (sin Storage ni costo).

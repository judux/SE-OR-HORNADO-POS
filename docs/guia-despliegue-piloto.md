# Guía de uso: plataforma, restaurantes y personal

> Todo se hace desde la app. No hace falta entrar a la consola de Firebase. El despliegue lo hace Claude (`npm run deploy`).
> **Requisito (una sola vez):** en Firebase Authentication deben estar habilitados los proveedores **Google** y **Anónimo**.

## Quién entra y cómo

| Quién | Dónde | Cómo |
|---|---|---|
| **Tú** (dueño de la plataforma) | `https://kino-pos.web.app/plataforma` (ningún botón lleva ahí) | Con tu cuenta de Google |
| **Dueño o admin de un restaurante** | El enlace de registro que le envías (`/registro`) y luego la dirección normal de la app | Con su cuenta de Google. La primera vez crea su PIN; después solo se le pide el PIN |
| **Meseros y cajeros** | El enlace único de su restaurante, que les comparte el admin | Sin cuenta de Google: abren el enlace y entran con el PIN que el admin les creó |

## 1. Reclamar la plataforma (una sola vez)

1. Abre `/plataforma` y pulsa **Continuar con Google**.
2. Pulsa **Ser el dueño de la plataforma**. Después de esto nadie más puede reclamarla.

## 2. Registrar un restaurante

1. En tu panel, copia el **enlace de registro** y envíaselo al dueño del restaurante. Tú también lo puedes usar para registrar Señor Hornado.
2. Él entra con Google y llena el nombre del restaurante y el suyo. Queda "en revisión".
3. En tu panel aparece en **Solicitudes pendientes** → **Aprobar**. Puedes ajustar los nombres y, solo para Señor Hornado, marcar **"Copiar el menú y las mesas de la versión anterior"**.
4. Él vuelve a entrar con Google, **crea su PIN** escribiéndolo dos veces y queda en su panel de administración.

## 3. El admin carga su menú y sus mesas

1. En **Menú → Agregar producto** crea cada producto con su precio y categoría. Se puede editar o marcar como agotado en cualquier momento.
2. En **Mesas → Nueva mesa** crea las mesas del local.

## 4. El admin incorpora a su personal

1. En **Personal → Nuevo usuario** crea a cada mesero y cajero con su PIN.
2. En la misma pantalla está el **enlace para tu personal**: **Copiar** o **Compartir** (por ejemplo, por WhatsApp).
3. Cada empleado abre el enlace en su celular → su celular queda vinculado a **ese** restaurante → entra con su PIN.
4. Si el enlace se filtra: **Generar enlace nuevo**. El viejo deja de servir para celulares nuevos; los que ya están vinculados siguen funcionando.

## Si algo sale mal

| Problema | Qué hacer |
|---|---|
| La app se ve como la versión anterior | Ciérrala y vuelve a abrirla (el celular guarda la versión anterior hasta recargar) |
| "Enlace no válido" | El admin generó uno nuevo o el restaurante está suspendido: pide el enlace actual |
| El admin olvidó su PIN | En tu panel, en su restaurante: **Restablecer PIN del admin**. Al entrar con Google elige uno nuevo |
| Un empleado olvidó su PIN | El admin lo cambia en **Personal** |
| "Restaurante suspendido" | Reactívalo desde tu panel |
| "PIN incorrecto" | Los PINs de un restaurante no sirven en otro; revisa que el celular esté vinculado al restaurante correcto |
| Volver a la versión anterior | Pídeselo a Claude o, en la consola, **Hosting → Historial de versiones → Revertir** |

## Para desarrollo (emulador local)

```bash
npm run emulators
```

```bash
node scripts/seed-emulator.mjs --demo
```

```bash
npm run start:emu
```

En el emulador, las pantallas de inicio de sesión tienen además **"Solo pruebas: entrar con correo"**, que no aparece en producción. Todas las cuentas de la demo usan la contraseña `clave-de-prueba-123`:

| Cuenta | Uso |
|---|---|
| `dueno@prueba.app` | Dueño de la plataforma |
| `johan@prueba.app` | Admin de Señor Hornado (PIN 4821) |
| `pedro@prueba.app` | Solicitud pendiente "Parrilla Don Pedro" |

El enlace del personal de Señor Hornado en la demo es `/unirse/senor-hornado-demo/demo-codigo-senor-hornado-123456`.

`npm run verify` revisa todo (build, pruebas unitarias y reglas). `npm run deploy` verifica y solo despliega si todo pasa.

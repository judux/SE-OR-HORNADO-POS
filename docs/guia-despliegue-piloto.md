# Guía: poner en marcha la plataforma y un restaurante

> Todo se hace **desde la app**. No hace falta entrar a la consola de Firebase.
> El despliegue (subir la versión nueva) lo hace Claude con la CLI de Firebase.

## Cómo está organizado

| Quién | Dónde entra | Qué hace |
|---|---|---|
| **Dueño de la plataforma** (tú) | `/plataforma` con su correo y contraseña | Crea restaurantes, su cuenta y su primer administrador; suspende o reactiva restaurantes |
| **Equipo del restaurante** (celular, tablet o PC) | `/activar`, una sola vez, con la cuenta del restaurante | Queda vinculado a ese restaurante |
| **Personal** (admin, cajero o mesero) | PIN de 4 dígitos en un equipo activado | Trabaja solo con los datos de **su** restaurante |

## 1. Reclamar la plataforma (una sola vez, en cuanto se despliegue)

1. Abre `https://senor-hornado-pos-8412.web.app/plataforma`.
2. Elige **"Primera vez"** y escribe tu nombre, tu correo y una contraseña de al menos 8 caracteres.
3. Pulsa **Crear cuenta de dueño**. Esto solo funciona una vez: después nadie más puede reclamar la plataforma.

> Hazlo justo después del despliegue. Mientras la plataforma no tenga dueño, cualquiera que conozca la dirección podría reclamarla primero.

## 2. Crear un restaurante

En el panel, pulsa **Nuevo restaurante** y completa:
- **Nombre:** por ejemplo "Señor Hornado".
- **Cuenta para activar sus equipos:** un correo (no tiene que existir de verdad) y una contraseña de 8 o más caracteres. Esta cuenta es la que el restaurante usa en sus celulares y en la caja.
- **Administrador:** su nombre y un PIN de 4 dígitos.
- **Copiar el menú y las mesas de la versión anterior:** márcalo solo para Señor Hornado. Copia los productos y mesas que ya existían.

## 3. Activar los equipos del restaurante

En cada celular de mesero y en la caja:
1. Abre `https://senor-hornado-pos-8412.web.app`.
2. Escribe el correo y la contraseña **de la cuenta del restaurante**.
3. **Instala la app:**
   - Android (Chrome): menú ⋮ → *Agregar a pantalla principal*.
   - iPhone (Safari): compartir → *Agregar a inicio*.
4. Entra con el PIN. En la caja, toca **"activar el sonido"**.

## 4. El admin del restaurante crea a su personal

Con su PIN, el administrador entra a **Usuarios → Nuevo usuario** y crea a sus meseros y cajeros, cada uno con su propio PIN. En **Menú** y **Mesas** ajusta productos, precios y mesas.

## 5. Ensayo general

Recorre el guion de `docs/piloto-2026-10-24.md` en los dispositivos reales.

---

## Si algo sale mal

| Problema | Qué hacer |
|---|---|
| "La cuenta … no pertenece a ningún restaurante" | Se activó con una cuenta antigua (por ejemplo `equipos@senorhornado.app`). Pulsa "Usar otra" y entra con la cuenta del restaurante |
| "Restaurante suspendido" | Reactívalo desde `/plataforma` |
| El admin olvidó su PIN | En `/plataforma`, en el restaurante, pulsa **Agregar administrador** y crea uno nuevo |
| "PIN incorrecto" | El PIN no existe en **ese** restaurante: los PINs de un restaurante no sirven en otro |
| Hay que volver a la versión anterior | Pídeselo a Claude, o en la consola: **Hosting → Historial de versiones → Revertir** |

## Probar en tu PC sin tocar producción (para desarrollo)

```bash
npm run emulators
```

En otra terminal:

```bash
node scripts/seed-emulator.mjs --demo
```

```bash
npm run start:emu
```

Abre `http://localhost:4200`. Todas las cuentas de la demo usan la contraseña `clave-de-prueba-123`:

| Cuenta | Uso | PINs |
|---|---|---|
| `dueno@prueba.app` | `/plataforma` | — |
| `caja@prueba.app` | Señor Hornado | admin 4821, mesero 1111, cajero 2222 |
| `asadero@prueba.app` | Asadero Prueba | admin 4821 |

Las reglas se prueban con `npm run test:rules` (35 casos). Ese comando borra los datos del emulador.

# Guía de despliegue: piloto del sábado 24 de octubre

> Sigue los pasos **en este orden**. Los pasos 1 a 3 se hacen en la consola de Firebase (https://console.firebase.google.com, proyecto **senor-hornado-pos-8412**). El paso 4 se hace en la terminal.
> Tiempo estimado: 1 a 2 horas, la mayor parte cargando el menú real.

---

## 1. Crear la cuenta de equipos (Firebase Authentication)

1. Ve a **Authentication → Comenzar**, si aún no está activo.
2. En **Método de acceso**, habilita **Correo electrónico/contraseña**. **No** actives el "vínculo de correo electrónico".
3. En **Usuarios → Agregar usuario**:
   - Correo: `equipos@senorhornado.app`. Debe ser **exactamente** este, porque está escrito en `firestore.rules` y en los `environment`.
   - Contraseña: una **larga y única**, de al menos 12 caracteres. Guárdala en un lugar seguro, **no** en el repositorio ni en un chat.
4. Si quieres cambiar el correo, hay que cambiarlo en `firestore.rules` y en `src/environments/*.ts`, y volver a desplegar.

> ¿Por qué funciona? Las reglas solo aceptan ese correo, y como ya existe una cuenta con él, nadie más puede registrarlo.

## 2. Limpiar los datos de prueba (Firestore Database)

Hazlo **antes** de desplegar las reglas nuevas, porque después nadie podrá borrar ventas, ni siquiera tú desde la app. La consola de Firebase sí puede, porque ignora las reglas.

1. Borra las colecciones de prueba: `orders`, `order_history`, `expenses` y, si existen, `shifts` y `config`.
2. En `tables`: deja solo las mesas reales. En cada una, `estado` debe ser `libre`, y si existe el campo `id_orden_actual`, bórralo o ponlo en `null`.
3. En `users`:
   - Crea **al menos un administrador real** con los campos `nombre`, `rol` = `admin`, `pin_acceso` (4 dígitos, string), `activo` = `true`.
   - Borra o desactiva cualquier usuario con PINs fáciles (`1234`, `1111`, `2222`, `3333`). Ya no hay PINs maestros en el código: **si no hay un admin en esta colección, nadie podrá entrar**.

## 3. Revisar el uso gratis (opcional pero recomendado)

En **Firestore → Uso** puedes ver las lecturas y escrituras por día. Durante el piloto, revísalo al final del día. La cuota gratis es de 50.000 lecturas y 20.000 escrituras diarias.

## 4. Desplegar (terminal, en la carpeta del proyecto)

```bash
npx ng build --configuration production
```

```bash
npx firebase deploy --only hosting,firestore:rules --project senor-hornado-pos-8412
```

Si te pide iniciar sesión, ejecuta antes `npx firebase login`.

**Comprobar:**
- Abre `https://senor-hornado-pos-8412.web.app` en una ventana privada. Debe aparecer **"Activar este equipo"**.
- En la consola de Firebase, **Firestore → Reglas** debe mostrar las reglas nuevas (las que mencionan `equipos@senorhornado.app`).

## 5. Activar cada dispositivo (el dueño o tú)

En **cada** celular de mesero y en la tablet o PC de caja:

1. Abre `https://senor-hornado-pos-8412.web.app`.
2. En **Activar este equipo**, escribe la contraseña de la cuenta de equipos. El correo ya viene puesto.
3. **Instala la app:**
   - Android (Chrome): menú ⋮ → *Agregar a pantalla principal*.
   - iPhone (Safari): botón compartir → *Agregar a inicio*.
4. Entra con el PIN de esa persona y comprueba que ve su módulo.
5. Solo en la caja: toca **"Activar el sonido de comandas nuevas"**.

> La activación se guarda en el dispositivo. Si se borran los datos del navegador, hay que volver a activarlo.

## 6. Cargar los datos reales (panel de Admin)

Entra con el PIN de admin:
- **Productos:** nombre, precio en pesos y categoría. Revísalos con el dueño, porque es lo que más errores causa.
- **Mesas:** crea las mesas reales.
- **Usuarios:** un PIN **único** para cada mesero y cajero.

## 7. Ensayo general (viernes en la tarde)

Recorre el guion de pruebas de `docs/piloto-2026-10-24.md` en los **dispositivos reales** y anota cada resultado. Decide si el piloto va o no con los criterios de la sección 2.4 de `docs/plan-maestro.md`.

**A las 6 p. m. del viernes se congela el código:** el sábado solo se despliega una corrección si algo crítico falla.

---

## Si algo sale mal

| Problema | Qué hacer |
|---|---|
| Nadie puede entrar con su PIN | Revisa que exista un usuario `admin` activo en `users` (paso 2.3) y que el equipo esté activado |
| "Correo o contraseña incorrectos" al activar | Revisa la contraseña de la cuenta de equipos en Authentication; puedes restablecerla desde la consola |
| La app nueva falla y hay que volver atrás | Consola → **Hosting → Historial de versiones** → *Revertir* a la anterior |
| Todo falla durante el servicio | **Procedimiento de respaldo en papel** (sección 2.5 del plan maestro) y avísame con el error que ves |

## Probar en tu PC sin tocar producción

```bash
npm run emulators
```

En otra terminal:

```bash
npm run seed:emu
```

```bash
npm run start:emu
```

Abre `http://localhost:4200`. En el emulador, `npm run seed:emu` crea la cuenta de equipos con la contraseña de prueba `clave-de-prueba-123`. Los PINs de prueba son: admin 9001, meseros 1111/3333, cajero 2222.

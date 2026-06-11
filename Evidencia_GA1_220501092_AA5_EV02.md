# Informe de Evaluación de los Requerimientos
**Evidencia:** GA1-220501092-AA5-EV02
**Proyecto:** Sistema de Punto de Venta (POS) "Señor Hornado"
**Autor:** Johan

## 1. Introducción
El presente documento tiene como objetivo validar funcionalmente los requerimientos del software en desarrollo para el restaurante "Señor Hornado". Mediante la construcción de prototipos visuales (wireframes) y el diseño estructurado de casos de prueba, se asegura que las historias de usuario clave cumplan con las necesidades operativas del cliente antes y durante la etapa de codificación, enfocándose en un flujo de trabajo sin fricciones entre los meseros y la caja.

## 2. Alcance
Este informe de validación abarca cuatro de las funcionalidades críticas del sistema (Módulos de Mesero y Cajero):
1. El sistema rápido de autenticación mediante PIN.
2. La asignación visual de mesas y control de su estado.
3. El proceso de toma y envío seguro de pedidos a caja.
4. La gestión, consolidación y cobro de los tickets en el área de caja.

## 3. Lista de Requerimientos Seleccionados
- **REQ-01 (HU-01):** Autenticación rápida de usuarios (Mesero/Cajero) mediante un PIN personal de 4 dígitos.
- **REQ-02 (HU-02):** Gestión visual de mesas que permita identificar mediante colores (Libre, Pendiente, En Caja) el estado del servicio y el mesero asignado.
- **REQ-03 (HU-03):** Toma de pedidos (PWA Móvil) con capacidad de agregar notas, con un bloqueo explícito ("candado") para evitar que los meseros modifiquen la orden una vez enviada a la caja.
- **REQ-04 (HU-04):** Panel de caja centralizado con alertas visuales de nuevos pedidos, permitiendo la gestión de cobros en efectivo (con cálculo de vuelto exacto) y transferencias.

## 4. Versión del Documento
- **Versión:** 1.0
- **Fecha:** 28 de Abril de 2026
- **Estado:** Aprobado para implementación

---

## 5. Cuerpo del Informe: Prototipos y Casos de Prueba

### 5.1. Módulo de Autenticación (Login por PIN)

![Prototipo de Login por PIN](C:/Users/johan/.gemini/antigravity/brain/963d976d-8395-46d6-bdc1-fe4b876e27ef/prototipo_login_pin_1777430323193.png)

#### Caso de Prueba 01
* **Identificador:** CP-01
* **Objetivo del caso de prueba:** Validar que un usuario pueda acceder rápidamente a su rol (Mesero, Cajero o Admin) ingresando un PIN de 4 dígitos.
* **Nombre del requerimiento asociado:** REQ-01 / Autenticación rápida por PIN.
* **Precondiciones:** El sistema debe tener usuarios creados en la base de datos de Firebase con sus respectivos roles y un PIN de 4 dígitos asignado.
* **Lista de pasos y resultados esperados:**
  1. **Paso:** El usuario accede a la URL inicial de la aplicación desde un dispositivo móvil o tablet.
     **Resultado:** El sistema muestra la pantalla de Login con un teclado numérico (1-9, 0, borrar).
  2. **Paso:** El usuario presiona 4 dígitos consecutivos en el teclado en pantalla.
     **Resultado:** Los indicadores circulares se llenan (color verde). Al ingresar el cuarto dígito, el sistema valida automáticamente sin necesidad de presionar "Enter".
  3. **Paso:** (Flujo Alterno) El usuario ingresa un PIN incorrecto.
     **Resultado:** Se muestra un mensaje de error "PIN incorrecto" y se limpian los indicadores.
  4. **Paso:** (Flujo Exitoso) El usuario ingresa un PIN válido de un mesero.
     **Resultado:** El sistema muestra un mensaje de bienvenida ("¡Bienvenido, Carlos!") y redirige al usuario a la vista de Selección de Mesas tras menos de 1 segundo.

---

### 5.2. Módulo de Meseros: Selección de Mesas

![Prototipo de Selección de Mesas](C:/Users/johan/.gemini/antigravity/brain/963d976d-8395-46d6-bdc1-fe4b876e27ef/prototipo_seleccion_mesas_1777430467802.png)

#### Caso de Prueba 02
* **Identificador:** CP-02
* **Objetivo del caso de prueba:** Comprobar que el mesero puede visualizar correctamente el estado de ocupación de las mesas y seleccionar una para iniciar o continuar un pedido.
* **Nombre del requerimiento asociado:** REQ-02 / Gestión visual de mesas por estados.
* **Precondiciones:** El usuario debe haber iniciado sesión como "Mesero". Debe existir un mapa de mesas cargado en el sistema con diferentes estados de prueba.
* **Lista de pasos y resultados esperados:**
  1. **Paso:** El mesero visualiza el dashboard (grilla) principal tras iniciar sesión.
     **Resultado:** El sistema muestra las mesas con la leyenda de colores (Verde = Libre, Amarillo = Pendiente, Azul = En Caja) y las etiquetas de capacidad.
  2. **Paso:** El mesero toca una tarjeta de mesa que se encuentra en color Verde (Libre).
     **Resultado:** El sistema inicia un nuevo pedido en blanco y redirige a la pantalla del menú (Toma de Pedidos).
  3. **Paso:** El mesero toca una tarjeta de mesa de color Amarillo (Pendiente) que tiene su nombre asignado en el badge inferior.
     **Resultado:** El sistema recupera el carrito de compras guardado localmente/nube y redirige a la pantalla de menú para continuar agregando ítems.
  4. **Paso:** El mesero verifica las mesas Azules.
     **Resultado:** Observa que tienen un pedido "En Caja" a la espera de que el cliente realice el pago.

---

### 5.3. Módulo de Meseros: Toma de Pedidos

![Prototipo de Toma de Pedidos](C:/Users/johan/.gemini/antigravity/brain/963d976d-8395-46d6-bdc1-fe4b876e27ef/prototipo_toma_pedidos_1777430793314.png)

#### Caso de Prueba 03
* **Identificador:** CP-03
* **Objetivo del caso de prueba:** Verificar que un mesero pueda armar una orden, agregar notas a los productos y evidenciar que los productos ya enviados a la caja no pueden ser eliminados desde su dispositivo.
* **Nombre del requerimiento asociado:** REQ-03 / Toma de pedidos con bloqueo post-envío.
* **Precondiciones:** El mesero ha seleccionado una mesa libre. El menú debe contener productos cargados y disponibles.
* **Lista de pasos y resultados esperados:**
  1. **Paso:** El mesero selecciona una categoría de comida y presiona el botón "+" de un producto.
     **Resultado:** Se despliega un modal o se añade el producto al panel derecho ("Orden Actual") con la etiqueta verde "Nuevo". El total de la orden se actualiza.
  2. **Paso:** El mesero selecciona la opción de "Agregar nota" sobre un ítem "Nuevo".
     **Resultado:** El sistema permite ingresar texto (ej. "Sin ensalada") y lo refleja debajo del producto en el carrito.
  3. **Paso:** El mesero presiona el botón verde "Enviar a Caja".
     **Resultado:** El botón muestra el texto "Enviando... ⏳". Al completarse, redirige al mesero a la grilla de mesas.
  4. **Paso:** El mesero vuelve a ingresar a la misma mesa enviada.
     **Resultado:** En el carrito (lado derecho), los ítems previamente enviados aparecen en tono gris, tienen un ícono de "Candado" (🔒) y desaparecen los controles de "+" / "-" / "Eliminar". No se pueden modificar ni eliminar.

---

### 5.4. Módulo de Cajeros: Dashboard y Recepción

![Prototipo del Dashboard del Cajero](C:/Users/johan/.gemini/antigravity/brain/963d976d-8395-46d6-bdc1-fe4b876e27ef/prototipo_dashboard_caja_1777430811377.png)

#### Caso de Prueba 04
* **Identificador:** CP-04
* **Objetivo del caso de prueba:** Validar la correcta recepción en tiempo real de los pedidos (tickets) enviados por los meseros y la ejecución exitosa del flujo de cobro con cálculo de vuelto.
* **Nombre del requerimiento asociado:** REQ-04 / Panel centralizado del cajero y cálculos de pago.
* **Precondiciones:** El usuario "Cajero" debe haber iniciado sesión en una pantalla ancha (PC/Tablet). Debe existir al menos un pedido enviado (En Caja) por un mesero.
* **Lista de pasos y resultados esperados:**
  1. **Paso:** El cajero visualiza el dashboard principal en la pestaña "Tickets".
     **Resultado:** Se muestra el contador de pendientes actualizado y aparecen las tarjetas de las mesas con un resumen del tiempo transcurrido y el monto total ($).
  2. **Paso:** El cajero hace clic sobre la tarjeta de un ticket pendiente.
     **Resultado:** Se despliega el modal "Cobrar Cuenta", mostrando la lista completa de ítems de la mesa, el subtotal y las opciones de pago (Efectivo / Transferencia).
  3. **Paso:** El cajero selecciona el método "Efectivo" y escribe en el input "Billete recibido" un valor mayor al total del subtotal.
     **Resultado:** El sistema muestra automáticamente en texto verde el cambio matemático correspondiente ("Vuelto a entregar: $...").
  4. **Paso:** El cajero hace clic en "Confirmar Pago Exitoso".
     **Resultado:** El modal se cierra, la tarjeta desaparece de la vista de tickets pendientes, y en el sistema general la mesa vuelve a estar en estado "Libre".

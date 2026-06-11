# Evidencia GA2-220501093-AA1-EV03
## Elaboración de historias de usuario del proyecto

---

## FICHA DEL DOCUMENTO
| Fecha | Revisión | Autor | Verificado por |
| :--- | :--- | :--- | :--- |
| [Fecha Actual] | 1.0 | [Nombre del Aprendiz] | Instructor SENA |

**Documento validado por las partes en fecha:** [Fecha Actual]
* **Por el cliente:** D./Dña. [Nombre Cliente/Instructor]
* **Por la empresa suministradora:** D./Dña. [Nombre Aprendiz]

---

## CONTENIDO
1. INTRODUCCIÓN
   1.1 Propósito
   1.2 Alcance
   1.3 Personal involucrado
   1.4 Definiciones, acrónimos y abreviaturas
   1.5 Referencias
   1.6 Resumen
2. DESCRIPCIÓN GENERAL
   2.1 Perspectiva del producto
   2.2 Funcionalidad del producto
   2.3 Características de los usuarios
   2.4 Restricciones
   2.5 Suposiciones y dependencias
   2.6 Evolución previsible del sistema
3. REQUISITOS ESPECÍFICOS
   3.1 Requisitos comunes de los interfaces
       3.1.1 Interfaces de usuario
       3.1.2 Interfaces de hardware
       3.1.3 Interfaces de software
       3.1.4 Interfaces de comunicación
   3.2 Requisitos funcionales
       3.2.1 Requisito funcional 1 (UC-04: Registrar Pedido de Mesa)
       3.2.2 Requisito funcional 2 (UC-07: Procesar Cobro y Cierre)
       3.2.3 Requisito funcional 3 (UC-01: Gestionar Mesas)
       3.2.4 Requisito funcional 4 (UC-05/06: Sincronización en Caja)
   3.3 Requisitos no funcionales
       3.3.1 Requisitos de rendimiento
       3.3.2 Seguridad
       3.3.3 Fiabilidad
       3.3.4 Disponibilidad
       3.3.5 Mantenibilidad
       3.3.6 Portabilidad
   3.4 Otros requisitos
4. APÉNDICES (Historias de Usuario)

---

## 1 INTRODUCCIÓN

### 1.1 Propósito
El propósito de este documento es especificar los requisitos de software (SRS) para el Sistema de Punto de Venta (POS) "Señor Hornado". Está dirigido al equipo de desarrollo, al cliente (propietarios del restaurante) y a los instructores del proceso formativo para validar que las funcionalidades propuestas cubren las necesidades del negocio.

### 1.2 Alcance
El producto a desarrollar es una aplicación web POS integral ("Señor Hornado") destinada a digitalizar y optimizar el proceso de toma de pedidos, facturación y control de mesas. El sistema abarcará desde la interfaz móvil para que el mesero tome la orden, pasando por la transmisión en tiempo real de los datos, hasta el panel de cobro en caja y la administración de mesas y menú.

### 1.3 Personal involucrado
| Nombre | Rol | Categoría profesional | Responsabilidades |
| :--- | :--- | :--- | :--- |
| [Tu Nombre] | Analista / Desarrollador | Aprendiz SENA | Levantamiento de requisitos, diseño y desarrollo del sistema. |
| [Nombre Instructor] | Revisor | Instructor | Validación técnica del documento y del sistema. |

### 1.4 Definiciones, acrónimos y abreviaturas
* **POS:** Point of Sale (Punto de Venta).
* **Mobile-first:** Estrategia de diseño orientada prioritariamente a dispositivos móviles.
* **Firestore:** Base de datos NoSQL en tiempo real alojada en la nube de Firebase.
* **CRUD:** Create, Read, Update, Delete (Crear, Leer, Actualizar, Eliminar).
* **UI/UX:** Interfaz de Usuario / Experiencia de Usuario.

### 1.5 Referencias
* **IEEE Std 830-1998:** Práctica recomendada para la especificación de requisitos de software.
* **Evidencia GA2-220501093-AA1-EV02:** Diagramas y plantillas para casos de uso del proyecto.

### 1.6 Resumen
El resto del documento detalla las características del sistema POS "Señor Hornado". La sección 2 ofrece una perspectiva general y las funciones principales. La sección 3 detalla de forma exhaustiva los requisitos funcionales, no funcionales e interfaces. La sección 4 contiene como apéndice la especificación técnica en formato de Historias de Usuario ágiles, tal como requiere la evidencia.

---

## 2 DESCRIPCIÓN GENERAL

### 2.1 Perspectiva del producto
El Sistema POS "Señor Hornado" es un producto de software independiente y autónomo basado en tecnologías web modernas (Angular, TailwindCSS) y backend as a service (Firebase). Sustituirá por completo el flujo de comandas manuales escritas en papel, interactuando únicamente con el hardware estándar del restaurante (smartphones de meseros y PC de caja).

### 2.2 Funcionalidad del producto
* **Gestión de Entorno:** Creación, lectura, actualización y eliminación (CRUD) de mesas y productos del menú.
* **Toma de Pedidos (Sala):** Interfaz móvil para meseros, selección de mesas y carga de platos al carrito.
* **Monitor de Caja:** Panel de visualización en tiempo real de órdenes pendientes de pago.
* **Procesamiento de Pago:** Liquidación de mesas, cálculo de propina, selección de método de pago y liberación de mesa.

### 2.3 Características de los usuarios
* **Administrador:** Propietario/Gerente. Conocimientos técnicos básicos. Necesita gestionar el catálogo y configuración del restaurante.
* **Mesero:** Personal de servicio. Conocimientos técnicos mínimos. Necesita una aplicación extremadamente rápida, visual, fácil de tocar sin requerir precisión fina.
* **Cajero:** Personal administrativo. Conocimientos intermedios. Requiere ver información consolidada y herramientas para cobrar de forma ágil.

### 2.4 Restricciones
* El sistema de sala (para meseros) debe ser "Mobile-first" y obligatoriamente deshabilitar comportamientos nativos de navegadores como el zoom al dar doble toque.
* Requiere conexión a internet estable para la sincronización entre dispositivos (Firestore).
* No se puede integrar actualmente a hardware de impresoras fiscales de forma directa; el cierre de ventas es lógico dentro del software.

### 2.5 Suposiciones y dependencias
* Se asume que el restaurante proveerá una red Wi-Fi estable o que los dispositivos tendrán plan de datos.
* Se asume que Firebase/Firestore brindará el soporte necesario para las conexiones simultáneas gratuitas o bajo su plan actual.
* Dependencia del correcto funcionamiento de navegadores web modernos (Chrome, Safari, Edge).

### 2.6 Evolución previsible del sistema
* Integración con facturación electrónica (DIAN o ente respectivo) a futuro.
* Módulo de control de inventarios (deducción de materia prima por cada plato vendido).
* Aplicación nativa descargable desde App Store o Google Play.

---

## 3 REQUISITOS ESPECÍFICOS

### 3.1 Requisitos comunes de los interfaces
#### 3.1.1 Interfaces de usuario
* La aplicación empleará colores institucionales (verde, amarillo, rojo, blanco).
* Los botones en la vista del mesero tendrán un tamaño mínimo de tap target (44x44px).
* Diseño responsivo que se adapte a celulares (meseros) y pantallas de escritorio/laptops (cajero y administrador).

#### 3.1.2 Interfaces de hardware
* El sistema es agnóstico al hardware, operando sobre el navegador web de PCs (Windows/Mac), Tablets o Smartphones (iOS/Android).

#### 3.1.3 Interfaces de software
* Integración con Firebase Authentication para el manejo seguro de accesos mediante PIN.
* Integración con Cloud Firestore para persistencia de datos en tiempo real.

#### 3.1.4 Interfaces de comunicación
* Conexión HTTPS para transferencia segura de datos web.
* WebSockets internos gestionados por Firebase para sincronización "Realtime" (Push).

### 3.2 Requisitos funcionales

#### 3.2.1 Requisito funcional 1
* **Número de requisito:** RF-01
* **Nombre de requisito:** Registrar Pedido de Mesa (UC-04)
* **Tipo:** Requisito Funcional
* **Prioridad:** Alta/Esencial
* **Descripción:** El sistema permitirá al actor "Mesero", tras iniciar sesión, visualizar el mapa/lista de mesas, seleccionar una mesa "Libre", desplegar el menú categorizado y agregar productos. Al confirmar, el sistema enviará la orden completa a la cola de caja y cambiará el estado de la mesa a "Ocupada".

#### 3.2.2 Requisito funcional 2
* **Número de requisito:** RF-02
* **Nombre de requisito:** Procesar Cobro y Cierre (UC-07)
* **Tipo:** Requisito Funcional
* **Prioridad:** Alta/Esencial
* **Descripción:** El sistema permitirá al actor "Cajero" visualizar en tiempo real las órdenes enviadas por los meseros. Al seleccionar una mesa, el sistema desglosará el pedido, calculará el subtotal, sumará propina si aplica, registrará el método de pago (Efectivo/Tarjeta) y al confirmar, cambiará el estado de la mesa nuevamente a "Libre".

#### 3.2.3 Requisito funcional 3
* **Número de requisito:** RF-03
* **Nombre de requisito:** Gestionar Mesas (UC-01)
* **Tipo:** Requisito Funcional
* **Prioridad:** Media/Deseado
* **Descripción:** El sistema permitirá al actor "Administrador" acceder a un panel exclusivo donde podrá crear, editar y eliminar mesas. El sistema impedirá (restringirá) eliminar cualquier mesa cuyo estado actual sea "Ocupada" o "En proceso de pago".

#### 3.2.4 Requisito funcional 4
* **Número de requisito:** RF-04
* **Nombre de requisito:** Sincronización Inmediata en Caja (UC-05/06)
* **Tipo:** Requisito Funcional
* **Prioridad:** Alta/Esencial
* **Descripción:** El sistema actualizará el monitor del cajero automáticamente utilizando listeners de base de datos, reflejando cualquier nuevo pedido en un lapso menor a 3 segundos sin requerir recargar la página.

### 3.3 Requisitos no funcionales

#### 3.3.1 Requisitos de rendimiento
* El tiempo de respuesta para la sincronización de órdenes entre el dispositivo del mesero y la pantalla del cajero no debe exceder los 3 segundos en condiciones de red estándar (3G/4G/Wi-Fi).

#### 3.3.2 Seguridad
* El acceso al sistema debe estar restringido mediante un código PIN personal cifrado de 4 a 6 dígitos por usuario.
* La base de datos (Firestore Rules) debe bloquear operaciones de escritura/lectura no autorizadas.

#### 3.3.3 Fiabilidad
* El sistema debe preservar el estado de los pedidos en curso en la base de datos en tiempo real, evitando pérdida de comandas ante una caída local de conexión (se sincroniza al reconectar).

#### 3.3.4 Disponibilidad
* El sistema, alojado en infraestructura de nube (Firebase Hosting), debe ofrecer un tiempo de actividad (uptime) del 99.9%.

#### 3.3.5 Mantenibilidad
* El código fuente debe estar estructurado en componentes bajo el framework Angular, permitiendo actualizaciones modulares sin afectar todo el aplicativo.

#### 3.3.6 Portabilidad
* Aplicación basada en tecnologías web (PWA - Progressive Web App), accesible desde cualquier navegador estándar (Chrome, Safari, Edge) en sistemas operativos Windows, macOS, Android e iOS.

### 3.4 Otros requisitos
* **Requisitos ergonómicos (UI):** Prevención de doble toque accidental (zoom) a través de directivas CSS (`touch-action: manipulation`) para la usabilidad en pantallas táctiles por parte de los meseros.

---

## 4 APÉNDICES

### ESPECIFICACIÓN MEDIANTE HISTORIAS DE USUARIO
Como complemento al estándar IEEE 830 y según los requerimientos de la evidencia, a continuación se desglosan los requisitos funcionales bajo la estructura ágil de Historias de Usuario, fundamentales para el Product Backlog.

| Historia de Usuario | Detalle |
| :--- | :--- |
| **Número de historia** | HU-01 (Prioridad Alta) |
| **Nombre de la historia** | Registro Rápido de Pedidos sin Zoom |
| **Usuario involucrado** | Mesero |
| **Puntos estimados de esfuerzo** | 5 puntos |
| **Descripción** | **Como** mesero del restaurante,<br>**Quiero** poder agregar platos a la cuenta tocando la pantalla rápidamente sin que se haga zoom accidentalmente,<br>**Para** tomar los pedidos de forma veloz y no retrasar el servicio. |
| **Observaciones** | Se debe implementar CSS `touch-action: manipulation` para prevenir el doble toque en navegadores móviles. |
| **Criterios de aceptación** | 1. La interfaz es mobile-first.<br>2. Botones con área táctil amplia.<br>3. Al hacer doble toque rápido no se hace zoom in/out. |

<br>

| Historia de Usuario | Detalle |
| :--- | :--- |
| **Número de historia** | HU-02 (Prioridad Alta) |
| **Nombre de la historia** | Sincronización Inmediata en Caja |
| **Usuario involucrado** | Cajero |
| **Puntos estimados de esfuerzo** | 8 puntos |
| **Descripción** | **Como** cajero del turno,<br>**Quiero** visualizar las órdenes enviadas por los meseros de forma automática en mi pantalla,<br>**Para** preparar la cuenta y reducir la fila de espera de clientes pagando. |
| **Observaciones** | Requiere el uso de WebSockets o Firebase Realtime database listeners en la vista del cajero. |
| **Criterios de aceptación** | 1. Vista de caja escucha cambios en BD sin recargar F5.<br>2. Notificación visual al llegar nueva orden.<br>3. Retardo menor a 3 segundos. |

<br>

| Historia de Usuario | Detalle |
| :--- | :--- |
| **Número de historia** | HU-03 (Prioridad Media) |
| **Nombre de la historia** | Protección de Mesas Abiertas |
| **Usuario involucrado** | Administrador |
| **Puntos estimados de esfuerzo** | 3 puntos |
| **Descripción** | **Como** administrador del sistema,<br>**Quiero** que el sistema impida borrar una mesa si tiene una cuenta abierta o clientes consumiendo,<br>**Para** evitar descuadres financieros por eliminación accidental. |
| **Observaciones** | Validar el estado de la mesa a nivel de Backend / Firestore Rules antes de permitir el DELETE. |
| **Criterios de aceptación** | 1. Verificación del campo `estado` (`libre`, `ocupada`).<br>2. Si es distinto de `libre`, mostrar modal de error.<br>3. Botón de eliminar deshabilitado preventivamente si la mesa está ocupada. |

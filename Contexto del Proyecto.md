Contexto del Proyecto:
Actúa como un Arquitecto de Software Senior y Desarrollador Full-Stack experto. Vamos a construir una aplicación web tipo POS (Punto de Venta) y sistema de facturación electrónica para un restaurante tradicional especializado en hornado y carnes a la parrilla.

Objetivo Principal: Reemplazar el uso de factureros de papel por un sistema digital ágil, optimizar la toma de pedidos desde el celular de los meseros, centralizar el cobro en la caja y administrar el negocio. NO habrá módulo de pantalla de cocina (el mesero lleva la orden verbalmente tras registrarla en el sistema).

Entorno de Desarrollo y Versiones Estrictas:
El proyecto debe ser compatible con el siguiente entorno local. Nota crítica para la IA: Estoy utilizando Node.js v25.0.0 (experimental). Si sugieres comandos o configuraciones, asegúrate de que no rompan la compatibilidad con Angular 18 bajo esta versión de Node.

Node.js: v25.0.0

npm: 11.6.2

Python: 3.13.7

Java: 25.0.1 (LTS)

Angular Framework: 18.2.14

Angular CLI: 18.2.21

TypeScript: 5.5.4

TailwindCSS: 3.4.19

Firebase: 10.13.0

Stack Tecnológico:

Frontend: Angular 18 (usando Signals para la reactividad y Standalone Components).

Estilos: Tailwind CSS (enfoque estricto en mobile-first para las vistas de los meseros).

Backend & Base de Datos: Firebase (Firestore para base de datos en tiempo real y Firebase Auth para los accesos).

Facturación Electrónica: Preparar la arquitectura del backend/servicios para la futura integración con la API de un proveedor tecnológico autorizado por la DIAN en Colombia.

Perfiles de Usuario (Roles):

Mesero (Máximo 6 usuarios):

Interfaz 100% móvil, botones grandes, navegación rápida sin tiempos de carga.

Funciones: Seleccionar mesas, visualizar menú por categorías (ej. Hornado, Carnes, Bebidas), agregar platos, incluir notas de preparación, y ver el resumen de la orden de la mesa.

Cajero (Vista de Tablet/Escritorio):

Interfaz amplia con sincronización en tiempo real (Realtime Firestore).

Funciones: Recibir alertas de pedidos nuevos en las mesas, calcular totales automáticamente, aplicar propinas, registrar métodos de pago (Efectivo, Tarjeta, Transferencia) y emitir/cerrar la cuenta.

Administrador (Vista de Escritorio):

Funciones: CRUD de platos (agregar, editar precios, ocultar si se agotan), gestión de usuarios (crear pines o accesos para meseros), y un dashboard visual de ventas e ingresos por día.

Modelado de Datos Inicial (Firestore Collections):

users: id, rol (mesero, cajero, admin), nombre, pin_acceso.

products: id, nombre, precio, categoria, disponible (boolean), notas_permitidas (boolean).

tables: id, numero_mesa, estado (libre, ocupada, pagando).

orders: id, id_mesa, id_mesero, items (array de productos con cantidad y notas), estado (abierta, cerrada), subtotal, total.

Hoja de Ruta de Implementación (Fases de Trabajo):
Espera mis instrucciones antes de codificar. Trabajaremos en las siguientes fases:

Fase 1: Configuración del Entorno. Inicialización de Angular, Tailwind y conexión con el proyecto de Firebase.

Fase 2: Autenticación y Rutas. Creación de un login sencillo y protección de rutas según el rol (Guards en Angular).

Fase 3: Módulo del Administrador. CRUD del menú en Firestore para tener datos de prueba.

Fase 4: Módulo del Mesero. UI mobile-first, listado de mesas y carrito de pedidos.

Fase 5: Módulo del Cajero. Sincronización en tiempo real de las órdenes de las mesas y lógica de pagos.

Fase 6: Dashboard y Facturación. Gráficos básicos y preparación del servicio HTTP para la DIAN.

Instrucción Inmediata:
Confirma que has entendido este documento de arquitectura. Si lo has entendido, genera únicamente la estructura de carpetas inicial recomendada para el proyecto en Angular 18, considerando las versiones especificadas, y espera mi orden para ejecutar la Fase 1.



LO DE LA FACTURACION ELECTRONICA ES PARA DESPUES, NO TE PREOCUPES POR ESO AHORA
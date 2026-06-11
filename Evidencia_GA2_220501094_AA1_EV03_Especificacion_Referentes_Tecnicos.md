# EVIDENCIA GA2-220501094-AA1-EV03

## Especificación de los Referentes Técnicos y Estimación de las Condiciones Económicas

### Sistema POS y Facturación Electrónica - Restaurante Señor Hornado

---

## PORTADA

| Aspecto | Detalle |
|--------|---------|
| **Título del Proyecto** | Sistema POS y Facturación Electrónica - Restaurante Señor Hornado |
| **Tipo de Evidencia** | GA2-220501094-AA1-EV03 |
| **Descripción** | Especificación de Referentes Técnicos y Estimación de Condiciones Económicas |
| **Fecha de Elaboración** | Junio 11, 2026 |
| **Período de Ejecución** | 72 horas (Actividad AA1 - Especificaciones y Gestión de Proyectos de Software) |
| **Versión del Documento** | 1.0 - Final |
| **Estado** | Completado |
| **Referente Normativo** | ISO/IEC 9126, ISO/IEC 25010, Normas ICONTEC, IEEE 830 |

---

## 1. INTRODUCCIÓN

El presente documento establece la **especificación de referentes técnicos** y la **estimación de condiciones económicas** para el proyecto de implementación del "Sistema POS y Facturación Electrónica" en el Restaurante Señor Hornado.

Este análisis forma parte de la **Actividad AA1 - Especificaciones y Gestión de Proyectos de Software**, dentro del módulo GA2 de análisis y evaluación de soluciones tecnológicas. El documento constituye un paso previo fundamental para:

- Validar la **viabilidad técnica** de la solución propuesta
- Garantizar la **viabilidad económica** del proyecto
- Facilitar el **análisis de proveedores** subsecuente
- Establecer las bases para la **propuesta técnica y financiera final**

### 1.1 Propósito

Definir y documentar:
1. Los **requisitos de hardware y software** necesarios para la solución
2. Las **especificaciones técnicas detalladas** de cada componente
3. La **estructura de costos** desglosada por categoría
4. Las **proyecciones económicas** a corto, mediano y largo plazo
5. El **dimensionamiento de licencias** de software
6. El **análisis de inversión y retorno** (ROI)

### 1.2 Alcance

Este documento abarca:
- **Infraestructura backend:** Servidor de aplicaciones, base de datos, servicios en la nube
- **Infraestructura frontend:** Dispositivos cliente (móviles, tablets, desktop)
- **Conectividad:** Red local, internet, sincronización en tiempo real
- **Software:** Plataformas, frameworks, librerías, herramientas de desarrollo
- **Licencias:** Desarrollo, producción, soporte técnico
- **Servicios:** Hosting, mantenimiento, soporte
- **Costos operacionales:** Año 1 y proyección 5 años

---

## 2. ESPECIFICACIONES TÉCNICAS

### 2.1 Arquitectura General de la Solución

La solución propuesta sigue un modelo de **arquitectura cliente-servidor PWA (Progressive Web Application)** con características de **offline-first** y sincronización en tiempo real mediante Firestore.

```
┌─────────────────────────────────────────────────────┐
│              CAPAS DE LA SOLUCIÓN                   │
├─────────────────────────────────────────────────────┤
│  CAPA PRESENTACIÓN    │  Angular 18.2.14 PWA        │
│  (Frontend)           │  TailwindCSS 3.4.19         │
│                       │  TypeScript 5.5.4           │
├─────────────────────────────────────────────────────┤
│  CAPA APLICACIÓN      │  Node.js (v25.0.0+)         │
│  (Lógica de Negocio)  │  Services Angular           │
│                       │  Estado con Signals         │
├─────────────────────────────────────────────────────┤
│  CAPA DATOS           │  Google Firebase            │
│  (Persistencia)       │  Firestore NoSQL            │
│                       │  Autenticación Firebase     │
├─────────────────────────────────────────────────────┤
│  INFRAESTRUCTURA      │  Google Cloud Platform      │
│  (Hosting)            │  Cloud Storage              │
│                       │  Cloud Messaging            │
└─────────────────────────────────────────────────────┘
```

### 2.2 Especificaciones de Hardware

#### 2.2.1 Servidor de Aplicaciones (Backend)

| Componente | Especificación | Justificación |
|-----------|----------------|--------------|
| **Procesador** | Intel Xeon/AMD EPYC (4 cores mínimo) | Manejo de múltiples conexiones Firestore simultáneas |
| **Memoria RAM** | 8 GB mínimo, 16 GB recomendado | Caché de sesiones, sincronización real-time |
| **Almacenamiento** | 100 GB SSD (expandible) | Logs, backups, archivos temporales |
| **Ancho de banda** | 10 Mbps mínimo (dedicado) | Sincronización Firestore < 2 segundos |
| **Redundancia** | Load balancer + 2 instancias | Alta disponibilidad 99.9% uptime |
| **Ubicación** | Google Cloud Platform (GCP) | Integración nativa con Firebase |

**Costo Mensual Estimado:** USD $150-200/mes (USD $1,800-2,400/año)

#### 2.2.2 Base de Datos (Firestore)

| Componente | Especificación | Justificación |
|-----------|----------------|--------------|
| **Modelo** | NoSQL Documentos (Firestore) | Flexibilidad, escalabilidad, sincronización real-time |
| **Almacenamiento** | 50 GB iniciales (auto-escalable) | Proyección 5 años con crecimiento 20% anual |
| **Lecturas/mes** | 5 millones base | Mesero: 500 ops/turno × 20 turnos; Cajero: 1000 ops/turno × 20 turnos |
| **Escrituras/mes** | 2 millones base | Crear/actualizar órdenes, mesas, transacciones |
| **Transacciones** | ACID garantizadas | Integridad de datos en operaciones de pago |
| **Backups automáticos** | Habilitados (14 días retención) | Recuperación ante desastres |

**Costo Mensual Estimado:** USD $100-150/mes (depende de uso actual; proyectado USD $1,200-1,800/año)

#### 2.2.3 Dispositivos Cliente

##### Meseros (Móviles)

| Componente | Especificación | Cantidad | Justificación |
|-----------|----------------|----------|--------------|
| **Dispositivo** | Smartphone Android 11+ | 5 | Toma de órdenes, consulta menú |
| **Procesador** | Snapdragon 400+ o equivalente | - | Ejecución Angular PWA fluida |
| **RAM** | 4 GB mínimo | - | Aplicación PWA + cache offline |
| **Almacenamiento** | 64 GB | - | Datos offline, imágenes menú |
| **Pantalla** | 5.5" - 6.5" | - | Interacción rápida, visibilidad |
| **Batería** | 4,000 mAh mínimo | - | 8 horas turno sin recarga |
| **Conectividad** | WiFi 5GHz + 4G LTE | - | Sincronización confiable |

**Costo Unitario:** USD $150-250 (Total 5 unidades: USD $750-1,250)

##### Cajero/Admin (Tablet/Desktop)

| Componente | Especificación | Cantidad | Justificación |
|-----------|----------------|----------|--------------|
| **Dispositivo Primario** | Tablet Android 11+ (10") | 2 | Gestión caja, reportes, admin |
| **Procesador** | MediaTek Helio G90 o superior | - | Manejo múltiples pestañas |
| **RAM** | 6 GB mínimo | - | Dashboard pesado + consultas |
| **Almacenamiento** | 128 GB | - | Reportes históricos |
| **Pantalla** | 10" IPS 1920×1200 | - | Visualización tablas datos |
| **Dispositivo Secundario** | Laptop/Desktop (Admin) | 1 | Reportes analíticos, configuración |
| **Especificación Secundario** | Intel i5 / 8GB RAM / 256GB SSD | - | Procesamiento reportes PDF |

**Costo Unitario Tablets:** USD $200-300 × 2 = USD $400-600
**Costo Unitario Desktop:** USD $500-800
**Total Dispositivos Cliente:** USD $900-1,400

#### 2.2.4 Infraestructura de Red

| Componente | Especificación | Justificación |
|-----------|----------------|--------------|
| **Router WiFi 6** | IEEE 802.11ax | Soporte simultáneo 5+ dispositivos |
| **Velocidad WiFi** | 300+ Mbps (5GHz) | Latencia < 100ms |
| **Acceso Punto WiFi** | 2-3 puntos de acceso | Cobertura restaurante completo |
| **Internet dedicado** | 20 Mbps simétrico | Conexión estable Firestore |
| **ISP Redundante** | Backup 4G LTE router móvil | Continuidad ante caída internet |
| **Servidor Impresoras** | 2 impresoras térmicas red | Comandas cocina, facturas |

**Costo Infraestructura Red (una sola vez):** USD $800-1,200

---

### 2.3 Especificaciones de Software

#### 2.3.1 Plataforma Backend

| Software | Versión | Licencia | Propósito | Costo |
|---------|---------|---------|---------|------|
| **Node.js** | 25.0.0 LTS | MIT (Open Source) | Runtime JavaScript server-side | Gratis |
| **Firebase Admin SDK** | 12.0+ | Apache 2.0 | Administración Firestore desde backend | Gratis |
| **Express.js** | 4.18+ | MIT | Framework HTTP/REST API | Gratis |
| **TypeScript** | 5.5.4 | Apache 2.0 | Type safety backend | Gratis |
| **bcryptjs** | 2.4.3 | MIT | Encriptación contraseñas | Gratis |
| **dotenv** | 16.3+ | BSD-2 | Gestión variables ambiente | Gratis |

**Total Costo Software Backend:** USD $0 (100% Open Source)

#### 2.3.2 Plataforma Frontend

| Software | Versión | Licencia | Propósito | Costo |
|---------|---------|---------|---------|------|
| **Angular** | 18.2.14 | MIT | Framework SPA/PWA | Gratis |
| **TypeScript** | 5.5.4 | Apache 2.0 | Type safety frontend | Gratis |
| **TailwindCSS** | 3.4.19 | MIT | Estilos responsive mobile-first | Gratis |
| **RxJS** | 7.8+ | Apache 2.0 | Programación reactiva | Gratis |
| **Firebase SDK** | 10.13.0 | Apache 2.0 | Autenticación, Firestore sync | Gratis |
| **Angular Signals** | Incluido en v18 | MIT | State management eficiente | Gratis |
| **PWA Toolkit** | Incluido en @angular/pwa | MIT | Offline-first, service workers | Gratis |

**Total Costo Software Frontend:** USD $0 (100% Open Source)

#### 2.3.3 Herramientas de Desarrollo

| Herramienta | Versión | Licencia | Propósito | Costo |
|-----------|---------|---------|---------|------|
| **Visual Studio Code** | Última | MIT | IDE desarrollo | Gratis |
| **Git/GitHub** | Distribuido | GPL | Control versiones | Gratis (private repos) |
| **npm/Node Package Manager** | Incluido | MIT | Gestor dependencias | Gratis |
| **Angular CLI** | 18.2.14 | MIT | Herramienta compilación/generación | Gratis |
| **ESLint** | 8.50+ | MIT | Linting código | Gratis |
| **Prettier** | 3.0+ | MIT | Formateo automático | Gratis |
| **Postman/Insomnia** | Community | MIT/Apache 2.0 | Testing API REST | Gratis |
| **Jest/Jasmine** | 29+ | MIT | Testing unitario | Gratis |

**Total Costo Herramientas Desarrollo:** USD $0 (100% Open Source)

#### 2.3.4 Infraestructura Cloud (Firebase)

| Servicio | Plan | Especificación | Costo Mensual |
|---------|------|----------------|--------------|
| **Firestore Database** | Pay-as-you-go | 50GB almacenamiento, 5M lecturas/mes | USD $80-150 |
| **Firebase Authentication** | Incluido | OAuth 2.0, proveedores múltiples | Gratis |
| **Cloud Storage** | Pay-as-you-go | 10GB imágenes/archivos | USD $20 |
| **Cloud Messaging** | Incluido | Push notifications en tiempo real | Gratis |
| **Firebase Hosting** | Spark + pago | 10GB hosting PWA, SSL automático | USD $10-30 |
| **Cloud Functions** | Pay-as-you-go | Serverless para backend lógica | USD $10-20 |
| **Cloud Armor** | Básico | DDoS protection, WAF | Incluido |
| **Monitoreo/Logging** | Incluido | Firebase Console, Cloud Logging | Gratis (primeros 50GB/mes) |

**Costo Mensual Firebase (Año 1):** USD $150-250 (Proyectado USD $1,800-3,000/año)

---

### 2.4 Requisitos de Conectividad

| Aspecto | Especificación | Justificación |
|--------|----------------|--------------|
| **Sincronización Firestore** | < 2 segundos latencia máxima | Experiencia usuario real-time |
| **Modo Offline** | 100% funcional (con caché local) | Continuidad aunque falle internet |
| **Ancho de banda WiFi** | 20 Mbps dedicado mínimo | Múltiples dispositivos simultáneos |
| **Internet principal** | 10 Mbps dedicado (carga/descarga) | Firestore sync + backups |
| **Redundancia internet** | Backup 4G LTE | Continuidad operacional crítica |
| **Protocolo de datos** | HTTPS/TLS 1.3 | Encriptación transporte (PCI-DSS compliant) |

---

## 3. ESTIMACIÓN ECONÓMICA

### 3.1 Desglose de Inversión Inicial

#### 3.1.1 Hardware y Dispositivos

| Concepto | Cantidad | Costo Unitario | Costo Total |
|---------|----------|----------------|------------|
| Smartphones Android (Meseros) | 5 | USD $200 | USD $1,000 |
| Tablets Android 10" (Caja/Admin) | 2 | USD $250 | USD $500 |
| Laptop/Desktop (Admin Reporting) | 1 | USD $700 | USD $700 |
| Router WiFi 6 + Access Points | 1 | USD $400 | USD $400 |
| Impresoras Térmicas (Red) | 2 | USD $150 | USD $300 |
| Servidor Local (Backup) | 1 | USD $500 | USD $500 |
| **Subtotal Hardware** | - | - | **USD $3,400** |

#### 3.1.2 Software y Licencias

| Concepto | Cantidad | Costo Unitario | Costo Total |
|---------|----------|----------------|------------|
| Angular/Node.js Frameworks | - | Gratis | USD $0 |
| IDE/Herramientas Desarrollo | - | Gratis | USD $0 |
| Firebase Setup Inicial | - | Gratis | USD $0 |
| Certificado SSL (1 año) | 1 | USD $100 | USD $100 |
| **Subtotal Software** | - | - | **USD $100** |

#### 3.1.3 Desarrollo y Consultoría

| Concepto | Horas | Costo/Hora | Costo Total |
|---------|-------|-----------|------------|
| Análisis y diseño | 80 | USD $50 | USD $4,000 |
| Desarrollo backend (APIs) | 120 | USD $60 | USD $7,200 |
| Desarrollo frontend (UI/UX) | 150 | USD $55 | USD $8,250 |
| Integración Firebase/Firestore | 60 | USD $65 | USD $3,900 |
| Testing y QA | 80 | USD $45 | USD $3,600 |
| Deployment y configuración | 40 | USD $60 | USD $2,400 |
| Documentación técnica | 30 | USD $50 | USD $1,500 |
| Capacitación usuarios | 20 | USD $55 | USD $1,100 |
| **Subtotal Desarrollo** | **580 horas** | - | **USD $31,950** |

#### 3.1.4 Infraestructura Inicial (Firebase Setup)

| Concepto | Cantidad | Costo | Observaciones |
|---------|----------|-------|---------------|
| Firestore Database Setup | 1 | USD $200 | Configuración, índices, reglas seguridad |
| Cloud Storage Setup | 1 | USD $100 | Buckets, políticas, CORS configuration |
| Firebase Hosting Domain | 1 | USD $50 | Dominio + SSL | 
| **Subtotal Infraestructura** | - | - | **USD $350** |

#### 3.1.5 Contingencia y Riesgos (15%)

| Concepto | Base de Cálculo | Porcentaje | Monto |
|---------|-----------------|-----------|--------|
| Contingencia técnica | Desarrollo | 15% | USD $4,792.50 |
| Ajustes y cambios | Hardware + Software | 15% | USD $525 |
| **Subtotal Contingencia** | - | - | **USD $5,317.50** |

#### 3.1.6 INVERSIÓN INICIAL TOTAL

```
Hardware y Dispositivos:        USD $3,400.00
Software y Licencias:            USD $100.00
Desarrollo y Consultoría:      USD $31,950.00
Infraestructura Inicial:         USD $350.00
Contingencia (15%):            USD $5,317.50
────────────────────────────────────────────
INVERSIÓN INICIAL TOTAL:       USD $41,117.50
────────────────────────────────────────────
Equivalente en COP*:         COP $176,623,850
*(Tasa referencia: 1 USD = 4,300 COP aproximado junio 2026)
```

---

### 3.2 Costos Operacionales Anuales

#### 3.2.1 Servicios Cloud (Firebase)

| Servicio | Costo Mensual | Costo Anual |
|---------|--------------|-----------|
| Firestore Database (escrituras/lecturas) | USD $120 | USD $1,440 |
| Cloud Storage (imágenes/archivos) | USD $20 | USD $240 |
| Firebase Hosting | USD $15 | USD $180 |
| Cloud Functions (backend lógica) | USD $15 | USD $180 |
| **Subtotal Cloud Servicios** | **USD $170** | **USD $2,040** |

#### 3.2.2 Soporte y Mantenimiento

| Concepto | Descripción | Costo Anual |
|---------|-------------|-----------|
| Soporte técnico (4 hrs/semana) | Soporte L1/L2, incidentes críticos | USD $5,000 |
| Mantenimiento software | Updates, patches, mejoras menores | USD $3,000 |
| Mantenimiento hardware | Reparaciones, reemplazo dispositivos | USD $2,000 |
| Backup y recuperación desastres | Storage backup, testing RTO/RPO | USD $1,500 |
| **Subtotal Soporte y Mantenimiento** | - | **USD $11,500** |

#### 3.2.3 Licencias y Herramientas

| Concepto | Descripción | Costo Anual |
|---------|-------------|-----------|
| IDE profesional (VS Code Premium) | Soporte, extensiones | USD $0 (Open Source) |
| Herramientas testing/monitoring | Sentry, Datadog monitoring | USD $1,500 |
| Gestión proyectos (Jira/Trello) | Seguimiento desarrollo | USD $400 |
| **Subtotal Licencias y Herramientas** | - | **USD $1,900** |

#### 3.2.4 Conectividad e Internet

| Concepto | Descripción | Costo Anual |
|---------|-------------|-----------|
| Internet dedicado (20 Mbps) | Proveedor ISP principal | USD $1,200 |
| Backup 4G LTE router móvil | Continuidad ante corte internet | USD $600 |
| **Subtotal Conectividad** | - | **USD $1,800** |

#### 3.2.5 COSTOS OPERACIONALES ANUALES TOTAL

```
Cloud Servicios (Firebase):           USD $2,040.00
Soporte y Mantenimiento:             USD $11,500.00
Licencias y Herramientas:             USD $1,900.00
Conectividad e Internet:              USD $1,800.00
────────────────────────────────────────────────
COSTOS OPERACIONALES ANUALES:        USD $17,240.00
────────────────────────────────────────────────
Equivalente en COP:               COP $74,132,000
```

---

### 3.3 Proyección Económica 5 Años

#### 3.3.1 Flujo de Caja Proyectado

| Año | Inversión Inicial | Costos Operacionales | Costos Acumulados | Ahorros Proyectados* |
|-----|-------------------|----------------------|-------------------|----------------------|
| **Año 1** | USD $41,117.50 | USD $17,240.00 | USD $58,357.50 | USD $45,000.00 |
| **Año 2** | USD $0.00 | USD $17,240.00 | USD $75,597.50 | USD $55,000.00 |
| **Año 3** | USD $0.00 | USD $17,240.00 | USD $92,837.50 | USD $65,000.00 |
| **Año 4** | USD $0.00 | USD $17,240.00 | USD $110,077.50 | USD $75,000.00 |
| **Año 5** | USD $0.00 | USD $17,240.00 | USD $127,317.50 | USD $85,000.00 |
| **TOTAL 5 AÑOS** | **USD $41,117.50** | **USD $86,200.00** | **USD $127,317.50** | **USD $325,000.00** |

*Ahorros: Reducción costos manuales (labor), incremento transacciones, mejora eficiencia operacional

#### 3.3.2 Métricas Financieras

```
┌────────────────────────────────────────────────┐
│         ANÁLISIS RETORNO DE INVERSIÓN          │
├────────────────────────────────────────────────┤
│                                                │
│  Inversión Total (5 años):      USD $127,318   │
│  Ahorros/Ingresos (5 años):     USD $325,000   │
│  Beneficio Neto:                USD $197,682   │
│  ROI Porcentaje (5 años):           155.2%    │
│  Período de Recuperación:          1.9 años   │
│  Costo Anual Promedio:           USD $25,464   │
│  Beneficio Anual Promedio:       USD $65,000   │
│                                                │
└────────────────────────────────────────────────┘
```

#### 3.3.3 Beneficios Cuantitativos

1. **Automatización Procesos**
   - Reducción 70% tiempo toma de órdenes
   - Eliminación errores manuales: -40%
   - Ahorro labor: USD $12,000/año

2. **Mejora Eficiencia Operacional**
   - Incremento transacciones 50% (capacidad)
   - Tiempo ciclo mejora 35%
   - Ingresos adicionales: USD $15,000/año

3. **Reducción Pérdidas y Fraude**
   - Control real-time de inventario
   - Trazabilidad completa transacciones
   - Reducción discrepancias: USD $8,000/año

4. **Generación Datos e Inteligencia**
   - Análisis ventas real-time
   - Optimización menú basada en datos
   - Mejora decisiones: USD $20,000/año

5. **Acceso Digital/Omnicanalidad**
   - Potencial futuro facturación electrónica
   - Posibilidad integración apps delivery
   - Ingresos futuros estimados: USD $30,000/año

---

### 3.4 Dimensionamiento de Licencias de Software

#### 3.4.1 Matriz de Licencias por Categoría

| Categoría | Software | Versión | Licencia | Períodos | Usuarios | Costo/Período |
|-----------|----------|---------|---------|----------|----------|---------------|
| **Desarrollo** | Node.js/npm | 25.0.0+ | MIT | 1 (perpetua) | 2 devs | USD $0 |
| **Desarrollo** | Angular CLI | 18.2.14 | MIT | 1 (perpetua) | 2 devs | USD $0 |
| **Desarrollo** | TypeScript | 5.5.4 | Apache 2.0 | 1 (perpetua) | 2 devs | USD $0 |
| **Desarrollo** | VS Code | Última | MIT | 1 (perpetua) | 2 devs | USD $0 |
| **Desarrollo** | Git/GitHub | - | GPL | 1 (perpetua) | 3 users | USD $0 |
| **Cloud** | Firebase Blaze | Pro | Pay-as-you-go | Mensual | Ilimitados | USD $170/mes |
| **Monitoreo** | Sentry | Teams | SaaS | Anual | 10 devs | USD $1,500/año |
| **Hosting** | GCP Compute | Standard | Pay-as-you-go | Mensual | - | USD $150-200/mes |

#### 3.4.2 Resumen Licencias

```
┌─────────────────────────────────────────────┐
│      DIMENSIONAMIENTO TOTAL LICENCIAS       │
├─────────────────────────────────────────────┤
│                                             │
│  Licencias Open Source:         USD $0      │
│  Cloud Services (Firestore):   USD $2,040   │
│  Herramientas Monitoreo:       USD $1,900   │
│  Hosting/Infraestructura:      USD $2,100   │
│                                             │
│  TOTAL ANUAL LICENCIAS:        USD $6,040   │
│  Equivalente COP:          COP $25,972,000  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. ANÁLISIS TÉCNICO INTEGRAL

### 4.1 Validación de Requisitos Técnicos vs. Solución

| Requisito Proyecto | Especificación Técnica | Cumplimiento |
|------------------|----------------------|-------------|
| 3 roles de usuario (Mesero, Cajero, Admin) | Angular con role-based guards, interfaces diferenciadas | ✅ Sí |
| Múltiples dispositivos (móvil, tablet, desktop) | PWA responsive, TailwindCSS mobile-first, offline-first | ✅ Sí |
| Sincronización real-time < 2 seg | Firestore listeners, Cloud Messaging, WebSocket | ✅ Sí |
| Modo offline completo | Service Workers, IndexedDB cache, sincronización eventual | ✅ Sí |
| Control de transacciones seguro | HTTPS/TLS 1.3, autenticación Firebase, auditoría Firestore | ✅ Sí |
| Escalabilidad (crecimiento 20%/año) | Firestore auto-escalable, Cloud Functions serverless | ✅ Sí |
| Disponibilidad 99.9% | Firebase SLA 99.95%, multi-region failover, backups automáticos | ✅ Sí |

### 4.2 Análisis de Viabilidad Técnica

**Fortalezas:**
- ✅ Stack 100% open source (reduces licensing)
- ✅ Firebase managed services (reduces ops burden)
- ✅ PWA technology proven en producción
- ✅ Arquitectura serverless (no DevOps especializado)
- ✅ Offline-first strategy robusta

**Riesgos Técnicos:**
- ⚠️ Vendor lock-in Firebase (mitigado: export data)
- ⚠️ Curva aprendizaje Angular Signals (mitigado: documentación, capacitación)
- ⚠️ Limite escrituras Firestore (mitigado: batching, caching)

**Recomendaciones:**
1. Realizar PoC (Proof of Concept) fase offline-first
2. Load testing simulación 100 transacciones/minuto
3. Plan contingencia proveedor (backup Azure)

---

## 5. CONCLUSIONES

### 5.1 Viabilidad del Proyecto

El presente análisis de referentes técnicos y estimación de condiciones económicas **VALIDA LA VIABILIDAD** del proyecto Sistema POS y Facturación Electrónica para el Restaurante Señor Hornado bajo los siguientes fundamentos:

#### 5.1.1 Viabilidad Técnica

✅ **CONFIRMADA**

La solución propuesta cumple íntegramente los requisitos técnicos establecidos en la fase de análisis:

1. **Arquitectura moderna y escalable** basada en PWA con offline-first que asegura continuidad operacional
2. **Tecnología cloud-native** (Firebase/Firestore) que garantiza sincronización real-time < 2 segundos
3. **Stack 100% open source** que elimina costos de licencia de plataforma
4. **Especificaciones hardware accesibles** con dispositivos comerciales estándar (smartphones Android, tablets)
5. **Infraestructura cloud resiliente** con SLA 99.95% y backups automáticos

#### 5.1.2 Viabilidad Económica

✅ **CONFIRMADA**

Los análisis financieros demuestran rentabilidad clara del proyecto:

1. **Inversión inicial moderada** de USD $41,118 (COP $176.6M) recuperable en 1.9 años
2. **ROI positivo 155.2%** en horizonte 5 años con beneficio neto USD $197,682
3. **Costos operacionales predecibles** USD $17,240/año (USD $1,437/mes)
4. **Beneficios cuantitativos identificados** USD $325,000 en ahorro y nuevos ingresos (5 años)
5. **Estructura de costos transparente** sin sorpresas por vendor lock-in

#### 5.1.3 Alineación con Objetivos Organizacionales

✅ **CONFIRMADA**

La solución propuesta alinea directamente con los objetivos estratégicos del Restaurante Señor Hornado:

1. **Mejora eficiencia operacional:** -70% tiempo toma órdenes, -40% errores
2. **Modernización proceso negocio:** Transición digital completa POS manual → electrónico
3. **Preparación facturación electrónica:** Integración futura DIAN sin rediseño
4. **Escalabilidad sostenible:** Crecimiento 20% anual soportado por infraestructura
5. **Control y transparencia:** Auditoría completa, trazabilidad real-time, reportes analíticos

### 5.2 Recomendaciones de Implementación

1. **Fase 1: Preparación (4 semanas)**
   - Adquisición hardware según especificaciones
   - Configuración infraestructura Firebase
   - Capacitación técnica equipo

2. **Fase 2: Desarrollo (12 semanas)**
   - Sprint 1-2: Backend APIs, autenticación
   - Sprint 3-4: Frontend módulos principales
   - Sprint 5: Testing, optimización, deployment

3. **Fase 3: Validación (2 semanas)**
   - UAT con usuarios finales (Mesero, Cajero, Admin)
   - Load testing y performance tuning
   - Capacitación operacional

4. **Fase 4: Lanzamiento (1 semana)**
   - Go-live ambiente producción
   - Soporte intensivo primeros días
   - Monitoreo 24/7

### 5.3 Próximos Pasos

Este documento constituye la **base técnica y económica** para proceder a:

1. **Análisis de proveedores** (si se requiere outsourcing)
2. **Elaboración propuesta técnica y financiera final**
3. **Aprobación presupuestal** por dirección restaurante
4. **Contratación desarrollo** y/o team assembly
5. **Inicio fase implementación**

---

## ANEXOS

### Anexo A: Normas y Referencias Técnicas

- ISO/IEC 9126: Evaluación de la Calidad del Software
- ISO/IEC 25010: Modelos de Calidad de Software y Datos
- IEEE 830: Especificación de Requisitos de Software
- Estándares ICONTEC: Documentación técnica profesional
- Google Cloud: Firebase Best Practices
- W3C: PWA Specifications (Web App Manifest, Service Workers)

### Anexo B: Glosario de Términos

- **PWA:** Progressive Web Application
- **Firestore:** Base de datos NoSQL en tiempo real de Google Cloud
- **SLA:** Service Level Agreement
- **ROI:** Return on Investment
- **RTO/RPO:** Recovery Time/Point Objectives
- **TLS:** Transport Layer Security
- **ACID:** Atomicity, Consistency, Isolation, Durability

### Anexo C: Referencias Herramientas y Versiones

- Node.js v25.0.0 LTS (https://nodejs.org)
- Angular 18.2.14 (https://angular.io)
- Firebase Documentation (https://firebase.google.com/docs)
- TailwindCSS 3.4.19 (https://tailwindcss.com)
- TypeScript 5.5.4 (https://www.typescriptlang.org)

---

**Documento:** Evidencia GA2-220501094-AA1-EV03
**Versión:** 1.0
**Fecha:** Junio 11, 2026
**Estado:** COMPLETADO ✅
**Aprobado para entrega:** Sí

# PROPUESTA TÉCNICA Y ECONÓMICA
## Para la Implementación del Sistema POS y Facturación Electrónica

---

## 📄 DOCUMENTO FORMAL DE PROPUESTA

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║                    SOLUTIONS & TECH CONSULTING                          ║
║                          www.solutionstc.com                            ║
║                                                                          ║
║                    Propuesta Técnica y Económica                         ║
║                    Para Implementación de Proyecto POS                   ║
║                                                                          ║
║                     Versión: 1.0 | Junio 2026                           ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 1. PRESENTACIÓN Y SALUDOS

Estimado Señor/a Manager del Restaurante Señor Hornado,

Reciba un cordial saludo de parte del equipo de **SOLUTIONS & TECH CONSULTING**, consultora especializada en transformación digital y soluciones empresariales para el sector gastronómico.

Nos complace presentarle esta **Propuesta Técnica y Económica** para la implementación del **Sistema POS y Facturación Electrónica** que modernizará significativamente sus operaciones diarias y posicionará a su establecimiento a la vanguardia de la digitalización en el sector.

### 1.1 Acerca de Solutions & Tech Consulting

| Aspecto | Detalles |
|--------|---------|
| **Firma Consultora** | Solutions & Tech Consulting S.A.S. |
| **Especialidad** | Transformación Digital, Sistemas POS, Facturación Electrónica |
| **Experiencia** | 15+ años en sector HORECA (Hoteles, Restaurantes, Cafés) |
| **Clientes Satisfechos** | 120+ establecimientos en Colombia |
| **Certificaciones** | ISO 27001, ISO 9001, DIAN acreditados |
| **Equipo Técnico** | 8 desarrolladores, 3 analistas, 2 especialistas DIAN |

### 1.2 Objetivo de la Propuesta

Presentar **opciones de solución técnica viables** para:
1. Optimizar el proceso de toma de órdenes y gestión de mesas
2. Automatizar caja y procedimientos de pago
3. Preparar infraestructura para facturación electrónica DIAN
4. Implementar análisis real-time de ventas y operaciones
5. Garantizar continuidad operacional con capacidad offline

---

## 2. ALCANCE DE LA PROPUESTA

### 2.1 Módulos Incluidos

La solución comprende la implementación de **tres módulos funcionales integrados**:

#### **Módulo 1: Gestión de Mesas y Órdenes (Meseros)**
- Interfaz mobile-first para smartphones Android
- Gestión estado mesas (libre, ocupada, pagando)
- Toma de órdenes con especificaciones y notas
- Consulta menú en tiempo real con disponibilidad
- Cierre de órdenes con confirmación chef

#### **Módulo 2: Gestión de Caja y Pagos (Cajero)**
- Interfaz tablet optimizada (10")
- Registro transacciones con múltiples métodos pago
- Generación facturas preliminares (pre-facturación)
- Cierre de caja con corte de turno
- Reportes transaccionales detallados

#### **Módulo 3: Administración y Reportes (Gerente/Admin)**
- Dashboard ejecutivo con KPIs principales
- Gestión de usuarios y permisos por rol
- Configuración menú de productos
- Reportes analíticos (ventas, productos, rentabilidad)
- Auditoría de transacciones y cambios

### 2.2 Funcionalidades Transversales

- ✅ **Autenticación segura** con PIN y contraseña
- ✅ **Sincronización real-time** < 2 segundos (cuando hay conexión)
- ✅ **Modo offline completo** con sincronización automática
- ✅ **Auditoría y trazabilidad** de todas las operaciones
- ✅ **Encriptación de datos** (AES-256, TLS 1.3)
- ✅ **Respaldo automático** diario en cloud
- ✅ **Disponibilidad 99.9%** con SLA garantizado

### 2.3 NO Incluido en el Alcance

- ❌ Integración con sistemas legacy existentes (fuera alcance inicial)
- ❌ Desarrollo de aplicación de clientes/pedidos online
- ❌ Integración con plataformas delivery (DoorDash, Rappi)
- ❌ Sistema de fidelización de clientes
- ❌ Hardware personalizado (proveemos especificaciones)

---

## 3. VALORACIÓN DE LA SITUACIÓN

### 3.1 Diagnóstico Inicial

Mediante análisis de la situación actual del Restaurante Señor Hornado, se identifican los siguientes **puntos críticos**:

#### **Desafíos Operacionales**

| Problema | Impacto Actual | Impacto Potencial |
|----------|----------------|-------------------|
| Toma manual de órdenes en papel | +15 minutos/orden, errores 12% | Clientes insatisfechos, pérdida ingresos |
| Gestión caja manual en cuadernos | Discrepancias $200-500/día | Desconfianza, auditorías complejas |
| Sin trazabilidad de transacciones | Imposible identificar errores | Problemas con DIAN, falta control |
| Cierre manual de turno (2-3 hrs) | Retraso staff, cansancio | Errores, poca precisión |
| Sin reportes en tiempo real | Decisiones basadas en memoria | Mala planificación, decisiones reactivas |
| Tecnología obsoleta/inexistente | Operación completamente manual | Imposibilidad cumplir regulación DIAN |
| Riesgos seguridad (dinero físico) | Robos ocasionales, inseguridad | Pérdidas de patrimonio |

#### **Oportunidades de Mejora Identificadas**

1. **Automatización procesos:** Potencial reducción 60-70% tiempo operacional
2. **Mejora precisión:** Eliminación errores, trazabilidad completa
3. **Escalabilidad:** Preparación para crecimiento sin aumentar costos operativos
4. **Cumplimiento regulatorio:** Facturación electrónica DIAN lista para implementación
5. **Análisis de negocio:** Datos para decisiones estratégicas
6. **Experiencia cliente:** Servicio más rápido y confiable

### 3.2 Requerimientos Confirmados

Basados en sesiones de análisis con el equipo de Señor Hornado:

| Requerimiento | Prioridad | Justificación |
|---------------|-----------|--------------|
| 3 roles de usuario con permisos diferenciados | CRÍTICA | Control operacional y seguridad |
| Soporte múltiples dispositivos (móvil/tablet/desktop) | CRÍTICA | Flexibilidad operacional |
| Funcionamiento offline | CRÍTICA | Internet inestable en zona |
| Sincronización real-time < 2 seg | ALTA | Experiencia usuario aceptable |
| Generación reportes 24/7 | ALTA | Toma decisiones oportuna |
| Integración futura facturación DIAN | ALTA | Preparación normativa |
| Seguridad de datos (encriptación) | CRÍTICA | Cumplimiento legal |
| SLA 99.9% disponibilidad | MEDIA | Minimizar pérdidas operacionales |

---

## 4. OPCIONES DE PROPUESTA

### 4.1 OPCIÓN 1: SOLUCIÓN CLOUD COMPLETA (Recomendada para PyMEs)

**Denominación:** "Modelo SaaS Cloud-Native Híbrido"

#### 4.1.1 Descripción Técnica

Una solución **100% nativa en la nube** utilizando **Firebase/Firestore** como plataforma de base de datos y autenticación, con frontend **Angular PWA** que garantiza experiencia offline-first.

**Arquitectura Opción 1:**
```
┌──────────────────────────────────────────────────────┐
│                  CAPA PRESENTACIÓN                   │
│  Angular 18 PWA | TailwindCSS | Offline-First       │
│   Mesero(Móvil) | Cajero(Tablet) | Admin(Desktop)   │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS/TLS 1.3
                   ↓
┌──────────────────────────────────────────────────────┐
│             CAPA LÓGICA DE NEGOCIO                   │
│  Node.js + Express | Funciones Cloud | Servicios    │
│           Google Cloud Platform (GCP)                │
└──────────────────┬───────────────────────────────────┘
                   │ APIs REST/Realtime DB
                   ↓
┌──────────────────────────────────────────────────────┐
│            CAPA DE DATOS (Cloud)                     │
│  Firebase Firestore (NoSQL) | Cloud Storage         │
│  Autenticación | Cloud Messaging | Backups Auto     │
└──────────────────────────────────────────────────────┘
```

#### 4.1.2 Componentes Tecnológicos

| Componente | Tecnología | Razón Selección |
|-----------|-----------|-----------------|
| **Frontend** | Angular 18.2 + Signals | Modernidad, componentes reactivos eficientes |
| **Estilos** | TailwindCSS 3.4 | Mobile-first, responsive, mantenible |
| **Backend** | Node.js + Express | Escalable, eficiente, ecosistema robusto |
| **BD Principal** | Firestore NoSQL | Real-time sync, serverless, scaling automático |
| **Autenticación** | Firebase Auth | Segura, multi-factor, OAuth integrado |
| **Hosting** | Google Cloud Platform | Confiable, SLA 99.95%, integración native |
| **Offline** | Service Workers + IndexedDB | Sync eventual cuando haya conexión |
| **Monitoreo** | Cloud Logging + Sentry | Observabilidad, alertas proactivas |

#### 4.1.3 Ventajas Opción 1

✅ **Costo inicial bajo:** USD $41,118 (inversión mínima)
✅ **Implementación rápida:** 12-14 semanas vs 16-18 de alternativas
✅ **Escalabilidad automática:** No requiere DevOps especializado
✅ **Mantenimiento mínimo:** Infraestructura administrada por Google
✅ **Seguridad probada:** Firebase SLA 99.95%, PCI-DSS compliant
✅ **Offline-first nativo:** Funcionalidad completa sin internet
✅ **Costo operacional predecible:** USD $17,240/año sin sorpresas
✅ **Preparada para DIAN:** Integración sencilla futura

#### 4.1.4 Desventajas Opción 1

⚠️ **Vendor lock-in Firebase:** Dependencia Google (mitigable con export data)
⚠️ **Conexión internet crítica:** Para sincronización en tiempo real (offline mitiga)
⚠️ **Latencia internacional:** Servidores Firebase en USA (< 150ms típico)
⚠️ **Límites Firestore:** Máximo 1MB documento, 10,000 escrituras/segundo/colección
⚠️ **Curva aprendizaje:** Angular Signals requiere capacitación

#### 4.1.5 Cronograma Implementación Opción 1

| Fase | Duración | Actividades |
|------|----------|------------|
| **Fase 0: Preparación** | 2 semanas | Infraestructura GCP, capacitación equipo |
| **Fase 1: Backend** | 4 semanas | APIs REST, autenticación, Firestore setup |
| **Fase 2: Frontend Mesero** | 3 semanas | UI móvil, toma órdenes, consulta menú |
| **Fase 3: Frontend Caja** | 3 semanas | Gestión pagos, cierre caja, reportes |
| **Fase 4: Admin & Reportes** | 2 semanas | Dashboard, configuración, auditoría |
| **Fase 5: Testing & QA** | 2 semanas | UAT, performance tuning, security audit |
| **Go-live** | 1 semana | Deployment producción, soporte intensivo |
| **TOTAL** | **17 semanas** | - |

#### 4.1.6 Especificación Hardware Opción 1

| Dispositivo | Cantidad | Especificación | Costo Unitario |
|-----------|----------|----------------|----------------|
| Smartphones Android (Mesero) | 5 | 6.5" FHD, 4GB RAM, 64GB | USD $200 |
| Tablets Android (Caja/Admin) | 2 | 10" IPS, 6GB RAM, 128GB | USD $250 |
| Laptop Admin | 1 | i5/8GB/256GB SSD | USD $700 |
| WiFi 6 + Access Points | 1 set | 802.11ax, 3 puntos acceso | USD $400 |
| Impresoras Térmicas (Red) | 2 | 80mm, 300mm/s | USD $150 c/u |
| TOTAL HARDWARE | - | - | **USD $3,400** |

---

### 4.2 OPCIÓN 2: SOLUCIÓN HÍBRIDA ENTERPRISE (Para Máximo Control)

**Denominación:** "Modelo Híbrido Cloud+Local con Integración Legacy"

#### 4.2.1 Descripción Técnica

Una solución **híbrida** que combina:
- **Servidor local** con control total de datos críticos
- **Cloud backup** para redundancia y desastres
- **Integración posible** con sistemas legacy existentes
- **Mayor independencia** de proveedores cloud

**Arquitectura Opción 2:**
```
┌─────────────────────────────────────────────────────┐
│              CAPA PRESENTACIÓN                      │
│  Angular 18 PWA | TailwindCSS | Offline-First      │
│   Mesero(Móvil) | Cajero(Tablet) | Admin(Desktop)  │
└────────────┬────────────────────────────────────────┘
             │ HTTPS/TLS 1.3 (Dual: Cloud + Local)
             ↓
    ┌────────────────┴─────────────────┐
    ↓                                   ↓
┌──────────────────────┐      ┌────────────────────┐
│ SERVIDOR LOCAL       │      │ CLOUD BACKUP       │
│ (Restaurante)        │      │ (Sincronización)   │
├──────────────────────┤      ├────────────────────┤
│ Node.js + PostgreSQL │◄────►│ Firebase Firestore │
│ (Datos Primarios)    │      │ (Redundancia)      │
│ Linux Server         │      │ GCP                │
│ Ubuntu 22.04         │      │                    │
└──────────────────────┘      └────────────────────┘
         ↓ (Consultas Legacy)
┌──────────────────────┐
│ SISTEMA LEGACY       │
│ (si existe)          │
│ ej: sistema inventario
└──────────────────────┘
```

#### 4.2.2 Componentes Tecnológicos

| Componente | Tecnología | Razón Selección |
|-----------|-----------|-----------------|
| **Frontend** | Angular 18.2 + Signals | Idéntico a Opción 1 |
| **Servidor Local** | Ubuntu 22.04 LTS + Docker | Control total, aislamiento |
| **BD Principal (Local)** | PostgreSQL 15 | SQL confiable, mejor control |
| **BD Backup (Cloud)** | Firestore + PostgreSQL Cloud | Redundancia geográfica |
| **Backend** | Node.js + Express + GraphQL | APIs escalables, consultas eficientes |
| **Contenedores** | Docker + Docker Compose | Deployment reproducible |
| **Replicación** | Logical Replication | Sincronización automática |
| **Integración Legacy** | REST/API wrappers | Compatibilidad sistemas antiguos |
| **Monitoreo** | Prometheus + Grafana (local) | Visibilidad total operacional |

#### 4.2.3 Ventajas Opción 2

✅ **Control total de datos:** BD on-premises, independencia vendor
✅ **Cumplimiento normativa:** Mayor flexibilidad regulatoria
✅ **Integración legacy:** Puentes a sistemas existentes
✅ **Mejor latencia local:** Respuesta < 50ms en red LAN
✅ **Privacidad datos:** Información sensible nunca sale on-premises
✅ **Flexibilidad técnica:** Customización sin restricciones
✅ **Redundancia completa:** Cloud backup automático
✅ **Auditoría interna:** Logs completos bajo control

#### 4.2.4 Desventajas Opción 2

⚠️ **Costo inicial alto:** USD $58,500 (inversión 42% mayor)
⚠️ **Implementación lenta:** 16-18 semanas (+4-5 semanas análisis legacy)
⚠️ **Complejidad operacional:** Requiere personal IT especializado
⚠️ **Mantenimiento activo:** Actualizaciones, parches, backups
⚠️ **Riesgo de hardware:** Falla servidor local afecta operaciones
⚠️ **Costo operacional mayor:** USD $22,400/año (+30% vs Opción 1)
⚠️ **Escalabilidad limitada:** Dependencia capacidad hardware local

#### 4.2.5 Cronograma Implementación Opción 2

| Fase | Duración | Actividades |
|------|----------|------------|
| **Fase 0: Preparación** | 3 semanas | Análisis legacy, arquitectura híbrida, procurement |
| **Fase 1: Infraestructura** | 2 semanas | Servidor local, configuración Docker, BD PostgreSQL |
| **Fase 2: Backend Local** | 5 semanas | APIs Node.js, lógica negocio, replicación cloud |
| **Fase 3: Integración Legacy** | 3 semanas | Mapeo datos, APIs wrapper, testing integración |
| **Fase 4: Frontend** | 4 semanas | Módulos móvil, tablet, desktop |
| **Fase 5: Testing & Disaster Recovery** | 2 semanas | UAT, failover testing, plan recuperación |
| **Go-live** | 1 semana | Deployment gradual, soporte intensivo |
| **TOTAL** | **20 semanas** | - |

#### 4.2.6 Especificación Hardware Opción 2

| Componente | Cantidad | Especificación | Costo Unitario |
|-----------|----------|----------------|----------------|
| **Servidor Local (Principal)** | 1 | Rack 2U, Xeon 8-core, 32GB RAM, RAID-1 SSD | USD $2,500 |
| **Servidor Backup (Local)** | 1 | Idéntico principal para failover automático | USD $2,500 |
| **UPS (Uninterruptible Power Supply)** | 1 | 10 kVA, 30 minutos backup | USD $800 |
| **Dispositivos Cliente** | 5+2+1 | Idénticos Opción 1 (móviles, tablets, laptop) | USD $3,400 |
| **Infraestructura Red** | 1 | WiFi 6, cableado categoría 7, patch panel | USD $600 |
| **TOTAL HARDWARE** | - | - | **USD $10,200** |

---

## 5. ESTIMACIÓN DE COSTOS

### 5.1 Matriz Comparativa de Costos

#### **OPCIÓN 1: Solución Cloud Completa**

**Inversión Inicial:**
```
Hardware y Dispositivos                USD $3,400.00
Software y Licencias Iniciales         USD $100.00
Desarrollo Aplicación (580 hrs)       USD $31,950.00
Infraestructura Cloud Setup            USD $350.00
Contingencia y Riesgos (15%)          USD $5,317.50
────────────────────────────────────────────────
INVERSIÓN INICIAL OPCIÓN 1            USD $41,117.50
────────────────────────────────────────────────
```

**Costos Operacionales Anuales (Año 1):**
```
Firebase Cloud Services                USD $2,040.00
Hosting y Almacenamiento              USD $1,200.00
Soporte Técnico (40 hrs/mes)          USD $5,000.00
Mantenimiento y Actualizaciones       USD $3,000.00
Monitoreo y Seguridad                 USD $1,500.00
Conectividad Internet                 USD $1,800.00
Herramientas de Desarrollo            USD $1,500.00
────────────────────────────────────────────────
COSTOS OPERACIONALES AÑO 1            USD $16,040.00
────────────────────────────────────────────────
```

**Proyección 5 Años Opción 1:**
```
Año 1: Inversión USD $41,118 + Ops USD $16,040 = USD $57,158
Año 2: Ops USD $16,040/año
Año 3: Ops USD $16,040/año + Refresh hardware USD $1,500
Año 4: Ops USD $16,040/año
Año 5: Ops USD $16,040/año

TOTAL 5 AÑOS: USD $121,278
PROMEDIO ANUAL: USD $24,256
```

---

#### **OPCIÓN 2: Solución Híbrida Enterprise**

**Inversión Inicial:**
```
Hardware Local (Servidores + UPS)     USD $6,400.00
Hardware Dispositivos Cliente         USD $3,400.00
Software PostgreSQL + Herramientas    USD $200.00 (licencias)
Desarrollo Aplicación (720 hrs)      USD $42,300.00
Infraestructura On-Premises Setup     USD $1,200.00
Análisis e Integración Legacy (40 hrs) USD $2,200.00
Contingencia y Riesgos (15%)          USD $6,750.00
────────────────────────────────────────────────
INVERSIÓN INICIAL OPCIÓN 2            USD $62,450.00
────────────────────────────────────────────────
```

**Costos Operacionales Anuales (Año 1):**
```
Cloud Backup Services (Firebase)      USD $2,500.00
Servidor Local Mantenimiento         USD $3,500.00
Personal IT On-Premises (1 FTE)      USD $12,000.00
Soporte Técnico Especializado        USD $6,000.00
Actualización Hardware Anual         USD $2,000.00
Conectividad Internet + Backup       USD $2,400.00
Herramientas Monitoreo/Seguridad     USD $2,000.00
────────────────────────────────────────────────
COSTOS OPERACIONALES AÑO 1            USD $30,400.00
────────────────────────────────────────────────
```

**Proyección 5 Años Opción 2:**
```
Año 1: Inversión USD $62,450 + Ops USD $30,400 = USD $92,850
Año 2: Ops USD $30,400/año
Año 3: Ops USD $30,400/año + Hardware refresh USD $3,500
Año 4: Ops USD $30,400/año
Año 5: Ops USD $30,400/año

TOTAL 5 AÑOS: USD $217,050
PROMEDIO ANUAL: USD $43,410
```

---

### 5.2 Análisis Comparativo Financiero

| Métrica | Opción 1 | Opción 2 | Ventaja |
|--------|---------|---------|---------|
| **Inversión Inicial** | USD $41,118 | USD $62,450 | Opción 1: -34% |
| **Año 1 Total** | USD $57,158 | USD $92,850 | Opción 1: -38% |
| **Costo Anual Promedio** | USD $24,256 | USD $43,410 | Opción 1: -44% |
| **ROI (5 años)** | 155.2% | 89.3% | Opción 1: +66pp |
| **Período Recuperación** | 1.9 años | 2.8 años | Opción 1: -0.9 años |
| **Tiempo Implementación** | 17 semanas | 20 semanas | Opción 1: 3 semanas antes |
| **Complejidad Operacional** | Baja | Alta | Opción 1: Menor dependencia |
| **Dependencia Personal IT** | Mínima | Alta (1 FTE) | Opción 1: Reducida |

### 5.3 Beneficios Cuantitativos (Ambas Opciones)

Independientemente de la opción elegida, se proyectan **beneficios operacionales iguales**:

| Beneficio | Ahorro Anual | Cálculo |
|----------|------------|---------|
| **Automatización toma órdenes** | USD $12,000 | -70% tiempo (labor) |
| **Eficiencia caja y pagos** | USD $8,000 | -50% tiempo cierre |
| **Reducción errores/pérdidas** | USD $8,000 | Control real-time |
| **Análisis datos/optimización menú** | USD $15,000 | Decisiones basadas datos |
| **Incremento capacidad (15% tx/día)** | USD $25,000 | Más transacciones, mismo staff |
| **Reducción riesgos seguridad** | USD $6,000 | Menos dinero efectivo manejado |
| **TOTAL BENEFICIOS ANUALES** | **USD $74,000** | - |

**Conclusión Financiera:** Con beneficios de USD $74,000/año, **ambas opciones son rentables**, pero Opción 1 recupera inversión 0.9 años antes.

---

## 6. COTIZACIÓN POR OPCIÓN

### 6.1 COTIZACIÓN OPCIÓN 1: SOLUCIÓN CLOUD COMPLETA

```
╔════════════════════════════════════════════════════════════════╗
║                     COTIZACIÓN FORMAL                         ║
║              SOLUCIÓN CLOUD COMPLETA - OPCIÓN 1              ║
║              PROYECTO POS SEÑOR HORNADO                       ║
╚════════════════════════════════════════════════════════════════╝
```

| ÍTEM | DESCRIPCIÓN | CANTIDAD | VALOR UNITARIO | VALOR TOTAL |
|-----|-----------|----------|----------------|------------|
| **1. HARDWARE Y DISPOSITIVOS** | | | | |
| 1.1 | Smartphone Android 6.5" (Meseros) | 5 | USD $200 | USD $1,000 |
| 1.2 | Tablet Android 10" (Caja/Admin) | 2 | USD $250 | USD $500 |
| 1.3 | Laptop i5 8GB/256GB (Admin) | 1 | USD $700 | USD $700 |
| 1.4 | Router WiFi 6 + Access Points (3) | 1 | USD $400 | USD $400 |
| 1.5 | Impresoras Térmicas 80mm | 2 | USD $150 | USD $300 |
| **SUBTOTAL HARDWARE** | | | | **USD $2,900** |
| | | | | |
| **2. SOFTWARE Y LICENCIAS** | | | | |
| 2.1 | Certificado SSL Domain (1 año) | 1 | USD $100 | USD $100 |
| 2.2 | Software de Desarrollo (Open Source) | - | USD $0 | USD $0 |
| **SUBTOTAL SOFTWARE** | | | | **USD $100** |
| | | | | |
| **3. DESARROLLO Y PERSONALIZACIÓN** | | | | |
| 3.1 | Análisis y Diseño (80 hrs @ USD $50) | 80 | USD $50 | USD $4,000 |
| 3.2 | Desarrollo Backend APIs (120 hrs @ USD $60) | 120 | USD $60 | USD $7,200 |
| 3.3 | Desarrollo Frontend Mesero (80 hrs @ USD $55) | 80 | USD $55 | USD $4,400 |
| 3.4 | Desarrollo Frontend Caja (70 hrs @ USD $55) | 70 | USD $55 | USD $3,850 |
| 3.5 | Desarrollo Admin/Dashboard (60 hrs @ USD $55) | 60 | USD $55 | USD $3,300 |
| 3.6 | Integración Firebase/Firestore (60 hrs @ USD $65) | 60 | USD $65 | USD $3,900 |
| 3.7 | Testing y QA (80 hrs @ USD $45) | 80 | USD $45 | USD $3,600 |
| 3.8 | Deployment y Configuración (40 hrs @ USD $60) | 40 | USD $60 | USD $2,400 |
| 3.9 | Documentación Técnica (30 hrs @ USD $50) | 30 | USD $50 | USD $1,500 |
| 3.10 | Capacitación Usuarios 3 Roles (20 hrs @ USD $55) | 20 | USD $55 | USD $1,100 |
| **SUBTOTAL DESARROLLO** | | | | **USD $31,350** |
| | | | | |
| **4. INFRAESTRUCTURA CLOUD** | | | | |
| 4.1 | Firebase Setup y Configuración | 1 | USD $200 | USD $200 |
| 4.2 | Cloud Storage Configuración | 1 | USD $100 | USD $100 |
| 4.3 | Dominio + SSL Certificate | 1 | USD $50 | USD $50 |
| **SUBTOTAL INFRAESTRUCTURA** | | | | **USD $350** |
| | | | | |
| **5. GESTIÓN DE PROYECTO Y RIESGOS** | | | | |
| 5.1 | Contingencia Técnica (15% Desarrollo) | 1 | USD $4,702.50 | USD $4,702.50 |
| 5.2 | Gestión de Cambios y Ajustes | 1 | USD $500 | USD $500 |
| **SUBTOTAL GESTIÓN** | | | | **USD $5,202.50** |
| | | | | |
| | **TOTAL INVERSIÓN INICIAL** | | | **USD $39,902.50** |
| | **IVA 19% (Vigente en Colombia)** | | | **USD $7,581.48** |
| | | | | |
| | **═════════════════════════════════════════** | | | |
| | **VALOR TOTAL COTIZACIÓN OPCIÓN 1** | | | **USD $47,483.98** |
| | **═════════════════════════════════════════** | | | |

**Conversión a COP** (Tasa ref: 1 USD = 4,300 COP):
- **TOTAL: COP $204,180,894**

**Formas de Pago:**
- 40% a firma contrato (USD $18,993.59)
- 35% a inicio desarrollo (USD $16,619.39)
- 25% a entrega y go-live (USD $11,870.99)

**Incluye:**
- ✅ Toda infraestructura cloud configurada
- ✅ Desarrollo completo 3 módulos
- ✅ Primer año soporte técnico (40 hrs/mes)
- ✅ Capacitación usuarios
- ✅ Documentación técnica completa
- ✅ 30 días ajustes post-lanzamiento sin costo

**Válida hasta:** Agosto 31, 2026 (90 días)

---

### 6.2 COTIZACIÓN OPCIÓN 2: SOLUCIÓN HÍBRIDA ENTERPRISE

```
╔════════════════════════════════════════════════════════════════╗
║                     COTIZACIÓN FORMAL                         ║
║          SOLUCIÓN HÍBRIDA ENTERPRISE - OPCIÓN 2              ║
║              PROYECTO POS SEÑOR HORNADO                       ║
╚════════════════════════════════════════════════════════════════╝
```

| ÍTEM | DESCRIPCIÓN | CANTIDAD | VALOR UNITARIO | VALOR TOTAL |
|-----|-----------|----------|----------------|------------|
| **1. HARDWARE LOCAL Y CLIENTE** | | | | |
| 1.1 | Servidor Rack 2U Xeon 8-core/32GB/RAID | 1 | USD $2,500 | USD $2,500 |
| 1.2 | Servidor Backup (Failover Automático) | 1 | USD $2,500 | USD $2,500 |
| 1.3 | UPS 10kVA (30 min backup power) | 1 | USD $800 | USD $800 |
| 1.4 | Smartphone Android 6.5" (Meseros) | 5 | USD $200 | USD $1,000 |
| 1.5 | Tablet Android 10" (Caja/Admin) | 2 | USD $250 | USD $500 |
| 1.6 | Laptop i7 16GB/512GB (Admin) | 1 | USD $900 | USD $900 |
| 1.7 | Router WiFi 6 + Access Points (3) + Cableado Cat-7 | 1 | USD $600 | USD $600 |
| 1.8 | Impresoras Térmicas 80mm | 2 | USD $150 | USD $300 |
| **SUBTOTAL HARDWARE** | | | | **USD $9,100** |
| | | | | |
| **2. SOFTWARE Y LICENCIAS** | | | | |
| 2.1 | PostgreSQL 15 Enterprise (2 licencias) | 2 | USD $50 | USD $100 |
| 2.2 | Certificado SSL Domain (1 año) | 1 | USD $100 | USD $100 |
| 2.3 | Docker Enterprise (1 año, 2 nodos) | 1 | USD $500 | USD $500 |
| 2.4 | Herramientas Monitoreo/Seguridad | 1 | USD $500 | USD $500 |
| **SUBTOTAL SOFTWARE** | | | | **USD $1,200** |
| | | | | |
| **3. DESARROLLO Y PERSONALIZACIÓN** | | | | |
| 3.1 | Análisis Legacy y Arquitectura Híbrida (80 hrs) | 80 | USD $60 | USD $4,800 |
| 3.2 | Desarrollo Backend Node.js + GraphQL (150 hrs) | 150 | USD $65 | USD $9,750 |
| 3.3 | Integración PostgreSQL Local (70 hrs) | 70 | USD $60 | USD $4,200 |
| 3.4 | APIs Wrapper para Legacy Systems (40 hrs) | 40 | USD $65 | USD $2,600 |
| 3.5 | Desarrollo Frontend Mesero (80 hrs) | 80 | USD $55 | USD $4,400 |
| 3.6 | Desarrollo Frontend Caja (70 hrs) | 70 | USD $55 | USD $3,850 |
| 3.7 | Desarrollo Admin/Dashboard (60 hrs) | 60 | USD $55 | USD $3,300 |
| 3.8 | Replicación Cloud-Local (sincronización) (50 hrs) | 50 | USD $70 | USD $3,500 |
| 3.9 | Testing y QA (100 hrs) | 100 | USD $45 | USD $4,500 |
| 3.10 | Disaster Recovery Planning (30 hrs) | 30 | USD $65 | USD $1,950 |
| 3.11 | Deployment y Configuración (50 hrs) | 50 | USD $60 | USD $3,000 |
| 3.12 | Documentación Técnica (40 hrs) | 40 | USD $50 | USD $2,000 |
| 3.13 | Capacitación Usuarios y IT Staff (30 hrs) | 30 | USD $60 | USD $1,800 |
| **SUBTOTAL DESARROLLO** | | | | **USD $45,750** |
| | | | | |
| **4. INFRAESTRUCTURA ON-PREMISES** | | | | |
| 4.1 | Instalación y Configuración Servidores | 1 | USD $800 | USD $800 |
| 4.2 | Setup PostgreSQL, Docker, Replicación | 1 | USD $400 | USD $400 |
| **SUBTOTAL INFRAESTRUCTURA** | | | | **USD $1,200** |
| | | | | |
| **5. GESTIÓN DE PROYECTO Y RIESGOS** | | | | |
| 5.1 | Contingencia Técnica (15% Desarrollo) | 1 | USD $6,862.50 | USD $6,862.50 |
| 5.2 | Gestión de Cambios y Ajustes | 1 | USD $500 | USD $500 |
| **SUBTOTAL GESTIÓN** | | | | **USD $7,362.50** |
| | | | | |
| | **TOTAL INVERSIÓN INICIAL** | | | **USD $64,612.50** |
| | **IVA 19% (Vigente en Colombia)** | | | **USD $12,276.38** |
| | | | | |
| | **═════════════════════════════════════════** | | | |
| | **VALOR TOTAL COTIZACIÓN OPCIÓN 2** | | | **USD $76,888.88** |
| | **═════════════════════════════════════════** | | | |

**Conversión a COP** (Tasa ref: 1 USD = 4,300 COP):
- **TOTAL: COP $330,621,984**

**Formas de Pago:**
- 30% a firma contrato (USD $23,066.66)
- 40% a inicio desarrollo (USD $30,755.55)
- 30% a entrega y go-live (USD $23,066.66)

**Incluye:**
- ✅ Servidores locales completamente configurados
- ✅ BD PostgreSQL replicada con cloud backup
- ✅ Desarrollo completo con integración legacy
- ✅ Plan recuperación desastres (DR)
- ✅ Primer año soporte técnico (60 hrs/mes)
- ✅ Capacitación equipo técnico
- ✅ Documentación técnica y operativa
- ✅ 45 días ajustes post-lanzamiento sin costo

**Válida hasta:** Agosto 31, 2026 (90 días)

---

## 7. TÉRMINOS Y CONDICIONES

### 7.1 Alcance y Limitaciones

1. **Alcance Incluido:**
   - Desarrollo software completo según especificaciones
   - Infraestructura cloud (Opción 1) u on-premises (Opción 2)
   - Dispositivos especificados en cotización
   - Capacitación usuarios (20-30 horas)
   - Documentación técnica
   - Primer año soporte técnico

2. **Alcance NO Incluido:**
   - Integración con sistemas legacy (excepto Opción 2)
   - Desarrollo aplicación clientes/online
   - Integración plataformas delivery
   - Hardware adicional no especificado
   - Cambios en requisitos funcionales (aplica cambio de alcance)

### 7.2 Cronograma y Entregas

| Hito | Descripción | Fecha Estimada |
|------|-----------|----------------|
| **0. Inicio Proyecto** | Firma contrato, setup inicial | Semana 1 |
| **1. Análisis Completo** | Documentación requisitos finales | Semana 2-3 |
| **2. Infraestructura Lista** | Cloud/Local configurado, BD creada | Semana 4 |
| **3. Backend Completado** | APIs REST testing positivo | Semana 8 |
| **4. Frontend Mesero** | Módulo toma órdenes UAT | Semana 11 |
| **5. Frontend Caja** | Módulo pagos UAT | Semana 14 |
| **6. Frontend Admin** | Dashboard y reportes UAT | Semana 16 |
| **7. Testing Completo** | QA, performance, security audit | Semana 18 |
| **8. Capacitación** | Usuarios y equipo técnico | Semana 19 |
| **9. Go-Live** | Deployment producción | Semana 20 |

**Duración:** 
- Opción 1: 17 semanas (4 meses)
- Opción 2: 20 semanas (5 meses)

### 7.3 Responsabilidades de Solutions & Tech Consulting

**Compromisos:**

✅ Entregar software según especificaciones funcionales y técnicas
✅ Garantizar SLA 99.9% disponibilidad (post go-live)
✅ Proporcionar código fuente documentado y comentado
✅ Realizar UAT con equipo del cliente
✅ Capacitar equipo del restaurante
✅ Documentación técnica, operativa y de usuario
✅ Soporte técnico nivel 1 y 2 por 12 meses
✅ Actualizaciones de seguridad y bugs críticos
✅ Mantener confidencialidad datos del negocio

### 7.4 Responsabilidades del Cliente (Señor Hornado)

**Compromisos Requeridos:**

- ✅ Designar equipo del lado cliente (mínimo 1 persona) para coordinación
- ✅ Facilitar acceso a instalaciones para infraestructura
- ✅ Proporcionar datos maestros (menú, usuarios, etc.)
- ✅ Validar funcionalidad en UAT (máximo 10 días)
- ✅ Participar activamente en capacitación
- ✅ Aprobar cambios fuera de alcance (aplica cambio de alcance)
- ✅ Proporcionar ambiente seguro para servidores (Opción 2)
- ✅ Mantener backups locales adicionales (recomendación)

### 7.5 Términos de Pago

**Estructura Opción 1:**
```
40% (USD $18,993.59) ──► A firma contrato
35% (USD $16,619.39) ──► A inicio desarrollo (Semana 1)
25% (USD $11,870.99) ──► A go-live exitoso
```

**Estructura Opción 2:**
```
30% (USD $23,066.66) ──► A firma contrato
40% (USD $30,755.55) ──► A inicio desarrollo (Semana 1)
30% (USD $23,066.66) ──► A go-live exitoso
```

**Métodos de Pago Aceptados:**
- Transferencia bancaria internacional (SWIFT)
- Transferencia local en COP (contra USDCOP spot)
- Tarjeta crédito empresarial (aplica 2% fee)

**Penalización por Incumplimiento:**
- Retraso pago > 30 días: 0.5% mensual
- Incumplimiento hitos: Revisión contrato

### 7.6 Garantías y Limitaciones

**Garantías Ofrecidas:**

✅ Software libre de defectos por 90 días post go-live
✅ Reemplazo hardware defectuoso (manufactura)
✅ Confidencialidad de datos e información comercial
✅ Cumplimiento normas seguridad (ISO 27001)

**Limitaciones:**

⚠️ No responsabilidad por pérdida datos client (recomendar backups)
⚠️ No responsabilidad por uso incorrecto software
⚠️ No responsabilidad por caída internet/servicios terceros
⚠️ Cambios requisitos aplican adicionales en tiempo/costo

### 7.7 Propiedad Intelectual

- **Código fuente:** Propiedad Solutions & Tech Consulting (licencia perpetua al cliente)
- **Datos:** Propiedad 100% del cliente
- **Diseño/Logo:** Propiedad Solutions & Tech Consulting (licencia de uso)
- **Documentación:** Uso exclusivo cliente

### 7.8 Confidencialidad

Ambas partes se comprometen a mantener confidencial:
- Datos operacionales del restaurante
- Especificaciones técnicas del software
- Información financiera compartida
- Contratos y términos negociados

Duración: 3 años post-finalización proyecto

### 7.9 Resolución de Disputas

En caso de desacuerdo:
1. Contacto directo entre gerentes de proyecto (7 días)
2. Escalación a directores de ambas empresas (7 días)
3. Mediación profesional (si aplica)
4. Arbitraje según leyes colombianas

### 7.10 Terminación Contrato

**Causas Terminación:**
- Incumplimiento gravísimo de responsabilidades
- Insolvencia de cualquiera de las partes
- Fuerza mayor que impida cumplimiento > 60 días

**Consecuencias:**
- Opción 1: Reembolso de pagos menos trabajo realizado (valuado)
- Opción 2: Entrega infraestructura/código al estado actual
- Restitución de datos con formato estándar

---

## 8. RECOMENDACIÓN Y JUSTIFICACIÓN

### 8.1 Opción Recomendada: OPCIÓN 1 - Solución Cloud Completa

Basados en el análisis detallado de costos, complejidad, velocidad de implementación y ROI, **recomendamos enfáticamente la Opción 1** por las siguientes razones:

| Factor | Justificación |
|--------|--------------|
| **Financiero** | 34% menos inversión, 44% menos costo anual, ROI 66pp mayor |
| **Tiempo** | 3 semanas más rápido (17 vs 20 semanas) → ingresos antes |
| **Riesgo Operacional** | Menor complejidad, menos personal IT requerido |
| **Escalabilidad** | Crecimiento futuro sin inversión hardware adicional |
| **Flexibilidad** | Ajustes y mejoras más rápidos y económicos |
| **Soporte** | Infraestructura administrada por Google (SLA 99.95%) |

**La Opción 1 es ideal para:** PyMEs, restaurantes en crecimiento, operaciones con internet confiable, presupuesto limitado.

### 8.2 Cuándo Considerar Opción 2

La Opción 2 es recomendable **solo** si:
- ✅ Requiere integración estricta con sistema legacy existente
- ✅ Tiene personal IT especializado disponible
- ✅ Regulación local exige datos on-premises
- ✅ Presupuesto amplio es disponible
- ✅ Requiere máximo control y customización técnica

En el caso de Señor Hornado, **no aplican estas condiciones**, por lo que **Opción 1 es superior**.

---

## 9. ESPECIFICACIONES TÉCNICAS DETALLADAS (Anexo)

### 9.1 Especificaciones Dispositivos Opción 1

**Smartphones Mesero (Especificación Técnica):**
```
Modelo: Samsung Galaxy A15 o equivalente
Procesador: MediaTek Helio G85
Pantalla: 6.5" IPS FHD (1080×2340) 90Hz
RAM: 4GB LPDDR5
Almacenamiento: 64GB UFS 2.2
Cámara: 50MP + 13MP ultra-wide
Batería: 5000 mAh
SO: Android 14
Conectividad: WiFi 6, 4G LTE, NFC (futuro pagos)
Costo: USD $200 × 5 = USD $1,000
```

**Tablets Caja (Especificación Técnica):**
```
Modelo: Samsung Galaxy Tab A8 o equivalente
Procesador: Qualcomm Snapdragon 680
Pantalla: 10.5" IPS WUXGA (1920×1200)
RAM: 6GB LPDDR4X
Almacenamiento: 128GB eMMC
Batería: 7040 mAh
SO: Android 13
Conectividad: WiFi 6, 4G LTE (opcional)
Costo: USD $250 × 2 = USD $500
```

### 9.2 Especificaciones Software Framework

**Frontend Angular 18.2.14:**
- Signals para state management (reactive programming)
- Componentes standalone (modular architecture)
- lazy loading de módulos
- Route guards role-based
- Interceptores HTTP/error handling

**Backend Node.js + Express:**
- TypeScript 5.5.4 para type safety
- Validación entrada (Zod/Joi)
- Autenticación JWT
- Rate limiting y seguridad
- Logging centralizado

**Database Firestore:**
- Colecciones: users, orders, tables, products, transactions
- Real-time listeners para sync
- Transacciones ACID garantizadas
- Índices optimizados
- Reglas de seguridad por rol

---

## 10. INFORMACIÓN ADICIONAL

### 10.1 Contacto Solutions & Tech Consulting

**Oficina Principal:**
```
Solutions & Tech Consulting S.A.S.
Carrera 15 No. 124-67, Oficina 501
Bogotá, Colombia
Código Postal: 110221

Teléfono: +57 1 629-1234
Email: ventas@solutionstc.com
Web: www.solutionstc.com
```

**Equipo del Proyecto:**
- **Gerente Proyecto:** Ing. Carlos Martínez
  - Email: c.martinez@solutionstc.com
  - Celular: +57 310-456-7890

- **Lead Técnico:** Ing. Ana García
  - Email: a.garcia@solutionstc.com
  - Celular: +57 320-123-4567

### 10.2 Referencias de Clientes

**Clientes Implementados Exitosamente (Últimos 2 años):**

1. **Restaurante La Parilla** (Medellín)
   - Solución Cloud - 8 sedes operando
   - Contacto: gerente@laparilla.com.co

2. **Café Artesanal Premium** (Bogotá)
   - Solución Cloud - 3 locales integrados
   - Contacto: admin@cafeartesanal.com.co

3. **Grupo Gastronomía Ltda** (Cali)
   - Solución Híbrida - 15 unidades
   - Contacto: operaciones@grupogas.com.co

### 10.3 Certificaciones y Acreditaciones

```
[ISO 27001 - Information Security]      [ISO 9001 - Quality Management]
[DIAN Acreditado]                       [PCI-DSS Compliant]
[Google Cloud Partner]                  [Firebase Certified]
```

---

## 11. ANEXOS

### Anexo A: Cronograma Gantt Opción 1
```
PROYECTO POS SEÑOR HORNADO - CRONOGRAMA OPCIÓN 1

Semana →  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17

Fase 0: Prep
Preparación  ██

Fase 1: Backend
Análisis      ███
Backend APIs     ████████
Firebase         ████

Fase 2: Frontend Mesero
Frontend Mesero       ███████

Fase 3: Frontend Caja
Frontend Caja              ███████

Fase 4: Frontend Admin
Frontend Admin                ███████

Fase 5: Testing
Testing/QA                        ████████

Fase 6: Capac/Deploy
Capacitación                            ██
Go-Live                                 ██
```

### Anexo B: Matriz de Riesgos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|--------------|--------|-----------|
| 1 | Retrasos en requisitos client | Media | Alto | Kickoff temprano, comunicación semanal |
| 2 | Internet inestable zona | Media | Crítico | Offline-first nativo, failover 4G |
| 3 | Resistencia usuarios a cambio | Media | Medio | Capacitación extensiva, soporte ↑ |
| 4 | Cambios scope mid-proyecto | Baja | Crítico | Change control formal, cliente aprobación |
| 5 | Disponibilidad equipo técnico | Baja | Medio | Equipo dedicado 100%, backup recursos |

### Anexo C: Glossario Técnico

- **PWA:** Progressive Web Application (web app con capacidades nativas)
- **Firestore:** BD NoSQL realtime de Google Cloud
- **SLA:** Service Level Agreement (acuerdo disponibilidad)
- **DIAN:** Dirección Impuestos y Aduanas Nacionales (Colombia)
- **TLS:** Transport Layer Security (encriptación datos)
- **ROI:** Return on Investment (retorno inversión)
- **UAT:** User Acceptance Testing (validación usuarios)
- **DevOps:** Development Operations (infraestructura código)

---

## FIRMA Y VALIDACIÓN

```
╔════════════════════════════════════════════════════════════════╗
║                 AUTORIZACIÓN DE PROPUESTA                     ║
║                                                                ║
║  Representante Solutions & Tech Consulting:                   ║
║  ___________________________        Fecha: ______________      ║
║  Nombre y Firma / Sello Digital                               ║
║                                                                ║
║  Aceptación y Revisión Cliente (Señor Hornado):              ║
║  ___________________________        Fecha: ______________      ║
║  Nombre y Firma / Responsable                                 ║
║                                                                ║
║  NOTA: Esta propuesta es válida por 90 días desde esta        ║
║  fecha. Para proceder, debe ser firmada por ambas partes.     ║
║  Cambios posteriores requerirán addendum formal.              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

**PROPUESTA FINALIZADA**

| Parámetro | Valor |
|-----------|-------|
| Documento | Propuesta Técnica y Económica |
| Evidencia | GA2-220501094-AA3-EV02 |
| Versión | 1.0 Final |
| Fecha | Junio 11, 2026 |
| Estado | ✅ LISTO PARA PRESENTACIÓN |
| Opción Recomendada | Opción 1 - Cloud Completa (USD $47,483.98) |

---

*© 2026 Solutions & Tech Consulting S.A.S. - Todos los derechos reservados*

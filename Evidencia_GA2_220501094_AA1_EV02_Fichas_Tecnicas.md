# DISEÑO DE FICHAS TÉCNICAS PARA LA RECOLECCIÓN DE INFORMACIÓN

**Proyecto:** Sistema de Punto de Venta (POS) y Facturación Electrónica  
**Restaurante:** Señor Hornado

**Código de Actividad:** GA2-220501094-AA1-EV02  
**Denominación:** Diseño de las fichas técnicas para la recolección de la información  
**Estudiante:** 220501094  
**Fecha de Elaboración:** 11 de junio de 2026  
**Versión:** 1.0

---

## TABLA DE CONTENIDO

1. [Introducción](#introducción)
2. [Referente Normativo](#referente-normativo)
3. [Objetivos y Alcance](#objetivos-y-alcance)
4. [Estructura de las Fichas Técnicas](#estructura-de-las-fichas-técnicas)
5. [Fichas Técnicas Diseñadas](#fichas-técnicas-diseñadas)
6. [Instrucciones de Llenado](#instrucciones-de-llenado)
7. [Ejemplos Completados](#ejemplos-completados)
8. [Dimensionamiento de Licencias](#dimensionamiento-de-licencias)
9. [Análisis Técnico y Económico](#análisis-técnico-y-económico)
10. [Conclusiones](#conclusiones)

---

## INTRODUCCIÓN

### Propósito del Documento

El presente documento presenta el diseño de un conjunto de **fichas técnicas estandarizadas** para la recolección de información del proyecto "Sistema POS y Facturación Electrónica - Restaurante Señor Hornado". Estas herramientas facilitan la captura, organización y análisis de datos técnicos y operacionales necesarios para la toma de decisiones informadas durante el desarrollo del software.

### Justificación

La recolección sistemática de información es fundamental para:

- ✅ **Garantizar Calidad:** Asegurar que se captura información completa y consistente
- ✅ **Estandarización:** Aplicar procesos uniformes según normas internacionales
- ✅ **Trazabilidad:** Mantener registro de fuentes de información
- ✅ **Validación:** Verificar la integridad de datos recolectados
- ✅ **Documentación:** Crear registro formal para auditorías

### Alcance de Aplicación

Las fichas técnicas aplican a:

- Recolección de requisitos del cliente
- Documentación de características técnicas
- Evaluación de software existente
- Análisis de infraestructura
- Especificación de licencias
- Estimación de costos

---

## REFERENTE NORMATIVO

### Norma NTC ISO 9000:2015

El diseño de estas fichas técnicas se fundamenta en los principios de la **Norma Técnica Colombiana NTC ISO 9000:2015 - Sistemas de Gestión de la Calidad: Fundamentos y Vocabulario**.

#### Principios de Calidad Aplicados

**1. Enfoque al Cliente**
- Las fichas capturan necesidades específicas del restaurante
- Permiten validación temprana con stakeholders
- Facilitan trazabilidad de requisitos a soluciones

**2. Liderazgo**
- Estructura clara de responsables por sección
- Definición de autoridades de aprobación
- Roles bien definidos en proceso de recolección

**3. Compromiso del Personal**
- Formatos de fácil llenado
- Instrucciones claras y ejemplos
- Campos obligatorios para garantizar completitud

**4. Enfoque a Procesos**
- Fichas organizadas por proceso de negocio
- Vinculación con actividades del restaurante
- Mapeo de flujos operacionales

**5. Mejora Continua**
- Secciones de observaciones y recomendaciones
- Control de versiones de fichas
- Retroalimentación integrada

**6. Toma de Decisiones Basada en Datos**
- Recolección de información medible y verificable
- Análisis de tendencias operacionales
- Estimaciones técnicas y económicas sustentadas

**7. Gestión de Relaciones**
- Identificación clara de fuentes de información
- Validación con proveedores y usuarios
- Registro de acuerdos y compromisos

#### Requisitos NTC ISO 9000 en las Fichas

| Requisito ISO | Implementación en Fichas |
|:---|:---|
| **Documentación de información** | Campos estructurados por tema |
| **Control de versiones** | Identificación de versión y fecha |
| **Responsabilidad** | Campos de responsable y aprobador |
| **Integridad de datos** | Validación y campos obligatorios |
| **Trazabilidad** | Vinculación a fuentes externas |
| **Acceso y disponibilidad** | Formato estándar y accesible |

---

## OBJETIVOS Y ALCANCE

### Objetivos Específicos

1. **Recolección Sistemática:** Diseñar herramientas que garanticen captura completa de información
2. **Estandarización:** Aplicar formato consistente en todos los formularios
3. **Trazabilidad:** Mantener registro auditable de fuentes y cambios
4. **Validación Técnica:** Verificar que requisitos sean técnicamente viables
5. **Estimación Económica:** Cuantificar inversión en software y licencias
6. **Documentación:** Crear base de datos de decisiones del proyecto

### Alcance de Recolección

**Incluye:**
- Requisitos funcionales y no funcionales
- Especificaciones técnicas del software
- Evaluación de infraestructura existente
- Análisis de licencias y costos
- Estimación de recursos humanos
- Riesgos técnicos y operacionales

**Excluye:**
- Recolección de datos de clientes finales (privacidad)
- Información financiera confidencial del restaurante
- Datos personales de empleados actuales
- Información competitiva de otros establecimientos

---

## ESTRUCTURA DE LAS FICHAS TÉCNICAS

### Componentes Principales de Cada Ficha

#### 1. Encabezado (Identificación)

```
┌─────────────────────────────────────┐
│  CÓDIGO DE FICHA: FT-XXX-001        │
│  NOMBRE: [Nombre descriptivo]       │
│  VERSIÓN: 1.0                       │
│  FECHA: 11/06/2026                  │
│  RESPONSABLE: [Nombre]              │
└─────────────────────────────────────┘
```

#### 2. Sección de Información General

- Título descriptivo del tema
- Objetivo de la ficha
- Proceso de negocio relacionado
- Stakeholders involucrados

#### 3. Tabla de Datos Estructurados

- Campos con etiquetas claras
- Tipos de datos esperados
- Campos obligatorios vs. opcionales
- Valores predefinidos (dropdowns)

#### 4. Instrucciones de Llenado

- Descripción de cada campo
- Ejemplos de respuestas esperadas
- Validaciones aplicables
- Restricciones de datos

#### 5. Sección de Validación

- Criterios de calidad de datos
- Checklist de completitud
- Firma de responsable
- Fecha de validación

#### 6. Observaciones y Seguimiento

- Campo para comentarios adicionales
- Control de cambios
- Referencias a documentos relacionados
- Próxima revisión

---

## FICHAS TÉCNICAS DISEÑADAS

### FICHA TÉCNICA 1: REQUERIMIENTOS FUNCIONALES

**Código:** FT-REQ-001  
**Nombre:** Ficha de Requerimientos Funcionales del Software

#### Objetivo
Capturar de forma estructurada los requisitos funcionales que debe cumplir el sistema.

#### Tabla de Información

| Campo | Descripción | Tipo | Obligatorio |
|:---|:---|:---|:---:|
| ID Requisito | Identificador único (REQ-001) | Texto | ✅ |
| Nombre | Título del requisito | Texto | ✅ |
| Descripción | Explicación detallada | Texto largo | ✅ |
| Módulo | Área del sistema (Mesero, Caja, Admin) | Selección | ✅ |
| Prioridad | Alta, Media, Baja | Selección | ✅ |
| Tipo | Entrada de datos, Procesamiento, Reporte | Selección | ✅ |
| Usuario Involucrado | Rol que usa la funcionalidad | Texto | ✅ |
| Precondiciones | Requisitos previos necesarios | Texto | ❌ |
| Postcondiciones | Estado después de ejecutar | Texto | ❌ |
| Criterio de Aceptación | Cómo validar que funciona | Texto | ✅ |
| Fuente de Información | Documento o persona que originó | Texto | ✅ |
| Fecha de Registro | Cuándo se capturó | Fecha | ✅ |
| Estado | Pendiente, Aprobado, En Revisión | Selección | ✅ |
| Notas | Observaciones adicionales | Texto | ❌ |

#### Instrucciones de Llenado

**ID Requisito:** Usar formato REQ-XXX-NNN (ej: REQ-003-001)

**Nombre:** Máximo 80 caracteres, descripción clara y concisa

**Descripción:** Detallar qué hace, cómo se usa, para qué sirve

**Módulo:** Seleccionar del desplegable: Mesero, Cajero, Administrador, Transversal

**Prioridad:** 
- Alta: Crítica para funcionamiento
- Media: Importante pero no crítica
- Baja: Deseable, puede posponerse

**Criterio de Aceptación:** Escribir en formato: 
- "Dado que [condición inicial]
- Cuando [acción realizada]
- Entonces [resultado esperado]"

---

### FICHA TÉCNICA 2: ESPECIFICACIONES TÉCNICAS DE SOFTWARE

**Código:** FT-SOFT-001  
**Nombre:** Ficha de Especificaciones Técnicas de Software

#### Objetivo
Documentar características técnicas detalladas de componentes de software (librerías, frameworks, herramientas).

#### Tabla de Información

| Campo | Descripción | Tipo | Obligatorio |
|:---|:---|:---|:---:|
| Nombre del Software | Nombre comercial/técnico | Texto | ✅ |
| Versión Recomendada | Número de versión específica | Texto | ✅ |
| Proveedor/Desarrollador | Empresa o comunidad detrás | Texto | ✅ |
| Categoría | Framework, Librería, Herramienta | Selección | ✅ |
| Licencia | Tipo de licencia (MIT, GPL, Comercial) | Texto | ✅ |
| Costo Anual | Precio en COP (0 si es libre) | Número | ✅ |
| URL Oficial | Sitio web del proyecto | URL | ✅ |
| Compatibilidad | Plataformas soportadas | Texto | ✅ |
| Requisitos Mínimos | Hardware/Software requerido | Texto | ✅ |
| Ventajas | Beneficios de usar este software | Texto largo | ✅ |
| Desventajas | Limitaciones o problemas | Texto largo | ❌ |
| Alternativas | Opciones similares disponibles | Texto | ❌ |
| Comunidad/Soporte | Nivel de actividad del proyecto | Texto | ✅ |
| Curva de Aprendizaje | Fácil, Media, Difícil | Selección | ✅ |
| Recomendación | Seleccionar, Considerar, Descartar | Selección | ✅ |
| Fecha Evaluación | Cuándo se realizó la evaluación | Fecha | ✅ |
| Evaluador | Quién hizo la evaluación | Texto | ✅ |

---

### FICHA TÉCNICA 3: ANÁLISIS DE INFRAESTRUCTURA

**Código:** FT-INFRA-001  
**Nombre:** Ficha de Análisis de Infraestructura

#### Objetivo
Documentar el estado actual y requerimientos de infraestructura (servidores, redes, equipos).

#### Tabla de Información

| Campo | Descripción | Tipo | Obligatorio |
|:---|:---|:---|:---:|
| Tipo de Recurso | Servidor, Red, Almacenamiento, Dispositivo | Selección | ✅ |
| Nombre/ID | Identificador del recurso | Texto | ✅ |
| Ubicación | Dónde está (Local, Nube, Híbrido) | Selección | ✅ |
| Capacidad Actual | Especificaciones actuales | Texto | ✅ |
| Capacidad Requerida | Lo que necesita el nuevo sistema | Texto | ✅ |
| Estado | Operativo, Obsoleto, Planificado | Selección | ✅ |
| Utilización Actual | Porcentaje de uso (0-100%) | Número | ✅ |
| Costo Mensual | Gasto operacional | Número | ❌ |
| Mantenimiento | Frecuencia y responsable | Texto | ❌ |
| Riesgos | Problemas potenciales identificados | Texto | ❌ |
| Plan de Mejora | Acciones recomendadas | Texto | ❌ |
| Prioridad de Actualización | Alta, Media, Baja | Selección | ✅ |
| Fecha de Inspección | Cuándo se revisó | Fecha | ✅ |
| Inspector | Quién realizó la inspección | Texto | ✅ |

---

### FICHA TÉCNICA 4: DIMENSIONAMIENTO DE LICENCIAS

**Código:** FT-LIC-001  
**Nombre:** Ficha de Dimensionamiento de Licencias de Software

#### Objetivo
Cuantificar y costar las licencias de software necesarias para el proyecto.

#### Tabla de Información

| Campo | Descripción | Tipo | Obligatorio |
|:---|:---|:---|:---:|
| Software | Nombre del programa licenciado | Texto | ✅ |
| Tipo de Licencia | Individual, Volumen, Sitio, Perpetua | Selección | ✅ |
| Cantidad de Licencias | Número de unidades a adquirir | Número | ✅ |
| Usuarios Finales | Cuántas personas lo usarán | Número | ✅ |
| Módulos Necesarios | Componentes/features a licenciar | Texto | ✅ |
| Período | Anual, Bienal, Perpetuo | Selección | ✅ |
| Costo Unitario | Precio por licencia en COP | Número | ✅ |
| Costo Total | Cantidad × Precio Unitario | Número (Fórmula) | ✅ |
| Mantenimiento Anual | % del costo total para soporte | Número | ❌ |
| Costo + Mantenimiento | Costo Total + Mantenimiento | Número (Fórmula) | ❌ |
| Proveedor | Quién vende la licencia | Texto | ✅ |
| Vigencia | Desde - Hasta (fechas) | Fecha | ✅ |
| Garantía | Período de garantía incluida | Texto | ❌ |
| Renovación Automática | Sí / No | Booleano | ✅ |
| Notas Comerciales | Descuentos, Bundling, Promociones | Texto | ❌ |

---

### FICHA TÉCNICA 5: ESTIMACIÓN TÉCNICA Y ECONÓMICA

**Código:** FT-ESTIM-001  
**Nombre:** Ficha de Estimación Técnica y Económica

#### Objetivo
Estimar recursos técnicos y humanos necesarios, así como costos asociados.

#### Tabla de Información

| Campo | Descripción | Tipo | Obligatorio |
|:---|:---|:---|:---:|
| Componente/Módulo | Qué se va a estimar | Texto | ✅ |
| Descripción Breve | Resumen de alcance | Texto | ✅ |
| Complejidad | Baja, Media, Alta | Selección | ✅ |
| Esfuerzo (Horas) | Horas de trabajo estimadas | Número | ✅ |
| Desarrolladores Necesarios | Cuántos profesionales | Número | ✅ |
| Duración (Días) | Tiempo calendario estimado | Número | ✅ |
| Costo Hora-Desarrollador | Tarifa en COP/hora | Número | ✅ |
| Costo Mano de Obra | Esfuerzo × Costo Hora | Número (Fórmula) | ✅ |
| Recursos de Infraestructura | Servidores, BD, herramientas | Texto | ❌ |
| Costo Infraestructura | Gasto en recursos técnicos | Número | ❌ |
| Licencias Necesarias | Software a adquirir | Texto | ❌ |
| Costo Licencias | Gasto en licencias | Número | ❌ |
| Costo Total Componente | Suma de todos los costos | Número (Fórmula) | ✅ |
| Riesgos Técnicos | Problemas potenciales | Texto | ❌ |
| Factor de Riesgo | Porcentaje de contingencia (5-20%) | Número | ❌ |
| Costo con Riesgos | Costo Total × (1 + Factor Riesgo) | Número (Fórmula) | ❌ |
| Metodología | Ágil, Cascada, Hibrida | Selección | ✅ |
| Estimador | Quién hizo la estimación | Texto | ✅ |
| Fecha Estimación | Cuándo se realizó | Fecha | ✅ |

---

### FICHA TÉCNICA 6: RECOLECCIÓN DE FUENTES DE INFORMACIÓN

**Código:** FT-FUENTE-001  
**Nombre:** Ficha de Trazabilidad de Fuentes de Información

#### Objetivo
Documentar y validar la procedencia de toda la información recolectada para garantizar confiabilidad.

#### Tabla de Información

| Campo | Descripción | Tipo | Obligatorio |
|:---|:---|:---|:---:|
| ID Fuente | Identificador único (FUENTE-001) | Texto | ✅ |
| Tipo de Fuente | Entrevista, Documento, Sistema Actual | Selección | ✅ |
| Descripción Fuente | Detalles de la fuente | Texto | ✅ |
| Tema/Área | Área del proyecto cubierta | Texto | ✅ |
| Proveedor de Información | Persona/Departamento que proporciona | Texto | ✅ |
| Cargo/Rol | Puesto de quien proporciona | Texto | ✅ |
| Contacto | Teléfono o email | Texto | ❌ |
| Documento Origen | Archivo, URL, o referencia | Texto | ❌ |
| Información Obtenida | Resumen de datos recolectados | Texto | ✅ |
| Fecha Recolección | Cuándo se obtuvo | Fecha | ✅ |
| Validación | Información verificada (Sí/No) | Booleano | ✅ |
| Validador | Quién verificó la información | Texto | ✅ |
| Confiabilidad | Alta, Media, Baja | Selección | ✅ |
| Requisitos Vinculados | REQ-001, REQ-002, etc. | Texto | ❌ |
| Observaciones | Notas sobre la fuente | Texto | ❌ |
| Control de Cambios | Versión y fecha de cambios | Texto | ❌ |

---

## INSTRUCCIONES DE LLENADO

### Guía General para Todas las Fichas

#### 1. Antes de Empezar

- ✅ Reúne toda la información relevante
- ✅ Identifica a los stakeholders involucrados
- ✅ Revisa documentos existentes del proyecto
- ✅ Asegura acceso a sistemas/herramientas a evaluar
- ✅ Reserva tiempo sin interrupciones

#### 2. Llenado de Campos

**Campos Obligatorios (*):**
- Deben completarse sin excepción
- Si no hay información, documentar como "No Aplica" o "Pendiente"
- Validar que los datos sean correctos antes de marcar como completo

**Campos Opcionales (○):**
- Llenar si tienes información disponible
- Si no aplica, dejar en blanco
- No afecta la validación de la ficha

#### 3. Tipos de Datos

**Texto:** Escribir descripción clara y concisa (máx. 100 caracteres)

**Texto Largo:** Permiten párrafos completos (máx. 500 caracteres)

**Número:** Solo dígitos, decimales si aplica

**Fecha:** Formato DD/MM/YYYY

**Selección:** Elegir una opción del desplegable

**URL:** Dirección web completa (https://...)

**Booleano:** Sí / No

#### 4. Validación de Datos

Antes de finalizar la ficha:

- ✅ Verificar que todos los campos obligatorios estén completos
- ✅ Revisar ortografía y puntuación
- ✅ Validar consistencia de datos (sin contradicciones)
- ✅ Confirmar que números tengan unidades (COP, horas, %)
- ✅ Asegurar que fechas sean lógicas (no futuro si es recolección actual)

#### 5. Signatures de Responsabilidad

**Responsable de Llenado:**
- Quién diligencia la ficha
- Firma (impresa o digital)
- Fecha de llenado

**Aprobador:**
- Supervisor o líder de área
- Firma de conformidad
- Fecha de aprobación

#### 6. Archivo y Trazabilidad

- Guardar con nombre: FT-[CÓDIGO]-v[VERSIÓN]-[FECHA]
- Mantener copia de respaldo
- Registrar en catálogo de fichas
- Vincular con documentación relacionada

---

## EJEMPLOS COMPLETADOS

### EJEMPLO 1: Ficha FT-REQ-001 Completa

```
╔════════════════════════════════════════════════════════════════════╗
║ FICHA DE REQUERIMIENTOS FUNCIONALES                                ║
║ Código: FT-REQ-001                                                 ║
║ Versión: 1.0 | Fecha: 11/06/2026                                  ║
╚════════════════════════════════════════════════════════════════════╝

ID REQUISITO:              REQ-001-MESA
NOMBRE:                    Gestión de Estado de Mesas
DESCRIPCIÓN:               El sistema debe permitir visualizar el estado 
                           de todas las mesas del restaurante en tiempo 
                           real, indicando si están libres, ocupadas o 
                           pendientes de pago con colores distintivos.

MÓDULO:                    Mesero / Administrador
PRIORIDAD:                 ✓ ALTA
TIPO:                      ✓ Visualización de Datos

USUARIO INVOLUCRADO:       Mesero, Administrador, Cajero
PRECONDICIONES:            Usuario debe estar autenticado con PIN válido
POSTCONDICIONES:           Todas las mesas muestran estado actualizado

CRITERIO DE ACEPTACIÓN:
  - Dado que el mesero inicia sesión
  - Cuando accede a la pantalla de mesas
  - Entonces ve todas las mesas con color según estado:
    * Verde = Libre
    * Amarillo = Ocupada
    * Rojo = Pendiente Pago
  - Y la información se actualiza en tiempo real < 2 segundos

FUENTE DE INFORMACIÓN:     PRD RESTAURANTE, Entrevista Mesero
FECHA REGISTRO:            11/06/2026
ESTADO:                    ✓ APROBADO

NOTAS:                     Validado con usuarios finales en sesión de 
                           retroalimentación del 11/06/2026

─────────────────────────────────────────────────────────────────────
RESPONSABLE: Juan García       FIRMA: ___________  FECHA: 11/06/2026
APROBADOR:   Arquitecto TI     FIRMA: ___________  FECHA: 11/06/2026
```

---

### EJEMPLO 2: Ficha FT-SOFT-001 Completa

```
╔════════════════════════════════════════════════════════════════════╗
║ ESPECIFICACIONES TÉCNICAS DE SOFTWARE                              ║
║ Código: FT-SOFT-001                                                ║
║ Versión: 1.0 | Fecha: 11/06/2026                                  ║
╚════════════════════════════════════════════════════════════════════╝

NOMBRE SOFTWARE:           Firebase Realtime Database
VERSIÓN RECOMENDADA:       10.13.0
PROVEEDOR:                 Google Cloud
CATEGORÍA:                 ✓ Base de Datos NoSQL

LICENCIA:                  Freemium (Gratis + Premium)
COSTO ANUAL:               USD $600 (Plan Blaze, estimado)
URL OFICIAL:               https://firebase.google.com/

COMPATIBILIDAD:            Web (Angular), Mobile (iOS/Android), Node.js
REQUISITOS MÍNIMOS:        Acceso a Internet, Navegador moderno, JS ES6+

VENTAJAS:
  - Sincronización en tiempo real < 100ms
  - Escalabilidad automática sin administración
  - Seguridad integrada con Firebase Auth
  - Soporte oficial de Google
  - Integración nativa con Angular
  - Sin necesidad de mantener servidor propio

DESVENTAJAS:
  - Costo puede aumentar con alto tráfico
  - Vendor lock-in con ecosistema Google
  - Limitaciones de query (más simple que SQL tradicional)
  - Datos limitados a estructura NoSQL

ALTERNATIVAS:              AWS DynamoDB, Azure Cosmos DB, MongoDB Realm
COMUNIDAD:                 Excelente, documentación completa, actualizaciones frecuentes
CURVA APRENDIZAJE:         ✓ MEDIA

RECOMENDACIÓN:             ✓ SELECCIONAR

JUSTIFICACIÓN:
  Mejor opción para este proyecto por su integración nativa con 
  Angular, costo inicial bajo, y soporte de tiempo real que es 
  requisito crítico para sincronización entre Mesero y Caja.

─────────────────────────────────────────────────────────────────────
FECHA EVALUACIÓN:          11/06/2026
EVALUADOR:                 Arquitecto de Software - 220501093
```

---

### EJEMPLO 3: Ficha FT-LIC-001 Completa

```
╔════════════════════════════════════════════════════════════════════╗
║ DIMENSIONAMIENTO DE LICENCIAS DE SOFTWARE                          ║
║ Código: FT-LIC-001                                                 ║
║ Versión: 1.0 | Fecha: 11/06/2026                                  ║
╚════════════════════════════════════════════════════════════════════╝

SOFTWARE:                  Angular CLI (Professional Support)
TIPO LICENCIA:             ✓ Comercial Premium
CANTIDAD LICENCIAS:        3 desarrolladores
USUARIOS FINALES:          6 meseros + 2 cajeros + 1 admin = 9

MÓDULOS NECESARIOS:        - Compilación avanzada
                           - Debugging profesional
                           - Performance monitoring
                           - Priority support

PERÍODO:                   ✓ ANUAL (1 año)
COSTO UNITARIO:            USD $299 / desarrollador / año
COSTO TOTAL:               3 × $299 × 4,200 COP = COP $3,764,400

MANTENIMIENTO ANUAL:       10% del costo total = COP $376,440
COSTO + MANTENIMIENTO:     COP $4,140,840

PROVEEDOR:                 Google Cloud / Jetbrains
VIGENCIA:                  01/01/2026 - 31/12/2026
GARANTÍA:                  Incluida, 24/7 support
RENOVACIÓN AUTOMÁTICA:     ✓ SÍ

NOTAS COMERCIALES:
  - Negociar descuento volumen para 3 licencias (10-15%)
  - Considerar plan grupal de 5 puestos
  - Opción de pagar semestral para mejor flujo de caja

─────────────────────────────────────────────────────────────────────
RESPONSABLE: Analista TI    FIRMA: ___________  FECHA: 11/06/2026
APROBADOR:   Dueño Negocio  FIRMA: ___________  FECHA: 11/06/2026
```

---

### EJEMPLO 4: Ficha FT-ESTIM-001 Completa

```
╔════════════════════════════════════════════════════════════════════╗
║ ESTIMACIÓN TÉCNICA Y ECONÓMICA                                     ║
║ Código: FT-ESTIM-001                                               ║
║ Versión: 1.0 | Fecha: 11/06/2026                                  ║
╚════════════════════════════════════════════════════════════════════╝

COMPONENTE:                Módulo Mesero (PWA - Toma de Pedidos)
DESCRIPCIÓN:               Interfaz mobile-first para toma de pedidos,
                           sincronización realtime, almacenamiento local.

COMPLEJIDAD:               ✓ MEDIA
ESFUERZO (HORAS):          160 horas
DESARROLLADORES:           2 profesionales
DURACIÓN (DÍAS):           20 días hábiles

COSTO HORA:                COP $85,000 / hora promedio
COSTO MANO DE OBRA:        160 × $85,000 = COP $13,600,000

RECURSOS INFRAESTRUCTURA:
  - Servidor de testing: Firebase Spark Plan USD $0
  - Storage inicial: 1 GB incluido
  - Costo: COP $0 (incluido en plan de desarrollo)

LICENCIAS NECESARIAS:
  - Angular CLI Premium: 2 × USD $299 = USD $598 = COP $2,511,600
  - Visual Studio Code: Gratis (Open Source)
  - Total Licencias: COP $2,511,600

COSTO TOTAL COMPONENTE:    COP $13,600,000 + COP $2,511,600 
                           = COP $16,111,600

RIESGOS TÉCNICOS:
  - Cambios de requisitos mid-project
  - Problemas de sincronización realtime
  - Performance en conexiones lentas

FACTOR RIESGO:             15%
COSTO CON RIESGOS:         COP $16,111,600 × 1.15 = COP $18,533,340

METODOLOGÍA:               ✓ ÁGIL (Sprints de 2 semanas)

DESGLOSE POR SPRINT:
  Sprint 1 (Semana 1-2): Autenticación + Setup PWA = COP $4,133,335
  Sprint 2 (Semana 3-4): Toma de Pedidos = COP $4,133,335
  Sprint 3 (Semana 5):   Testing + Ajustes = COP $2,066,667
  Imprevistos (15%):     COP $2,200,003
  Total:                  COP $18,533,340

─────────────────────────────────────────────────────────────────────
ESTIMADOR:                 Líder Técnico
FECHA ESTIMACIÓN:          11/06/2026
VALIDACIÓN:                Aprobado por equipo técnico
```

---

## DIMENSIONAMIENTO DE LICENCIAS

### Resumen Ejecutivo de Inversión en Software

#### Categoría 1: Herramientas de Desarrollo (Obligatorias)

| Software | Cantidad | Costo Unit. | Período | Costo Total |
|:---|:---:|:---:|:---|---:|
| Angular CLI Pro | 3 dev | USD $299 | Anual | COP $3,764,400 |
| Visual Studio Code | 3 dev | Gratis | N/A | COP $0 |
| Node.js | Servidores | Gratis | N/A | COP $0 |
| Git/GitHub | Equipo | USD $21/mes | Anual | COP $1,058,400 |
| **SUBTOTAL** | | | | **COP $4,822,800** |

#### Categoría 2: Infraestructura en Nube

| Servicio | Capacidad | Costo | Período | Costo Total |
|:---|:---|:---|:---|---:|
| Firebase Plan Blaze | Auto-scaling | USD $0-600 | Anual | COP $2,520,000 |
| Cloud Firestore | 25GB almacén | Incluido | Anual | COP $0 |
| Cloud Storage | 5GB | USD $0.020/GB | Anual | COP $420,000 |
| Backup/Redundancia | Automático | 10% Firebase | Anual | COP $252,000 |
| **SUBTOTAL** | | | | **COP $3,192,000** |

#### Categoría 3: Productividad y Documentación

| Software | Usuarios | Costo Unit. | Período | Costo Total |
|:---|:---:|:---:|:---|---:|
| Microsoft 365 | 5 usuarios | USD $10/mes | Anual | COP $2,100,000 |
| Figma Pro | 2 diseñadores | USD $144/año | Anual | COP $1,209,600 |
| Jira/Confluence | 10 usuarios | USD $7/mes | Anual | COP $2,940,000 |
| Slack | 10 usuarios | USD $8/mes | Anual | COP $3,360,000 |
| **SUBTOTAL** | | | | **COP $9,609,600** |

#### Categoría 4: Testing y Calidad

| Software | Usuarios | Costo Unit. | Período | Costo Total |
|:---|:---:|:---:|:---|---:|
| Postman Pro | 3 usuarios | USD $156/año | Anual | COP $1,968,000 |
| SonarQube Server | 1 instancia | Gratis | N/A | COP $0 |
| Jest/Testing libs | Gratis | Gratis | N/A | COP $0 |
| **SUBTOTAL** | | | | **COP $1,968,000** |

### TOTAL INVERSIÓN EN LICENCIAS: **COP $19,592,400/año**

**Nota:** Esto es el primer año. Años subsecuentes pueden tener variaciones por:
- Uso real de infraestructura (Firebase)
- Descuentos por volumen o renovación
- Cancelación de herramientas no utilizadas

---

## ANÁLISIS TÉCNICO Y ECONÓMICO

### 1. Estimación de Costo Total del Proyecto

#### Fase 1: Análisis y Diseño (Semana 1-4)

| Concepto | Horas | Tarifa | Subtotal |
|:---|:---:|:---:|---:|
| Analista Senior | 80 | COP $100,000 | COP $8,000,000 |
| Diseñador UX/UI | 60 | COP $80,000 | COP $4,800,000 |
| Arquitecto de Datos | 40 | COP $120,000 | COP $4,800,000 |
| **SUBTOTAL FASE 1** | | | **COP $17,600,000** |

#### Fase 2: Desarrollo Modular (Semana 5-16, 12 semanas)

| Módulo | Desarrolladores | Horas | Tarifa | Subtotal |
|:---|:---:|:---:|:---:|---:|
| Módulo Mesero | 2 dev | 240 | COP $85,000 | COP $20,400,000 |
| Módulo Caja | 2 dev | 200 | COP $85,000 | COP $17,000,000 |
| Módulo Admin | 1 dev | 120 | COP $85,000 | COP $10,200,000 |
| Backend/API | 1 dev | 160 | COP $95,000 | COP $15,200,000 |
| DevOps/Infra | 1 dev | 100 | COP $100,000 | COP $10,000,000 |
| **SUBTOTAL FASE 2** | | | | **COP $72,800,000** |

#### Fase 3: Testing y Deployment (Semana 17-20, 4 semanas)

| Concepto | Horas | Tarifa | Subtotal |
|:---|:---:|:---:|---:|
| QA Testing | 120 | COP $75,000 | COP $9,000,000 |
| UAT con Cliente | 60 | COP $85,000 | COP $5,100,000 |
| Deployment | 40 | COP $100,000 | COP $4,000,000 |
| Documentación | 60 | COP $70,000 | COP $4,200,000 |
| **SUBTOTAL FASE 3** | | | **COP $22,300,000** |

### COSTO TOTAL MANO DE OBRA: **COP $112,700,000**

### Costo Total Proyecto (con todas las inversiones)

| Concepto | Costo |
|:---|---:|
| Mano de Obra | COP $112,700,000 |
| Licencias Software (Año 1) | COP $19,592,400 |
| Infraestructura Nube (Año 1) | COP $3,192,000 |
| Contingencia (10%) | COP $13,548,440 |
| **TOTAL PROYECTO** | **COP $149,032,840** |

**Costo Estimado por Mes:** COP $12,419,403 (12 meses)

**Costo Estimado por Usuario Capacitado:** COP $16,559,204 (9 usuarios)

---

### 2. Análisis de Retorno de Inversión (ROI)

#### Beneficios Cuantitativos Estimados

**Reducción de Tiempo en Toma de Pedidos:**
- Actual: 5 minutos por mesa
- Con nuevo sistema: 2 minutos por mesa
- Ahorro: 3 minutos × 40 mesas × 15 servicios/mes = 1,800 minutos/mes = 30 horas/mes
- Equivale: 30 horas × COP $25,000/hora = COP $750,000/mes

**Reducción de Errores de Cobro:**
- Actual: 5% de órdenes con error
- Con nuevo sistema: 0.5% de órdenes con error
- Promedio de órdenes/mes: 1,200 × COP $40,000 promedio = COP $48,000,000
- Ahorro por reducción de errores: 4.5% × COP $48,000,000 = COP $2,160,000/mes

**Agilización de Cierre de Caja:**
- Actual: 45 minutos de cierre manual
- Con nuevo sistema: 15 minutos
- Ahorro: 30 minutos × 25 días/mes = 12.5 horas/mes
- Equivale: 12.5 horas × COP $25,000/hora = COP $312,500/mes

**Total Beneficios Mensales:** COP $3,222,500

**Total Beneficios Anuales:** COP $38,670,000

#### Cálculo de ROI

```
ROI = (Beneficios Anuales - Costos Anuales) / Costos Iniciales × 100

Beneficios Año 1:        COP $38,670,000
Costos Operacionales:    COP $35,900,000 (Infraestructura + Licencias)
Costo Inicial Proyecto:  COP $149,032,840

ROI Año 1 = (38,670,000 - 35,900,000) / 149,032,840 × 100
ROI Año 1 = 1.86%

Período de Recuperación = 149,032,840 / 38,670,000 = 3.85 años
```

#### Proyección a 5 Años

| Año | Inversión | Operación | Beneficios Netos | ROI Acumulado |
|:---|---:|---:|---:|---:|
| 1 | COP $149,032,840 | COP $35,900,000 | COP $2,770,000 | -1.85% |
| 2 | COP $0 | COP $35,900,000 | COP $38,670,000 | 25.93% |
| 3 | COP $0 | COP $35,900,000 | COP $38,670,000 | 51.87% |
| 4 | COP $0 | COP $35,900,000 | COP $38,670,000 | 77.81% |
| 5 | COP $0 | COP $35,900,000 | COP $38,670,000 | 103.75% |

---

### 3. Matriz de Riesgos Técnicos y Mitigación

| Riesgo | Probabilidad | Impacto | Severidad | Estrategia Mitigación |
|:---|:---:|:---:|:---:|:---|
| Cambios de requisitos | Alta | Alto | 🔴 Crítico | Validación periódica con cliente, documentar cambios |
| Problemas sincronización RT | Media | Alto | 🟠 Mayor | Testing exhaustivo, Firebase redundancia |
| Baja adopción de usuarios | Media | Medio | 🟡 Medio | Capacitación intensiva, interfaz intuitiva |
| Retrasos en desarrollo | Media | Medio | 🟡 Medio | Metodología Ágil, sprints de 2 semanas |
| Costo infraestructura | Media | Medio | 🟡 Medio | Monitoreo de uso, alertas de consumo |
| Incompatibilidad dispositivos | Baja | Bajo | 🟢 Bajo | Testing en múltiples navegadores/SO |

---

## CONCLUSIONES

### Resumen de la Evidencia

El presente documento ha presentado un **sistema completo de fichas técnicas estandarizadas** para la recolección de información del proyecto POS Señor Hornado, fundamentado en la **Norma NTC ISO 9000:2015** de Sistemas de Gestión de la Calidad.

### Fichas Técnicas Diseñadas

Se han elaborado **6 fichas técnicas principales:**

1. ✅ **FT-REQ-001:** Requerimientos Funcionales
2. ✅ **FT-SOFT-001:** Especificaciones Técnicas de Software
3. ✅ **FT-INFRA-001:** Análisis de Infraestructura
4. ✅ **FT-LIC-001:** Dimensionamiento de Licencias
5. ✅ **FT-ESTIM-001:** Estimación Técnica y Económica
6. ✅ **FT-FUENTE-001:** Trazabilidad de Fuentes

### Indicadores Clave del Proyecto

| Indicador | Valor |
|:---|---:|
| Inversión Inicial | COP $149,032,840 |
| Duración Proyecto | 20 semanas (5 meses) |
| Equipo Requerido | 8 profesionales |
| Beneficio Anual | COP $38,670,000 |
| ROI Año 5 | 103.75% |
| Período Recuperación | 3.85 años |

### Recomendaciones Finales

1. **Validar Fichas con Stakeholders:** Presentar formatos a cliente para feedback
2. **Implementar Sistema de Registro:** Usar base de datos o herramienta de gestión documental
3. **Capacitar al Equipo:** Asegurar uso consistente de fichas
4. **Revisar Periódicamente:** Actualizar fichas cada 3 meses o ante cambios significativos
5. **Establecer Responsables:** Asignar dueños de calidad de datos por área

### Valor Agregado

Estas fichas técnicas proporcionan:

- ✅ **Trazabilidad completa** de decisiones técnicas y económicas
- ✅ **Estandarización** según normas internacionales (ISO 9000)
- ✅ **Documentación profesional** para auditorías y auditorías externas
- ✅ **Base para estimaciones** realistas de tiempo y costo
- ✅ **Control de calidad** en la recolección de información
- ✅ **Facilita comunicación** entre equipo técnico y cliente

---

## ANEXOS

### Anexo A: Plantilla de Firma Digital

```
Para fichas completadas digitalmente, usar el siguiente formato:

RESPONSABLE: ________________________    FECHA: ______________
CARGO: ________________________________
CONTACTO: ______________________________

APROBADOR: _____________________________   FECHA: ______________
CARGO: ________________________________
CONTACTO: ______________________________

VALIDADOR CALIDAD: _____________________    FECHA: ______________
CARGO: ________________________________
OBSERVACIONES: ________________________
```

### Anexo B: Control de Versiones

```
VERSION | FECHA | CAMBIOS REALIZADOS | AUTOR
--------|-------|-------------------|----------
1.0     |11/06/26| Creación inicial   | 220501094
        |        | 6 fichas diseñadas |
        |        |
        |        |
```

### Anexo C: Referencias Normativas

- **Norma NTC ISO 9000:2015** - Sistemas de Gestión de la Calidad
- **IEEE 830** - Especificación de Requisitos de Software
- **ITIL v4** - Gestión de Servicios de TI
- **PMBOK 6ª Edición** - Estándares de Gestión de Proyectos

### Anexo D: Formatos de Exportación

Las fichas pueden exportarse en los siguientes formatos:

- 📄 **PDF:** Para distribución inmutable
- 📊 **Excel:** Para análisis de datos
- 🔗 **JSON:** Para integración con sistemas
- 📝 **CSV:** Para importación a bases de datos
- 🌐 **Web:** Portal interactivo (opcional)

---

**DOCUMENTO CONTROLADO**

Clasificación: Acceso Interno - Proyecto  
Vigencia: 01/01/2026 - 31/12/2026  
Próxima Revisión: 01/09/2026  
Almacenamiento: Repositorio del Proyecto  
Copias Controladas: 3  

---

**Elaborado por:** Analista de Sistemas - 220501094  
**Validado por:** Líder Técnico del Proyecto  
**Aprobado por:** Dueño del Negocio  
**Fecha de Publicación:** 11 de junio de 2026  
**Versión:** 1.0

---

*Este documento proporciona las herramientas técnicas necesarias para la recolección sistemática de información, la estimación de costos y la toma de decisiones informadas en el proyecto "Sistema POS y Facturación Electrónica - Restaurante Señor Hornado".*

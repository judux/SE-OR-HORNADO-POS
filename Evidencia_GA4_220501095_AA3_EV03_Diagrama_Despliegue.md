# EVIDENCIA GA4-220501095-AA3-EV03
# DIAGRAMA DE DESPLIEGUE PARA CASO DE ESTUDIO Y PROYECTO DE SOFTWARE

---

## PORTADA

| Elemento | Información Detallada |
| :--- | :--- |
| **Programa de Formación** | Tecnólogo en Análisis y Desarrollo de Software (ADSO) |
| **Ficha de Caracterización** | 220501095 |
| **Fase del Proyecto** | Fase 2: Planeación (Guía de Aprendizaje 4) |
| **Competencia** | 220501095 — Diseñar la solución de software de acuerdo con los requerimientos y modelos de diseño |
| **Actividad de Aprendizaje** | AA3 — Diseñar las vistas de la arquitectura de software |
| **Código de Evidencia** | GA4-220501095-AA3-EV03 |
| **Nombre de la Evidencia** | Diagrama de despliegue para caso de estudio y proyecto de software |
| **Instrumento de Evaluación**| IE-GA4-220501095-AA3-EV03 |
| **Aprendiz** | Johan Sebastián |
| **Instructor Técnico** | Instructor de Área Técnica de Software |
| **Proyecto de Referencia** | Sistema POS y Facturación Electrónica — Restaurante Señor Hornado |
| **Fecha de Elaboración** | Octubre de 2026 |
| **Versión** | 1.0 (Final) |

---

## 1. INTRODUCCIÓN

El **diagrama de despliegue** en el marco del lenguaje de modelado unificado (UML) representa la arquitectura física y operativa de una solución de software. Su objetivo central es modelar cómo los diferentes componentes y artefactos ejecutables se distribuyen en nodos de hardware, servidores físicos o virtuales, dispositivos de usuario y canales de comunicación de red.

Dentro de la fase de **Planeación** (Guía de Aprendizaje 4), este informe técnico define la topología de infraestructura para el **"Sistema POS y Facturación Electrónica del Restaurante Señor Hornado"**. Se describe de forma clara y directa cómo interactúan los dispositivos móviles de los meseros, la terminal de caja, la impresora térmica de comandas y los servicios en la nube de Google Cloud / Firebase, garantizando el cumplimiento de los requerimientos funcionales del negocio y atributos no funcionales críticos como alta disponibilidad, respuesta en tiempo real y soporte ante caídas de internet (*Offline-First*).

---

## 2. DESARROLLO DEL DIAGRAMA DE DESPLIEGUE

### 2.1 Definición de la Arquitectura Física y Nodos del Sistema

La solución opera bajo un modelo híbrido compuesto por un entorno local (LAN dentro del restaurante) y una infraestructura elástica basada en la nube (Serverless / BaaS).

```
+---------------------------------------------------------------------------------------+
|                                    TOPOLOGÍA GLOBAL                                   |
+---------------------------------------------------------------------------------------+
|  [Dispositivos Móviles]  \                                                            |
|  (Smartphones Meseros)    \ (Wi-Fi 5 GHz)                                             |
|                            --> [Router Local] === (Internet) ===> [Nube Google Cloud] |
|  [Terminal de Caja]       /    (WLAN Privada)                     (Hosting + DB NoSQL)|
|  (PC / Impresora Térmica)/                                                            |
+---------------------------------------------------------------------------------------+
```

Los nodos identificados en el sistema son:

1. **`<<device>> Dispositivos Móviles (Meseros):`** Smartphones Android o iOS utilizados por hasta 6 meseros para la toma de comandas directamente en las mesas.
2. **`<<device>> Terminal de Caja (Cajero):`** Computador de escritorio o tablet de 10 pulgadas ubicado en el punto de cobro, conectado por cable de red para máxima estabilidad.
3. **`<<device>> Impresora Térmica Esc/POS (80 mm):`** Periférico físico de salida conectado a la estación de caja para la emisión de recibos y tirillas de pago.
4. **`<<device>> Gateway Router Wi-Fi Local:`** Enrutador de alta velocidad que gestiona la red de área local privada del restaurante en la banda de 5 GHz.
5. **`<<cloud provider>> Google Cloud / Firebase Platform:`** Entorno de infraestructura en la nube gestionado que aloja la base de datos distribuida, autenticación y microservicios.
6. **`<<external system>> Servidores DIAN:`** Entidad gubernamental externa encargada de recibir, validar y autorizar los documentos de facturación electrónica en Colombia.

---

### 2.2 Representación Gráfica: Diagrama de Despliegue UML

A continuación se presenta el diagrama de despliegue elaborado para el proyecto formativo:

```mermaid
graph TB
    subgraph RESTAURANTE ["LOCAL FÍSICO: RESTAURANTE SEÑOR HORNADO (Red LAN / WLAN)"]
        
        subgraph NODO_MESEROS ["«device» Smartphones Meseros (x6)"]
            PWA_Mesero["«artifact» Waiter_Client.pwa<br/>(Angular 18 Standalone App)"]
            Cache_Local["«storage» IndexedDB Cache<br/>(Persistencia Offline)"]
            PWA_Mesero --- Cache_Local
        end

        subgraph NODO_CAJA ["«device» Terminal de Caja (PC / Tablet)"]
            PWA_Cajero["«artifact» Cashier_Desk.pwa<br/>(Angular 18 Desktop UI)"]
            Driver_Print["«artifact» EscPos_Driver.js<br/>(Controlador Impresión)"]
            PWA_Cajero --- Driver_Print
        end

        subgraph NODO_IMPRESORA ["«device» Periférico de Impresión"]
            Printer["Impresora Térmica 80mm<br/>(Protocolo Esc/POS)"]
        end

        Router["«device» Router Wi-Fi Local<br/>(SSID Privado 5GHz - WPA3)"]

        NODO_MESEROS -.->|Wi-Fi 5GHz / TCP/IP| Router
        NODO_CAJA -->|Ethernet Cat 6 / 1 Gbps| Router
        Driver_Print -->|Cable USB / Red LAN IP| Printer
    end

    subgraph INTERNET ["RED PÚBLICA (INTERNET WAN)"]
        ISP["Conexión Fibra Óptica (ISP Principal + Backup 4G)"]
        Router === ISP
    end

    subgraph CLOUD ["INFRAESTRUCTURA NUBE (Google Cloud / Firebase)"]
        subgraph HOSTING ["«execution environment» Firebase Edge Hosting"]
            Frontend_Build["«artifact» Bundle SPA<br/>(HTML5, JS Chunks, CSS)"]
        end

        subgraph BASE_DATOS ["«database system» Cloud Firestore"]
            Firestore_DB[("BD NoSQL Multi-Región<br/>(Mesas, Pedidos, Menú)")]
        end

        subgraph AUTENTICACION ["«security service» Firebase Auth"]
            Auth_Service["Gestor de Sesiones<br/>(Tokens JWT + Roles RBAC)"]
        end

        subgraph FUNCTIONS ["«serverless compute» Cloud Functions (Node.js 20)"]
            Fn_Facturacion["«artifact» DianBillingMicroservice<br/>(Emisor XML UBL 2.1)"]
            Fn_Reportes["«artifact» DailySummaryMicroservice<br/>(Cierres de Caja)"]
        end
    end

    subgraph DIAN ["SISTEMA GUBERNAMENTAL (COLOMBIA)"]
        Dian_API["«web service» Servidor DIAN<br/>(Validación Factura Electrónica)"]
    end

    ISP -->|HTTPS / Port 443 TLS 1.3| Frontend_Build
    ISP -->|WSS / Port 443 WebSockets| Firestore_DB
    ISP -->|HTTPS / Port 443 REST| Auth_Service
    ISP -->|HTTPS / Port 443 REST| FUNCTIONS

    Fn_Facturacion -->|Llamada gRPC Interna| Firestore_DB
    Fn_Facturacion -->|HTTPS / TLS 1.3 Mutual Auth (X.509)| Dian_API
```

---

### 2.3 Especificación de Nodos, Artefactos y Protocolos

La siguiente matriz detalla los componentes ejecutables alojados en cada nodo y sus protocolos de interconexión:

| Nodo Físico / Entorno | Artefacto o Componente Alojado | Responsabilidad Técnica | Conexión y Protocolo |
| :--- | :--- | :--- | :--- |
| **Terminales Móviles (Meseros)** | `Waiter_Client.pwa` / `IndexedDB` | Interfaz mobile-first para toma de pedidos y almacenamiento local ante cortes de red. | Inalámbrica Wi-Fi 5 GHz; WebSockets (WSS) seguro hacia Firestore. |
| **Estación de Caja** | `Cashier_Desk.pwa` / `EscPos_Driver` | Monitoreo de mesas en tiempo real, liquidación de cuentas y orden de impresión. | Cable UTP Cat 6 Ethernet; cable USB / LAN IP hacia la impresora. |
| **Impresora Térmica** | Firmware / Driver de Hardware | Impresión de tickets de venta y comandas de preparación. | Protocolo binario Esc/POS sobre puerto USB o TCP/IP local. |
| **Firebase Edge Hosting** | Assets compilados de Angular 18 | Entrega perimetral ultrarrápida de la aplicación web a los navegadores cliente. | HTTPS (Puerto 443), protocolo TLS 1.3 con compresión Brotli/Gzip. |
| **Cloud Firestore** | Motor NoSQL en tiempo real | Almacenamiento y sincronización reactiva de mesas, comandas, productos y usuarios. | WebSockets bidireccionales seguros (WSS) y API gRPC interna de Google. |
| **Cloud Functions** | Microservicios en Node.js 20 | Procesamiento de cierres de caja y comunicación fiscal con la DIAN. | HTTPS REST API para llamadas externas; llamadas internas a la base de datos. |
| **Servidores DIAN** | Servicio Web de Facturación | Recepción, validación formal y emisión de acuse de recibo de facturas XML UBL 2.1. | HTTPS seguro con autenticación mutua mediante Certificado Digital X.509. |

---

### 2.4 Alineación con Requisitos Funcionales y No Funcionales

El diseño de la topología de despliegue satisface de forma directa los requerimientos del proyecto:

1. **Requerimiento Funcional — Agilidad en Pedidos y Cobro:**  
   La conexión directa mediante WebSockets entre las terminales de los meseros y la base de datos reactiva permite que cualquier cambio de estado en una mesa se refleje en la pantalla de caja en menos de 1 segundo.
2. **Requerimiento No Funcional — Disponibilidad y Resiliencia (*Offline-First*):**  
   Al emplear una Progressive Web App (PWA) con almacenamiento local en `IndexedDB`, si el proveedor de internet del restaurante sufre una caída, los meseros pueden continuar registrando comandas localmente sin bloqueos. Los datos se sincronizan automáticamente en cuanto se restablece el enlace WAN.
3. **Requerimiento No Funcional — Rendimiento y Concurrencia:**  
   La red Wi-Fi configurada en la banda de 5 GHz evita las interferencias electromagnéticas generadas por motores y hornos en la cocina (que operan en 2.4 GHz), asegurando baja latencia y alta tasa de transferencia en el salón.
4. **Requerimiento No Funcional — Seguridad y Control de Acceso:**  
   El tráfico de datos viaja íntegramente cifrado bajo HTTPS / TLS 1.3. La base de datos valida en cada lectura/escritura las *Security Rules* utilizando el token criptográfico JWT emitido por Firebase Authentication con roles estrictos (Mesero, Cajero, Administrador).
5. **Requerimiento No Funcional — Escalabilidad y Bajo Mantenimiento:**  
   La infraestructura en la nube basada en servicios Serverless elimina la necesidad de contar con servidores físicos locales dedicados, reduciendo los costos de mantenimiento y escalando automáticamente según la cantidad de transacciones.

---

## 3. CONCLUSIONES

1. **El diagrama de despliegue es el puente entre el software lógico y el mundo físico:** Permite visualizar con exactitud los puntos de ejecución de cada artefacto de software, los enlaces de red necesarios y las dependencias de hardware requeridas para que el sistema funcione de manera confiable.
2. **La arquitectura híbrida asegura continuidad operativa:** La combinación de una red de área local bien estructurada (con soporte *Offline-First* en los clientes) y un backend Serverless en la nube brinda al Restaurante Señor Hornado la máxima disponibilidad posible: el negocio nunca detiene su operación por fallas de conectividad externa.
3. **Cumplimiento estricto de los requisitos de ingeniería:** La topología diseñada responde directamente a los requerimientos funcionales de toma de comandas y facturación electrónica, garantizando simultáneamente la seguridad, la baja latencia y la facilidad de mantenimiento en producción.

---

## 4. REFERENCIAS BIBLIOGRÁFICAS

* **Ambler, S. W.** (2004). *The Object Primer: Agile Model-Driven Development with UML 2.0*. Cambridge University Press.
* **Booch, G., Rumbaugh, J., & Jacobson, I.** (2006). *El lenguaje de modelado unificado: Guía del usuario* (2da ed.). Pearson Educación.
* **Fowler, M.** (2004). *UML Gota a Gota* (3ra ed.). Addison-Wesley.
* **Pressman, R. S., & Maxim, B. R.** (2020). *Ingeniería del Software: Un enfoque práctico* (9na ed.). McGraw-Hill Education.
* **Servicio Nacional de Aprendizaje — SENA.** (2024). *Guía de Aprendizaje 4: Fase de Planeación - Diseño de Soluciones de Software (Código 220501095)*. Dirección de Formación Profesional.

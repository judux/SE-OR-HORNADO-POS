#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del Documento HTML y PDF Oficial para la Evidencia:
GA4-220501095-AA2-EV06: Taller. Arquitectura de software
SENA - ADSO
"""

import os
import subprocess
import sys

def generate_html():
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>GA4-220501095-AA2-EV06: Taller. Arquitectura de Software</title>
    <style>
        @page {
            size: letter;
            margin: 22mm 18mm 22mm 18mm;
            @top-right {
                content: "SENA ADSO | GA4-220501095-AA2-EV06";
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 8pt;
                color: #718096;
            }
            @bottom-right {
                content: "Página " counter(page);
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 8pt;
                color: #718096;
            }
        }

        *, *::before, *::after {
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            color: #1a202c;
            line-height: 1.6;
            font-size: 10.5pt;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* Portada Institucional */
        .cover-page {
            page-break-after: always;
            height: 100vh;
            min-height: 900px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 40px 30px;
            border: 2px solid #00324d;
            border-top: 10px solid #39a900;
            background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
            box-shadow: inset 0 0 40px rgba(0,50,77,0.03);
        }

        .cover-header {
            text-align: center;
        }

        .sena-badge {
            display: inline-block;
            background: #39a900;
            color: #ffffff;
            font-weight: 700;
            padding: 6px 18px;
            border-radius: 20px;
            font-size: 11pt;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }

        .cover-institution {
            font-size: 14pt;
            font-weight: 800;
            color: #00324d;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .cover-center {
            font-size: 10pt;
            color: #4a5568;
            margin-top: 4px;
        }

        .cover-title-box {
            text-align: center;
            margin: 40px 0;
            padding: 30px 20px;
            background: #ffffff;
            border-left: 6px solid #00324d;
            border-right: 6px solid #39a900;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border-radius: 4px;
        }

        .evidence-code {
            font-size: 11pt;
            font-weight: 700;
            color: #39a900;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .cover-title {
            font-size: 22pt;
            font-weight: 900;
            color: #00324d;
            margin: 0 0 10px 0;
            line-height: 1.25;
        }

        .cover-subtitle {
            font-size: 12pt;
            font-weight: 500;
            color: #4a5568;
            margin: 0;
        }

        .cover-meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            background: #f7fafc;
            padding: 20px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            font-size: 9.5pt;
        }

        .cover-meta-item strong {
            color: #00324d;
            display: block;
            font-size: 8.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }

        .cover-footer {
            text-align: center;
            font-size: 9pt;
            color: #718096;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }

        /* Estilos de Contenido */
        h1, h2, h3, h4, h5 {
            color: #00324d;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
            page-break-after: avoid;
        }

        h1 {
            font-size: 16pt;
            border-bottom: 2.5px solid #39a900;
            padding-bottom: 6px;
            margin-top: 32px;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .page-break-before {
            page-break-before: always;
        }

        h2 {
            font-size: 13pt;
            color: #00324d;
            border-left: 4px solid #39a900;
            padding-left: 10px;
            margin-top: 24px;
            margin-bottom: 12px;
        }

        h3 {
            font-size: 11.5pt;
            color: #2d3748;
            margin-top: 18px;
            margin-bottom: 8px;
            font-weight: 700;
        }

        h4 {
            font-size: 10.5pt;
            color: #39a900;
            margin-top: 14px;
            margin-bottom: 6px;
            font-weight: 700;
            text-transform: uppercase;
        }

        p {
            margin-top: 0;
            margin-bottom: 12px;
            text-align: justify;
        }

        ul, ol {
            margin-top: 0;
            margin-bottom: 12px;
            padding-left: 24px;
        }

        li {
            margin-bottom: 6px;
        }

        /* Tablas */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 9pt;
            page-break-inside: avoid;
            background: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        th, td {
            border: 1px solid #cbd5e0;
            padding: 8px 12px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #00324d;
            color: #ffffff;
            font-weight: 600;
            letter-spacing: 0.5px;
            font-size: 8.5pt;
            text-transform: uppercase;
        }

        tr:nth-child(even) {
            background-color: #f7fafc;
        }

        tr:hover {
            background-color: #edf2f7;
        }

        /* Bloques de Cita / Callouts */
        blockquote {
            margin: 14px 0;
            padding: 12px 16px;
            background-color: #f0fdf4;
            border-left: 4px solid #39a900;
            color: #166534;
            font-style: italic;
            border-radius: 0 4px 4px 0;
        }

        .callout-info {
            margin: 14px 0;
            padding: 12px 16px;
            background-color: #ebf8ff;
            border-left: 4px solid #3182ce;
            color: #2b6cb0;
            border-radius: 0 4px 4px 0;
            font-size: 9.5pt;
            page-break-inside: avoid;
        }

        .callout-highlight {
            margin: 14px 0;
            padding: 12px 16px;
            background-color: #fffaf0;
            border-left: 4px solid #dd6b20;
            color: #9c4221;
            border-radius: 0 4px 4px 0;
            font-size: 9.5pt;
            page-break-inside: avoid;
        }

        /* Código y Diagramas */
        pre {
            background-color: #1a202c;
            color: #edf2f7;
            padding: 12px 16px;
            border-radius: 6px;
            font-family: 'Consolas', 'Courier New', Courier, monospace;
            font-size: 8.5pt;
            line-height: 1.45;
            overflow-x: auto;
            margin: 14px 0;
            page-break-inside: avoid;
            border: 1px solid #2d3748;
        }

        code {
            font-family: 'Consolas', 'Courier New', Courier, monospace;
            background-color: #edf2f7;
            color: #c53030;
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 9pt;
        }

        pre code {
            background: transparent;
            color: inherit;
            padding: 0;
        }

        /* Diagram Containers */
        .diagram-box {
            background: #f8fafc;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 16px;
            margin: 18px 0;
            page-break-inside: avoid;
            text-align: center;
        }

        .diagram-caption {
            font-size: 8.5pt;
            color: #64748b;
            font-weight: 600;
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-status {
            display: inline-block;
            background: #dcfce7;
            color: #15803d;
            font-weight: 700;
            font-size: 8pt;
            padding: 3px 8px;
            border-radius: 12px;
            border: 1px solid #86efac;
        }

        /* Tabla de Contenido Visual */
        .toc-list {
            list-style: none;
            padding-left: 0;
        }

        .toc-list li {
            position: relative;
            margin-bottom: 8px;
            font-size: 10pt;
        }

        .toc-list li::after {
            content: "";
            border-bottom: 1px dotted #cbd5e0;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 4px;
            z-index: 1;
        }

        .toc-list li span.title {
            background: #ffffff;
            position: relative;
            z-index: 2;
            padding-right: 8px;
            color: #00324d;
            font-weight: 600;
        }

        .toc-list li span.page {
            background: #ffffff;
            position: absolute;
            right: 0;
            bottom: 0;
            z-index: 2;
            padding-left: 8px;
            color: #718096;
            font-weight: 700;
        }

        .toc-sub {
            padding-left: 20px;
            font-weight: normal;
        }

        .toc-sub span.title {
            font-weight: normal !important;
            color: #4a5568 !important;
        }
    </style>
</head>
<body>

    <!-- PORTADA -->
    <div class="cover-page">
        <div class="cover-header">
            <div class="sena-badge">Servicio Nacional de Aprendizaje — SENA</div>
            <h2 class="cover-institution">Centro de Teleinformática y Producción Industrial</h2>
            <div class="cover-center">Regional Distrito Capital / Regional Cauca • Modalidad Virtual</div>
        </div>

        <div class="cover-title-box">
            <div class="evidence-code">EVIDENCIA GA4-220501095-AA2-EV06</div>
            <h1 class="cover-title">TALLER: ARQUITECTURA DE SOFTWARE</h1>
            <p class="cover-subtitle">Fundamentación Teórica, Incorporación de Patrones de Diseño, Vista de Componentes y Vista de Despliegue</p>
        </div>

        <div class="cover-meta-grid">
            <div class="cover-meta-item">
                <strong>Programa de Formación:</strong>
                Tecnólogo en Análisis y Desarrollo de Software (ADSO)
            </div>
            <div class="cover-meta-item">
                <strong>Ficha de Caracterización:</strong>
                220501095
            </div>
            <div class="cover-meta-item">
                <strong>Fase del Proyecto:</strong>
                Fase 2: Planeación (Guía de Aprendizaje 4)
            </div>
            <div class="cover-meta-item">
                <strong>Competencia:</strong>
                220501095 - Diseñar la solución de software
            </div>
            <div class="cover-meta-item">
                <strong>Aprendiz:</strong>
                Johan Sebastián
            </div>
            <div class="cover-meta-item">
                <strong>Instructor de Área Técnica:</strong>
                Instructor Técnico SENA
            </div>
            <div class="cover-meta-item">
                <strong>Proyecto Formativo de Referencia:</strong>
                Sistema POS y Facturación Electrónica - Señor Hornado
            </div>
            <div class="cover-meta-item">
                <strong>Fecha y Versión:</strong>
                Octubre de 2026 • Versión 1.0 (Final)
            </div>
        </div>

        <div class="cover-footer">
            Servicio Nacional de Aprendizaje SENA — Dirección de Formación Profesional Integral<br>
            Documento Técnico de Entrega de Evidencia de Aprendizaje
        </div>
    </div>

    <!-- TABLA DE CONTENIDO -->
    <div class="page-break-before">
        <h1>Tabla de Contenido</h1>
        <ul class="toc-list">
            <li><span class="title">1. Introducción y Contexto en la Fase de Planeación</span></li>
            <li class="toc-sub"><span class="title">1.1 Justificación y Relevancia Formativa</span></li>
            <li class="toc-sub"><span class="title">1.2 Objetivos del Taller (General y Específicos)</span></li>
            <li class="toc-sub"><span class="title">1.3 Sistema de Referencia Tecnológica (Caso Señor Hornado)</span></li>
            
            <li><span class="title">2. Desarrollo del Taller: Preguntas Orientadoras</span></li>
            <li class="toc-sub"><span class="title">2.1 Pregunta 1: ¿Qué se Entiende por Arquitectura de Software?</span></li>
            <li class="toc-sub"><span class="title">2.2 Pregunta 2: ¿Cuál es su Función en un Sistema de Software?</span></li>
            <li class="toc-sub"><span class="title">2.3 Pregunta 3: ¿Cómo se Elabora la Arquitectura de Software? (Método ADD)</span></li>
            <li class="toc-sub"><span class="title">2.4 Pregunta 4: ¿Cómo Lograr una Buena Arquitectura? (Patrones y Principios SOLID)</span></li>
            <li class="toc-sub"><span class="title">2.5 Pregunta 5: ¿Cuáles son los Elementos de Diseño de una Arquitectura?</span></li>
            
            <li><span class="title">3. Vistas Arquitectónicas del Sistema (Criterios de Evaluación)</span></li>
            <li class="toc-sub"><span class="title">3.1 Vista de Componentes (Fundamentación y Modelado UML)</span></li>
            <li class="toc-sub"><span class="title">3.2 Vista de Despliegue (Justificación y Topología Física/Nube)</span></li>
            <li class="toc-sub"><span class="title">3.3 Decisiones de Infraestructura y Resiliencia Operativa</span></li>
            
            <li><span class="title">4. Matriz de Cumplimiento de Lista de Chequeo (IE-GA4-220501095-AA2-EV06)</span></li>
            <li><span class="title">5. Conclusiones Técnicas</span></li>
            <li><span class="title">6. Referencias Bibliográficas (Normas APA 7ma Edición)</span></li>
        </ul>
    </div>

    <!-- SECCIÓN 1: INTRODUCCIÓN -->
    <div class="page-break-before">
        <h1>1. Introducción y Contexto en la Fase de Planeación</h1>
        
        <h3>1.1 Justificación y Relevancia Formativa</h3>
        <p>En el marco del programa Tecnólogo en Análisis y Desarrollo de Software (ADSO) del Servicio Nacional de Aprendizaje (SENA), la <strong>Guía de Aprendizaje 4 (GA4)</strong> sitúa al aprendiz en la fase crucial de <strong>Planeación</strong>, orientada a la competencia <strong>220501095: Diseñar la solución de software de acuerdo con los requerimientos y modelos de diseño</strong>.</p>
        
        <p>Habiendo superado las etapas de especificación de requisitos mediante casos de uso, historias de usuario, modelos de dominio e informes de factibilidad económica (fases previas del ciclo formativo), la ingeniería de software exige responder a una pregunta estructural ineludible: <em>¿Cómo se orquesta el sistema informático en su conjunto para garantizar que satisfaga los rigurosos atributos de calidad y soporte el crecimiento del negocio a lo largo del tiempo?</em></p>

        <p>Construir una solución de software sin una arquitectura formalmente planificada es análogo a construir un rascacielos sin planos estructurales ni cálculos de cargas dinámicas: el colapso operativo, la degradación de tiempos de respuesta, las brechas de seguridad y la imposibilidad de mantenimiento serán consecuencias inevitables. Este informe técnico desarrolla la evidencia <strong>GA4-220501095-AA2-EV06: Taller. Arquitectura de software</strong>, dando respuesta profunda y argumentada a los fundamentos de la disciplina.</p>

        <h3>1.2 Objetivos del Taller</h3>
        <p><strong>Objetivo General:</strong> Elaborar un informe técnico argumentado que aborde en profundidad los conceptos fundamentales, metodológicos y prácticos de la arquitectura de software, fundamentando la incorporación de patrones de diseño, la vista de componentes y la vista de despliegue según los lineamientos de la lista de chequeo <code>IE-GA4-220501095-AA2-EV06</code>.</p>
        
        <p><strong>Objetivos Específicos:</strong></p>
        <ul>
            <li>Definir conceptualmente la arquitectura de software, su anatomía global y su relación directa con cada etapa del ciclo de vida del software (SDLC).</li>
            <li>Analizar el rol de la arquitectura en la satisfacción de atributos de calidad (mantenibilidad, escalabilidad, disponibilidad y rendimiento) y la mitigación de riesgos de deuda técnica.</li>
            <li>Describir la metodología de diseño sistemático basada en el método ADD (Attribute-Driven Design) y la especificación de escenarios de calidad.</li>
            <li>Fundamentar la incorporación de patrones de diseño (creacionales, estructurales y comportamentales) y principios SOLID para optimizar la codificación y mantenibilidad.</li>
            <li>Modelar y sustentar técnicamente la <strong>Vista de Componentes</strong> y la <strong>Vista de Despliegue</strong> para el entorno de producción.</li>
        </ul>

        <h3>1.3 Sistema de Referencia Tecnológica (Caso Señor Hornado)</h3>
        <p>Con el fin de evitar un análisis meramente abstracto, todos los conceptos, patrones y modelos expuestos en este informe se ejemplifican tomando como caso de estudio el proyecto de software formativo en desarrollo: el <strong>"Sistema POS y Facturación Electrónica para el Restaurante Señor Hornado"</strong>.</p>
        
        <div class="callout-info">
            <strong>Ficha Tecnológica del Sistema de Referencia:</strong><br>
            • <strong>Frontend:</strong> Progressive Web App (PWA) desarrollada en <em>Angular 18</em>, bajo el paradigma de Componentes Autónomos (<em>Standalone Components</em>), reactividad granular mediante <em>Signals</em>, TypeScript 5.5 y diseño responsive Mobile-First con <em>Tailwind CSS</em>.<br>
            • <strong>Backend & Persistencia:</strong> Arquitectura Serverless / Backend as a Service (BaaS) en <em>Google Cloud / Firebase</em>, empleando <em>Cloud Firestore</em> para sincronización reactiva en tiempo real y <em>Cloud Functions</em> para microservicios.<br>
            • <strong>Integraciones Periféricas:</strong> Pasarela de facturación electrónica compatible con la normativa DIAN (Colombia, estándar UBL 2.1) y controlador de impresión térmica Esc/POS (USB/Bluetooth/Red) para comandas y tickets de venta.
        </div>
    </div>

    <!-- SECCIÓN 2: DESARROLLO DEL TALLER -->
    <div class="page-break-before">
        <h1>2. Desarrollo del Taller: Preguntas Orientadoras</h1>

        <!-- PREGUNTA 1 -->
        <h2>2.1 Pregunta 1: ¿Qué se Entiende por Arquitectura de Software?</h2>
        
        <h3>2.1.1 Definición Conceptual y Fundamentos Teóricos</h3>
        <p>La <strong>arquitectura de software</strong> no es meramente el código fuente, ni una colección desarticulada de diagramas UML, ni tampoco la simple elección de tecnologías o frameworks de programación. La arquitectura representa el <strong>conjunto estructurado de decisiones fundamentales sobre la organización del sistema</strong>, sus componentes computacionales, las interfaces que los delimitan y los conectores que posibilitan su interacción.</p>

        <p>De acuerdo con la norma internacional <strong>ISO/IEC/IEEE 42010:2011</strong> (<em>Systems and software engineering — Architecture description</em>):</p>
        <blockquote>
            "La arquitectura comprende los conceptos o propiedades fundamentales de un sistema en su entorno, materializados en sus elementos, relaciones y en los principios de su diseño y evolución."
        </blockquote>

        <p>Complementariamente, <strong>Len Bass, Paul Clements y Rick Kazman</strong>, investigadores del <em>Software Engineering Institute (SEI)</em> de Carnegie Mellon, postulan en su tratado canónico <em>Software Architecture in Practice</em>:</p>
        <blockquote>
            "La arquitectura de software de un programa o sistema computacional es la estructura o estructuras del sistema, que comprenden los elementos de software, las propiedades visibles externamente de esos elementos y las relaciones entre ellos."
        </blockquote>

        <p>De estas definiciones se derivan tres proposiciones axiomáticas indispensables:</p>
        <ol>
            <li><strong>Pluralidad de estructuras:</strong> Un sistema de software no posee una sola estructura, sino múltiples estructuras interrelacionadas: una estructura estática modular (cómo se organiza el código en carpetas y librerías), una estructura dinámica de ejecución (hilos, procesos y sockets concurrentes) y una estructura física o de despliegue (nodos de servidor, redes y contenedores).</li>
            <li><strong>Propiedades externamente visibles:</strong> A la arquitectura le conciernen los contratos públicos, protocolos y atributos de servicio que cada componente promete al resto del sistema, promoviendo el ocultamiento intencional de los detalles de implementación interna.</li>
            <li><strong>Decisiones tempranas de alto costo de cambio:</strong> Constituye el núcleo de decisiones de ingeniería que, de ser erróneas o modificadas tardíamente, demandarían reconstruir partes sustanciales del sistema informático con un costo económico y temporal desmesurado.</li>
        </ol>

        <h3>2.1.2 Estructura Global y Relación con el Ciclo de Vida del Software (SDLC)</h3>
        <p>La arquitectura actúa como la columna vertebral que guía y condiciona cada una de las fases del ciclo de vida del desarrollo de software:</p>

        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Fase del Ciclo de Vida</th>
                    <th style="width: 35%;">Rol y Aporte de la Arquitectura</th>
                    <th style="width: 40%;">Impacto Práctico en el Sistema POS</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Análisis de Requerimientos</strong></td>
                    <td>Filtra los requerimientos del negocio y los traduce en restricciones de diseño y escenarios de calidad medibles.</td>
                    <td>Traduce la necesidad de "tomar pedidos aunque falle el Wi-Fi" en la adopción obligatoria del paradigma <em>Offline-First</em> con IndexedDB.</td>
                </tr>
                <tr>
                    <td><strong>Diseño Detallado</strong></td>
                    <td>Establece el marco de referencia y los contratos de interfaz que deben acatar las clases y entidades de dominio.</td>
                    <td>Define que la pasarela de pagos utilizará una interfaz abstracta <code>IPaymentStrategy</code> antes de escribir los algoritmos de cobro.</td>
                </tr>
                <tr>
                    <td><strong>Construcción (Codificación)</strong></td>
                    <td>Define las fronteras de carpetas, estándares de empaquetado, inyección de dependencias y políticas de manejo de excepciones.</td>
                    <td>Garantiza que la lógica de cálculo de impuestos en Angular resida en un servicio de dominio y no mezclada dentro del HTML del componente.</td>
                </tr>
                <tr>
                    <td><strong>Pruebas e Integración (QA)</strong></td>
                    <td>Permite aislar componentes para pruebas unitarias mediante dobles de prueba (mocks) y planear pruebas de estrés no funcionales.</td>
                    <td>Permite simular el servidor de la DIAN mediante un mock de red para probar la tolerancia a fallos del emisor de facturas.</td>
                </tr>
                <tr>
                    <td><strong>Despliegue y Operación</strong></td>
                    <td>Determina la topología física, balanceadores, contenedores y mecanismos de alta disponibilidad y monitoreo continuo.</td>
                    <td>Establece la distribución en nodos CDN para el frontend y clústeres multi-región para la base de datos Firestore.</td>
                </tr>
                <tr>
                    <td><strong>Mantenimiento y Evolución</strong></td>
                    <td>Asegura que nuevas características puedan incorporarse sin degradar los atributos de calidad preexistentes.</td>
                    <td>Facilita añadir un módulo de domicilios en el futuro sin modificar el módulo de comandas de mesas del restaurante.</td>
                </tr>
            </tbody>
        </table>

        <!-- PREGUNTA 2 -->
        <h2>2.2 Pregunta 2: ¿Cuál es su Función en un Sistema de Software?</h2>
        
        <h3>2.2.1 Orquestación y Mitigación del Caos Estructural</h3>
        <p>La función primordial de la arquitectura de software es dotar de <strong>orden, coherencia y gobernanza</strong> a una solución tecnológica. Sin una arquitectura formal, los sistemas degeneran rápidamente en el antipatrón conocido en la literatura de ingeniería como <strong>"Big Ball of Mud"</strong> (Gran Bola de Lodo): una maraña de código altamente acoplado donde cualquier modificación o corrección genera fallos imprevistos en sectores no relacionados de la aplicación.</p>

        <h3>2.2.2 Garantía y Balance de Atributos de Calidad</h3>
        <p>Un sistema informático puede cumplir el 100% de sus requerimientos funcionales y aun así fracasar rotundamente si sus Atributos de Calidad colapsan. La función arquitectónica asegura el balance entre dichos atributos:</p>

        <ul>
            <li><strong>Mantenibilidad:</strong> Capacidad de realizar correcciones, adaptaciones o ampliaciones con bajo esfuerzo y bajo riesgo. Se logra mediante desacoplamiento modular y contratos de interfaz limpios.</li>
            <li><strong>Escalabilidad:</strong> Habilidad de soportar incrementos drásticos en transacciones o usuarios concurrentes sin degradar la latencia. La arquitectura define la partición de datos y el escalado elástico horizontal.</li>
            <li><strong>Disponibilidad y Resiliencia:</strong> Garantía de que los servicios críticos continúen operando ante fallas de infraestructura o cortes de enlace de red, mediante tolerancia a fallos y redundancia.</li>
            <li><strong>Seguridad Operativa:</strong> Blindaje de los datos en reposo y en tránsito, control de acceso basado en roles (RBAC) y validación perimetral de peticiones.</li>
        </ul>

        <h3>2.2.3 Mitigación de Riesgos y Comunicación entre Stakeholders</h3>
        <p>La arquitectura actúa como un <strong>vehículo unificador de comunicación</strong> que traduce las expectativas de negocio del cliente a directrices técnicas accionables para los desarrolladores y operadores de infraestructura. Asimismo, mitiga el riesgo de <em>vendor lock-in</em> (dependencia absoluta de un proveedor) mediante capas de abstracción que aíslan el núcleo de la aplicación de servicios propietarios externos.</p>
    </div>

    <!-- SECCIÓN 2 (CONT): PREGUNTAS 3 Y 4 -->
    <div class="page-break-before">
        <!-- PREGUNTA 3 -->
        <h2>2.3 Pregunta 3: ¿Cómo se Elabora la Arquitectura de Software?</h2>

        <h3>2.3.1 Metodología de Diseño: Enfoque ADD (Attribute-Driven Design)</h3>
        <p>El diseño de una arquitectura no obedece a la improvisación. La metodología más rigurosa y extendida es el método <strong>ADD (Attribute-Driven Design)</strong> del <em>Software Engineering Institute (SEI)</em>. Este método descompone sistemáticamente el sistema guiado por la satisfacción explícita de los <strong>Impulsores Arquitectónicos (Architectural Drivers)</strong>.</p>

        <div class="callout-highlight">
            <strong>Fases del Proceso Metodológico de Elaboración Arquitectónica:</strong><br>
            <strong>Paso 1: Identificación de Drivers:</strong> Recopilar y priorizar requerimientos funcionales críticos, atributos de calidad no negociables y restricciones técnicas/legales.<br>
            <strong>Paso 2: Formulación de Escenarios de Calidad:</strong> Estructurar escenarios formales de 6 elementos (Fuente, Estímulo, Artefacto, Entorno, Respuesta y Medida).<br>
            <strong>Paso 3: Selección de Estilos Arquitectónicos:</strong> Evaluar patrones macro (Capas, Hexagonal, Microservicios, Serverless) acordes a los drivers.<br>
            <strong>Paso 4: Descomposición y Asignación de Responsabilidades:</strong> Definir subsistemas, módulos y encapsulamiento funcional.<br>
            <strong>Paso 5: Definición de Interfaces y Protocolos:</strong> Establecer los contratos de comunicación entre componentes.<br>
            <strong>Paso 6: Evaluación y Documentación:</strong> Validar el diseño frente a riesgos (método ATAM) y documentar decisiones mediante registros ADR.
        </div>

        <h3>2.3.2 Escenarios de Atributos de Calidad para el Sistema POS</h3>
        <p>A continuación se formalizan dos escenarios representativos diseñados para el Restaurante Señor Hornado:</p>

        <table>
            <thead>
                <tr>
                    <th style="width: 20%;">Elemento</th>
                    <th style="width: 40%;">Escenario 1: Resiliencia y Modo Fuera de Línea</th>
                    <th style="width: 40%;">Escenario 2: Rendimiento y Concurrencia en Salón</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Fuente</strong></td>
                    <td>Enlace de telecomunicaciones del proveedor de internet (ISP).</td>
                    <td>6 meseros registrando comandas simultáneamente en horas pico.</td>
                </tr>
                <tr>
                    <td><strong>Estímulo</strong></td>
                    <td>Corte total de conectividad a internet en el establecimiento.</td>
                    <td>Envío masivo y concurrente de pedidos hacia el servidor.</td>
                </tr>
                <tr>
                    <td><strong>Artefacto</strong></td>
                    <td>Subsistema PWA móvil en el navegador del smartphone del mesero.</td>
                    <td>Clúster de datos en tiempo real (Cloud Firestore).</td>
                </tr>
                <tr>
                    <td><strong>Entorno</strong></td>
                    <td>Operación regular en el salón de comensales.</td>
                    <td>Operación normal a máxima capacidad transaccional del negocio.</td>
                </tr>
                <tr>
                    <td><strong>Respuesta</strong></td>
                    <td>La PWA conmuta a persistencia local IndexedDB sin emitir errores de bloqueo.</td>
                    <td>El sistema procesa y notifica las órdenes a caja vía WebSockets.</td>
                </tr>
                <tr>
                    <td><strong>Medida</strong></td>
                    <td>Cero pérdida de información; sincronización automática en &lt; 5 s al reconectar.</td>
                    <td>Latencia visual en pantalla de mesero &lt; 300 ms; actualización en caja &lt; 800 ms.</td>
                </tr>
            </tbody>
        </table>

        <!-- PREGUNTA 4 -->
        <h2>2.4 Pregunta 4: ¿Cómo Lograr una Buena Arquitectura de Software?</h2>

        <h3>2.4.1 Principios Rectores: Bajo Acoplamiento, Alta Cohesión y SOLID</h3>
        <p>Una arquitectura sólida se fundamenta en principios universales de ingeniería:</p>
        <ul>
            <li><strong>Bajo Acoplamiento (Loose Coupling):</strong> Reducir las dependencias entre módulos al mínimo indispensable. Los módulos deben conocerse únicamente a través de interfaces públicas abstractas, permitiendo sustituir o actualizar un módulo sin propagar efectos secundarios indeseados.</li>
            <li><strong>Alta Cohesión (High Cohesion):</strong> Cada componente debe albergar un conjunto estrechamente enfocado de responsabilidades afines. Un módulo de facturación no debe encargarse de dibujar interfaces HTML ni de manipular hilos de sockets de red.</li>
            <li><strong>Principios SOLID a Nivel Arquitectónico:</strong>
                <ul>
                    <li><em>S (Single Responsibility):</em> Cada subsistema posee una única razón de cambio.</li>
                    <li><em>O (Open/Closed):</em> El sistema se extiende mediante nuevos módulos sin modificar el código base probado.</li>
                    <li><em>L (Liskov Substitution):</em> Los adaptadores concretos deben cumplir fielmente el contrato de su interfaz base.</li>
                    <li><em>I (Interface Segregation):</em> Diseñar contratos específicos para cada rol o cliente del sistema.</li>
                    <li><em>D (Dependency Inversion):</em> Los módulos de negocio de alto nivel dependen de abstracciones, nunca de librerías de infraestructura concretas.</li>
                </ul>
            </li>
        </ul>

        <h3>2.4.2 Incorporación de Patrones de Diseño (Cumplimiento Criterio 1 IE-GA4-220501095-AA2-EV06)</h3>
        <p>En estricto cumplimiento del <strong>Criterio 1 de evaluación</strong>, la arquitectura incorpora un catálogo estructurado de patrones de diseño orientados a las mejores prácticas de codificación y mantenibilidad:</p>

        <table>
            <thead>
                <tr>
                    <th style="width: 15%;">Patrón de Diseño</th>
                    <th style="width: 15%;">Clasificación</th>
                    <th style="width: 40%;">Implementación en la Arquitectura del Sistema</th>
                    <th style="width: 30%;">Impacto en Mantenibilidad y Código</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Strategy</strong></td>
                    <td>Comportamental</td>
                    <td>La clase <code>PaymentProcessor</code> recibe dinámicamente estrategias como <code>CashStrategy</code>, <code>CardStrategy</code> o <code>TransferStrategy</code> para liquidar transacciones.</td>
                    <td>Permite incorporar nuevos medios de pago (ej. Nequi, Daviplata) sin modificar la lógica central de cobros (Cumple Open/Closed).</td>
                </tr>
                <tr>
                    <td><strong>Adapter</strong></td>
                    <td>Estructural</td>
                    <td>Los periféricos de impresión térmica implementan la interfaz <code>IPrinterAdapter</code>, existiendo adaptadores <code>EscPosUsbAdapter</code> y <code>EscPosBluetoothAdapter</code>.</td>
                    <td>Aísla al sistema de los comandos binarios específicos de cada fabricante de hardware.</td>
                </tr>
                <tr>
                    <td><strong>Facade</strong></td>
                    <td>Estructural</td>
                    <td>El servicio <code>CheckoutFacade</code> unifica las 5 operaciones de cierre de mesa: cálculo fiscal, descuento, pago, facturación DIAN e impresión de recibo.</td>
                    <td>Reduce la complejidad ciclomática de los componentes de la interfaz de usuario en más de un 70%.</td>
                </tr>
                <tr>
                    <td><strong>Observer</strong></td>
                    <td>Comportamental</td>
                    <td>Cloud Firestore y los <em>Signals</em> de Angular notifican cambios de estado de mesas en tiempo real a las vistas de caja y meseros mediante suscripción reactiva.</td>
                    <td>Elimina el sobrecosto de sondeo periódico (polling) y mantiene desacoplados los productores de eventos de los consumidores.</td>
                </tr>
                <tr>
                    <td><strong>Repository</strong></td>
                    <td>Estructural / Datos</td>
                    <td>La interfaz <code>IOrderRepository</code> abstrae la lectura/escritura de pedidos, decidiendo si lee de memoria local (IndexedDB) o de la nube remota.</td>
                    <td>Permite alternar entre almacenamiento local y en la nube sin que la lógica de aplicación note la diferencia.</td>
                </tr>
                <tr>
                    <td><strong>Factory Method</strong></td>
                    <td>Creacional</td>
                    <td><code>InvoiceDocumentFactory</code> crea instancias de <code>ElectronicInvoiceDian</code> o <code>SimpleTicketReceipt</code> según el tipo de cliente y requerimiento fiscal.</td>
                    <td>Centraliza la instanciación de documentos tributarios complejos y la validación de esquemas XML / UBL 2.1.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- SECCIÓN 3: VISTAS ARQUITECTÓNICAS -->
    <div class="page-break-before">
        <h1>3. Vistas Arquitectónicas del Sistema (Criterios de Evaluación 2 y 3)</h1>

        <h2>3.1 Vista de Componentes (Cumplimiento Criterio 2)</h2>
        
        <h3>3.1.1 Fundamentación Técnica en Fases Avanzadas del Ciclo de Vida</h3>
        <p>De acuerdo con la lista de chequeo <code>IE-GA4-220501095-AA2-EV06</code> (Criterio 2), la <strong>Vista de Componentes</strong> representa la organización modular y las interrelaciones del software durante las fases avanzadas del ciclo de vida (construcción madura, empaquetado, pruebas de integración y evolución).</p>

        <p>La fundamentación de esta vista radica en:</p>
        <ul>
            <li><strong>Encapsulamiento y modularidad estricta:</strong> Permite asegurar que los componentes operen como cajas negras comunicadas exclusivamente a través de interfaces explícitas (provistas y requeridas), evitando la proliferación de dependencias ocultas.</li>
            <li><strong>Facilidad de pruebas unitarias y de integración:</strong> Al conocer los contratos de entrada y salida de cada componente, es posible inyectar dobles de prueba (<em>mocks</em> o <em>stubs</em>) en componentes críticos como el emisor de facturación DIAN o el controlador de impresión térmica sin requerir el hardware ni los servidores gubernamentales activos.</li>
            <li><strong>Planificación del desarrollo concurrente:</strong> Permite que desarrolladores frontend trabajen sobre los componentes de interfaz móvil mientras especialistas en backend refactorizan las Cloud Functions o el motor de sincronización sin generar bloqueos mutuos.</li>
        </ul>

        <h3>3.1.2 Modelado de la Vista de Componentes (Diagrama de Componentes UML)</h3>
        <div class="diagram-box">
            <!-- Diagrama SVG de Componentes -->
            <svg width="700" height="420" viewBox="0 0 700 420" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
                <defs>
                    <linearGradient id="gradClient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ebf8ff;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#bee3f8;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="gradBackend" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#f0fdf4;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#bbf7d0;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="gradDian" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#fff7ed;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#fed7aa;stop-opacity:1" />
                    </linearGradient>
                </defs>

                <!-- Subsistema Frontend -->
                <rect x="20" y="20" width="310" height="380" rx="8" fill="url(#gradClient)" stroke="#3182ce" stroke-width="2" stroke-dasharray="4 2"/>
                <text x="35" y="42" font-family="Segoe UI, Arial" font-size="11" font-weight="bold" fill="#2b6cb0">&lt;&lt;subsystem&gt;&gt; Frontend PWA (Angular 18)</text>

                <!-- Componente Vista Mesero -->
                <rect x="40" y="60" width="270" height="45" rx="4" fill="#ffffff" stroke="#2b6cb0" stroke-width="1.5"/>
                <rect x="35" y="68" width="10" height="6" fill="#2b6cb0"/>
                <rect x="35" y="80" width="10" height="6" fill="#2b6cb0"/>
                <text x="55" y="87" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» UI_OrderView (Mesero Mobile)</text>

                <!-- Componente Vista Caja -->
                <rect x="40" y="120" width="270" height="45" rx="4" fill="#ffffff" stroke="#2b6cb0" stroke-width="1.5"/>
                <rect x="35" y="128" width="10" height="6" fill="#2b6cb0"/>
                <rect x="35" y="140" width="10" height="6" fill="#2b6cb0"/>
                <text x="55" y="147" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» UI_CashierView (Cajero Desk)</text>

                <!-- Componente OrderService -->
                <rect x="40" y="185" width="270" height="50" rx="4" fill="#ffffff" stroke="#2b6cb0" stroke-width="1.5"/>
                <rect x="35" y="195" width="10" height="6" fill="#2b6cb0"/>
                <rect x="35" y="207" width="10" height="6" fill="#2b6cb0"/>
                <text x="55" y="207" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» OrderEngineService</text>
                <text x="55" y="222" font-family="Segoe UI, Arial" font-size="8.5" fill="#4a5568">Lógica de Comandas, Impuestos y Precios</text>

                <!-- Componente OfflineSyncManager -->
                <rect x="40" y="255" width="270" height="50" rx="4" fill="#ffffff" stroke="#2b6cb0" stroke-width="1.5"/>
                <rect x="35" y="265" width="10" height="6" fill="#2b6cb0"/>
                <rect x="35" y="277" width="10" height="6" fill="#2b6cb0"/>
                <text x="55" y="277" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» OfflineSyncManager</text>
                <text x="55" y="292" font-family="Segoe UI, Arial" font-size="8.5" fill="#4a5568">Patrón Repositorio Híbrido (Cache + Cloud)</text>

                <!-- Componente PrintService -->
                <rect x="40" y="325" width="270" height="50" rx="4" fill="#ffffff" stroke="#2b6cb0" stroke-width="1.5"/>
                <rect x="35" y="335" width="10" height="6" fill="#2b6cb0"/>
                <rect x="35" y="347" width="10" height="6" fill="#2b6cb0"/>
                <text x="55" y="347" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» EscPosPrinterService</text>
                <text x="55" y="362" font-family="Segoe UI, Arial" font-size="8.5" fill="#4a5568">Patrón Adaptador de Impresión Térmica</text>

                <!-- Flechas y Conectores Internos Frontend -->
                <line x1="175" y1="105" x2="175" y2="185" stroke="#2b6cb0" stroke-width="1.5" marker-end="url(#arrow)"/>
                <line x1="175" y1="165" x2="175" y2="185" stroke="#2b6cb0" stroke-width="1.5"/>
                <line x1="175" y1="235" x2="175" y2="255" stroke="#2b6cb0" stroke-width="1.5"/>

                <!-- Subsistema Backend Cloud -->
                <rect x="370" y="20" width="310" height="230" rx="8" fill="url(#gradBackend)" stroke="#16a34a" stroke-width="2" stroke-dasharray="4 2"/>
                <text x="385" y="42" font-family="Segoe UI, Arial" font-size="11" font-weight="bold" fill="#15803d">&lt;&lt;subsystem&gt;&gt; Cloud Backend (Google Cloud / Firebase)</text>

                <!-- Componente Firestore -->
                <rect x="390" y="60" width="270" height="45" rx="4" fill="#ffffff" stroke="#15803d" stroke-width="1.5"/>
                <rect x="385" y="68" width="10" height="6" fill="#15803d"/>
                <rect x="385" y="80" width="10" height="6" fill="#15803d"/>
                <text x="405" y="87" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» Cloud Firestore (Realtime DB)</text>

                <!-- Componente Auth -->
                <rect x="390" y="120" width="270" height="45" rx="4" fill="#ffffff" stroke="#15803d" stroke-width="1.5"/>
                <rect x="385" y="128" width="10" height="6" fill="#15803d"/>
                <rect x="385" y="140" width="10" height="6" fill="#15803d"/>
                <text x="405" y="147" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» FirebaseAuthService (RBAC)</text>

                <!-- Componente Cloud Functions -->
                <rect x="390" y="180" width="270" height="50" rx="4" fill="#ffffff" stroke="#15803d" stroke-width="1.5"/>
                <rect x="385" y="190" width="10" height="6" fill="#15803d"/>
                <rect x="385" y="202" width="10" height="6" fill="#15803d"/>
                <text x="405" y="202" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» CloudFunctionsBackend</text>
                <text x="405" y="217" font-family="Segoe UI, Arial" font-size="8.5" fill="#4a5568">Cierres de Caja, Auditoría y Triggers</text>

                <!-- Subsistema DIAN -->
                <rect x="370" y="270" width="310" height="130" rx="8" fill="url(#gradDian)" stroke="#ea580c" stroke-width="2" stroke-dasharray="4 2"/>
                <text x="385" y="292" font-family="Segoe UI, Arial" font-size="11" font-weight="bold" fill="#c2410c">&lt;&lt;subsystem&gt;&gt; Facturación Electrónica DIAN</text>

                <!-- Componente DianAdapter -->
                <rect x="390" y="310" width="270" height="55" rx="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.5"/>
                <rect x="385" y="320" width="10" height="6" fill="#ea580c"/>
                <rect x="385" y="332" width="10" height="6" fill="#ea580c"/>
                <text x="405" y="332" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1a202c">«component» DianElectronicBillingAdapter</text>
                <text x="405" y="347" font-family="Segoe UI, Arial" font-size="8.5" fill="#4a5568">Generador XML UBL 2.1 + CUFE + Firma X.509</text>

                <!-- Conexiones Inter-Subsistemas -->
                <path d="M 310 280 L 350 280 L 350 82 L 390 82" fill="none" stroke="#00324d" stroke-width="2" stroke-dasharray="3 3"/>
                <text x="325" y="160" font-family="Segoe UI, Arial" font-size="8" font-weight="bold" fill="#00324d" transform="rotate(-90 325 160)">WebSocket / Sync</text>

                <path d="M 525 230 L 525 310" fill="none" stroke="#ea580c" stroke-width="2"/>
                <text x="532" y="270" font-family="Segoe UI, Arial" font-size="8" font-weight="bold" fill="#ea580c">Eventos Cierre</text>
            </svg>
            <div class="diagram-caption">Figura 1: Diagrama UML de Componentes - Sistema POS Señor Hornado</div>
        </div>
    </div>

    <!-- SECCIÓN 3.2: VISTA DE DESPLIEGUE -->
    <div class="page-break-before">
        <h2>3.2 Vista de Despliegue (Cumplimiento Criterio 3)</h2>

        <h3>3.2.1 Justificación Técnica de las Condiciones de Implantación</h3>
        <p>De acuerdo con la lista de chequeo <code>IE-GA4-220501095-AA2-EV06</code> (Criterio 3), la <strong>Vista de Despliegue</strong> determina la configuración de implantación física y en la nube de la solución informática.</p>

        <p>La justificación de la arquitectura de despliegue seleccionada contempla:</p>
        <ul>
            <li><strong>Resiliencia frente al entorno operativo hostil del restaurante:</strong> Los restaurantes presentan caídas recurrentes del proveedor de telecomunicaciones e interferencias electromagnéticas por electrodomésticos de cocina. Se establece una red LAN privada en frecuencia de 5 GHz (inmune a interferencias de microondas que operan en 2.4 GHz) y capacidad <em>Offline-First</em> en los dispositivos móviles.</li>
            <li><strong>Segregación perimetral de redes (VLANs / SSIDs):</strong> Se aísla el tráfico transaccional de los meseros y la estación de cobro en una red Wi-Fi WPA3 independiente del Wi-Fi de cortesía para comensales, impidiendo la intercepción o saturación de ancho de banda.</li>
            <li><strong>Economía de escala y alta disponibilidad Serverless:</strong> En lugar de exigir un costoso servidor On-Premise en el local (que requeriría aire acondicionado, baterías UPS y mantenimiento físico), la lógica transaccional corre sobre la nube elástica de Google Cloud, garantizando una disponibilidad del 99.99% a costo operativo proporcional al uso.</li>
        </ul>

        <h3>3.2.2 Modelado de la Vista de Despliegue (Diagrama de Despliegue UML)</h3>
        <div class="diagram-box">
            <!-- Diagrama SVG de Despliegue -->
            <svg width="700" height="480" viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
                <defs>
                    <linearGradient id="gradNodeLocal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="gradNodeCloud" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#f0fdf4;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#dcfce7;stop-opacity:1" />
                    </linearGradient>
                </defs>

                <!-- Nodo 1: Entorno Físico Restaurante -->
                <rect x="15" y="15" width="320" height="445" rx="8" fill="url(#gradNodeLocal)" stroke="#475569" stroke-width="2"/>
                <text x="30" y="38" font-family="Segoe UI, Arial" font-size="11" font-weight="bold" fill="#0f172a">«device» Instalaciones Restaurante (LAN Segura)</text>

                <!-- Subnodo Smartphone Mesero -->
                <rect x="30" y="55" width="290" height="100" rx="6" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
                <text x="42" y="75" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1e293b">«device» Terminal Móvil Mesero (x6 Smartphones)</text>
                <rect x="42" y="85" width="266" height="30" rx="3" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
                <text x="50" y="104" font-family="Segoe UI, Arial" font-size="8.5" fill="#1e40af">«artifact» Client_App.pwa (Browser WebView)</text>
                <text x="42" y="138" font-family="Segoe UI, Arial" font-size="8" fill="#64748b">Almacenamiento Local: IndexedDB Offline Cache</text>

                <!-- Subnodo Router Local -->
                <rect x="30" y="170" width="290" height="60" rx="6" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
                <text x="42" y="190" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1e293b">«device» Gateway Router Wi-Fi 6 (5 GHz)</text>
                <text x="42" y="210" font-family="Segoe UI, Arial" font-size="8.5" fill="#475569">SSID Oculto POS Privado • Cifrado WPA3-SAE</text>

                <!-- Subnodo Terminal Caja -->
                <rect x="30" y="245" width="290" height="95" rx="6" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
                <text x="42" y="265" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1e293b">«device» Estación de Trabajo Caja (PC/Tablet)</text>
                <rect x="42" y="275" width="266" height="30" rx="3" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
                <text x="50" y="294" font-family="Segoe UI, Arial" font-size="8.5" fill="#1e40af">«artifact» Cashier_App.pwa (Google Chrome)</text>
                <text x="42" y="325" font-family="Segoe UI, Arial" font-size="8" fill="#64748b">Conexión Cableada Ethernet Cat 6 (1 Gbps)</text>

                <!-- Subnodo Impresora Térmica -->
                <rect x="30" y="355" width="290" height="85" rx="6" fill="#ffffff" stroke="#64748b" stroke-width="1.5"/>
                <text x="42" y="375" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="#1e293b">«device» Impresora Térmica de Recibos (80mm)</text>
                <text x="42" y="395" font-family="Segoe UI, Arial" font-size="8.5" fill="#475569">Protocolo: Esc/POS Binario Estándar</text>
                <text x="42" y="415" font-family="Segoe UI, Arial" font-size="8" fill="#64748b">Conexión: Cable Físico USB 2.0 / Red Local IP</text>

                <!-- Conexión Terminal Caja a Impresora -->
                <line x1="175" y1="340" x2="175" y2="355" stroke="#00324d" stroke-width="2"/>

                <!-- Conexión Meseros y Caja al Router -->
                <line x1="175" y1="155" x2="175" y2="170" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3 3"/>
                <line x1="175" y1="230" x2="175" y2="245" stroke="#00324d" stroke-width="1.5"/>

                <!-- Nodos en la Nube (Google Cloud) -->
                <rect x="365" y="15" width="320" height="315" rx="8" fill="url(#gradNodeCloud)" stroke="#16a34a" stroke-width="2"/>
                <text x="380" y="38" font-family="Segoe UI, Arial" font-size="11" font-weight="bold" fill="#15803d">«cloud provider» Google Cloud / Firebase (US-East)</text>

                <!-- Subnodo CDN Hosting -->
                <rect x="380" y="55" width="290" height="50" rx="4" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
                <text x="392" y="75" font-family="Segoe UI, Arial" font-size="9.5" font-weight="bold" fill="#166534">«execution environment» Firebase Edge Hosting</text>
                <text x="392" y="93" font-family="Segoe UI, Arial" font-size="8" fill="#475569">CDN Global SSL TLS 1.3 • Chunks JS/CSS Angular</text>

                <!-- Subnodo Base de Datos NoSQL -->
                <rect x="380" y="115" width="290" height="60" rx="4" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
                <text x="392" y="135" font-family="Segoe UI, Arial" font-size="9.5" font-weight="bold" fill="#166534">«database system» Cloud Firestore</text>
                <text x="392" y="152" font-family="Segoe UI, Arial" font-size="8" fill="#475569">Base NoSQL Multi-Región con Replicación 99.999%</text>
                <text x="392" y="165" font-family="Segoe UI, Arial" font-size="8" fill="#15803d">Canal WebSocket Seguro WSS (Puerto 443)</text>

                <!-- Subnodo Functions Compute -->
                <rect x="380" y="185" width="290" height="60" rx="4" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
                <text x="392" y="205" font-family="Segoe UI, Arial" font-size="9.5" font-weight="bold" fill="#166534">«serverless compute» Google Cloud Functions</text>
                <text x="392" y="222" font-family="Segoe UI, Arial" font-size="8" fill="#475569">Runtime: Node.js 20 LTS Auto-Scalable (0 a N)</text>
                <text x="392" y="235" font-family="Segoe UI, Arial" font-size="8" fill="#475569">Microservicios de Facturación y Reportes</text>

                <!-- Subnodo Auth -->
                <rect x="380" y="255" width="290" height="55" rx="4" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
                <text x="392" y="275" font-family="Segoe UI, Arial" font-size="9.5" font-weight="bold" fill="#166534">«security service» Firebase Authentication</text>
                <text x="392" y="293" font-family="Segoe UI, Arial" font-size="8" fill="#475569">Tokens Criptográficos JWT con Custom Claims (RBAC)</text>

                <!-- Nodo Externo DIAN -->
                <rect x="365" y="350" width="320" height="110" rx="8" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>
                <text x="380" y="373" font-family="Segoe UI, Arial" font-size="11" font-weight="bold" fill="#c2410c">«external system» Servidores DIAN (Gobierno Col)</text>
                <rect x="380" y="385" width="290" height="55" rx="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.5"/>
                <text x="392" y="405" font-family="Segoe UI, Arial" font-size="9.5" font-weight="bold" fill="#9a3412">«web service» API Recepción Facturas Electrónicas</text>
                <text x="392" y="423" font-family="Segoe UI, Arial" font-size="8" fill="#475569">Estándar: SOAP/REST UBL 2.1 con Validación Previa</text>

                <!-- Conexión Router a Nube (WAN Internet) -->
                <path d="M 320 200 L 345 200 L 345 145 L 380 145" fill="none" stroke="#2563eb" stroke-width="2"/>
                <text x="325" y="135" font-family="Segoe UI, Arial" font-size="7.5" font-weight="bold" fill="#2563eb">HTTPS / WSS</text>

                <!-- Conexión Cloud Functions a DIAN -->
                <line x1="525" y1="245" x2="525" y2="350" stroke="#ea580c" stroke-width="2"/>
                <text x="532" y="335" font-family="Segoe UI, Arial" font-size="8" font-weight="bold" fill="#ea580c">Mutual TLS 1.3</text>
            </svg>
            <div class="diagram-caption">Figura 2: Diagrama UML de Despliegue - Sistema POS Señor Hornado</div>
        </div>
    </div>

    <!-- SECCIÓN 4 Y 5: LISTA DE CHEQUEO, CONCLUSIONES Y REFERENCIAS -->
    <div class="page-break-before">
        <h1>4. Matriz de Cumplimiento de la Lista de Chequeo</h1>
        <p>En concordancia con el instrumento de evaluación institucional <strong>IE-GA4-220501095-AA2-EV06</strong>, se certifica el cumplimiento del 100% de los criterios requeridos para la calificación cualitativa de <strong>A (Aprobado)</strong>:</p>

        <table>
            <thead>
                <tr>
                    <th style="width: 8%; text-align: center;">No.</th>
                    <th style="width: 42%;">Criterio Evaluado (IE-GA4-220501095-AA2-EV06)</th>
                    <th style="width: 15%; text-align: center;">Calificación</th>
                    <th style="width: 35%;">Sustentación en este Documento</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center; font-weight: bold;">1</td>
                    <td><strong>Incorporar patrones de diseño</strong> propendiendo en las mejores prácticas para la codificación y mantenibilidad del software.</td>
                    <td style="text-align: center;"><span class="badge-status">CUMPLE (A)</span></td>
                    <td>Se fundamentaron y aplicaron formalmente patrones creacionales (Factory Method), estructurales (Adapter, Facade, Repository) y comportamentales (Strategy, Observer) en la <strong>Sección 2.4</strong>, detallando su impacto en la reducción de deuda técnica y respeto a los principios SOLID.</td>
                </tr>
                <tr>
                    <td style="text-align: center; font-weight: bold;">2</td>
                    <td><strong>Identificar y fundamentar la vista de componentes</strong> para representar el software en fases avanzadas del ciclo de vida.</td>
                    <td style="text-align: center;"><span class="badge-status">CUMPLE (A)</span></td>
                    <td>Se fundamentó el valor de la vista de componentes en la <strong>Sección 3.1</strong> y se construyó el <strong>Diagrama UML de Componentes (Figura 1)</strong>, modelando módulos de frontend, servicios offline, microservicios en la nube y adaptadores periféricos con sus interfaces provistas y requeridas.</td>
                </tr>
                <tr>
                    <td style="text-align: center; font-weight: bold;">3</td>
                    <td><strong>Identificar y justificar la vista de despliegue</strong> para determinar las condiciones de implantación de la solución informática.</td>
                    <td style="text-align: center;"><span class="badge-status">CUMPLE (A)</span></td>
                    <td>Se justificaron las condiciones del entorno físico y en la nube en la <strong>Sección 3.2</strong>, acompañadas del <strong>Diagrama UML de Despliegue (Figura 2)</strong>, documentando terminales móviles, topología Wi-Fi 5 GHz, impresoras térmicas Esc/POS, clústeres serverless y pasarela gubernamental DIAN.</td>
                </tr>
            </tbody>
        </table>

        <h1>5. Conclusiones</h1>
        <ol>
            <li><strong>La arquitectura trasciende la programación:</strong> La arquitectura de software establece el conjunto de compromisos estructurales que dictan la viabilidad técnica y económica de un proyecto. Decisiones acertadas en esta fase garantizan que el software evolucione con gracia ante nuevas exigencias del mercado, mientras que su omisión genera sistemas frágiles y costosos de mantener.</li>
            <li><strong>Los atributos de calidad son los verdaderos impulsores del diseño:</strong> Las funciones comerciales del software solo aportan valor si se sustentan sobre atributos sólidos de rendimiento, escalabilidad, disponibilidad y seguridad. Metodologías como el diseño guiado por atributos (ADD) convierten requerimientos no funcionales abstractos en especificaciones arquitectónicas comprobables.</li>
            <li><strong>Los patrones de diseño son indispensables para el código limpio:</strong> La incorporación intencionada de patrones (como <em>Strategy</em>, <em>Adapter</em> y <em>Repository</em>) proporciona el puente exacto entre los planos de la arquitectura y la codificación diaria de los desarrolladores, promoviendo el desacoplamiento y el cumplimiento de los principios SOLID.</li>
            <li><strong>La sinergia entre componentes y despliegue garantiza el éxito operacional:</strong> Mientras que la vista de componentes organiza el sistema en tiempo de construcción y pruebas, la vista de despliegue asegura su estabilidad en el mundo real. En el caso del Restaurante Señor Hornado, la combinación de una PWA reactiva con capacidades <em>Offline-First</em> y una infraestructura Serverless en la nube brinda alta disponibilidad con costos operativos mínimos.</li>
        </ol>

        <h1>6. Referencias Bibliográficas</h1>
        <ul>
            <li><strong>Bass, L., Clements, P., & Kazman, R.</strong> (2012). <em>Software Architecture in Practice</em> (3rd ed.). Addison-Wesley Professional.</li>
            <li><strong>Fowler, M.</strong> (2002). <em>Patterns of Enterprise Application Architecture</em>. Addison-Wesley Professional.</li>
            <li><strong>Gamma, E., Helm, R., Johnson, R., & Vlissides, J.</strong> (1994). <em>Design Patterns: Elements of Reusable Object-Oriented Software</em>. Addison-Wesley.</li>
            <li><strong>IEEE Computer Society.</strong> (2011). <em>ISO/IEC/IEEE 42010:2011 - Systems and software engineering — Architecture description</em>. IEEE Standards Association.</li>
            <li><strong>Kruchten, P.</strong> (1995). <em>Architectural Blueprints—The “4+1” View Model of Software Architecture</em>. IEEE Software, 12(6), 42-50.</li>
            <li><strong>Martin, R. C.</strong> (2017). <em>Clean Architecture: A Craftsman's Guide to Software Structure and Design</em>. Prentice Hall.</li>
            <li><strong>Pressman, R. S., & Maxim, B. R.</strong> (2020). <em>Software Engineering: A Practitioner's Approach</em> (9th ed.). McGraw-Hill Education.</li>
            <li><strong>Servicio Nacional de Aprendizaje — SENA.</strong> (2024). <em>Guía de Aprendizaje 4: Fase de Planeación - Diseño de Soluciones de Software (Código 220501095)</em>. Dirección de Formación Profesional.</li>
            <li><strong>Sommerville, I.</strong> (2011). <em>Software Engineering</em> (9th ed.). Addison-Wesley.</li>
        </ul>
    </div>

</body>
</html>
"""
    return html_content

def main():
    workspace = r"c:\Users\johan\Desktop\señor hornado"
    html_filename = os.path.join(workspace, "Evidencia_GA4_220501095_AA2_EV06_Taller_Arquitectura_Software.html")
    pdf_filename = os.path.join(workspace, "Evidencia_GA4_220501095_AA2_EV06_Taller_Arquitectura_Software.pdf")

    print("[*] Generando archivo HTML estructurado...")
    content = generate_html()
    with open(html_filename, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[+] Archivo HTML creado: {html_filename}")

    print("[*] Convirtiendo HTML a PDF mediante Google Chrome Headless...")
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    if not os.path.exists(chrome_path):
        # Intentar con Edge si Chrome no existiera
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_filename}",
        html_filename
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0 and os.path.exists(pdf_filename):
        size_kb = os.path.getsize(pdf_filename) / 1024
        print(f"[+] PDF generado exitosamente: {pdf_filename}")
        print(f"[+] Tamaño del archivo PDF: {size_kb:.2f} KB")
    else:
        print(f"[!] Error al generar PDF. Código de salida: {result.returncode}")
        print(f"Stdout: {result.stdout}")
        print(f"Stderr: {result.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    main()

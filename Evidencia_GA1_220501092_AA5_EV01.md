# Evidencia GA1-220501092-AA5-EV01
## Determinación de las especificaciones funcionales del software y metodología a utilizar

**Proyecto:** Sistema de Punto de Venta (POS) "Señor Hornado"
**Autor:** Johan

---

## 1. Selección de la Herramienta Tecnológica

Tras evaluar diferentes opciones de software para la gestión de proyectos y requerimientos (como Jira, Trello y Monday.com), se ha seleccionado **Monday.com** para registrar, gestionar y realizar seguimiento a los requerimientos funcionales y no funcionales del proyecto "Señor Hornado".

**Justificación de la Selección:**
1. **Versatilidad de Vistas:** Monday.com permite visualizar los requerimientos no solo como una lista estándar, sino también en formato Kanban y líneas de tiempo, lo que facilita entender en qué estado se encuentra cada solicitud del cliente dependiendo del perfil de quien revise.
2. **Personalización de Columnas:** Es una plataforma altamente parametrizable. Permite agregar columnas personalizadas esenciales aplicadas al proyecto como "Estados" (Listo, En Proceso, Estancado), "Prioridad" (Crítica, Alta, Media), "Responsable" y "Fechas límite".
3. **Colaboración y Comunicación:** Cada ítem (requerimiento) actúa como un hilo de comunicación centralizado, donde el equipo y los clientes pueden acceder al contexto histórico de la solicitud técnica.
4. **Escalabilidad y Segmentación:** Al separar roles del sistema (Administración, Meseros, Caja), Monday permite manejar distintos grupos interconectados de forma muy ordenada en un mismo tablero principal.

---

## 2. Configuración de Requerimientos

La configuración de esta metodología dentro del entorno de trabajo `johandavidromoros-team.monday.com` se estructuró a través de Grupos e Ítems:

### 2.1. Estructura del Tablero (Workspace)
- **Grupos (Epics o Módulos):** El tablero principal se organizó en distintos grupos funcionales base, como *Panel de Administración*, *App Meseros* y *Caja/Pagos*.
- **Ítems (Requerimientos):** Cada fila representa una Historia de Usuario o funcionalidad crítica exigida.
- **Columnas Configuradas:**
  - *Estado:* "Sin Empezar", "Trabajando en ello", "Validación con Cliente", "Listo".
  - *Prioridad:* "Baja", "Media", "Alta", "Crítica".
  - *Tipo:* "Requerimiento Funcional", "Requisito No Funcional".

### 2.2. Requerimientos Configurados (Los Ítems)
A continuación, se define cómo quedaron listados de forma exacta en la plataforma los distintos requisitos del programa:

**Grupo: Panel de Administración**
- *REQ-01:* Creación, eliminación y edición de mesas registradas en el sistema para control del flujo del restaurante. (Prioridad: Alta)
- *REQ-02:* Restringir funcionalidades de zoom táctil de la pantalla con doble toque en dispositivos móviles para prevenir errores. (Prioridad: Crítica / Req. No Funcional)
- *REQ-03:* Inventario base y gestión de categorías de los diferentes platos. (Prioridad: Media)

**Grupo: App Meseros (Front de toma de pedidos)**
- *REQ-04:* Interfaz para registrar pedidos desde dispositivos móviles y asociarlos explícitamente a un número de mesa activo. (Prioridad: Alta)
- *REQ-05:* Enviar el pedido directamente al panel e iniciar el cambio de estado del objeto JSON hacia "en_caja" para cobro. (Prioridad: Alta)

**Grupo: Sistema de Cajeros (Dashboard Central)**
- *REQ-06:* Visualización asíncrona y en tiempo real de los pedidos generados por los meseros (Firebase listener). (Prioridad: Crítica)
- *REQ-07:* Proceso de gestión de cuenta, cobro al cliente final y cierre/reinicio del estado de la mesa ocupada. (Prioridad: Media)

---

## 3. Evidencias Visuales de la Configuración en la Herramienta

*(Nota: Pega a continuación 2 ó 3 capturas directas de tu cuenta de Monday.com mostrando lo que acabamos de describir en el punto 2)*

[ PANTALLAZO 1 AQUÍ: Vista principal de tu Tablero en Monday.com. Se deben visualizar los grupos "Panel de Administración", "App Meseros", etc., con sus respectivos ítems y columnas de Estado/Prioridad ]

[ PANTALLAZO 2 AQUÍ: Detalle al abrir cualquiera de los ítems mostrando los colores rojo/amarillo/verde en las celdas de prioridad ]

---

## 4. Evaluación del Informe de Requisitos con el Cliente y Ajustes

### 4.1. Proceso de Evaluación
Con los requisitos debidamente digitalizados en Monday, se convocó a una sesión de revisión y demostración presencial con el cliente (los administradores y cajeros del restaurante). Para facilitar la explicación sin ahondar en tecnicismos, se utilizó la vista por colores de Estado y Prioridad que provee la herramienta.

**Validación de Necesidades Base:**
1. Aprobación y verificación del ciclo completo planificado para el restaurante: el plato entra por sistema a través del mesero, queda validado bajo el número de mesa, y fluye hasta la interfaz final del cajero sin intermediarios.
2. Comprobación expresa de que la resolución de conflictos (como lo del zoom en el móvil del mesero) están parametrizadas como requerimientos críticos.

### 4.2. Hallazgos y Ajustes Realizados en la Documentación
Al observar el mapa configurado de requerimientos, surgieron dos discusiones que derivaron en refactorización y ajustes de los ítems en el tablero:

1. **Hallazgo (Latencia Crítica en la Recepción):** Se debatió el modelo de recarga de la caja. El cajero en horas pico no puede actualizar manualmente su navegador.
   - **Ajuste:** Se transformó este diálogo de la reunión actualizando la documentación inmediatamente. El *REQ-06* pasó a exigir el uso de datos observables en realtime con Firebase, elevando su nivel dentro de la columna Prioridad a "Crítica".
2. **Hallazgo (Acceso de Permisos):** Se hizo la alerta respecto a que una mesa no podía desaparecer o editarse por accidente si tenía cuentas abiertas.
   - **Ajuste:** Modificación del *REQ-01*, añadiendo una condicionante funcional y una restricción de seguridad temporal (como uso de PIN) dentro del bloque administrador para prevenir purga de información.

El uso de **Monday.com** ha permitido que los cambios de ruta dictados por las evaluaciones con el cliente se puedan iterar el mismo día sin perder el control sobre el alcance final de nuestro sistema informático.

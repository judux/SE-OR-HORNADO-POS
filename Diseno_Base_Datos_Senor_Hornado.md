# Diseño de Datos e Interfaces - Señor Hornado

A continuación se detalla la propuesta técnica para la estructura de la base de datos (Firestore) y las entidades del aplicativo web (TypeScript), alineadas a los Casos de Uso y los requerimientos funcionales del proyecto.

---

## 1. Lógica de Estado del Pedido y Mesa

Para manejar correctamente la interacción entre los diferentes roles (Mesero, Cajero, Admin) y asegurar la integridad visual en tiempo real de las cuentas, se manejarán los siguientes estados:

### Estado de la Mesa (`TableState`)
- **`LIBRE`**: Mesa disponible para asignarle clientes.
- **`OCUPADA`**: Mesa con clientes consumiendo (tiene una cuenta/orden `ABIERTA` vinculada).
- **`PAGANDO`**: Mesa cuyos clientes ya terminaron y el pedido ha sido enviado a la caja para su cobro. Bloquea que el mesero agregue más productos.

### Estado del Pedido (`OrderState`)
- **`ABIERTA`**: La orden se está armando activamente. El mesero puede agregar platos. *(Opcional si la orden se envía toda de un golpe, pero útil para facturación si van pidiendo de a pocos).*
- **`EN_CAJA`**: El mesero envió la orden a caja. Aparece en el dashboard del cajero.
- **`PAGADA`**: El cajero procesó el pago y cerró la orden. Ingresa a los reportes de ventas.
- **`ANULADA`**: Un administrador o cajero autorizado anula el pedido por un error (p.ej. los clientes se retiraron antes de consumir).

---

## 2. Diseño de Colecciones (Firestore) y JSON de Ejemplo

El sistema usará una base de datos NoSQL (Firebase Firestore). Los documentos tendrán la siguiente estructura JSON en cada una de sus colecciones principales:

### Colección: `users`
Guarda el personal autorizado.
```json
{
  "id": "USR-1001",
  "nombre": "Carlos Mendoza",
  "rol": "MESERO",
  "pin_acceso": "1234",
  "activo": true,
  "fecha_creacion": "2026-05-01T14:30:00Z"
}
```

### Colección: `tables`
Controla la disponibilidad física.
```json
{
  "id": "TBL-01",
  "numero_mesa": "Mesa 01",
  "estado": "OCUPADA",
  "id_orden_actual": "ORD-5050" 
}
```

### Colección: `products`
El menú o inventario base.
```json
{
  "id": "PRD-201",
  "nombre": "Plato de Hornado Grande",
  "precio": 15000,
  "categoria": "Hornado",
  "disponible": true,
  "notas_permitidas": true
}
```

### Colección: `orders`
Registra todo el ciclo de facturación y consumo.
```json
{
  "id": "ORD-5050",
  "id_mesa": "TBL-01",
  "nombre_mesa": "Mesa 01",
  "id_mesero": "USR-1001",
  "nombre_mesero": "Carlos Mendoza",
  "estado": "EN_CAJA",
  "items": [
    {
      "id_producto": "PRD-201",
      "nombre": "Plato de Hornado Grande",
      "precio_unitario": 15000,
      "cantidad": 2,
      "subtotal": 30000,
      "notas": "Una porción sin cuero, la otra normal"
    },
    {
      "id_producto": "PRD-305",
      "nombre": "Jugo de Mora",
      "precio_unitario": 4000,
      "cantidad": 2,
      "subtotal": 8000,
      "notas": ""
    }
  ],
  "subtotal": 38000,
  "propina": 0,
  "total": 38000,
  "metodo_pago": null,
  "fecha_creacion": "2026-05-01T15:00:00Z",
  "fecha_cierre": null
}
```

*(Nota: Una vez la orden pasa a `PAGADA`, el `metodo_pago` puede actualizarse a un objeto como `[{"tipo": "EFECTIVO", "monto": 38000}]` para soportar pagos mixtos).*

---

## 3. Definición de Tipos e Interfaces (TypeScript)

A continuación, se presentan las interfaces TypeScript (`.ts`) que modelarán estas estructuras dentro de la aplicación Angular, asegurando un tipado estricto:

```typescript
// --- ENUMS ---

export enum UserRole {
  ADMIN = 'ADMIN',
  MESERO = 'MESERO',
  CAJERO = 'CAJERO'
}

export enum TableState {
  LIBRE = 'LIBRE',
  OCUPADA = 'OCUPADA',
  PAGANDO = 'PAGANDO'
}

export enum OrderState {
  ABIERTA = 'ABIERTA',
  EN_CAJA = 'EN_CAJA',
  PAGADA = 'PAGADA',
  ANULADA = 'ANULADA'
}

export enum PaymentMethod {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA'
}

// --- INTERFACES ---

export interface User {
  id: string;
  nombre: string;
  rol: UserRole;
  pin_acceso: string;
  activo: boolean;
  fecha_creacion: Date | any; // Firebase Timestamp
}

export interface Table {
  id: string;
  numero_mesa: string;
  estado: TableState;
  id_orden_actual?: string | null; // ID de la orden vinculada si está ocupada/pagando
}

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  notas_permitidas: boolean;
}

export interface OrderItem {
  id_producto: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  notas?: string;
}

export interface PaymentDetail {
  tipo: PaymentMethod;
  monto: number;
}

export interface Order {
  id: string;
  id_mesa: string;
  nombre_mesa: string; // Desnormalizado para lecturas más rápidas en el dashboard del cajero
  id_mesero: string;
  nombre_mesero: string;
  estado: OrderState;
  items: OrderItem[];
  subtotal: number;
  propina: number;
  total: number;
  detalles_pago?: PaymentDetail[]; // Permite manejar pagos parciales/mixtos (ej: mitad efectivo, mitad tarjeta)
  fecha_creacion: Date | any; // Firebase Timestamp
  fecha_cierre?: Date | any;
}
```

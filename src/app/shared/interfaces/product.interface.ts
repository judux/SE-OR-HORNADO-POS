export interface Product {
    id: string;
    nombre: string;
    precio: number;
    categoria: 'almuerzos' | 'bandejas' | 'platos' | 'sopas' | 'bebidas' | 'porciones';
    disponible: boolean;
    notas_permitidas: boolean;
    descripcion?: string;
    imagen_url?: string;
}

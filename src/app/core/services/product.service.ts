import { Injectable, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import {
    Firestore, collection, collectionData, doc,
    addDoc, updateDoc, deleteDoc
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Product } from '../../shared/interfaces';
import { TenantService } from './tenant.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService implements OnDestroy {
    private firestore = inject(Firestore);
    private tenant = inject(TenantService);
    private products = signal<Product[]>([]);
    private subscription?: Subscription;

    readonly allProducts = this.products.asReadonly();
    readonly availableProducts = computed(() => this.products().filter(p => p.disponible));

    constructor() {
        // Re-suscribe a los productos del restaurante activo cada vez que cambia el tenant.
        effect(() => {
            const id = this.tenant.restauranteId();
            this.subscription?.unsubscribe();

            if (!id) {
                this.products.set([]);
                return;
            }

            const productsRef = collection(this.firestore, `restaurants/${id}/products`);
            this.subscription = collectionData(productsRef, { idField: 'id' }).subscribe(
                (data) => this.products.set(data as Product[])
            );
        }, { allowSignalWrites: true });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    getProductsByCategory(category: string): Product[] {
        return this.products().filter(p => p.categoria === category);
    }

    getProductById(id: string): Product | undefined {
        return this.products().find(p => p.id === id);
    }

    async addProduct(product: Omit<Product, 'id'>): Promise<void> {
        try {
            const productsRef = collection(this.firestore, this.tenant.path('products'));
            await addDoc(productsRef, product);
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    }

    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        try {
            const productDoc = doc(this.firestore, this.tenant.path('products'), id);
            await updateDoc(productDoc, { ...updates });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
        }
    }

    async deleteProduct(id: string): Promise<void> {
        try {
            const productDoc = doc(this.firestore, this.tenant.path('products'), id);
            await deleteDoc(productDoc);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    }

    async toggleDisponible(id: string): Promise<void> {
        const product = this.products().find(p => p.id === id);
        if (product) {
            const productDoc = doc(this.firestore, this.tenant.path('products'), id);
            await updateDoc(productDoc, { disponible: !product.disponible });
        }
    }

    getCategories(): string[] {
        return ['almuerzos', 'bandejas', 'platos', 'sopas', 'bebidas', 'porciones'];
    }

    getCategoryLabel(cat: string): string {
        const labels: Record<string, string> = {
            'almuerzos': 'Almuerzos',
            'bandejas': 'Bandejas',
            'platos': 'De la Casa',
            'sopas': 'Sopas y Caldos',
            'bebidas': 'Bebidas',
            'porciones': 'Porciones Extra',
        };
        return labels[cat] || cat;
    }
}

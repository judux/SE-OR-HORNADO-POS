import { Injectable, signal, computed, inject } from '@angular/core';
import {
    Firestore, collection, query, where, getDocs, doc, getDoc
} from '@angular/fire/firestore';
import { Restaurant } from '../../shared/interfaces';

const TENANT_STORAGE_KEY = 'pos_tenant';

/**
 * Fuente única de verdad sobre qué restaurante (tenant) está activo en la sesión.
 *
 * Todos los demás servicios construyen sus rutas de Firestore a partir de aquí:
 *   collection(firestore, tenant.path('products'))
 *   -> "restaurants/{restaurante_id}/products"
 *
 * El super admin opera FUERA de cualquier tenant, por eso restauranteId puede ser null.
 */
@Injectable({
    providedIn: 'root'
})
export class TenantService {
    private firestore = inject(Firestore);
    private current = signal<Restaurant | null>(null);

    readonly restaurant = this.current.asReadonly();
    readonly restauranteId = computed(() => this.current()?.id ?? null);
    readonly isActive = computed(() => this.current() !== null);

    constructor() {
        this.restoreTenant();
    }

    /**
     * Construye la ruta de una subcolección bajo el restaurante activo.
     * Lanza error si no hay tenant activo: es una salvaguarda contra
     * queries accidentalmente globales que filtrarían datos entre restaurantes.
     */
    path(subcollection: string): string {
        const id = this.restauranteId();
        if (!id) {
            throw new Error(
                `TenantService: intento de acceder a "${subcollection}" sin restaurante activo. ` +
                `Asegúrate de que el tenant esté cargado antes de consultar Firestore.`
            );
        }
        return `restaurants/${id}/${subcollection}`;
    }

    /** Ruta del documento del restaurante activo: "restaurants/{id}" */
    rootPath(): string {
        const id = this.restauranteId();
        if (!id) {
            throw new Error('TenantService: no hay restaurante activo.');
        }
        return `restaurants/${id}`;
    }

    /**
     * Busca un restaurante por su slug (usado en la URL /r/:slug/login).
     * Solo retorna restaurantes activos.
     */
    async findBySlug(slug: string): Promise<Restaurant | null> {
        try {
            const ref = collection(this.firestore, 'restaurants');
            const q = query(ref, where('slug', '==', slug), where('activo', '==', true));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                return null;
            }
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() } as Restaurant;
        } catch (error) {
            console.error('Error al buscar restaurante por slug:', error);
            return null;
        }
    }

    /** Carga un restaurante por su id y lo fija como tenant activo. */
    async loadById(id: string): Promise<Restaurant | null> {
        try {
            const ref = doc(this.firestore, 'restaurants', id);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
                return null;
            }
            const restaurant = { id: snap.id, ...snap.data() } as Restaurant;
            this.setTenant(restaurant);
            return restaurant;
        } catch (error) {
            console.error('Error al cargar restaurante:', error);
            return null;
        }
    }

    /** Fija el restaurante activo y lo persiste en localStorage. */
    setTenant(restaurant: Restaurant): void {
        this.current.set(restaurant);
        localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(restaurant));
    }

    /** Limpia el tenant activo (logout / cambio de restaurante). */
    clearTenant(): void {
        this.current.set(null);
        localStorage.removeItem(TENANT_STORAGE_KEY);
    }

    private restoreTenant(): void {
        const stored = localStorage.getItem(TENANT_STORAGE_KEY);
        if (stored) {
            try {
                this.current.set(JSON.parse(stored) as Restaurant);
            } catch {
                localStorage.removeItem(TENANT_STORAGE_KEY);
            }
        }
    }
}

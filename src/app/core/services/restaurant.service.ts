import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import {
    Firestore, collection, collectionData, doc, setDoc,
    addDoc, updateDoc, query, where, getDocs, serverTimestamp
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Restaurant, User } from '../../shared/interfaces';

/**
 * Gestión de restaurantes (tenants) del sistema. Operado por el super admin.
 *
 * Al crear un restaurante también se crea su primer usuario admin dentro de
 * la subcolección users del restaurante, para que el dueño pueda entrar de inmediato.
 */
@Injectable({
    providedIn: 'root'
})
export class RestaurantService implements OnDestroy {
    private firestore = inject(Firestore);
    private restaurants = signal<Restaurant[]>([]);
    private subscription: Subscription;

    readonly allRestaurants = this.restaurants.asReadonly();

    constructor() {
        const ref = collection(this.firestore, 'restaurants');
        this.subscription = collectionData(ref, { idField: 'id' }).subscribe(
            (data) => this.restaurants.set(data as Restaurant[])
        );
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    /** Verifica que el slug no esté tomado (debe ser único en todo el sistema). */
    async isSlugAvailable(slug: string): Promise<boolean> {
        const ref = collection(this.firestore, 'restaurants');
        const q = query(ref, where('slug', '==', slug));
        const snapshot = await getDocs(q);
        return snapshot.empty;
    }

    /**
     * Crea un restaurante nuevo junto con su primer usuario admin.
     * Retorna el id del restaurante creado, o null si falla.
     */
    async createRestaurant(
        data: { nombre: string; slug: string; plan: 'basico' | 'pro'; direccion?: string; telefono?: string },
        primerAdmin: { nombre: string; pin_acceso: string }
    ): Promise<string | null> {
        try {
            const slug = this.normalizeSlug(data.slug);

            if (!(await this.isSlugAvailable(slug))) {
                throw new Error(`El identificador "${slug}" ya está en uso.`);
            }

            // Crear el documento del restaurante
            const restaurantRef = await addDoc(collection(this.firestore, 'restaurants'), {
                nombre: data.nombre,
                slug,
                plan: data.plan,
                activo: true,
                direccion: data.direccion ?? '',
                telefono: data.telefono ?? '',
                fecha_creacion: serverTimestamp(),
            });

            // Crear el primer admin dentro de la subcolección del restaurante
            const adminUser: Omit<User, 'id'> = {
                nombre: primerAdmin.nombre,
                rol: 'admin',
                pin_acceso: primerAdmin.pin_acceso,
                activo: true,
            };
            await addDoc(collection(this.firestore, `restaurants/${restaurantRef.id}/users`), adminUser);

            return restaurantRef.id;
        } catch (error) {
            console.error('Error al crear restaurante:', error);
            return null;
        }
    }

    /** Activa o suspende un restaurante (un restaurante suspendido no puede iniciar sesión). */
    async toggleActivo(id: string, activo: boolean): Promise<void> {
        try {
            const ref = doc(this.firestore, 'restaurants', id);
            await updateDoc(ref, { activo });
        } catch (error) {
            console.error('Error al cambiar estado del restaurante:', error);
        }
    }

    async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<void> {
        try {
            const ref = doc(this.firestore, 'restaurants', id);
            await updateDoc(ref, { ...updates });
        } catch (error) {
            console.error('Error al actualizar restaurante:', error);
        }
    }

    /** Convierte "Mi Restaurante!" -> "mi-restaurante" para usarlo en la URL. */
    normalizeSlug(raw: string): string {
        return raw
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
}

import { Injectable, inject, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Auth, authState, signInWithEmailAndPassword, signOut, User as FirebaseUser } from '@angular/fire/auth';
import {
    Firestore, doc, getDoc, docData, collection,
    CollectionReference, DocumentReference
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription, distinctUntilChanged, filter, firstValueFrom, of, switchMap, catchError } from 'rxjs';
import { Restaurant } from '../../shared/interfaces';

/**
 * Tipo de cuenta con sesión iniciada en este navegador:
 * - device: cuenta de un restaurante (sus equipos: celulares, tablet, PC de caja).
 * - platform: dueño de la plataforma (administra restaurantes).
 * - unlinked: cuenta válida en Firebase pero que no pertenece a ningún restaurante.
 * - none: sin sesión.
 */
export type AccountKind = 'loading' | 'none' | 'device' | 'platform' | 'unlinked';

export interface AccountState {
    kind: AccountKind;
    uid?: string;
    email?: string | null;
}

/**
 * Sabe a qué restaurante pertenece este equipo y construye las rutas de datos
 * (restaurants/{rid}/...). Todos los servicios leen y escriben a través de aquí,
 * así un restaurante nunca toca los datos de otro (y las reglas de Firestore lo verifican).
 */
@Injectable({
    providedIn: 'root'
})
export class TenantService {
    private auth = inject(Auth);
    private firestore = inject(Firestore);

    private state$ = new BehaviorSubject<AccountState>({ kind: 'loading' });
    readonly account = signal<AccountState>({ kind: 'loading' });
    readonly restaurant = signal<Restaurant | null>(null);

    /** Restaurante del equipo, solo si está ACTIVO (si se suspende, los datos dejan de cargarse). */
    readonly activeRid = computed(() => {
        const r = this.restaurant();
        return this.account().kind === 'device' && r?.estado === 'activo' ? r.id : null;
    });
    readonly activeRid$: Observable<string | null> = toObservable(this.activeRid).pipe(distinctUntilChanged());

    private restaurantSub?: Subscription;
    private resolution = 0; // solo se aplica la identificación más reciente

    constructor() {
        authState(this.auth).subscribe(user => this.runResolution(user));
    }

    private async runResolution(user: FirebaseUser | null): Promise<AccountState> {
        const token = ++this.resolution;
        this.account.set({ kind: 'loading' });
        this.state$.next({ kind: 'loading' });
        const state = await this.resolveAccount(user);
        if (token === this.resolution) {
            this.account.set(state);
            this.state$.next(state);
        }
        return this.whenResolved();
    }

    /** Vuelve a identificar la cuenta actual (p. ej. justo después de crear sus documentos). */
    refresh(): Promise<AccountState> {
        return this.runResolution(this.auth.currentUser);
    }

    /** Espera a que se sepa qué cuenta hay (para los guards). */
    whenResolved(): Promise<AccountState> {
        return firstValueFrom(this.state$.pipe(filter(s => s.kind !== 'loading')));
    }

    private async resolveAccount(user: FirebaseUser | null): Promise<AccountState> {
        this.restaurantSub?.unsubscribe();
        this.restaurant.set(null);
        if (!user) return { kind: 'none' };

        const base = { uid: user.uid, email: user.email };
        try {
            const platformSnap = await getDoc(doc(this.firestore, 'platform_admins', user.uid));
            if (platformSnap.exists()) return { kind: 'platform', ...base };

            const deviceSnap = await getDoc(doc(this.firestore, 'devices', user.uid));
            if (!deviceSnap.exists()) return { kind: 'unlinked', ...base };

            const rid = deviceSnap.data()['rid'] as string;
            await this.watchRestaurant(rid);
            return { kind: 'device', ...base };
        } catch (error) {
            console.error('No se pudo identificar la cuenta:', error);
            return { kind: 'unlinked', ...base };
        }
    }

    /** Escucha el documento del restaurante en vivo (si lo suspenden, el equipo se bloquea al instante). */
    private watchRestaurant(rid: string): Promise<void> {
        return new Promise(resolve => {
            let first = true;
            this.restaurantSub = docData(doc(this.firestore, 'restaurants', rid)).pipe(
                catchError(() => of(undefined))
            ).subscribe(data => {
                this.restaurant.set(data ? ({ id: rid, ...(data as any) } as Restaurant) : null);
                if (first) { first = false; resolve(); }
            });
        });
    }

    async signIn(email: string, password: string): Promise<AccountState> {
        const cred = await signInWithEmailAndPassword(this.auth, email.trim(), password);
        return this.runResolution(cred.user);
    }

    async signOut(): Promise<void> {
        await signOut(this.auth);
    }

    // --- Rutas de datos del restaurante actual ---

    private requireRid(): string {
        const rid = this.activeRid();
        if (!rid) throw new Error('Este equipo no tiene un restaurante activo');
        return rid;
    }

    col(name: string): CollectionReference {
        return collection(this.firestore, 'restaurants', this.requireRid(), name);
    }

    docRef(name: string, id: string): DocumentReference {
        return doc(this.firestore, 'restaurants', this.requireRid(), name, id);
    }

    newDocRef(name: string): DocumentReference {
        return doc(this.col(name));
    }

    /**
     * Para listeners: emite los datos de una subcolección del restaurante activo y se vuelve a
     * suscribir si cambia el restaurante. Si las reglas rechazan la lectura, emite el valor por defecto.
     */
    watch<T>(factory: (rid: string) => Observable<T>, fallback: T): Observable<T> {
        return this.activeRid$.pipe(
            switchMap(rid => rid ? factory(rid).pipe(catchError(err => {
                console.error('Error de lectura:', err);
                return of(fallback);
            })) : of(fallback))
        );
    }
}

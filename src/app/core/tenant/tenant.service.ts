import { Injectable, inject, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
    Auth, authState, signInWithEmailAndPassword, signOut, signInWithPopup, signInAnonymously,
    GoogleAuthProvider, User as FirebaseUser
} from '@angular/fire/auth';
import {
    Firestore, doc, getDoc, docSnapshots, setDoc, Timestamp,
    CollectionReference, DocumentReference
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription, distinctUntilChanged, filter, firstValueFrom, of, switchMap, catchError } from 'rxjs';
import { Restaurant } from '../../shared/interfaces';
import { RestaurantCollection, restaurantCol, restaurantDoc, PLATFORM_COLLECTIONS } from './collections';

/**
 * Tipo de cuenta con sesión iniciada en este navegador:
 * - device: cuenta de un restaurante (sus equipos: celulares, tablet, PC de caja).
 * - platform: dueño de la plataforma (administra restaurantes).
 * - unlinked: cuenta válida en Firebase pero que no pertenece a ningún restaurante.
 * - none: sin sesión.
 */
export type AccountKind = 'loading' | 'none' | 'device' | 'platform' | 'unlinked' | 'error';

interface Identification {
    kind: 'none' | 'device' | 'platform' | 'unlinked' | 'error';
    rid?: string;
}

// --- Caché local de la identificación (solo acelera el arranque; no da permisos) ---
interface CachedAccount {
    uid: string;
    kind: 'device' | 'platform';
    rid?: string;
    restaurant?: Restaurant;
}
const CACHE_KEY = 'pos_cuenta';

function readCachedAccount(uid: string): CachedAccount | null {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as CachedAccount | null;
        return cached && cached.uid === uid ? cached : null;
    } catch {
        return null;
    }
}

function writeCachedAccount(value: CachedAccount): void {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch { /* sin almacenamiento: se ignora */ }
}

function clearCachedAccount(): void {
    try { localStorage.removeItem(CACHE_KEY); } catch { /* se ignora */ }
}

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
    private watchedRid: string | null = null;
    private watchReady: Promise<void> | null = null;
    private resolution = 0; // solo se aplica la identificación más reciente

    constructor() {
        authState(this.auth).subscribe(user => this.runResolution(user));
    }

    /**
     * Identifica la cuenta. Si este dispositivo ya la conocía (caché local), la app arranca al instante
     * con lo recordado y verifica en segundo plano; así también abre sin señal.
     * La seguridad no depende de la caché: las reglas de Firestore validan cada operación.
     */
    private async runResolution(user: FirebaseUser | null): Promise<AccountState> {
        const token = ++this.resolution;
        const cached = user ? readCachedAccount(user.uid) : null;

        if (user && cached) {
            this.applyState({ kind: cached.kind, uid: user.uid, email: user.email }, cached.rid, cached.restaurant);
            this.identify(user).then(result => {
                // Sin conexión ('error'): se mantiene lo recordado
                if (token !== this.resolution || result.kind === 'error') return;
                if (result.kind !== cached.kind || result.rid !== cached.rid) {
                    this.applyState({ kind: result.kind, uid: user.uid, email: user.email }, result.rid);
                }
            });
            return this.whenResolved();
        }

        this.publish({ kind: 'loading' });
        const result: Identification = user ? await this.identify(user) : { kind: 'none' };
        if (token !== this.resolution) return this.whenResolved();
        if (result.kind === 'device' && result.rid) {
            await this.watchRestaurant(result.rid); // primera vez: esperar el estado real del restaurante
        }
        this.applyState({ kind: result.kind, uid: user?.uid, email: user?.email }, result.rid);
        return this.whenResolved();
    }

    private publish(state: AccountState): void {
        this.account.set(state);
        this.state$.next(state);
    }

    /** Aplica una identificación: arranca o detiene la escucha del restaurante y guarda la caché. */
    private applyState(state: AccountState, rid?: string, cachedRestaurant?: Restaurant): void {
        if (state.kind === 'device' && rid) {
            if (rid !== this.watchedRid) {
                this.watchRestaurant(rid); // reinicia el restaurante; la primera lectura llega después
                if (cachedRestaurant) this.restaurant.set(cachedRestaurant);
            }
        } else {
            this.stopWatchingRestaurant();
        }
        this.publish(state);
        this.saveCache();
    }

    private saveCache(): void {
        const state = this.account();
        if ((state.kind === 'device' && this.watchedRid) || state.kind === 'platform') {
            writeCachedAccount({
                uid: state.uid!,
                kind: state.kind,
                rid: this.watchedRid ?? undefined,
                restaurant: this.restaurant() ?? undefined
            });
        } else if (state.kind !== 'error') {
            clearCachedAccount();
        }
    }

    /** Vuelve a identificar la cuenta actual (p. ej. justo después de crear sus documentos). */
    refresh(): Promise<AccountState> {
        return this.runResolution(this.auth.currentUser);
    }

    /** Espera a que se sepa qué cuenta hay (para los guards). */
    whenResolved(): Promise<AccountState> {
        return firstValueFrom(this.state$.pipe(filter(s => s.kind !== 'loading')));
    }

    /** ¿Qué es esta cuenta? Las dos consultas van en paralelo. 'error' = no se pudo saber (sin conexión). */
    private async identify(user: FirebaseUser): Promise<Identification> {
        try {
            const [platformSnap, deviceSnap] = await Promise.all([
                getDoc(doc(this.firestore, PLATFORM_COLLECTIONS.platformAdmins, user.uid)),
                getDoc(doc(this.firestore, PLATFORM_COLLECTIONS.devices, user.uid))
            ]);
            if (platformSnap.exists()) return { kind: 'platform' };
            if (deviceSnap.exists()) return { kind: 'device', rid: deviceSnap.data()['rid'] as string };
            return { kind: 'unlinked' };
        } catch (error) {
            console.error('No se pudo identificar la cuenta:', error);
            return { kind: 'error' };
        }
    }

    /** Escucha el documento del restaurante en vivo (si lo suspenden, el equipo se bloquea al instante). */
    private watchRestaurant(rid: string): Promise<void> {
        // Ya se escucha (o se está empezando a escuchar) este restaurante: se reutiliza la misma espera.
        // Reiniciarla dejaría colgada a quien ya la estaba esperando (dos identificaciones casi simultáneas).
        if (this.watchedRid === rid && this.watchReady) {
            return this.watchReady;
        }
        this.stopWatchingRestaurant();
        this.watchedRid = rid;
        this.watchReady = new Promise(resolve => {
            let first = true;
            this.restaurantSub = docSnapshots(doc(this.firestore, PLATFORM_COLLECTIONS.restaurants, rid)).pipe(
                catchError(() => of(null))
            ).subscribe(snap => {
                // Se ignoran los errores y las lecturas "desde caché" sin confirmar del servidor
                // (sin conexión, Firestore dice que el documento no existe): se conserva lo último conocido.
                const confirmed = snap !== null && !(snap.metadata.fromCache && !snap.exists());
                if (confirmed) {
                    this.restaurant.set(snap.exists() ? ({ id: rid, ...snap.data() } as Restaurant) : null);
                    this.saveCache();
                }
                // La espera termina con la primera lectura CONFIRMADA (o un error); una lectura de caché
                // sin confirmar no cuenta, porque todavía no se sabe el estado real del restaurante.
                if (first && (confirmed || snap === null)) { first = false; resolve(); }
            });
            // Sin señal puede que nunca llegue una lectura confirmada: no dejar la app esperando para siempre
            setTimeout(() => { if (first) { first = false; resolve(); } }, 8000);
        });
        return this.watchReady;
    }

    private stopWatchingRestaurant(): void {
        this.restaurantSub?.unsubscribe();
        this.restaurantSub = undefined;
        this.watchReady = null;
        this.watchedRid = null;
        this.restaurant.set(null);
    }

    /** Entrar con Google (administradores de restaurante y dueño de la plataforma). */
    async signInWithGoogle(): Promise<AccountState> {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const cred = await signInWithPopup(this.auth, provider);
        return this.runResolution(cred.user);
    }

    /** Solo para el emulador local (pruebas): entrar con correo y contraseña. */
    async signInWithEmailForTesting(email: string, password: string): Promise<AccountState> {
        const cred = await signInWithEmailAndPassword(this.auth, email.trim(), password);
        return this.runResolution(cred.user);
    }

    /**
     * Vincula este equipo a un restaurante con el enlace que comparte su administrador.
     * El celular del personal entra de forma anónima (sin cuenta de Google); las reglas solo aceptan
     * el vínculo si el código del enlace es el vigente del restaurante y el restaurante está activo.
     */
    async joinRestaurant(rid: string, token: string): Promise<'joined' | 'already' | 'other-restaurant' | 'invalid'> {
        // Esperar a que Firebase recupere la sesión guardada (si no, se crearía una cuenta anónima
        // encima de la sesión de Google del administrador)
        await this.auth.authStateReady();
        if (this.auth.currentUser) {
            const current = await this.whenResolved();
            if (current.kind === 'device') {
                return this.restaurant()?.id === rid ? 'already' : 'other-restaurant';
            }
            if (current.kind === 'platform') return 'other-restaurant';
            await signOut(this.auth); // cuenta sin restaurante: se reemplaza
        }

        const cred = await signInAnonymously(this.auth);
        try {
            await setDoc(doc(this.firestore, PLATFORM_COLLECTIONS.devices, cred.user.uid), {
                rid, token, tipo: 'personal', creado_en: Timestamp.now()
            });
        } catch {
            await cred.user.delete().catch(() => { });
            await this.runResolution(null);
            return 'invalid';
        }
        await this.runResolution(cred.user);
        return 'joined';
    }

    /** UID y tipo de inicio de sesión de la cuenta actual. */
    currentUser(): FirebaseUser | null {
        return this.auth.currentUser;
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

    col(name: RestaurantCollection): CollectionReference {
        return restaurantCol(this.firestore, this.requireRid(), name);
    }

    /** Para listeners con el rid que entrega watch(). */
    colOf(rid: string, name: RestaurantCollection): CollectionReference {
        return restaurantCol(this.firestore, rid, name);
    }

    docOf(rid: string, name: RestaurantCollection, id: string): DocumentReference {
        return restaurantDoc(this.firestore, rid, name, id);
    }

    docRef(name: RestaurantCollection, id: string): DocumentReference {
        return restaurantDoc(this.firestore, this.requireRid(), name, id);
    }

    newDocRef(name: RestaurantCollection): DocumentReference {
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

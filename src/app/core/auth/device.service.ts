import { Injectable, inject, signal } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, User as FirebaseUser } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

/**
 * Sesión del EQUIPO (celular, tablet o PC) con Firebase Auth.
 * El dueño la activa una sola vez por dispositivo con la cuenta de equipos del restaurante;
 * después el personal entra con su PIN. Las reglas de Firestore solo aceptan esta cuenta.
 */
@Injectable({
    providedIn: 'root'
})
export class DeviceService {
    private auth = inject(Auth);

    readonly device = signal<FirebaseUser | null>(null);

    constructor() {
        authState(this.auth).subscribe(user => this.device.set(user));
    }

    /** Espera a que Firebase Auth restaure la sesión guardada (o confirme que no hay). */
    async isActivated(): Promise<boolean> {
        const user = await firstValueFrom(authState(this.auth));
        return user !== null;
    }

    async activate(email: string, password: string): Promise<void> {
        await signInWithEmailAndPassword(this.auth, email.trim(), password);
    }

    async deactivate(): Promise<void> {
        await signOut(this.auth);
    }
}

import { Injectable, signal } from '@angular/core';

export class TimeoutError extends Error {
    constructor() {
        super('Tiempo de espera agotado');
        this.name = 'TimeoutError';
    }
}

/**
 * Estado de la conexión del dispositivo.
 * navigator.onLine detecta cuando el equipo pierde la red; un Wi-Fi sin internet no lo detecta,
 * por eso las operaciones importantes usan además withTimeout().
 */
@Injectable({
    providedIn: 'root'
})
export class ConnectionService {
    readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);

    constructor() {
        window.addEventListener('online', () => this.online.set(true));
        window.addEventListener('offline', () => this.online.set(false));
    }

    /** Rechaza con TimeoutError si la promesa no termina a tiempo (la operación puede seguir en curso). */
    withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => reject(new TimeoutError()), ms);
            promise.then(
                value => { clearTimeout(timer); resolve(value); },
                error => { clearTimeout(timer); reject(error); }
            );
        });
    }
}

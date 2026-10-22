import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/** Pantallas donde recargar no hace perder nada (no hay un pedido ni un cobro a medias). */
const SAFE_PREFIXES = ['/login', '/activar', '/plataforma', '/registro', '/unirse'];
/** Si la versión nueva llega apenas se abre la app, se aplica de una (nadie ha empezado nada). */
const BOOT_WINDOW_MS = 20_000;
const CHECK_EVERY_MS = 30 * 60 * 1000;

/**
 * Actualiza la app sola, sin avisos: la versión nueva se aplica al abrir la app o al pasar
 * por una pantalla segura (PIN, bienvenida, plataforma). Nunca recarga en medio de un pedido.
 */
@Injectable({
    providedIn: 'root'
})
export class AppUpdateService {
    private swUpdate = inject(SwUpdate);
    private router = inject(Router);
    private readonly bootedAt = Date.now();
    private pending = false;

    constructor() {
        if (!this.swUpdate.isEnabled) return;

        this.swUpdate.versionUpdates
            .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
            .subscribe(() => {
                this.pending = true;
                if (Date.now() - this.bootedAt < BOOT_WINDOW_MS || this.isSafe(window.location.pathname)) this.apply();
            });

        this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe(e => {
                if (this.pending && this.isSafe(e.urlAfterRedirects)) this.apply();
            });

        // Al volver a la app (desde otra app o con la pantalla apagada) se revisa si hay versión nueva
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.check();
        });
        this.check();
        setInterval(() => this.check(), CHECK_EVERY_MS);
    }

    private check(): void {
        this.swUpdate.checkForUpdate().catch(() => { });
    }

    private isSafe(url: string): boolean {
        return url === '/' || SAFE_PREFIXES.some(p => url.startsWith(p));
    }

    private async apply(): Promise<void> {
        this.pending = false;
        try {
            await this.swUpdate.activateUpdate();
        } finally {
            document.location.reload();
        }
    }
}

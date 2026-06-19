import { ApplicationConfig, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, Auth, signInAnonymously, onAuthStateChanged } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideServiceWorker } from '@angular/service-worker';

/**
 * Garantiza que SIEMPRE haya una sesión de Firebase Auth activa.
 *
 * Los empleados entran por PIN (no por Firebase Auth), así que sin esto
 * serían anónimos para Firestore (request.auth == null) y las reglas no
 * podrían exigir autenticación. Con un login anónimo automático cada
 * dispositivo obtiene un token válido, lo que permite cerrar el acceso
 * totalmente abierto en firestore.rules.
 *
 * - Al arrancar: si no hay sesión, inicia una anónima antes de bootstrap.
 * - En caliente: si el super admin cierra sesión (queda en null), vuelve a
 *   establecer la sesión anónima para que la app siga funcionando.
 */
function initAuthSession(auth: Auth): () => Promise<void> {
  return () => new Promise<void>((resolve) => {
    let resolved = false;
    const done = () => { if (!resolved) { resolved = true; resolve(); } };
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error('No se pudo iniciar la sesión anónima de Firebase:', e);
        }
      }
      done();
    });
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Auth],
      useFactory: initAuthSession,
    },
    provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ]
};

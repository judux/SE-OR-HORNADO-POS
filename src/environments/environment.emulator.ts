// Entorno local con Firebase Emulator Suite (npm run emulators).
// El projectId "demo-*" hace que el SDK nunca se conecte a un proyecto real.
export const environment = {
    production: false,
    useEmulators: true,
    firebase: {
        apiKey: 'demo-api-key',
        authDomain: 'demo-senor-hornado.firebaseapp.com',
        projectId: 'demo-senor-hornado',
        storageBucket: 'demo-senor-hornado.appspot.com',
        messagingSenderId: '000000000000',
        appId: '1:000000000000:web:demo'
    }
};

export const environment = {
    production: false,
    // Cuenta de Firebase Auth que comparten los equipos del restaurante (debe coincidir con firestore.rules)
    deviceEmail: 'equipos@senorhornado.app',
    useEmulators: false,
    firebase: {
        apiKey: 'AIzaSyCjj33RBuAzycXjVDeGiYRPlG64i6rb2C0',
        authDomain: 'senor-hornado-pos-8412.firebaseapp.com',
        databaseURL: 'https://senor-hornado-pos-8412-default-rtdb.firebaseio.com',
        projectId: 'senor-hornado-pos-8412',
        storageBucket: 'senor-hornado-pos-8412.firebasestorage.app',
        messagingSenderId: '423760079098',
        appId: '1:423760079098:web:0c25a365ba638874934143'
    }
};

// Script para cargar datos iniciales en Firestore
// Ejecutar: node scripts/seed-firestore.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: 'AIzaSyCjj33RBuAzycXjVDeGiYRPlG64i6rb2C0',
    authDomain: 'senor-hornado-pos-8412.firebaseapp.com',
    databaseURL: 'https://senor-hornado-pos-8412-default-rtdb.firebaseio.com',
    projectId: 'senor-hornado-pos-8412',
    storageBucket: 'senor-hornado-pos-8412.firebasestorage.app',
    messagingSenderId: '423760079098',
    appId: '1:423760079098:web:0c25a365ba638874934143'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
    console.log('🌱 Iniciando seed de Firestore...\n');

    // ═══════════════════════════════════════
    // 1. USUARIOS
    // ═══════════════════════════════════════
    console.log('👤 Creando usuarios...');
    const users = [
        { nombre: 'Administrador', rol: 'admin', pin_acceso: '1234', activo: true },
        { nombre: 'Carlos (Mesero)', rol: 'mesero', pin_acceso: '1111', activo: true },
        { nombre: 'Lucía (Mesero)', rol: 'mesero', pin_acceso: '3333', activo: true },
        { nombre: 'Ana (Cajero)', rol: 'cajero', pin_acceso: '2222', activo: true },
    ];

    for (const user of users) {
        const docRef = await addDoc(collection(db, 'users'), user);
        console.log(`  ✅ ${user.nombre} (${user.rol}) → ID: ${docRef.id}`);
    }

    // ═══════════════════════════════════════
    // 2. PRODUCTOS (MENÚ)
    // ═══════════════════════════════════════
    console.log('\n🍽️ Creando menú de productos...');
    const products = [
        // Almuerzos
        { nombre: 'Almuerzo con Hornado', precio: 18000, categoria: 'almuerzos', disponible: true, notas_permitidas: true, descripcion: 'Incluye sopa y seco' },
        { nombre: 'Almuerzo con Gallina', precio: 22000, categoria: 'almuerzos', disponible: true, notas_permitidas: true, descripcion: 'Incluye sopa y seco' },
        { nombre: 'Almuerzo con Cuy', precio: 18000, categoria: 'almuerzos', disponible: true, notas_permitidas: true, descripcion: 'Incluye sopa y seco' },
        { nombre: 'Almuerzo con Carne Asada', precio: 16000, categoria: 'almuerzos', disponible: true, notas_permitidas: true, descripcion: 'Incluye sopa y seco' },

        // Bandejas
        { nombre: 'Bandeja con Hornado', precio: 15000, categoria: 'bandejas', disponible: true, notas_permitidas: true, descripcion: 'Solo seco' },
        { nombre: 'Bandeja con Gallina', precio: 18000, categoria: 'bandejas', disponible: true, notas_permitidas: true, descripcion: 'Solo seco' },
        { nombre: 'Bandeja con Cuy', precio: 15000, categoria: 'bandejas', disponible: true, notas_permitidas: true, descripcion: 'Solo seco' },
        { nombre: 'Bandeja con Carne Asada', precio: 16000, categoria: 'bandejas', disponible: true, notas_permitidas: true, descripcion: 'Con papa cocinada/frita' },

        // Platos
        { nombre: 'Sancocho de Espinazo', precio: 12000, categoria: 'platos', disponible: true, notas_permitidas: false, descripcion: 'Plato grande de sopa más hueso' },
        { nombre: 'Porción de Hornado', precio: 12000, categoria: 'platos', disponible: true, notas_permitidas: true, descripcion: 'Con mote, papa o ambas' },

        // Sopas
        { nombre: 'Sopa de Gallina (Plátano)', precio: 3000, categoria: 'sopas', disponible: true, notas_permitidas: false },
        { nombre: 'Sopa de Espinazo (Guineo)', precio: 3000, categoria: 'sopas', disponible: true, notas_permitidas: false },

        // Bebidas
        { nombre: 'Jarra de Limonada', precio: 5000, categoria: 'bebidas', disponible: true, notas_permitidas: false },

        // Porciones
        { nombre: 'Porción de Mote', precio: 5000, categoria: 'porciones', disponible: true, notas_permitidas: false },
        { nombre: 'Porción de Arroz', precio: 2000, categoria: 'porciones', disponible: true, notas_permitidas: false },
        { nombre: 'Porción de Frijol', precio: 2000, categoria: 'porciones', disponible: true, notas_permitidas: false },
        { nombre: 'Porción de Papas', precio: 5000, categoria: 'porciones', disponible: true, notas_permitidas: false },
    ];

    for (const product of products) {
        const docRef = await addDoc(collection(db, 'products'), product);
        console.log(`  ✅ ${product.nombre} ($${product.precio}) → ID: ${docRef.id}`);
    }

    // ═══════════════════════════════════════
    // 3. MESAS (15 mesas)
    // ═══════════════════════════════════════
    console.log('\n🪑 Creando 15 mesas...');
    for (let i = 1; i <= 15; i++) {
        const table = {
            numero_mesa: i,
            capacidad: i <= 5 ? 2 : (i <= 10 ? 4 : 6),
            estado: 'libre',
        };
        // Usar IDs predecibles (mesa_1, mesa_2, etc.)
        await setDoc(doc(db, 'tables', `mesa_${i}`), table);
        console.log(`  ✅ Mesa ${i} (capacidad: ${table.capacidad})`);
    }

    console.log('\n🎉 ¡Seed completado! La base de datos ya tiene los datos iniciales.');
    console.log('\n📌 PINs de acceso:');
    console.log('   Admin:  1234');
    console.log('   Mesero: 1111 (Carlos), 3333 (Lucía)');
    console.log('   Cajero: 2222 (Ana)');

    process.exit(0);
}

seedDatabase().catch((err) => {
    console.error('❌ Error en el seed:', err);
    process.exit(1);
});

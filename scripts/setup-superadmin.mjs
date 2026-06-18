// Script de un solo uso: registra tu correo como super admin en Firestore.
// Uso:  node scripts/setup-superadmin.mjs
//
// Cambia EMAIL y NOMBRE de abajo si quieres otro super admin.
// Funciona mientras las reglas de Firestore en vivo permitan escritura
// (super_admins se verifica por el campo `email`, no por el ID del documento).

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyCjj33RBuAzycXjVDeGiYRPlG64i6rb2C0',
    authDomain: 'senor-hornado-pos-8412.firebaseapp.com',
    projectId: 'senor-hornado-pos-8412',
    storageBucket: 'senor-hornado-pos-8412.firebasestorage.app',
    messagingSenderId: '423760079098',
    appId: '1:423760079098:web:0c25a365ba638874934143',
};

const EMAIL = 'johandavidromoro@gmail.com';
const NOMBRE = 'judux';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ref = collection(db, 'super_admins');

// Evita duplicados: si ya existe un super admin con ese correo, no crea otro.
const existing = await getDocs(query(ref, where('email', '==', EMAIL)));
if (!existing.empty) {
    console.log(`✓ Ya existe un super admin con el correo ${EMAIL}. Nada que hacer.`);
} else {
    const docRef = await addDoc(ref, { nombre: NOMBRE, email: EMAIL });
    console.log(`✓ Super admin creado correctamente (doc id: ${docRef.id}).`);
    console.log(`  Ahora entra en /super-admin/login con Google usando ${EMAIL}.`);
}

process.exit(0);

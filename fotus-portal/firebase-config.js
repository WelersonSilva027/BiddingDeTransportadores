// firebase-config.js (VERSÃO CORRIGIDA)

// 1. Importamos as ferramentas do Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; // <--- IMPORTANTE

// 2. Sua configuração (Chaves de Acesso)
const firebaseConfig = {
  apiKey: "AIzaSyDOCBYXDCKHnaay01KSRrVK98HWQibWrU4",
  authDomain: "bidding-de-transportadores.firebaseapp.com",
  projectId: "bidding-de-transportadores",
  storageBucket: "bidding-de-transportadores.firebasestorage.app",
  messagingSenderId: "298318631570",
  appId: "1:298318631570:web:b99be136be700ffef98c4b",
  measurementId: "G-5PFN80MPHW"
};

// 3. Inicializamos o App
const app = initializeApp(firebaseConfig);

// 4. EXPORTAMOS AS FERRAMENTAS (Aqui estava o erro: faltava o 'auth')
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // <--- ESSA É A LINHA QUE O ERRO ESTÁ RECLAMANDO QUE FALTA
// firebase-config.js

// Importando as funções específicas do Firebase que vamos usar
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; // Para o Banco de Dados
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";       // Para Arquivos (PDFs)

// Sua configuração (Copiada do seu print)
const firebaseConfig = {
  apiKey: "AIzaSyDOCBYXDCKHnaay01KSRrVK98HWQibWrU4",
  authDomain: "bidding-de-transportadores.firebaseapp.com",
  projectId: "bidding-de-transportadores",
  storageBucket: "bidding-de-transportadores.firebasestorage.app",
  messagingSenderId: "298318631570",
  appId: "1:298318631570:web:b99be136be700ffef98c4b",
  measurementId: "G-5PFN80MPHW"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Exportando para poder usar nos outros arquivos (app.js e admin.js)
export const db = getFirestore(app);
export const storage = getStorage(app);
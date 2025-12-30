// login.js - VERSÃO CORRIGIDA PARA NETLIFY

// 1. Importa a configuração do SEU projeto (arquivo local)
import { auth } from './firebase-config.js';

// 2. Importa o comando de login do FIREBASE (da internet)
// O erro acontecia porque esta linha abaixo estava faltando ou incompleta:
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const btnEntrar = document.getElementById('btn-entrar');
const msgErro = document.getElementById('msg-erro'); // Certifique-se que existe um <p id="msg-erro"> no HTML

btnEntrar.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // Visual: Carregando...
    btnEntrar.innerText = "Entrando...";
    btnEntrar.disabled = true;
    if(msgErro) msgErro.style.display = 'none';

    try {
        // Tenta fazer o login
        await signInWithEmailAndPassword(auth, email, senha);
        
        // Se passar daqui, deu certo! Redireciona para o painel
        window.location.href = "admin.html";

    } catch (erro) {
        console.error("ERRO LOGIN:", erro); 
        btnEntrar.innerText = "Entrar no Sistema";
        btnEntrar.disabled = false;
        
        // --- ALERTA DE ERRO ---
        Swal.fire({
            title: 'Acesso Negado',
            text: 'E-mail ou senha incorretos.',
            icon: 'error',
            confirmButtonColor: '#34495e'
        });
    }
});
import { db } from '../firebase-config.js';
// REMOVI A IMPORTAÇÃO DO STORAGE, POIS NÃO VAMOS USAR
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Objeto para guardar os arquivos convertidos em texto
let arquivosBase64 = {};

const inputsUpload = document.querySelectorAll('input[type="file"]');
const btnFinalizar = document.getElementById('btn-finalizar');

// --- PARTE 1: CONVERTER ARQUIVO PARA TEXTO (BASE64) ---
inputsUpload.forEach(input => {
    input.addEventListener('change', function() {
        const card = this.closest('.doc-card');
        const tipoDocumento = this.dataset.tipo;
        const statusText = card.querySelector('.status-text');
        const iconStatus = card.querySelector('.icon-status span');

        if (this.files[0]) {
            const arquivo = this.files[0];

            // Trava de segurança: Se for maior que 800KB, avisa (limite do banco é 1MB)
            if (arquivo.size > 800 * 1024) {
                alert("Arquivo muito grande! Por favor, envie um PDF menor que 800KB.");
                this.value = ""; // Limpa o input
                return;
            }

            statusText.textContent = "Processando...";
            statusText.style.color = "orange";

            // O Leitor Mágico que transforma PDF em Texto
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // O resultado é uma string gigante: "data:application/pdf;base64,JVBERi0xLjQK..."
                arquivosBase64[tipoDocumento] = e.target.result;
                
                // Sucesso Visual
                card.classList.remove('status-pending');
                card.classList.add('status-success');
                iconStatus.textContent = 'check_circle';
                statusText.textContent = "Pronto para envio!";
                statusText.style.color = "#2ecc71";
            };

            reader.onerror = function() {
                statusText.textContent = "Erro ao ler arquivo.";
                statusText.style.color = "red";
            };

            // Começa a ler o arquivo
            reader.readAsDataURL(arquivo);
        }
    });
});

// --- PARTE 2: ENVIO DO CADASTRO (SALVA NO BANCO) ---
btnFinalizar.addEventListener('click', async () => {
    const textoOriginal = btnFinalizar.innerText;
    btnFinalizar.innerText = "Salvando Cadastro...";
    btnFinalizar.disabled = true;

    try {
        // ... (parte do upload dos arquivos continua igual) ...

        // B) SEGUNDO: SALVA OS DADOS NO BANCO COM OS LINKS
        btnFinalizar.innerText = "Salvando Cadastro...";

        // ... (montagem do objeto dadosFormulario continua igual) ...
        
        const docRef = await addDoc(collection(db, "transportadoras"), dadosFormulario);
        
        // --- SUCESSO: SWEETALERT ---
        await Swal.fire({
            title: 'Sucesso!',
            text: 'Cadastro e documentos enviados para análise.',
            icon: 'success',
            confirmButtonColor: '#2ecc71', // Verde
            confirmButtonText: 'Ótimo!'
        });

        window.location.reload();

    } catch (e) {
        console.error("Erro no envio:", e);
        
        // --- ERRO: SWEETALERT ---
        Swal.fire({
            title: 'Ops!',
            text: 'Ocorreu um erro ao enviar. Verifique sua conexão.',
            icon: 'error',
            confirmButtonColor: '#d33' // Vermelho
        });

        btnFinalizar.innerText = textoOriginal;
        btnFinalizar.disabled = false;
    }
});
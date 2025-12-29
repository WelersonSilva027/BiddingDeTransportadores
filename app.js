// app.js

// Importando as configurações do seu projeto (Certifique-se que firebase-config.js está na mesma pasta)
import { db, storage } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Objeto para guardar as URLs dos arquivos temporariamente antes de salvar tudo no banco
let urlsArquivos = {};

// Seleciona os elementos do DOM
const inputsUpload = document.querySelectorAll('input[type="file"]');
const btnFinalizar = document.getElementById('btn-finalizar');

// --- PARTE 1: LÓGICA DE UPLOAD DE ARQUIVOS (Individual) ---
inputsUpload.forEach(input => {
    input.addEventListener('change', async function() {
        const card = this.closest('.doc-card'); // Pega o card visual pai do input
        const tipoDocumento = this.dataset.tipo; // Pega o nome do documento (ex: cnpj, antt, etc) definida no HTML

        if (this.files[0]) {
            const arquivo = this.files[0];
            
            // Cria um nome único para o arquivo: timestamp_nomeoriginal
            const nomeArquivoNoStorage = `uploads/${Date.now()}_${arquivo.name}`;
            const storageRef = ref(storage, nomeArquivoNoStorage);

            // 1. Feedback visual: Mudando texto para "Enviando..."
            const statusText = card.querySelector('.status-text');
            const iconStatus = card.querySelector('.icon-status span');
            
            statusText.textContent = "Enviando para nuvem...";
            statusText.style.color = "orange";
            iconStatus.textContent = "cloud_upload";

            try {
                // 2. Sobe o arquivo para o Firebase Storage
                const snapshot = await uploadBytes(storageRef, arquivo);
                
                // 3. Pega o Link (URL) público desse arquivo
                const url = await getDownloadURL(snapshot.ref);
                
                // 4. Salva o link no nosso objeto local temporário
                urlsArquivos[tipoDocumento] = url;
                console.log(`Arquivo ${tipoDocumento} salvo com sucesso:`, url);

                // 5. Atualiza visual do Card para Verde (Sucesso)
                card.classList.remove('status-pending');
                card.classList.add('status-success');
                iconStatus.textContent = 'check_circle';
                statusText.textContent = "Salvo na nuvem!";
                statusText.style.color = "#2ecc71"; // Verde

            } catch (erro) {
                console.error("Erro no upload:", erro);
                statusText.textContent = "Erro ao enviar. Tente novamente.";
                statusText.style.color = "red";
                iconStatus.textContent = "error";
            }
        }
    });
});

// --- PARTE 2: ENVIO DO CADASTRO COMPLETO (Botão Final) ---
btnFinalizar.addEventListener('click', async () => {
    
    // Feedback visual no botão para o usuário não clicar duas vezes
    const textoOriginal = btnFinalizar.innerText;
    btnFinalizar.innerText = "Salvando Cadastro...";
    btnFinalizar.disabled = true;
    btnFinalizar.style.backgroundColor = "#95a5a6"; // Cinza

    try {
        // Montando o Objeto final que vai para o Banco de Dados (Firestore)
        // Aqui pegamos os valores digitados nos inputs
        const dadosFormulario = {
            // --- IDENTIFICAÇÃO (Novos campos para a tabela do Admin) ---
            razao_social: document.getElementById('razao_social').value || "Não informado",
            cnpj: document.getElementById('cnpj_texto').value || "Não informado",
            
            // Metadados do Sistema
            data_envio: serverTimestamp(), // Pega a hora exata do servidor do Google
            status_geral: "pendente", // Status inicial para o Admin analisar

            // URLs dos arquivos que fizemos upload na Parte 1
            arquivos: urlsArquivos,

            // Dados Bancários
            banco: {
                nome: document.getElementById('banco_nome').value,
                agencia: document.getElementById('banco_agencia').value,
                conta: document.getElementById('banco_conta').value
            },

            // Contatos (Estrutura aninhada)
            contatos: {
                comercial: {
                    nome: document.getElementById('contato_comercial_nome').value,
                    tel: document.getElementById('contato_comercial_tel').value
                },
                financeiro: {
                    nome: document.getElementById('contato_financeiro_nome').value,
                    tel: document.getElementById('contato_financeiro_tel').value
                },
                operacional: {
                    nome: document.getElementById('contato_operacional_nome').value,
                    tel: document.getElementById('contato_operacional_tel').value
                }
            },

            // Referências Comerciais (Array simples)
            referencias: [
                document.getElementById('ref1').value,
                document.getElementById('ref2').value,
                document.getElementById('ref3').value
            ]
        };

        // --- SALVANDO NO FIRESTORE ---
        // Cria (ou usa) a coleção "transportadoras" e adiciona um novo documento
        const docRef = await addDoc(collection(db, "transportadoras"), dadosFormulario);
        
        console.log("Documento gravado com ID: ", docRef.id);
        
        // Sucesso!
        alert("Cadastro enviado com sucesso!\n\nID do Processo: " + docRef.id + "\n\nNossa equipe analisará a documentação.");
        
        // Opcional: Recarregar a página para limpar
        // window.location.reload();
        
        // Retorna o botão ao normal (caso não recarregue a página)
        btnFinalizar.innerText = "Enviado!";
        btnFinalizar.style.backgroundColor = "#2ecc71"; // Verde

    } catch (e) {
        console.error("Erro ao salvar documento: ", e);
        alert("Ocorreu um erro ao salvar os dados. Verifique o console para mais detalhes.");
        
        // Restaura o botão em caso de erro
        btnFinalizar.innerText = textoOriginal;
        btnFinalizar.disabled = false;
        btnFinalizar.style.backgroundColor = ""; // Volta a cor original (CSS)
    }
});
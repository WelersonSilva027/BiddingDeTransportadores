// admin.js - VERSÃO FINAL COMPLETA
import { db, auth } from './firebase-config.js'; 
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- ELEMENTOS DO DOM ---
const listaTabela = document.getElementById('lista-transportadoras');
const btnExcluirMassa = document.getElementById('btn-excluir-massa');
const checkAll = document.getElementById('check-all');
const tituloPagina = document.querySelector('h2');
const btnLogout = document.getElementById('btn-logout');

// Botões e Modal
const btnAprovar = document.getElementById('btn-aprovar');
const btnReprovar = document.getElementById('btn-reprovar');
const modalElement = document.getElementById('modalDetalhes');
let modalInstance = null;

// --- VARIÁVEIS DE CONTROLE ---
let idEmAnalise = null;
let filtroAtual = 'todos'; // Essa era a variável que estava faltando!

// --- 1. SEGURANÇA: VERIFICA SE ESTÁ LOGADO ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logado como:", user.email);
        carregarDados(); // Só carrega a tabela se tiver usuário
    } else {
        window.location.href = "index.html"; // Se não, manda pro login
    }
});

// Botão de Sair
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    });
}

// --- 2. FUNÇÕES AUXILIARES ---
function obterCorBadge(status) {
    const st = status ? status.toLowerCase() : "";
    if (st === 'aprovado') return 'bg-success';
    if (st === 'reprovado') return 'bg-danger';
    return 'bg-warning text-dark';
}

// --- 3. CARREGAR DADOS (TABELA) ---
async function carregarDados() {
    listaTabela.innerHTML = '<tr><td colspan="6" class="text-center py-4">Carregando dados...</td></tr>';
    if(checkAll) checkAll.checked = false;
    alternarBotaoExcluir();

    try {
        const querySnapshot = await getDocs(collection(db, "transportadoras"));
        listaTabela.innerHTML = "";
        let encontrouAlgum = false;

        querySnapshot.forEach((docSnap) => {
            const dados = docSnap.data();
            const statusDoc = dados.status_geral ? dados.status_geral.toLowerCase() : 'pendente';

            // FILTRO (Lógica das abas laterais)
            if (filtroAtual !== 'todos' && statusDoc !== filtroAtual) return;

            encontrouAlgum = true;
            let dataFormatada = "---";
            if (dados.data_envio) dataFormatada = dados.data_envio.toDate().toLocaleDateString('pt-BR');
            
            const corStatus = obterCorBadge(dados.status_geral);
            const textoStatus = dados.status_geral ? dados.status_geral.toUpperCase() : "INDEFINIDO";

            // Flags Visuais
            let htmlFlags = "";
            if (dados.flags && dados.flags.length > 0) {
                dados.flags.forEach(flag => {
                    let corFlag = "bg-secondary";
                    if(flag.includes("Débito") || flag.includes("Processo")) corFlag = "bg-danger";
                    else if(flag.includes("Vencido")) corFlag = "bg-warning text-dark";
                    htmlFlags += `<span class="badge ${corFlag} me-1" style="font-size: 10px;">${flag}</span>`;
                });
            }

            listaTabela.innerHTML += `
                <tr>
                    <td class="text-center"><input type="checkbox" class="form-check-input check-item" value="${docSnap.id}"></td>
                    <td>
                        <div class="fw-bold text-dark">${dados.razao_social}</div>
                        <div class="mt-1">${htmlFlags}</div>
                    </td>
                    <td>${dados.cnpj}</td>
                    <td>${dataFormatada}</td>
                    <td><span class="badge ${corStatus}">${textoStatus}</span></td>
                    <td>
                        <button class='btn btn-outline-primary btn-sm' onclick="verDetalhes('${docSnap.id}')">Avaliar</button>
                    </td>
                </tr>
            `;
        });

        if (!encontrouAlgum) listaTabela.innerHTML = `<tr><td colspan='6' class='text-center py-4 text-muted'>Nenhuma solicitação em '${filtroAtual}'.</td></tr>`;
        
        // Reconecta eventos dos checkboxes
        document.querySelectorAll('.check-item').forEach(c => c.addEventListener('change', alternarBotaoExcluir));

    } catch (erro) {
        console.error("Erro no carregarDados:", erro);
        listaTabela.innerHTML = "<tr><td colspan='6' class='text-danger text-center'>Erro ao carregar dados (Verifique Console).</td></tr>";
    }
}

// --- 4. VER DETALHES (MODAL) ---
window.verDetalhes = async function(id) {
    idEmAnalise = id;
    modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();

    const titulo = document.getElementById('modal-razao');
    const cnpj = document.getElementById('modal-cnpj');
    const divArquivos = document.getElementById('lista-arquivos');
    const listaContatos = document.getElementById('lista-contatos');
    const inputObs = document.getElementById('texto-observacao');
    const checkboxesFlags = document.querySelectorAll('.input-flag');

    titulo.innerText = "Carregando...";
    divArquivos.innerHTML = ""; 
    listaContatos.innerHTML = "";
    if(inputObs) inputObs.value = "";
    if(checkboxesFlags) checkboxesFlags.forEach(cb => cb.checked = false);

    try {
        const docSnap = await getDoc(doc(db, "transportadoras", id));
        if (docSnap.exists()) {
            const dados = docSnap.data();
            titulo.innerText = dados.razao_social;
            cnpj.innerText = dados.cnpj;

            if (dados.observacao && inputObs) inputObs.value = dados.observacao;
            if (dados.flags && checkboxesFlags) {
                dados.flags.forEach(flagSalva => {
                    checkboxesFlags.forEach(cb => { if (cb.value === flagSalva) cb.checked = true; });
                });
            }

            // Arquivos (Lê Base64 ou Link)
            const arquivos = dados.arquivos || {};
            if (Object.keys(arquivos).length === 0) divArquivos.innerHTML = '<div class="alert alert-light border">Sem arquivos.</div>';
            
            // Mapeamento de nomes bonitos
            const nomesMap = {'cnpj': 'Cartão CNPJ', 'contrato_social': 'Contrato Social', 'sintegra': 'SINTEGRA', 'rntrc': 'ANTT', 'apolice': 'Seguros'};

            for (const [tipo, conteudo] of Object.entries(arquivos)) {
                const nomeExibicao = nomesMap[tipo] || tipo;
                divArquivos.innerHTML += `
                    <a href="${conteudo}" target="_blank" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span><i class="material-icons text-danger fs-6 align-middle me-2">picture_as_pdf</i>${nomeExibicao}</span>
                        <small class="text-primary">Abrir Arquivo</small>
                    </a>`;
            }

            // Contatos
            const c = dados.contatos || {};
            listaContatos.innerHTML = `
                <li class="list-group-item"><small class="text-muted d-block">Comercial</small>${c.comercial?.nome || '-'} (${c.comercial?.tel || '-'})</li>
                <li class="list-group-item"><small class="text-muted d-block">Financeiro</small>${c.financeiro?.nome || '-'} (${c.financeiro?.tel || '-'})</li>
                <li class="list-group-item"><small class="text-muted d-block">Operacional</small>${c.operacional?.nome || '-'} (${c.operacional?.tel || '-'})</li>
            `;
        }
    } catch (erro) { console.error(erro); }
}

// --- 5. ATUALIZAR STATUS (APROVAR/REPROVAR) ---
async function atualizarStatusTransportadora(novoStatus) {
    if (!idEmAnalise) return;
    const btnClicado = novoStatus === 'aprovado' ? btnAprovar : btnReprovar;
    if(!btnClicado) return;

    const textoOriginal = btnClicado.innerText;
    
    // Pega valores do formulário de análise
    const obs = document.getElementById('texto-observacao') ? document.getElementById('texto-observacao').value : "";
    const flags = [];
    document.querySelectorAll('.input-flag:checked').forEach(cb => flags.push(cb.value));

    btnClicado.innerText = "Salvando...";
    btnClicado.disabled = true;

   // ... dentro da função atualizarStatusTransportadora ...
    try {
        await updateDoc(doc(db, "transportadoras", idEmAnalise), { 
            status_geral: novoStatus,
            observacao: obs,
            flags: flags
        });

        if (modalInstance) modalInstance.hide();
        
        // Feedback rápido e bonito (Toast no canto da tela)
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });

        Toast.fire({
            icon: 'success',
            title: `Transportadora ${novoStatus} com sucesso!`
        });

        await carregarDados(); 

    } catch (erro) {
// ...
        console.error(erro);
        alert("Erro ao atualizar status.");
    } finally {
        btnClicado.innerText = textoOriginal;
        btnClicado.disabled = false;
    }
}

// Event Listeners dos Botões de Ação
if(btnAprovar) btnAprovar.addEventListener('click', () => atualizarStatusTransportadora('aprovado'));
if(btnReprovar) btnReprovar.addEventListener('click', () => atualizarStatusTransportadora('reprovado'));

// --- 6. FILTROS E EXCLUSÃO ---
window.alterarFiltro = function(novoStatus) {
    filtroAtual = novoStatus;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-white', 'active');
        link.classList.add('text-white-50');
    });
    const menu = document.getElementById(`menu-${novoStatus}`);
    if(menu) {
        menu.classList.remove('text-white-50');
        menu.classList.add('text-white', 'active');
    }
    
    if(tituloPagina) {
        if(novoStatus === 'todos') tituloPagina.innerText = "Solicitações: Todas";
        else tituloPagina.innerText = `Solicitações: ${novoStatus.charAt(0).toUpperCase() + novoStatus.slice(1)}s`;
    }
    
    carregarDados();
}

if(checkAll) {
    checkAll.addEventListener('change', function() {
        document.querySelectorAll('.check-item').forEach(c => c.checked = this.checked);
        alternarBotaoExcluir();
    });
}

function alternarBotaoExcluir() {
    if(!btnExcluirMassa) return;
    const qtd = document.querySelectorAll('.check-item:checked').length;
    if (qtd > 0) {
        btnExcluirMassa.classList.remove('d-none');
        btnExcluirMassa.innerText = `Excluir (${qtd})`;
    } else {
        btnExcluirMassa.classList.add('d-none');
    }
}

i// ... código anterior ...

if(btnExcluirMassa) {
    btnExcluirMassa.addEventListener('click', () => {
        const selecionados = document.querySelectorAll('.check-item:checked');
        
        // --- CONFIRMAÇÃO ELEGANTE ---
        Swal.fire({
            title: 'Tem certeza?',
            text: `Você vai excluir ${selecionados.length} solicitações. Isso não tem volta!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',   // Vermelho para perigo
            cancelButtonColor: '#3085d6', // Azul para cancelar
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Se clicou em SIM, executa a exclusão
                try {
                    const promises = Array.from(selecionados).map(c => deleteDoc(doc(db, "transportadoras", c.value)));
                    await Promise.all(promises);
                    
                    await Swal.fire(
                        'Excluído!',
                        'Os registros foram apagados.',
                        'success'
                    );
                    carregarDados();
                } catch (e) { 
                    console.error(e); 
                    Swal.fire('Erro', 'Não foi possível excluir.', 'error');
                }
            }
        });
    });
}
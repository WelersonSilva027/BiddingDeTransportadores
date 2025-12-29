import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const listaTabela = document.getElementById('lista-transportadoras');

// --- FUNÇÃO AUXILIAR PARA CORES (NOVO) ---
function obterCorBadge(status) {
    // Normaliza para minúsculo para evitar erro se vier "Aprovado" ou "aprovado"
    const st = status ? status.toLowerCase() : "";
    
    if (st === 'aprovado') return 'bg-success'; // Verde
    if (st === 'reprovado') return 'bg-danger'; // Vermelho
    
    // Padrão (Pendente ou desconhecido)
    return 'bg-warning text-dark'; // Amarelo com texto escuro
}

// --- 1. CARREGAR A LISTA NA TABELA ---
async function carregarDados() {
    listaTabela.innerHTML = '<tr><td colspan="5" class="text-center">Carregando lista...</td></tr>';

    try {
        const querySnapshot = await getDocs(collection(db, "transportadoras"));
        listaTabela.innerHTML = "";

        if (querySnapshot.empty) {
            listaTabela.innerHTML = "<tr><td colspan='5' class='text-center'>Nenhum cadastro encontrado.</td></tr>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const dados = doc.data();
            
            // Formata Data
            let dataFormatada = "---";
            if (dados.data_envio) {
                dataFormatada = dados.data_envio.toDate().toLocaleDateString('pt-BR');
            }

            // Define a cor baseada no status
            const corStatus = obterCorBadge(dados.status_geral);
            const textoStatus = dados.status_geral ? dados.status_geral.toUpperCase() : "INDEFINIDO";

            // Monta a Linha HTML
            const linhaHTML = `
                <tr>
                    <td class="fw-bold">${dados.razao_social}</td>
                    <td>${dados.cnpj}</td>
                    <td>${dataFormatada}</td>
                    <td>
                        <span class="badge ${corStatus}">
                            ${textoStatus}
                        </span>
                    </td>
                    <td>
                        <button class='btn btn-primary btn-sm' onclick="verDetalhes('${doc.id}')">
                            <i class="material-icons" style="font-size:14px; vertical-align:middle;">visibility</i> Detalhes
                        </button>
                    </td>
                </tr>
            `;
            listaTabela.innerHTML += linhaHTML;
        });

    } catch (erro) {
        console.error("Erro ao listar:", erro);
        listaTabela.innerHTML = "<tr><td colspan='5' class='text-danger text-center'>Erro ao conectar com o banco de dados.</td></tr>";
    }
}

// --- 2. FUNÇÃO VER DETALHES (Modal) ---
window.verDetalhes = async function(id) {
    // Abre o Modal
    const modalElement = document.getElementById('modalDetalhes');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Elementos do Modal
    const titulo = document.getElementById('modal-razao');
    const cnpj = document.getElementById('modal-cnpj');
    const divArquivos = document.getElementById('lista-arquivos');
    const listaContatos = document.getElementById('lista-contatos');

    titulo.innerText = "Buscando dados...";
    divArquivos.innerHTML = "";
    listaContatos.innerHTML = "";

    try {
        const docRef = doc(db, "transportadoras", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();

            titulo.innerText = dados.razao_social;
            cnpj.innerText = dados.cnpj;

            // -- ARQUIVOS --
            const arquivos = dados.arquivos || {};
            const nomesBonitos = {
                'cnpj': 'Cartão CNPJ',
                'contrato_social': 'Contrato Social',
                'sintegra': 'SINTEGRA / IE',
                'rntrc': 'Certificado ANTT',
                'apolice': 'Seguros'
            };

            if (Object.keys(arquivos).length === 0) {
                divArquivos.innerHTML = '<div class="alert alert-secondary">Nenhum arquivo enviado.</div>';
            } else {
                for (const [tipo, url] of Object.entries(arquivos)) {
                    const nomeExibicao = nomesBonitos[tipo] || tipo.toUpperCase();
                    
                    divArquivos.innerHTML += `
                        <a href="${url}" target="_blank" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                            <div>
                                <i class="material-icons text-danger" style="font-size:18px; vertical-align:middle; margin-right:8px">picture_as_pdf</i>
                                ${nomeExibicao}
                            </div>
                            <small class="text-muted">Visualizar</small>
                        </a>
                    `;
                }
            }

            // -- CONTATOS --
            if (dados.contatos) {
                const c = dados.contatos;
                listaContatos.innerHTML = `
                    <li class="list-group-item"><strong>Comercial:</strong> ${c.comercial?.nome || '--'} (${c.comercial?.tel || '--'})</li>
                    <li class="list-group-item"><strong>Financeiro:</strong> ${c.financeiro?.nome || '--'} (${c.financeiro?.tel || '--'})</li>
                    <li class="list-group-item"><strong>Operacional:</strong> ${c.operacional?.nome || '--'} (${c.operacional?.tel || '--'})</li>
                `;
            }

        } else {
            titulo.innerText = "Erro: Documento não encontrado";
        }
    } catch (erro) {
        console.error("Erro detalhes:", erro);
        titulo.innerText = "Erro ao carregar detalhes.";
    }
}

// Inicia
document.addEventListener('DOMContentLoaded', carregarDados);
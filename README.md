# 🚚 Fotus Bidding System

Sistema de Gestão e Homologação de Transportadoras desenvolvido para a **Fotus Distribuidora Solar**.

O projeto visa digitalizar o processo de cadastro de novas transportadoras, permitindo o envio de documentação legal via portal público e a análise de *compliance* e risco através de um painel administrativo restrito.

## 🔗 Acesso ao Sistema (Live Demo)

Aqui estão os links de produção hospedados no Netlify:

* **🚛 Portal do Transportador (Público):**
    * [https://cadastro-de-transportador-fotus.netlify.app/](https://cadastro-de-transportador-fotus.netlify.app/)
    * *Objetivo:* Envio de dados e upload de documentos.

* **🔐 Painel Administrativo (Restrito):**
    * [https://gestao-de-bidding.netlify.app/](https://gestao-de-bidding.netlify.app/)
    * *Objetivo:* Análise, aprovação e gestão de riscos.

---

## 🛠️ Tecnologias Utilizadas

* **Front-End:** HTML5, CSS3, JavaScript (ES6 Modules).
* **Framework CSS:** Bootstrap 5.3 (Responsividade e Layout).
* **Back-End (BaaS):** Google Firebase.
    * **Firestore Database:** Banco de dados NoSQL em tempo real.
    * **Firebase Storage:** Armazenamento de arquivos PDF (Contratos, CNH, etc).
    * **Firebase Authentication:** Sistema de login seguro.
* **UI/UX:** SweetAlert2 (Alertas modais interativos).
* **Deploy:** Netlify (CI/CD com separação de ambientes).

---

## ✨ Funcionalidades

### 1. Portal do Transportador
* **Formulário Inteligente:** Coleta estruturada de Razão Social, CNPJ, Dados Bancários e Contatos.
* **Upload de Documentos:** Integração com Firebase Storage para envio de arquivos PDF.
* **Feedback Visual:** Indicadores de status (ícones de check) quando um arquivo é anexado com sucesso.
* **Validação:** Verificação de campos obrigatórios antes do envio.

### 2. Painel Administrativo (Gestão)
* **Autenticação:** Acesso protegido por e-mail e senha (redirecionamento automático).
* **Dashboard Kanban:** Filtros laterais para visualizar status: *Todos, Pendentes, Aprovados, Reprovados*.
* **Visualização de Documentos:** Acesso direto aos links dos PDFs armazenados na nuvem.
* **CRM de Compliance (Análise de Risco):**
    * **Flags:** Etiquetas visuais para *Débitos em Aberto*, *Processo Jurídico*, etc.
    * **Observações:** Campo para parecer técnico do analista.
* **Ações em Massa:** Exclusão de múltiplos registros simultaneamente com confirmação de segurança.

---

## 📂 Estrutura do Projeto

O projeto foi arquitetado em dois diretórios independentes para facilitar a manutenção e o deploy separado:

/ (Raiz do Repositório)
│
├── 📁 fotus-portal/           # Aplicação Pública
│   ├── index.html             # Interface do Formulário
│   ├── app.js                 # Lógica de Upload e Envio
│   ├── style.css              # Estilos visuais
│   ├── firebase-config.js     # Configuração Firebase (Client-side)
│   └── 📁 Logo/               # Assets
│
└── 📁 fotus-admin/            # Aplicação Restrita
    ├── index.html             # Tela de Login (Redirecionamento)
    ├── admin.html             # Dashboard Principal
    ├── login.js               # Autenticação Firebase
    ├── admin.js               # Lógica de Gestão, Tabelas e Modais
    ├── style.css              # Estilos do Painel
    ├── firebase-config.js     # Configuração Firebase (Admin)
    └── 📁 Logo/               # Assets

    
⚙️ Configuração Local
Para rodar este projeto em sua máquina:

Clone o repositório.

Configuração do Firebase:

Crie um projeto no Firebase Console.

Habilite: Firestore, Storage e Authentication.

Atualize o arquivo firebase-config.js nas duas pastas com suas credenciais.


Execução:

Utilize o Live Server (VS Code) para rodar, pois o uso de import/export (Módulos ES6) exige protocolo HTTP.


🔒 Regras de Segurança (Firebase)
As regras foram configuradas para garantir que apenas usuários autenticados possam ler/editar dados, enquanto o envio é público.

Firestore Rules:

JavaScript

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transportadoras/{document=**} {
      allow create: if true; // Público envia
      allow read, update, delete: if request.auth != null; // Admin gerencia
    }
  }
}
Desenvolvido para otimizar o fluxo logístico da Fotus.

🚀 Próximos Passos (Roadmap)
[ ] Envio automático de e-mail para a transportadora quando aprovada/reprovada.

[ ] Paginação na tabela do Admin (caso o volume de dados cresça muito).

[ ] Busca por CNPJ ou Nome na tabela.

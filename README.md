🚚 Fotus Bidding System
Sistema de Gestão e Homologação de Transportadoras desenvolvido para a Fotus Distribuidora Solar.

O projeto visa digitalizar o processo de cadastro de novas transportadoras, permitindo o envio de documentação legal via portal público e a análise de compliance e risco através de um painel administrativo restrito.

🔗 Links do Projeto
Portal do Transportador (Público): https://cadastro-de-transportador-fotus.netlify.app/

Painel Administrativo (Restrito): https://gestao-de-bidding.netlify.app/

🛠️ Tecnologias Utilizadas
Front-End: HTML5, CSS3, JavaScript (ES6 Modules).

Framework CSS: Bootstrap 5.3.

Back-End (BaaS): Google Firebase.

Firestore Database: Banco de dados NoSQL para armazenar cadastros.

Firebase Storage: Armazenamento de arquivos (PDFs de contratos, CNPJ, etc.).

Firebase Authentication: Sistema de login seguro para administradores.

UI/UX: SweetAlert2 (Alertas e Modais estilizados).

Hospedagem: Netlify (Deploy contínuo e separação de ambientes).

✨ Funcionalidades
1. Portal do Transportador (Público)
Formulário de Cadastro: Coleta de Razão Social, CNPJ, Dados Bancários e Referências Comerciais.

Upload de Documentos: Envio de arquivos PDF (Contrato Social, ANT, Apólices, etc.) diretamente para a nuvem (Firebase Storage).

Feedback Visual: Indicadores de progresso e sucesso no upload de arquivos.

Validação: Travas para arquivos muito grandes e campos obrigatórios.

2. Painel Administrativo (Fotus Admin)
Autenticação Segura: Acesso restrito via E-mail/Senha com proteção de rotas (redirecionamento automático se não logado).

Dashboard de Gestão:

Visualização em tabela de todas as solicitações.

Status Coloridos (Pendente, Aprovado, Reprovado).

Filtros de Workflow: Abas laterais para separar visualmente solicitações por status.

Gestão de Documentos: Visualização dos PDFs anexados diretamente no navegador através de Links seguros.

CRM de Compliance:

Flags de Risco: Marcação visual de problemas (Débitos em Aberto, Processo Jurídico, Doc. Vencido).

Observações: Campo de texto para parecer técnico do analista.

Ações em Massa: Checkboxes para seleção múltipla e exclusão em lote de cadastros (com confirmação de segurança via SweetAlert).

📂 Estrutura do Projeto
O projeto foi separado em dois diretórios distintos para garantir a segurança e facilitar o deploy independente:

/ (Raiz)
│
├── 📁 fotus-portal/           # Site Público
│   ├── index.html             # Formulário de Cadastro
│   ├── app.js                 # Lógica de Upload e Envio
│   ├── style.css              # Estilos visuais
│   ├── firebase-config.js     # Chaves de acesso (Públicas)
│   └── 📁 Logo/               # Imagens
│
└── 📁 fotus-admin/            # Sistema Restrito
    ├── index.html             # Tela de Login (Redireciona se logado)
    ├── login.js               # Lógica de Autenticação
    ├── admin.html             # Dashboard Principal
    ├── admin.js               # Lógica de CRUD, Filtros e Modais
    ├── style.css              # Estilos específicos do Admin
    ├── firebase-config.js     # Chaves de acesso (Compartilhadas)
    └── 📁 Logo/               # Imagens
⚙️ Configuração e Instalação
Para rodar este projeto localmente:

Clone ou baixe os arquivos.

Configuração do Firebase:

Crie um projeto no Firebase Console.

Ative o Firestore Database e o Storage (Regras de teste ou produção).

Ative o Authentication (Provedor de Email/Senha).

Copie as chaves de configuração e atualize o arquivo firebase-config.js em ambas as pastas.

Configuração de Segurança (Domínio):

No Firebase Console -> Authentication -> Settings -> Authorized Domains.

Adicione o domínio do seu site (ex: gestao-fotus.netlify.app) para permitir o login.

Execução:

Utilize o Live Server (VS Code) para abrir os arquivos HTML, pois o uso de Módulos ES6 (import/export) exige um servidor HTTP local.

🔒 Regras de Segurança (Firebase Rules)
Firestore (Banco de Dados)
JavaScript

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transportadoras/{document=**} {
      allow create: if true;  // Público cria
      allow read, update, delete: if request.auth != null; // Apenas Admin lê/edita
    }
  }
}
Storage (Arquivos)
JavaScript

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // Ajustar para 'request.auth != null' em produção se necessário
    }
  }
}
🚀 Próximos Passos (Roadmap)

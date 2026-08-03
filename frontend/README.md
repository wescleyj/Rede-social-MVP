# Documentação Técnica — Frontend (React + Vite) 🎨

Este documento detalha a arquitetura, estrutura de componentes, design system, gerenciamento de estado e integrações de API do cliente web da rede social **Vórtice**.

---

## 🏛️ Arquitetura e Tecnologias

- **Framework:** [React](https://react.dev/) (Vite)
- **Roteamento:** [React Router DOM v6](https://reactrouter.com/)
- **Cliente HTTP:** [Axios](https://axios-http.com/) com interceptors para injeção de tokens JWT e renovação automática (*silent refresh*)
- **Estilização:** Vanilla CSS estruturado com Design System próprio, variáveis CSS padronizadas, paleta escura (*Dark Mode*), efeitos de vidro (*Glassmorphism*) e responsividade avançada.
- **Gerenciamento de Estado:** React Context API (`AuthContext`) com suporte a usuários autenticados e modo de navegação anônima/visitante.
- **Ícones:** Sistema customizado de SVGs dimensionados e padronizados com alta acessibilidade.

---

## 📂 Estrutura de Diretórios

```text
frontend/src/
├── assets/                   # Ícones SVG e imagens (home, bell, search, user, shield, heart, lock, etc.)
├── components/               # Componentes reutilizáveis
│   ├── LeftSidebar/          # Barra de navegação responsiva (Desktop / Tablet / Mobile Bottom Bar)
│   ├── PostCard/             # Card de publicação (ações de like, repost, comentários, denúncia, exclusão)
│   ├── CommentModal/         # Modal de leitura, criação e exclusão de comentários e respostas
│   ├── ReportModal/          # Modal para denúncia de publicações, comentários e usuários
│   ├── ReportDetailsModal/   # Modal do painel admin com visualização completa do conteúdo denunciado
│   ├── ConfirmModal/         # Modal genérico e seguro de confirmação para ações destrutivas
│   └── EditProfileModal/     # Modal de edição de informações do perfil
├── contexts/                 # Contextos globais da aplicação
│   └── AuthContext.jsx       # Provedor de autenticação, sessão JWT e controle de usuário visitante
├── pages/                    # Páginas da aplicação
│   ├── Home/                 # Feed principal com criação de posts e suporte a imagem/GIF
│   ├── Search/               # Busca global com abas de posts e usuários e ações de seguir
│   ├── Notifications/        # Central de notificações e aprovação de solicitações de seguidores
│   ├── Profile/              # Perfil completo, estatísticas, abas de posts/reposts e configurações
│   ├── AdminDashboard/       # Painel administrativo de moderação de denúncias e novos administradores
│   ├── Signin/               # Tela de login com tratamento de erros
│   └── Signup/               # Tela de cadastro de novos usuários
├── services/                 # Comunicação com o backend
│   └── api.js                # Instância do Axios com interceptor de autenticação e refresh token
├── utils/                    # Funções utilitárias
│   ├── buildImageUrl.js      # Normalizador de URLs de mídia (relativas e absolutas)
│   └── dateUtils.js          # Formatador de datas relativas e legíveis
├── index.css                 # Design system global (cores, tipografia, reset, utilitários)
└── main.jsx                  # Ponto de entrada da aplicação React
```

---

## 🔐 1. Autenticação e Sessão Global (`AuthContext`)

O `AuthContext` gerencia o estado da sessão em toda a aplicação:

### Estados Principais:
- `userData`: Dados do usuário logado `{ id, name, username, bio, avatar_url, banner_url, is_private, is_superuser, isAnonymous }`.
- `loading`: Flag booleana de carregamento inicial.

### Métodos Disponíveis:
- `login(username, password)`: Envia credenciais para `POST /api/auth/login/`, armazena os tokens no `localStorage` e carrega os dados do usuário.
- `logout()`: Invalida a sessão chamando `POST /api/logout/` e limpa o armazenamento local.
- `updateUser(newData)`: Atualiza os dados do usuário no estado global de forma reativa.

### Interceptor do Axios (`services/api.js`):
- Insere automaticamente o cabeçalho `Authorization: Bearer <access_token>` em requisições privadas.
- Em caso de resposta `401 Unauthorized`, tenta renovar o token chamando `POST /api/auth/refresh/`. Se a renovação falhar, realiza o logout e redireciona o usuário para `/signin`.

---

## 📱 2. Design System & Responsividade

O frontend foi desenvolvido seguindo um padrão visual consistente com container central padronizado em **`750px`**:

### Variáveis Globais (`index.css`):
```css
:root {
    --bg: #030712;
    --surface: #0f172a;
    --surface-hover: #1e293b;
    --border: #1e293b;
    --brand: #38bdf8;
    --brand-hover: #0284c7;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --danger: #ef4444;
    --success: #22c55e;
    --font-sans: 'Inter', -apple-system, sans-serif;
    --font-display: 'Outfit', sans-serif;
}
```

### Alturas e Espaçamentos de Cabeçalhos Padronizados:
- **Desktop e Tablet (> 768px):** Altura fixa de **`64px`** (cabeçalhos de linha única) ou `min-height: 68px` com `padding: 18px 24px` (cabeçalhos de 2 linhas).
- **Mobile (≤ 768px):** Altura de **`56px`** com `padding: 0 16px`.

### Adaptação por Dispositivo:
- **Desktop (> 1024px):** Barra lateral esquerda completa (275px) com logotipo, links com rótulos e botão de ação rápida.
- **Tablet (769px - 1024px):** Barra lateral compacta com ícones alinhados centralmente.
- **Mobile (≤ 768px):** Barra inferior fixa (*bottom bar*) com altura de 60px, efeito *blur* e z-index elevado (1000).

---

## 🌐 3. Mapeamento de Páginas e Integrações com a API

### 🏠 Página Inicial (`Home`)
- **Feed de Publicações:** `GET /api/posts/` com suporte a paginação `?page=X`.
- **Criar Publicação:** `POST /api/posts/create/`
  - **Payload:** `{ "content": "Texto do post", "media_url": "https://..." }`
- **Interações:**
  - Curtir: `POST /api/posts/like/<id>/` (otimista, atualiza contador imediatamente).
  - Repostar: `POST /api/posts/repost/<id>/`
  - Excluir: `DELETE /api/posts/delete/<id>/` (com modal de confirmação).

---

### 🔍 Página de Pesquisa (`Search`)
- **Buscar Publicações:** `GET /api/search/posts/<query>/`
- **Buscar Usuários:** `GET /api/search/users/<query>/`
- **Seguir / Deixar de Seguir:** `POST /api/users/follow/<username>/` (atualiza estado de "Seguir", "Seguindo" ou "Pendente" para contas privadas).

---

### 🔔 Central de Notificações (`Notifications`)
- **Listar Solicitações Pendentes:** `GET /api/users/follow/requests/list/`
- **Aceitar Solicitação:** `POST /api/users/follow/accept/<username>/`
- **Rejeitar Solicitação:** `POST /api/users/follow/reject/<username>/`

---

### 👤 Página de Perfil (`Profile`)
- **Carregar Perfil:** `GET /api/users/info/<username>/` (ou `/api/users/me/` para o próprio usuário).
- **Posts do Usuário:** `GET /api/users/posts/<username>/`
- **Atualizar Perfil:** `PUT/PATCH /api/users/me/`
  - **Payload:** `{ "name": "...", "bio": "...", "avatar_url": "...", "banner_url": "...", "is_private": true/false }`
- **Alterar Senha:** `PUT/PATCH /api/users/me/update_passwd/`
  - **Payload:** `{ "old_password": "...", "new_password": "..." }`
- **Excluir Conta:** `DELETE /api/users/me/delete/`

---

### 🛡️ Painel Administrativo (`AdminDashboard`)
Acessível exclusivamente para usuários administradores (`userData.is_superuser`):
- **Listar Denúncias Abertas:** `GET /api/reports/open/` (com suporte a paginação).
- **Concluir Denúncia:** `POST /api/reports/<id>/conclude/`
- **Excluir Conteúdo Denunciado:** `DELETE /api/posts/delete/<id>/` ou `DELETE /api/comments/delete/<id>/`
- **Excluir Usuário Infrator:** `DELETE /api/users/<username>/delete/`
- **Cadastrar Novo Administrador:** `POST /api/auth/register/`

---

### 💬 Modal de Comentários (`CommentModal`)
- **Listar Comentários de um Post:** `GET /api/posts/info/<id>/`
- **Publicar Comentário:** `POST /api/comments/create/`
  - **Payload:** `{ "post": <post_id>, "content": "Texto do comentário", "parent": <comment_id_opcional> }`
- **Curtir Comentário:** `POST /api/comments/like/<id>/`
- **Excluir Comentário:** `DELETE /api/comments/delete/<id>/`

---

### 🚩 Modal de Denúncias (`ReportModal`)
- **Denunciar Post:** `POST /api/reports/posts/create/`
- **Denunciar Comentário:** `POST /api/reports/comments/create/`
- **Denunciar Usuário:** `POST /api/reports/users/create/`
  - **Payload:** `{ "reason": "spam|harassment|hate_speech|misinformation|violence|other", "details": "Texto explicativo" }`

---

## 🛠️ Comandos de Desenvolvimento

No diretório `frontend`:

```bash
# Instalar pacotes
npm install

# Iniciar servidor local de desenvolvimento
npm run dev

# Gerar bundle otimizado de produção
npm run build

# Pré-visualizar bundle gerado
npm run preview
```

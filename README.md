# Vórtice — Rede Social MVP 🌐

Plataforma de rede social moderna, completa e responsiva desenvolvida com **Django REST Framework** no backend e **React (Vite)** no frontend.

A aplicação conta com autenticação JWT, perfis públicos e privados com solicitação de seguimento, feed interativo, sistema completo de publicações (com suporte a mídias/GIFs), comentários e respostas em thread, sistema de busca global, painel de notificações e painel administrativo completo para moderação de denúncias e gerenciamento de administradores.

---

## 🚀 Funcionalidades Principais

### 👤 Autenticação & Usuários
- **Cadastro e Login:** Autenticação baseada em JSON Web Tokens (JWT) com renovação automática (*refresh token*).
- **Modo Visitante / Anônimo:** Navegação pelo feed público com proteção contextual e redirecionamento para login em ações restritas.
- **Gestão de Perfil:** Edição de nome, biografia, URLs de avatar e banner, e alternância de privacidade de perfil (público/privado).
- **Alteração de Senha & Exclusão de Conta:** Com modais de confirmação e segurança.
- **Sistema de Seguidores:** Seguir, deixar de seguir e gerenciamento de solicitações de seguimento para perfis privados.

### 📝 Publicações & Interações
- **Criação de Posts:** Publicações em texto com suporte a URLs de imagens e GIFs com pré-visualização em tempo real.
- **Feed Interativo:** Feed unificado com paginação e ordenação cronológica.
- **Curtidas & Reposts:** Interações com atualização instantânea na interface.
- **Comentários em Thread:** Visualização de comentários, criação de respostas aninhadas, curtidas e exclusão de comentários.
- **Exclusão Segura:** Permissão para autores e administradores excluírem postagens indesejadas.

### 🔍 Busca & Notificações
- **Pesquisa Global:** Busca em tempo real de publicações e usuários com abas dinâmicas e status de seguimento.
- **Central de Notificações:** Indicador visual de solicitações de seguimento pendentes com opções de aceitar ou recusar.

### 🛡️ Moderação & Painel Administrativo
- **Sistema de Denúncias:** Usuários podem denunciar posts, comentários ou perfis por motivos como spam, assédio, violência ou desinformação.
- **Painel Admin Exclusivo (`/admin`):**
  - Listagem de denúncias abertas com pré-visualização completa do conteúdo denunciado (autor, texto, mídias).
  - Ações rápidas: Concluir denúncia, excluir publicação/comentário denunciado e banir/excluir usuário.
  - Cadastro de novos administradores diretamente pela interface.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.10+**
- **Django 5.x**
- **Django REST Framework (DRF)**
- **Simple JWT** (Autenticação JWT)
- **django-cors-headers** (Integração CORS)
- **SQLite / PostgreSQL** (Banco de dados)

### Frontend
- **React 18 / 19** com **Vite**
- **React Router DOM v6** (Navegação SPA)
- **Axios** (Cliente HTTP com interceptors de autenticação)
- **Vanilla CSS Moderno** (Design system com CSS Variables, Glassmorphism, Dark Mode e Design Responsivo)
- **SVGs Otimizados** (Ícones padronizados e dimensionados)

---

## 📂 Estrutura do Repositório

```text
Rede-social-MVP/
├── backend/                  # API REST em Django
│   ├── manage.py
│   ├── config/               # Configurações do Django (settings, urls)
│   ├── authentication/       # App de login, registro e tokens
│   ├── users/                # App de perfis, seguimento e privacidade
│   ├── posts/                # App de publicações, curtidas e reposts
│   ├── comments/             # App de comentários e respostas
│   ├── search/               # App de busca de usuários e posts
│   └── reports/              # App de denúncias e moderação
│
├── frontend/                 # Aplicação SPA em React
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── assets/           # Ícones SVG e imagens do sistema
│   │   ├── components/       # Componentes reutilizáveis (PostCard, LeftSidebar, Modais, etc.)
│   │   ├── contexts/         # Context API (AuthContext)
│   │   ├── pages/            # Telas (Home, Profile, Search, Notifications, AdminDashboard, Signin, Signup)
│   │   ├── services/         # Configuração da API (Axios com interceptors)
│   │   └── utils/            # Funções utilitárias (formatação de data, URLs de imagem)
│   └── README.md             # Documentação técnica detalhada do frontend
│
└── README.md                 # Documentação geral do projeto
```

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- [Python 3.10+](https://www.python.org/) instalado
- [Node.js 18+](https://nodejs.org/) e npm instalados
- [Git](https://git-scm.com/) instalado

---

### 2. Configurando e Rodando o Backend

1. Acesse o diretório `backend`:
   ```bash
   cd backend
   ```

2. Crie e ative um ambiente virtual:
   ```bash
   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate

   # Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. Instale as dependências:
   ```bash
   pip install django djangorestframework djangorestframework_simplejwt django-cors-headers
   ```

4. Execute as migrações do banco de dados:
   ```bash
   python manage.py migrate
   ```

5. (Opcional) Crie um superusuário para acessar o painel administrativo:
   ```bash
   python manage.py createsuperuser
   ```

6. Inicie o servidor Django:
   ```bash
   python manage.py runserver
   ```
   A API ficará disponível em `http://localhost:8000/`.

---

### 3. Configurando e Rodando o Frontend

1. Em outro terminal, acerte o diretório `frontend`:
   ```bash
   cd frontend
   ```

2. Instale os pacotes npm:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:5173/`.

---

## 📡 Visão Geral dos Principais Endpoints da API

| Módulo | Método | Endpoint | Descrição |
|---|---|---|---|
| **Autenticação** | `POST` | `/api/auth/register/` | Criação de nova conta |
| | `POST` | `/api/auth/login/` | Autenticação e obtenção dos tokens JWT |
| | `POST` | `/api/auth/refresh/` | Renovação do token de acesso expirado |
| | `POST` | `/api/logout/` | Invalidação de sessão |
| **Usuários** | `GET` | `/api/users/me/` | Dados do usuário autenticado |
| | `PUT/PATCH` | `/api/users/me/` | Atualização de perfil |
| | `PUT/PATCH` | `/api/users/me/update_passwd/` | Alteração de senha |
| | `DELETE` | `/api/users/me/delete/` | Exclusão de conta |
| | `GET` | `/api/users/info/<username>/` | Perfil público de um usuário |
| | `POST` | `/api/users/follow/<username>/` | Seguir / Deixar de seguir |
| | `GET` | `/api/users/follow/requests/list/` | Listar solicitações de seguimento pendentes |
| | `POST` | `/api/users/follow/accept/<username>/` | Aceitar solicitação de seguimento |
| | `POST` | `/api/users/follow/reject/<username>/` | Rejeitar solicitação de seguimento |
| **Posts** | `GET` | `/api/posts/` | Feed global com paginação |
| | `POST` | `/api/posts/create/` | Publicar novo post |
| | `GET` | `/api/posts/info/<id>/` | Detalhes e comentários de um post |
| | `POST` | `/api/posts/like/<id>/` | Curtir / Descurtir post |
| | `POST` | `/api/posts/repost/<id>/` | Repostar / Desfazer repost |
| | `DELETE` | `/api/posts/delete/<id>/` | Excluir post |
| **Comentários** | `POST` | `/api/comments/create/` | Criar comentário ou resposta |
| | `POST` | `/api/comments/like/<id>/` | Curtir / Descurtir comentário |
| | `DELETE` | `/api/comments/delete/<id>/` | Excluir comentário |
| **Busca** | `GET` | `/api/search/posts/<query>/` | Busca textual em posts |
| | `GET` | `/api/search/users/<query>/` | Busca de perfis |
| **Moderação** | `POST` | `/api/reports/posts/create/` | Denunciar post |
| | `POST` | `/api/reports/comments/create/` | Denunciar comentário |
| | `POST` | `/api/reports/users/create/` | Denunciar usuário |
| | `GET` | `/api/reports/open/` | Listar denúncias abertas (Admin) |
| | `POST` | `/api/reports/<id>/conclude/` | Concluir denúncia (Admin) |

---

## 📱 Responsividade e Experiência do Usuário

A interface foi projetada com layout responsivo fluido adaptado para três faixas de dispositivos:
- **Desktop (> 1024px):** Barra de navegação lateral completa com rótulos e botão de ação rápida, cabeçalhos de 64px com 24px de espaçamento, container central de 750px com foco na leitura.
- **Tablet (769px a 1024px):** Barra lateral compactada inteligente com ícones centralizados para máxima eficiência de espaço.
- **Mobile (≤ 768px):** Barra de navegação inferior fixa com efeito de vidro (*glassmorphism*), cabeçalhos de 56px perfeitamente ajustados e formulários otimizados para toque.

---

## 📄 Licença

Projeto desenvolvido para fins educacionais e de demonstração prática de arquitetura Full Stack com Django e React.

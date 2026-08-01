# Rede-social-MVP

Projeto de uma rede social MVP desenvolvida com **Django** no backend e **React** no frontend.

A aplicação permite criar conta, fazer login, acessar um feed de publicações, interagir com posts e comentários, seguir usuários e editar o próprio perfil.

---

## O que esse projeto faz

Este projeto implementa uma rede social básica com as seguintes funcionalidades:

- Cadastro de usuários
- Login com autenticação JWT
- Atualização de perfil
- Visualização de perfis de outros usuários
- Seguir e deixar de seguir usuários
- Criar, visualizar, curtir, repostar e excluir posts
- Criar, visualizar, curtir e excluir comentários
- Feed global com publicações recentes
- Busca de posts e usuários
- Logout com invalidação do token de refresh

---

## Tecnologias utilizadas

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT
- django-cors-headers

### Frontend
- React

---

## Estrutura do projeto

- `backend/` → API em Django
- `frontend/` → Interface em React

---

## Como rodar o projeto

## 1. Backend

### Requisitos
- Python instalado
- Ambiente virtual recomendado

### Instalar dependências
Dentro da pasta `backend`:

```bash
pip install Django djangorestframework djangorestframework_simplejwt django-cors-headers
```

### Rodar o backend
Ainda dentro da pasta `backend`:

```bash
python manage.py runserver
```

A API ficará disponível, por padrão, em:

```bash
http://127.0.0.1:8000/
```

---

## 2. Frontend

### Requisitos
- Node.js instalado
- Gerenciador de pacotes como npm ou yarn

### Instalar dependências
Dentro da pasta `frontend`:

```bash
npm install
```

ou

```bash
yarn install
```

### Rodar o frontend
Ainda dentro da pasta `frontend`:

```bash
npm run dev
```

ou, se o projeto usar React com CRA:

```bash
npm start
```

---

## Configuração necessária

O frontend consome a API do backend.  
Se necessário, ajuste a URL base da API no frontend para apontar para o backend local, por exemplo:

```bash
http://127.0.0.1:8000
```

Também verifique se o backend está com CORS configurado corretamente para permitir requisições do frontend.

---

## Principais endpoints da API

### Autenticação pública
- `POST /api/auth/register/` → cadastro
- `POST /api/auth/login/` → login
- `POST /api/auth/refresh/` → renovar access token

### Usuário
- `GET /api/users/me/` → dados do usuário logado
- `PUT/PATCH /api/users/me/` → atualizar perfil
- `PUT/PATCH /api/users/me/update_passwd/` → alterar senha
- `DELETE /api/users/me/delete/` → deletar conta
- `GET /api/users/info/<username>/` → perfil de outro usuário
- `POST /api/users/follow/<username>/` → seguir/deixar de seguir

### Posts
- `POST /api/posts/create/` → criar post
- `GET /api/posts/` → feed global
- `GET /api/posts/info/<id>` → detalhes de um post
- `POST /api/posts/like/<id>/` → curtir/descurtir
- `POST /api/posts/repost/<id>/` → repostar/desfazer repost
- `DELETE /api/posts/delete/<id>/` → excluir post

### Comentários
- `POST /api/comments/create/` → criar comentário
- `GET /api/comments/info/<id>` → detalhes de comentário
- `POST /api/comments/like/<id>/` → curtir comentário
- `DELETE /api/comments/delete/<id>/` → excluir comentário

### Busca
- `GET /api/search/posts/<search>/` → buscar posts
- `GET /api/search/users/<search>/` → buscar usuários

---

## Observações

- O acesso às rotas privadas exige o cabeçalho:
  `Authorization: Bearer <token>`
- O access token dura cerca de 30 minutos
- O refresh token dura cerca de 2 dias
- A paginação padrão do feed é de 10 posts, e a busca geralmente retorna 5 itens por página

---

## Funcionalidades previstas no frontend

O frontend também contempla telas e fluxos como:

- Timeline/feed
- Página de perfil
- Edição de perfil
- Curtidas e reposts
- Comentários
- Módulo de denúncias
- Mensagens diretas
- Área administrativa

Algumas dessas partes podem estar parcialmente simuladas no frontend, caso o endpoint correspondente ainda não exista no backend.

---

## Licença

Projeto acadêmico/MVP. Ajuste conforme a necessidade do repositório.

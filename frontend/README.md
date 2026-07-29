# Documentação de API - Frontend Vórtice MVP

Este README serve como guia das rotas de API que o frontend espera consumir do backend.

## API Contract (Resumo das Rotas e Respostas Esperadas)

Aqui está o formato JSON de contrato que deve ser implementado pela equipe de Backend.

### 1. Autenticação
- **POST `/auth/login`**
  - **Payload:** `{ "email": "...", "password": "..." }`
  - **Resposta:**
    ```json
    {
      "token": "jwt_token_here",
      "refreshToken": "refresh_token_here",
      "user": {
        "id": 1,
        "name": "Nome",
        "username": "usuario",
        "avatar_url": null,
        "is_staff": false,
        "is_private": false
      }
    }
    ```

- **GET `/users/me`**
  - **Resposta:** O mesmo objeto `user` acima, acrescido de métricas:
    ```json
    {
      "id": 1,
      "name": "Nome",
      "username": "usuario",
      "bio": "Bio aqui",
      "avatar_url": null,
      "banner_url": null,
      "is_staff": false,
      "is_private": false,
      "posts_count": 10,
      "followers_count": 50,
      "following_count": 20,
      "created_at": "2023-01-01T00:00:00Z"
    }
    ```

- **PUT `/users/me/privacy`**
  - **Resposta:** `{ "is_private": true }`

### 2. Posts (Publicações)
- **GET `/posts/timeline`**
  - **Resposta:**
    ```json
    [
      {
        "id": 1,
        "content": "Texto do post",
        "media_url": null,
        "comments_count": 5,
        "reposts_count": 2,
        "likes_count": 10,
        "isLiked": false,
        "isReply": false,
        "author": {
          "name": "Nome do Autor",
          "username": "autor123",
          "avatar_url": null
        },
        "created_at": "2024-01-01T10:00:00Z"
      }
    ]
    ```

- **POST `/posts`**
  - **Payload:** `multipart/form-data` com `content` e `media` (file).
  - **Resposta:** O objeto do post recém criado (mesmo formato da timeline).

- **POST `/posts/:id/like`**
  - **Resposta:** `{ "isLiked": true, "likes_count": 11 }`

- **POST `/posts/:id/repost`**
  - **Resposta:** `{ "isReposted": true, "reposts_count": 3 }`

- **GET `/posts/:id/comments`**
  - **Resposta:** Lista de objetos de comentário (similar a post).

- **POST `/posts/:id/comments`**
  - **Payload:** `{ "content": "comentário aqui" }`
  - **Resposta:** O comentário recém criado.

### 3. Perfil de Usuários
- **GET `/users/:username`**
  - **Resposta:**
    ```json
    {
      "id": 2,
      "name": "Outro Usuário",
      "username": "outro",
      "bio": "...",
      "avatar_url": null,
      "banner_url": null,
      "is_private": false,
      "posts_count": 5,
      "followers_count": 100,
      "following_count": 10,
      "isFollowing": false,
      "isMutualFollow": false,
      "created_at": "2023-05-01T00:00:00Z"
    }
    ```

- **GET `/users/:username/posts`**
  - **Resposta:** Lista de posts (formato idêntico ao timeline).

- **POST `/users/follow`**
  - **Payload:** `{ "username": "outro" }`
  - **Resposta:** `{ "isFollowing": true }`

- **PUT `/users/me/edit`**
  - **Payload:** `multipart/form-data` com `name`, `bio`, `avatar`, `banner`.
  - **Resposta:** O objeto atualizado de `user`.

### 4. Busca
- **GET `/search?q=termo`**
  - **Resposta:**
    ```json
    {
      "users": [ { "id": 1, "name": "...", "username": "...", "bio": "...", "avatar_url": null, "isFollowing": false } ],
      "posts": [ /* Lista de posts padrão */ ]
    }
    ```

### 5. Denúncias (Reports) e Admin
- **POST `/reports/posts`** e **POST `/reports/users`**
  - **Payload:** Motivos da denúncia.
  - **Resposta:** `{ "success": true }`

- **GET `/admin/reports`**
  - **Resposta:**
    ```json
    [
      {
        "id": 101,
        "type": "POST",
        "target_id": 5,
        "reason": "spam",
        "description": "Texto suspeito",
        "status": "pending",
        "reporter": { "name": "Joao", "username": "joao" }
      }
    ]
    ```

- **POST `/admin/reports/:id/resolve`** e **POST `/admin/users/:username/ban`**
  - **Resposta:** `{ "success": true }`

### 6. Mensagens Diretas (DMs)
- **GET `/messages/conversations`**
  - **Resposta:**
    ```json
    [
      {
        "id": 1,
        "name": "Maria Silva",
        "username": "maria_silva",
        "avatar_url": null,
        "lastMessage": "Haha, concordo."
      }
    ]
    ```

- **GET `/messages/history/:username`**
  - **Resposta:**
    ```json
    [
      {
        "id": 1,
        "sender": "maria_silva",
        "text": "Você viu aquela nova feature?",
        "timestamp": "2024-01-01T15:00:00Z"
      }
    ]
    ```

- **POST `/messages/:username`**
  - **Payload:** `{ "text": "minha mensagem" }`
  - **Resposta:** O objeto da mensagem recém criada.

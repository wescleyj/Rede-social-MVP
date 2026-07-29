## Esquema da API

### Rotas Públicas

**POST `api/auth/register/`** (Cadastro)
*	**Corpo da Requisição (JSON):**
     *	`name` (string)
     *	`username` (string)
     *	`email` (string)
     *	`password` (string)
     *  `bio` (string, optional)
     *  `avatar_url` (string, optional)
     *  `banner_url` (string, optional)
*	**Retorno Esperado:** `201 Created` ou erro `409 Conflict`.

**POST `api/auth/login/`** (Autenticação)
*	**Corpo da Requisição (JSON):**
     *	`username` (string)
     *	`password` (string)
*	**Retorno Esperado:** `200 OK` ou erro `401 Unauthorized`.
     *	`refresh: token` (string)
     *  `access: token` (string)
     > O access token dura 30 minutos, e o refresh token dura 2 dias.
---

### Rotas Privadas

*Todas as rotas exigem o cabeçalho: `Authorization: Bearer <token>`*

**POST `api/auth/refresh/`** (Atualiza o token de acesso)
*    **Corpo da Requisição(JSON):**
     *   `Refresh` (string)
*    **Retorno Esperado:** `200 OK` or `401 Unauthorized`.
     *	`refresh: token` (string)
     *  `access: token` (string)

**POST `api/logout/`** (Invalida o token de Refresh)
*    **Corpo da Requisição(JSON):**
     *   `Refresh` (string)
*    **Retorno Esperado:** `205 Reset Content` or `400 Bad Request`.
     *	`refresh: token` (string)
     *  `access: token` (string)

**PUT or PATCH `api/users/me/update/`** (Atualizer informações do usuário)
*	**Corpo da Requisição (JSON):**
     *	`name` (string)
     *  `username` (string)
     *	`email` (string)
     *  `bio` (string)
     *  `avatar_url` (string)
     *  `banner_url` (string)
*	**Retorno Esperado:** `200 OK` or `400 Bad Request`.

**PUT or PATCH `api/users/me/update_passwd/`** (Atualizer senha do usuário)
*	**Corpo da Requisição (JSON):**
     *	`current_password` (string)
     *	`new_password` (string)
*	**Retorno Esperado:** `200 OK` or `400 Bad Request`.
     *	`id` (string)
     *  `username` (string)

**POST `api/posts/create/`** (Cria um post novo)
*    **Corpo da Requisição(JSON):**
     * `content` (string)
     * `media_url` (string, optional)
*    **Retorno Esperado:** `201 Created`.
     *	`id` (string/number)
     *	`author` (object): Contém: `name`, `username` e `avatar_url`
     *	`content` (string)
     *	`media_url` (string)
     *	`created_at` (string): Formato ISO 8601.
     *	`likes_count` (string/number)
     *	`reposts_count` (string/number)
     *	`comments_count` (string/number)

**GET `api/users/me`** (Dados do Perfil Logado)
*	**Retorno Esperado (JSON):**
     *	`name` (string)
     *	`username` (string)
     *	`bio` (string)
     *	`created_at` (string): Formato ISO 8601.
     *	`following_count` (number)
     *	`followers_count` (number)
     *	`posts_count` (number)
     *	`avatar_url` (string)
     *	`banner_url` (string)

**GET `api/posts`** (Feed Global - Publicações Mais Recentes)
*	**Retorno Esperado:** Array de objetos JSON, onde cada objeto contém:
     *	`id` (string/number)
     *	`content` (string)
     *	`media_url` (string)
     *	`comments_count` (number)
     *	`reposts_count` (number)
     *	`likes_count` (number)
     *	`author` (object): Contém `name`, `username` e `avatar_url`.

**GET `api/users/me/posts`** (Publicações do Usuário Logado)
*	**Retorno Esperado:** Array de objetos JSON idêntico ao da rota `/posts`.
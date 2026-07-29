Projeto desenvolvido em `Python 3.14`

para instalar as dependencias: `pip install Django djangorestframework djangorestframework_simplejwt`

para rodar: `python manage.py runserver`
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
     *  `id` (string)
     *	`username` (string)
     *	`name` (string)
     *	`email` (string)
     *	`bio` (string)
     *	`created_at` (string): Formato ISO 8601.
     *	`avatar_url` (string)
     *	`banner_url` (string)

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
*    **Retorno Esperado:** `205 Reset Content`.
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
*	**Retorno Esperado:** `200 OK` or `403 Forbidden`.
     *	`id` (string)
     *  `username` (string)

**GET `api/users/me`** (Dados do Perfil Logado)
*	**Retorno Esperado (JSON):**
     *	`email` (string)
     *	`username` (string)
     *	`name` (string)
     *	`bio` (string)
     *	`created_at` (string): Formato ISO 8601.
     *	`following_count` (string/number)
     *	`followers_count` (string/number)
     *	`posts_count` (string/number)
     *	`avatar_url` (string/URL)
     *	`banner_url` (string/URL)

**GET `api/users/info/<str:username>`** (Dados do perfil especificado)
*	**Retorno Esperado (JSON):**
     *	`email` (string)
     *	`username` (string)
     *	`name` (string)
     *	`bio` (string)
     *	`created_at` (string): Formato ISO 8601.
     *	`following_count` (string/number)
     *	`followers_count` (string/number)
     *	`posts_count` (string/number)
     *	`avatar_url` (string/URL)
     *	`banner_url` (string/URL)

**POST `api/users/follow/<str:username>/`** (Segue ou para de seguir o usuário)
*    **Retorno Esperado:** `200 OK` or `404 Not Found`.
     *	`Success: Followed @<str:username>` (string)
     *  `Success: Unfollowed @<str:username>` (string)

**POST `api/posts/create/`** (Cria um post novo)
*    **Corpo da Requisição(JSON):**
     * `content` (string)
     * `media_url` (string, optional)
*    **Retorno Esperado:** `201 Created`.
     *	`id` (string)
     *	`author` (object): Contém: `name`, `username` e `avatar_url`
     *	`content` (string)
     *	`media_url` (string)
     *	`created_at` (string): Formato ISO 8601.
     *	`likes_count` (string/number)
     *	`reposts_count` (string/number)
     *	`comments_count` (string/number)

**GET `api/posts/info/<int:id>`** (Informações sobre um post específico)
*	**Retorno Esperado:** Array de objetos JSON, onde cada objeto contém:
     *	`id` (string)
     *	`author` (object): Contém `name`, `username` e `avatar_url`.
     *	`content` (string)
     *	`media_url` (string)
     *	`likes_count` (number)
     *	`reposts_count` (number)
     *	`comments_count` (number)

**GET `api/posts`** (Feed Global - Publicações Mais Recentes)
*	**Retorno Esperado:** Array de objetos JSON, onde cada objeto contém:
     *	`id` (string)
     *	`content` (string)
     *	`media_url` (string)
     *	`comments_count` (number)
     *	`reposts_count` (number)
     *	`likes_count` (number)
     *	`author` (object): Contém `name`, `username` e `avatar_url`.

**GET `api/users/me/posts`** (Publicações do Usuário Logado)
*	**Retorno Esperado:** Array de objetos JSON idêntico ao da rota `/posts`.
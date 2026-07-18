## Esquema da API

### Rotas Públicas

**POST `/users`** (Cadastro)
*	**Corpo da Requisição (JSON):**
     *	`name` (string)
     *	`username` (string)
     *	`email` (string)
     *	`password` (string)
*	**Retorno Esperado:** `201 Created` ou erro `409 Conflict`.

**POST `/auth/login`** (Autenticação)
*	**Corpo da Requisição (JSON):**
     *	`email` (string)
     *	`password` (string)
*	**Retorno Esperado:** `200 OK`
     *	`token` (string)

---

### Rotas Privadas

*Todas as rotas exigem o cabeçalho: `Authorization: Bearer <token>`*

**GET `/users/me`** (Dados do Perfil Logado)
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

**GET `/posts`** (Feed Global - Publicações Mais Recentes)
*	**Retorno Esperado:** Array de objetos JSON, onde cada objeto contém:
     *	`id` (string/number)
     *	`content` (string)
     *	`media_url` (string)
     *	`comments_count` (number)
     *	`reposts_count` (number)
     *	`likes_count` (number)
     *	`author` (object): Contém `name`, `username` e `avatar_url`.

**GET `/users/me/posts`** (Publicações do Usuário Logado)
*	**Retorno Esperado:** Array de objetos JSON idêntico ao da rota `/posts`.
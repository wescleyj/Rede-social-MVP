## Esquema da API

Abaixo estão os caminhos e as propriedades mapeadas com base na integração do frontend.

### Rotas Públicas

**POST `/users`** (Cadastro)
*   **Corpo da Requisição (JSON):**
    *   `nome` (string)
    *   `usuario` (string)
    *   `email` (string)
    *   `password` (string)
*   **Retorno Esperado:** Confirmação de criação ou erro `409 Conflict` (E-mail ou usuário já existente).

**POST `/users`** (Autenticação)
*   **Corpo da Requisição (JSON):**
    *   `email` (string)
    *   `password` (string)
*   **Retorno Esperado:**
    *   `token` (string): JWT ou token de sessão gerado pelo backend.

---

### Rotas Privadas

*Todas as rotas abaixo exigem o envio do token no cabeçalho HTTP: `Authorization: Bearer <token>`*

**GET `/users/me`** (Dados do Perfil Logado)
*   **Retorno Esperado (JSON):**
    *   `nome` (string)
    *   `usuario` (string)
    *   `bio` (string)
    *   `creation_year` (string/number)
    *   `seguindo_count` (number)
    *   `seguidores_count` (number)
    *   `publicacoes_count` (number)
    *   `avatar` (string): Nome do arquivo da imagem de perfil.
    *   `banner` (string): Nome do arquivo da imagem de capa.

**GET `/users/me/posts`** (Publicações do Usuário Logado)
*   **Retorno Esperado:** Array de objetos JSON, onde cada objeto contém:
    *   `id` (string/number)
    *   `texto` (string)
    *   `imagem` (string): Nome do arquivo de mídia anexado (opcional).
    *   `comentarios_count` (number)
    *   `reposts_count` (number)
    *   `curtidas_count` (number)
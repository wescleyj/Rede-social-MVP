# Guia de Integração e Documentação Frontend

Este documento lista todas as páginas e componentes do Frontend (React) e mapeia exatamentes quais lógicas, chamadas de API e tratamentos de erro estão sendo feitos (ou esperados) da API.

---

## 1. Autenticação e Sessão Global (Context API)
Gerencia o usuário logado e protege as rotas. 

*   **Verificação de Sessão (Ao carregar a página)**
    *   **Rota Chamada:** `GET /api/users/me/`
    *   **Envio:** Apenas o cabeçalho `Authorization: Bearer <token>`
    *   **Retorno Esperado:** `200 OK` com `{ username, name, bio, email, avatar_url, banner_url, ... }`
    *   **Tratamento:** Se o token for inválido, o frontend tentará atualizar o token. Caso falhe, desloga o usuário.
*   **Logout**
    *   **Rota Chamada:** `POST /api/logout/`
    *   **Envio:** `{ refresh: "<token_refresh>" }`
    *   **Tratamento:** Limpa o armazenamento local do navegador e redireciona o usuário.

---

## 2. Página: Cadastro (Sign Up)
*   **Ação:** Criar conta de usuário.
*   **Rota Chamada:** `POST /api/auth/register/`
*   **Payload (Frontend envia):** 
    ```json
    {
      "name": "Nome Completo",
      "username": "usuario123",
      "email": "email@teste.com",
      "password": "senha"
    }
    ```
*   **Retorno Esperado:** `201 Created`
*   **Tratamento de Erros:** O Frontend espera capturar o código `409 Conflict` caso o e-mail ou nome de usuário já existam, exibindo uma mensagem de erro vermelha no formulário.

---

## 3. Página: Login (Sign In)
*   **Ação:** Entrar na plataforma.
*   **Rota Chamada:** `POST /api/auth/login/`
*   **Payload:** `{ "username": "usuario123", "password": "123" }`
*   **Retorno Esperado:** `200 OK`
    ```json
    {
      "access": "jwt_access_token",
      "refresh": "jwt_refresh_token"
    }
    ```
*   **Tratamento de Erros:** Captura erro `401 Unauthorized` (senha ou usuário inválidos) e informa no formulário.

---

## 4. Página Inicial (Home / Timeline)
*   **Ação:** Carregar Feed de Publicações mais recentes da plataforma.
*   **Rota Esperada:** `GET /api/posts/`
*   **Retorno Esperado:** 
    ```json
    [
      {
        "id": 1,
        "content": "Texto do post",
        "media_url": "link-opcional.jpg",
        "comments_count": 5,
        "reposts_count": 10,
        "likes_count": 20,
        "isLiked": false,
        "isReply": false,
        "author": { "name": "Nome", "username": "user", "avatar_url": "link" },
        "created_at": "2026-07-27T10:00:00Z"
      }
    ]
    ```
*   **Tratamento de Erros:** Se a API não existir ou falhar (`404` ou `500`), a Home exibe "mocks" (posts fictícios inseridos no código) para o layout não quebrar.

---

## 5. Página: Perfil de Usuário
Página dinâmica, exibe o perfil do usuário logado ou de terceiros (`/profile/<username>`).

*   **Ação 1: Buscar Informações do Perfil**
    *   **Rota:** `GET /api/users/info/<username>/` (ou `/api/users/me/` se for o próprio perfil).
    *   **Retorno:** Objeto contendo nome, bio, `followers_count`, `following_count` e foto.
    *   **Tratamento:** Fallback para mock caso dê `404 Not Found`.

*   **Ação 2: Seguir / Deixar de Seguir**
    *   **Rota:** `POST /api/users/follow/<username>/`
    *   **Ação Frontend:** O botão alterna de "Seguir" para "Seguindo" instantaneamente. Em caso de falha da requisição, exibe um `alert` avisando do erro.

*   **Ação 3: Editar Perfil (Apenas dono da conta)**
    *   **Rota:** `PUT /api/users/me/`
    *   **Payload:** Atualização dos campos (`bio`, `username`, `email`, `avatar_url`).
    *   **Tratamento:** Ao dar sucesso (200 OK), a página recarrega os dados globais. Em caso de erro, um `alert` notifica o usuário.

*   **Ação 4: Carregar Feed do Perfil**
    *   **Rota Esperada:** `GET /api/users/me/posts/` ou `/api/users/posts/<username>/`
    *   **Retorno:** Array de Posts semelhante à Home.

---

## 6. Componente: PostCard (Card de Publicação)
Componente reutilizável responsável por exibir a postagem e controlar as interações.

*   **Ação 1: Curtir**
    *   **Rota:** `POST /api/posts/like/<id>/`
    *   **Tratamento:** O número na tela sobe ou desce instantaneamente com a ação. O Frontend assume sucesso silencioso; se der erro, loga no console.
*   **Ação 2: Repostar**
    *   **Rota:** `POST /api/posts/repost/<id>/`
    *   **Tratamento:** Semelhante à curtida.
*   **Ação 3: Ler e Enviar Comentários (PENDENTE)**
    *   **Rota Leitura:** `GET /api/posts/<id>/comments/`
    *   **Rota Envio:** `POST /api/posts/<id>/comments/`
    *   **Payload de Envio:** `{ "text": "Meu comentário" }`

---

## 7. Modal de Denúncias (Report)
Funciona tanto em Perfil de usuários quanto em Posts.

*   **Ação: Denunciar Conteúdo**
    *   **Rota Esperada:** `POST /api/reports/users/` ou `POST /api/reports/posts/`
    *   **Payload Esperado:** `{ "target_id": 123, "reason": "spam", "details": "texto livre" }`
    *   **Tratamento:** Atualmente o formulário apenas simula o envio via um falso `alert` de sucesso e fecha o Modal, pois não há endpoint no backend.

---

## 8. Página: Mensagens Diretas (DMs)
O chat privado (`/messages`) entre usuários que se seguem mutuamente.

*   **Ação 1: Carregar Conversas**
    *   **Rota Esperada:** `GET /api/messages/conversations/`
    *   **Retorno:** Lista de contatos recentes e prévia da última mensagem.
*   **Ação 2: Carregar Histórico e Enviar Mensagem**
    *   **Rota Esperada (Ler):** `GET /api/messages/history/<username>/`
    *   **Rota Esperada (Enviar):** `POST /api/messages/<username>/`
    *   **Payload de Envio:** `{ "content": "Olá" }`
    *   **Tratamento:** Como essas rotas não existem no Backend, o frontend usa conversas de mentirinha (mocks) limitadas aos IDs de teste.

---

## 9. Página: Admin Dashboard
Tela exclusiva `/admin` onde a moderação ocorre. Exige que o usuário atual tenha a flag (ex: `is_admin = True`).

*   **Ação 1: Listar Denúncias**
    *   **Rota Esperada:** `GET /api/admin/reports/`
*   **Ação 2: Resolver Denúncia**
    *   **Rota Esperada:** `POST /api/admin/reports/<id>/resolve/`
*   **Ação 3: Banir Usuário**
    *   **Rota Esperada:** `POST /api/admin/users/<username>/ban/`
    *   **Tratamento:** Apenas simula o envio e apaga a denúncia da tabela visual no frontend para não travar o teste do sistema.

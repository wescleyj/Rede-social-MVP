import React, {useRef, useState} from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import '../../styles/auth.css';

export default function SignUp() {
  // Referências dos campos do formulário de cadastro
  const inputEmail = useRef();
  const inputNome = useRef();
  const inputUsername = useRef();
  const inputSenha = useRef();
  const [mensagem, setMensagem] = useState();
  const [isLoading, setIsLoading] = useState(false);

  // Lida com o cadastro de uma nova conta de usuário, tratando validações e erros
  async function createUser(e) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setMensagem(null);
    try {
      await api.post('/api/auth/register/', {
        name: inputNome.current.value.trim(),
        username: inputUsername.current.value.trim(),
        email: inputEmail.current.value.trim(),
        password: inputSenha.current.value
      })
      setMensagem({tipo: 'sucesso', texto: 'Sucesso na criação do usuário. Você já pode fazer login!'});
      e.target.reset();
    } catch (error) {
      console.error(error)

      // Mapeia mensagens de erro com base na resposta do servidor
      if (error.response?.status === 409) {
        setMensagem({tipo: 'erro', texto: 'Erro: email ou usuário já existente.'});
      } else if (error.response?.data?.message) {
        setMensagem({tipo: 'erro', texto: error.response.data.message});
      } else if (error.response?.data?.detail) {
        setMensagem({tipo: 'erro', texto: error.response.data.detail});
      } else {
        setMensagem({tipo: 'erro', texto: 'Erro desconhecido ao criar usuário.'});
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="logo">
              <div className="logo-circle"></div>
              <span>Vórtice</span>
            </div>
            <h1>Crie sua conta</h1>
            <p>Leva menos de um minuto e é grátis.</p>
          </div>

          <div className="auth-body">
            {mensagem && <p className={mensagem.tipo}>{mensagem.texto}</p>}
          </div>

          <form className="auth-form" onSubmit={createUser}>
            <div className="input-group">
              <label>Nome</label>
              <input type="text" placeholder="Como você quer ser chamado" required maxLength="25" ref={inputNome} disabled={isLoading} />
            </div>

            <div className="input-group">
              <label>Usuário</label>
              <input type="text" placeholder="usuario" required maxLength="20" ref={inputUsername} disabled={isLoading} />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="voce@email.com" required maxLength="100" ref={inputEmail} disabled={isLoading} />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input type="password" placeholder="••••••••••" required minLength="8" maxLength="128" ref={inputSenha} disabled={isLoading} />
            </div>
              <span className="input-hint">Mínimo 8 caracteres</span>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="divider">
            <span>ou</span>
          </div>

          <div className="auth-footer">
            Já tem conta? <Link to="/signin">Entrar</Link>
          </div>
        </div>
      </div>
  );
}

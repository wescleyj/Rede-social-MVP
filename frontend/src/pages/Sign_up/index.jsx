import React, {useRef, useState} from 'react';
import api from '../../../services/api'
import './styles.css';

export default function SignUp() {
  // Salva as informações do formulario para passar para a api
  const inputEmail = useRef();
  const inputNome = useRef();
  const inputUsername = useRef();
  const inputSenha = useRef();
  const [mensagem, setMensagem] = useState(); // Usa State para conseguir atualizar informações na pagina sem ter que recarregar

  async function createUser(e) {
    e.preventDefault();

    // Tenta criar o usuario e informa o usuario do sucesso ou fracasso
    try {
      await api.post('/users', {
        nome: inputNome.current.value,
        username: inputUsername.current.value,
        email: inputEmail.current.value,
        password: inputSenha.current.value
      })
      setMensagem({tipo: 'sucesso', texto: 'Sucesso na criação do usuário.'});
      e.target.reset() // Limpa o forms
    } catch (error) {
      console.error(error)

      // Ajustar com base no retorno do backend
      if (error.response?.status === 409) {
        setMensagem({tipo: 'erro', texto: 'Erro: email ou usuário já existente.'});
      } else if (error.response?.data?.message) {
        setMensagem({tipo: 'erro', texto: error.response.data.message});
      } else {
        setMensagem({tipo: 'erro', texto: 'Erro desconhecido ao criar usuário.'});
      }
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

          {/* Forms de criação de usuario */}
          <form className="auth-form" onSubmit={createUser}>
            <div className="input-group">
              <label>Nome</label>
              <input type="text" placeholder="Como você quer ser chamado" required ref={inputNome} />
            </div>

            <div className="input-group">
              <label>Usuário</label>
              <input type="text" placeholder="usuario" required ref={inputUsername} />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="voce@email.com" required ref={inputEmail} />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input type="password" placeholder="••••••••••" required minLength="8" ref={inputSenha} />
            </div>
              <span className="input-hint">Mínimo 8 caracteres</span>

            <button type="submit" className="btn-primary" >Criar conta</button>
          </form>

          <div className="divider">
            <span>ou</span>
          </div>

          {/* Leva o usuario para a pagina de login caso já tenha conta */}
          <div className="auth-footer">
            Já tem conta? <a href="/signin">Entrar</a>
          </div>
        </div>
      </div>
  );
}

import React, {useRef } from 'react';
import api from '../../../services/api'
import './styles.css';

export default function SignUp() {
  const inputEmail = useRef();
  const inputNome = useRef();
  const inputUsuario = useRef();
  const inputSenha = useRef();

  async function createUser(e) {
    e.preventDefault();
    try {
      await api.post('/users', {
        nome: inputNome.current.value,
        usuario: inputUsuario.current.value,
        email: inputEmail.current.value,
        password: inputSenha.current.value
      })
      // Criar logica de avisar sucesso a credencial
    } catch (error) {
      console.error(error)
    }
  }

  return (
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-circle"></div>
            <span>Vórtice</span>
          </div>
          <h1>Crie sua conta</h1>
          <p>Leva menos de um minuto e é grátis.</p>
        </div>

        <form className="auth-form" onSubmit={createUser}>
          <div className="input-group">
            <label>Nome</label>
            <input type="text" placeholder="Como você quer ser chamado" required ref={inputNome} />
          </div>

          <div className="input-group">
            <label>Usuário</label>
            <input type="text" placeholder="usuario" required ref={inputUsuario} />
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

        <div className="auth-footer">
          Já tem conta? <a href="/signin">Entrar</a>
        </div>
      </div>
  );
}
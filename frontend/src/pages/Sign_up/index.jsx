import React, { useState } from 'react';
import './styles.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Exemplo de integração com Django REST
    /*
    try {
        const response = await fetch('/api/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        // Redirecionar para o login
    } catch (error) {
        console.error(error);
    }
    */
  };

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

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>NOME</label>
            <input
                type="text"
                name="name"
                placeholder="Como você quer ser chamado"
                value={formData.name}
                onChange={handleChange}
                required
            />
          </div>

          <div className="input-group">
            <label>USUÁRIO</label>
            <div className="input-with-prefix">
              <span className="prefix">@</span>
              <input
                  type="text"
                  name="username"
                  placeholder="usuario"
                  value={formData.username}
                  onChange={handleChange}
                  required
              />
            </div>
          </div>

          <div className="input-group">
            <label>EMAIL</label>
            <input
                type="email"
                name="email"
                placeholder="voce@email.com"
                value={formData.email}
                onChange={handleChange}
                required
            />
          </div>

          <div className="input-group">
            <label>SENHA</label>
            <input
                type="password"
                name="password"
                placeholder="••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
            />
            <span className="input-hint">Mínimo 8 caracteres</span>
          </div>

          <button type="submit" className="btn-primary">Criar conta</button>
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
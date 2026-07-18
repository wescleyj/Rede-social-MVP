import React, { useRef } from 'react';
import api from '../../../services/api'
import './styles.css';

export default function SignIn() {
    const inputEmail = useRef();
    const inputPassword = useRef();

    async function checkUser(e) {
        e.preventDefault();
        try {
            await api.post('/users', {
                email: inputEmail.current.value,
                password: inputPassword.current.value
            });
            // Criar logica de salvar a credencial
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
                <h1>Bem-vindo de volta</h1>
                <p>Entre para continuar a conversa.</p>
            </div>

            <form className="auth-form" onSubmit={checkUser}>
                <div className="input-group">
                    <label>E-mail</label>
                    <input type="email" placeholder="email@email.com" required ref={inputEmail} />
                </div>
                <div className="input-group">
                    <label>Senha</label>
                    <input type="password" placeholder="********" required ref={inputPassword} />
                </div>
                <input type="submit" className="btn-primary" value="Enviar" />
            </form>

            <div className="divider">
                <span>ou</span>
            </div>

            <div className="auth-footer">
                Novo por aqui? <a href="/signup">Crie uma conta</a>
            </div>
        </div>
    );
}
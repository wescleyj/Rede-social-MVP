import React, { useState } from 'react';
import './styles.css';

export default function SignIn() {
    const [formData, setFormData] = useState({
        identifier: '',
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
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            // Processar autenticação/token
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
                <h1>Bem-vindo de volta</h1>
                <p>Entre para continuar a conversa.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label>EMAIL OU @USUÁRIO</label>
                    <input
                        type="text"
                        name="identifier"
                        placeholder="E-mail ou usuario"
                        value={formData.identifier}
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
                    />
                </div>

                <button type="submit" className="btn-primary">Entrar</button>
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
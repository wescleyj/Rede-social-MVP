import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import '../../styles/auth.css';

export default function SignIn() {
    const inputUsername = useRef();
    const inputPassword = useRef();
    const [mensagem, setMensagem] = useState(null);
    const navigate = useNavigate();

    async function checkUser(e) {
        e.preventDefault();
        setMensagem(null);

        try {
            const response = await api.post('/api/token/', {
                username: inputUsername.current.value,
                password: inputPassword.current.value
            });

            const token = response.data.access;
            if (token) {
                localStorage.setItem('token', token);
                if (response.data.refresh) {
                    localStorage.setItem('refreshToken', response.data.refresh);
                }
                navigate('/');
            } else {
                setMensagem({ tipo: 'erro', texto: 'Resposta inesperada do servidor.' });
            }
        } catch (error) {
            console.error(error);

            if (error.response?.status === 401) {
                setMensagem({ tipo: 'erro', texto: 'Usuário ou senha incorretos.' });
            } else if (error.response?.data?.detail) {
                setMensagem({ tipo: 'erro', texto: error.response.data.detail });
            } else {
                setMensagem({ tipo: 'erro', texto: 'Erro ao conectar com o servidor.' });
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
                    <h1>Bem-vindo de volta</h1>
                    <p>Entre para continuar a conversa.</p>
                </div>

                <div className="auth-body">
                    {mensagem && <p className={mensagem.tipo}>{mensagem.texto}</p>}
                </div>

                <form className="auth-form" onSubmit={checkUser}>
                    <div className="input-group">
                        <label>Usuário</label>
                        <input type="text" placeholder="seu_usuario" required ref={inputUsername} />
                    </div>
                    <div className="input-group">
                        <label>Senha</label>
                        <input type="password" placeholder="********" required ref={inputPassword} />
                    </div>
                    <input type="submit" className="btn-primary" value="Entrar" />
                </form>

                <div className="divider">
                    <span>ou</span>
                </div>

                <div className="auth-footer">
                    Novo por aqui? <Link to="/signup">Crie uma conta</Link>
                </div>
            </div>
        </div>
    );
}
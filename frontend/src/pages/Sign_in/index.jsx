import React, {useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api'
import './styles.css';

export default function SignIn() {
    // Salva os dados do forms para enviar para a API
    const inputEmail = useRef();
    const inputPassword = useRef();
    const [mensagem, setMensagem] = useState();
    const navigate = useNavigate();

    // Verifica se existe um usuario com essa senha
    async function checkUser(e) {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', {
                email: inputEmail.current.value,
                password: inputPassword.current.value
            });
            localStorage.setItem('token', response.data.token); // Salva as credenciais de login no localStorage
            navigate('/home');
        } catch (error) {
            console.error(error)

            // Ajustar com base no retorno do backend
            if (error.response?.status === 409) {
                setMensagem({tipo: 'erro', texto: 'Email ou senha incorretos'});
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
                    <h1>Bem-vindo de volta</h1>
                    <p>Entre para continuar a conversa.</p>
                </div>

                <div className="auth-body">
                    {mensagem && <p className={mensagem.tipo}>{mensagem.texto}</p>}
                </div>

                {/* Forms de Login */}
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
        </div>
    );
}
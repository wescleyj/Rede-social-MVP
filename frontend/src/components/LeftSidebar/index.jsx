import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './styles.css';
import api, { baseURL } from "../../../services/api.js";

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        async function fetchUserData() {
            try {
                const response = await api.get('/users/me');
                setUserData(response.data);
            } catch (error) {
                console.error(error);
                // Define como anônimo se a requisição falhar (ex: token inválido/expirado)
                setUserData({ name: 'Anônimo', username: 'visitante', avatar_url: null, isAnonymous: true });
            }
        }

        if (token) {
            fetchUserData();
        } else {
            // Define como anônimo imediatamente se não houver token salvo
            setUserData({ name: 'Anônimo', username: 'visitante', avatar_url: null, isAnonymous: true });
        }
    }, []);

    if (!userData) {
        return <nav className="sidebar-container">Carregando...</nav>;
    }

    return (
        <nav className="sidebar-container">
            <div className="sidebar-logo">
                <div className="logo-circle"></div>
                <span>Vórtice</span>
            </div>

            <ul className="sidebar-menu">
                <li className={location.pathname === '/' ? 'active' : ''}>
                    <Link to="/">Início</Link>
                </li>
                <li className={location.pathname === '/profile' ? 'active' : ''}>
                    <Link to="/profile">Perfil</Link>
                </li>
            </ul>

            {/* Altera o botão principal se o usuário for anônimo */}
            {!userData.isAnonymous ? (
                <button className="btn-publish">+ Publicar</button>
            ) : (
                <button className="btn-publish" onClick={() => navigate('/signin')}>Fazer Login</button>
            )}

            <div className="sidebar-user-footer">
                {userData.avatar_url ? (
                    <img
                        src={`${baseURL}/uploads/${userData.avatar_url}`}
                        alt={`Foto de perfil de ${userData.name}`}
                        className="user-avatar-small"
                    />
                ) : (
                    <div className="user-avatar-small"></div>
                )}
                <div className="user-info">
                    <span className="user-name">{userData.name}</span>
                    <span className="user-handle">{userData.username}</span>
                </div>
                <button className="btn-options">...</button>
            </div>
        </nav>
    );
}
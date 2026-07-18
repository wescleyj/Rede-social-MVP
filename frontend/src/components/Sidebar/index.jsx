import { Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './styles.css';
import api, {baseURL} from "../../../services/api.js";

export default function Sidebar() {
    const location = useLocation();
    const [userData, setUserData] = useState(null);

    // Busca os dados do usuario para preencher na sidebar(imagem de perfil e username)
    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await api.get('/users/me');
                setUserData(response.data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchUserData();
    }, []);

    // Se por algum motivo estiver não estiver conseguido carregar ou apresentar algum erro ira ficar carregando
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

            <button className="btn-publish">+ Publicar</button>

            <div className="sidebar-user-footer">
                <div className="user-avatar-small">
                    {userData.avatar ? (
                        <img
                            src={`${baseURL}/uploads/${userData.avatar}`}
                            alt={`Foto de perfil de ${userData.nome}`}
                            className="profile-avatar-small"
                        />
                    ) : (
                        <div className="profile-avatar-small"></div>
                    )}
                </div>
                <div className="user-info">
                    <span className="user-name">{userData.nome}</span>
                    <span className="user-handle">@{userData.usuario}</span>
                </div>
                <button className="btn-options">...</button>
            </div>
        </nav>
    );
}
import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { buildImageUrl } from "../../utils/buildImageUrl.js";
import api from "../../../services/api.js";
import homeIcon from "../../assets/home.svg";
import searchIcon from "../../assets/search.svg";
import bellIcon from "../../assets/bell.svg";
import userIcon from "../../assets/user.svg";
import shieldIcon from "../../assets/shield.svg";
import './styles.css';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, logout } = useContext(AuthContext);
    const [showMenu, setShowMenu] = useState(false);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

    useEffect(() => {
        // Zera notificações para usuários anônimos
        if (!userData || userData.isAnonymous) {
            setPendingRequestsCount(0);
            return;
        }

        // Busca o total de solicitações de seguimento pendentes na API
        const checkRequests = async () => {
            try {
                const response = await api.get('/api/users/follow/requests/list/');
                const results = response.data?.results || response.data || [];
                setPendingRequestsCount(Array.isArray(results) ? results.length : 0);
            } catch (err) {
                // silencioso
            }
        };

        checkRequests();
    }, [userData, location.pathname]);

    // Caso tenha problema ou esteja demorando para conseguir os dados do usuario informa status de carregamento
    if (!userData) {
        return <nav className="sidebar-container">Carregando...</nav>;
    }

    // Obtém a URL do avatar do usuário autenticado
    const avatarSrc = buildImageUrl(userData.avatar_url);

    return (
        <nav className="sidebar-container">
            <div className="sidebar-logo">
                <div className="logo-circle"></div>
                <span className="logo-text">Vórtice</span>
            </div>

            <ul className="sidebar-menu">
                <li className={location.pathname === '/' ? 'active' : ''}>
                    <Link to="/">
                        <img src={homeIcon} alt="" className="nav-icon" />
                        <span className="nav-label">Início</span>
                    </Link>
                </li>

                <li className={location.pathname.startsWith('/pesquisa') ? 'active' : ''}>
                    <Link to="/pesquisa">
                        <img src={searchIcon} alt="" className="nav-icon" />
                        <span className="nav-label">Pesquisar</span>
                    </Link>
                </li>

                <li className={location.pathname === '/notificacoes' || location.pathname === '/notifications' ? 'active' : ''}>
                    <Link 
                        to={userData.isAnonymous ? '/signin' : '/notificacoes'}
                        onClick={(e) => {
                            if (userData.isAnonymous) {
                                e.preventDefault();
                                navigate('/signin');
                            }
                        }}
                    >
                        <div className="nav-icon-wrapper">
                            <img src={bellIcon} alt="" className="nav-icon" />
                            {pendingRequestsCount > 0 && (
                                <span className="sidebar-nav-badge-dot"></span>
                            )}
                        </div>
                        <span className="nav-label">Notificações</span>
                        {pendingRequestsCount > 0 && (
                            <span className="sidebar-nav-badge">{pendingRequestsCount}</span>
                        )}
                    </Link>
                </li>

                <li className={location.pathname === '/profile' ? 'active' : ''}>
                    <Link 
                        to={userData.isAnonymous ? '/signin' : '/profile'}
                        onClick={(e) => {
                            if (userData.isAnonymous) {
                                e.preventDefault();
                                navigate('/signin');
                            }
                        }}
                    >
                        <img src={userIcon} alt="" className="nav-icon" />
                        <span className="nav-label">Perfil</span>
                    </Link>
                </li>
                
                {userData.is_superuser && (
                    <li className={location.pathname === '/admin' ? 'active' : ''}>
                        <Link to="/admin">
                            <img src={shieldIcon} alt="" className="nav-icon" />
                            <span className="nav-label">Painel Admin</span>
                        </Link>
                    </li>
                )}
            </ul>

            {!userData.isAnonymous ? (
                <button className="sidebar-btn-publish" onClick={() => { navigate('/'); window.scrollTo(0, 0); }}>+ Publicar</button>
            ) : (
                <button className="sidebar-btn-publish" onClick={() => navigate('/signin')}>Fazer Login</button>
            )}

            <div className="sidebar-user-footer" onClick={() => setShowMenu(!showMenu)}>
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={`Foto de perfil de ${userData.name}`}
                        className="user-avatar-small"
                    />
                ) : (
                    <div className="user-avatar-small"></div>
                )}
                <div className="user-info">
                    <span className="user-name">{userData.name}</span>
                    <span className="user-handle">@{userData.username}</span>
                </div>
                <button className="btn-options">...</button>

                {showMenu && !userData.isAnonymous && (
                    <div className="sidebar-dropdown-menu">
                        <button className="dropdown-item logout" onClick={(e) => {
                            e.stopPropagation();
                            logout();
                        }}>Sair de @{userData.username}</button>
                    </div>
                )}
            </div>
        </nav>
    );
}
import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { buildImageUrl } from "../../utils/buildImageUrl.js";
import './styles.css';



export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, logout, togglePrivacy } = useContext(AuthContext);
    const [showMenu, setShowMenu] = useState(false);

    if (!userData) {
        return <nav className="sidebar-container">Carregando...</nav>;
    }

    const avatarSrc = buildImageUrl(userData.avatar_url);

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

                <li className={location.pathname.startsWith('/pesquisa') ? 'active' : ''}>
                    <Link to="/pesquisa">Pesquisar</Link>
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
                        Perfil
                    </Link>
                </li>
                
                {userData.is_superuser && (
                    <li className={location.pathname === '/admin' ? 'active' : ''}>
                        <Link to="/admin">Painel Admin</Link>
                    </li>
                )}
            </ul>

            {/* Altera o botão principal se o usuário for anônimo */}
            {!userData.isAnonymous ? (
                <button className="btn-publish" onClick={() => { navigate('/'); window.scrollTo(0, 0); }}>+ Publicar</button>
            ) : (
                <button className="btn-publish" onClick={() => navigate('/signin')}>Fazer Login</button>
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
                        <button className="dropdown-item" onClick={(e) => {
                            e.stopPropagation();
                            togglePrivacy();
                        }}>
                            Conta Privada: {userData.is_private ? 'ON' : 'OFF'}
                        </button>
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
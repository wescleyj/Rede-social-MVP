import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { buildImageUrl } from '../../utils/buildImageUrl';
import './styles.css';

export default function RightSidebar() {
    const [search, setSearch] = useState("");
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        if (search.trim() !== '') {
            navigate(`/pesquisa?q=${encodeURIComponent(search.trim())}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit(e);
        }
    };

    const avatarUrl = buildImageUrl(userData?.avatar_url);
    const bannerUrl = buildImageUrl(userData?.banner_url);
    const isLoggedIn = userData && !userData.isAnonymous;

    return (
        <aside className="right-sidebar">
            {/* Barra de Pesquisa Moderna */}
            <form className="search-bar-form" onSubmit={handleSearchSubmit}>
                <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar no Vórtice..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={100}
                    />
                    {search && (
                        <button 
                            type="button" 
                            className="btn-clear-search" 
                            onClick={() => setSearch('')}
                            title="Limpar"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </form>

            {/* Card de Resumo do Perfil do Usuário */}
            {isLoggedIn && (
                <div className="sidebar-profile-card">
                    <div 
                        className="profile-card-banner" 
                        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : {}}
                    />
                    
                    <div className="profile-card-body">
                        <div 
                            className="profile-card-avatar-wrapper"
                            onClick={() => navigate('/profile')}
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={userData.name} className="profile-card-avatar" />
                            ) : (
                                <div className="profile-card-avatar-placeholder" />
                            )}
                        </div>

                        <div className="profile-card-info" onClick={() => navigate('/profile')}>
                            <h4 className="profile-card-name">{userData.name}</h4>
                            <span className="profile-card-handle">@{userData.username}</span>
                        </div>

                        {userData.bio && (
                            <p className="profile-card-bio">{userData.bio}</p>
                        )}

                        <div className="profile-card-stats">
                            <div className="stat-item" onClick={() => navigate('/profile')}>
                                <span className="stat-value">{userData.posts_count ?? 0}</span>
                                <span className="stat-label">Posts</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item" onClick={() => navigate('/profile')}>
                                <span className="stat-value">{userData.following_count ?? 0}</span>
                                <span className="stat-label">Seguindo</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item" onClick={() => navigate('/profile')}>
                                <span className="stat-value">{userData.followers_count ?? 0}</span>
                                <span className="stat-label">Seguidores</span>
                            </div>
                        </div>

                        <button 
                            className="btn-view-profile"
                            onClick={() => navigate('/profile')}
                        >
                            Ver Meu Perfil
                        </button>
                    </div>
                </div>
            )}

            {/* Rodapé Sutil e Moderno */}
            <footer className="sidebar-footer">
                <div className="footer-links">
                    <span>Termos</span>
                    <span>·</span>
                    <span>Privacidade</span>
                    <span>·</span>
                    <span>Ajuda</span>
                </div>
                <div className="footer-copyright">
                    © 2026 Vórtice MVP
                </div>
            </footer>
        </aside>
    );
}
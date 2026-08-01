import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import PostCard from '../../components/PostCard';
import './styles.css';

import { AuthContext } from '../../contexts/AuthContext';
import api from '../../../services/api.js';
import { buildImageUrl } from '../../utils/buildImageUrl.js';

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);
    
    const [searchInput, setSearchInput] = useState(query);
    const [activeTab, setActiveTab] = useState("usuarios"); // 'usuarios' | 'publicacoes'
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setSearchInput(query);
    }, [query]);

    useEffect(() => {
        let isMounted = true;
        
        async function fetchResults() {
            if (query.trim() === '') {
                setUsers([]);
                setPosts([]);
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                const [usersRes, postsRes] = await Promise.all([
                    api.get(`/api/search/users/${query}/`),
                    api.get(`/api/search/posts/${query}/`)
                ]);
                
                if (isMounted) {
                    setUsers(usersRes.data.results || usersRes.data);
                    setPosts(postsRes.data.results || postsRes.data);
                }
            } catch (err) {
                console.error("Erro na busca:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        
        fetchResults();
        
        return () => { isMounted = false; };
    }, [query]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/pesquisa?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    const handleFollowToggle = async (userParam) => {
        if (userData?.isAnonymous) {
            navigate('/signin');
            return;
        }
        try {
            await api.post(`/api/users/follow/${userParam.username}/`);
            setUsers(users.map(u => u.username === userParam.username ? { ...u, is_following: !u.is_following } : u));
        } catch (err) {
            console.error("Erro ao seguir usuário", err);
        }
    };

    return (
        <div className="layout-wrapper">
            <LeftSidebar />

            <main className="content search-main">
                <header className="search-header-container">
                    <form className="search-page-form" onSubmit={handleSearchSubmit}>
                        <div className="search-page-input-wrapper">
                            <span className="search-page-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar usuários ou publicações..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                maxLength={100}
                            />
                            {searchInput && (
                                <button 
                                    type="button" 
                                    className="btn-clear-search-page"
                                    onClick={() => setSearchInput('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </form>
                </header>

                <div className="search-tabs">
                    <button 
                        className={`search-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
                        onClick={() => setActiveTab('usuarios')}
                    >
                        Usuários
                    </button>
                    <button 
                        className={`search-tab ${activeTab === 'publicacoes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('publicacoes')}
                    >
                        Publicações
                    </button>
                </div>

                <div className="search-results">
                    {isLoading ? (
                        <div className="search-loading">Buscando...</div>
                    ) : (
                        <>
                            {query.trim() === '' ? (
                                <div className="search-empty-prompt">
                                    <p>Digite um termo no campo de busca acima para pesquisar usuários ou publicações.</p>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'usuarios' && (
                                        <div className="users-list">
                                            {users.length > 0 ? (
                                                users.map(user => (
                                                    <div key={user.username || user.id} className="search-user-card" onClick={() => navigate(`/profile/${user.username}`)}>
                                                        {user.avatar_url ? (
                                                            <img src={buildImageUrl(user.avatar_url)} alt="Avatar" className="user-avatar-large" />
                                                        ) : (
                                                            <div className="user-avatar-large"></div>
                                                        )}
                                                        <div className="user-info-search">
                                                            <div className="user-info-header">
                                                                <div className="user-names">
                                                                    <strong>
                                                                        {user.name}
                                                                        {user.is_private && (
                                                                            <svg className="icon-private-lock" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" title="Conta Privada" style={{ marginLeft: '4px', verticalAlign: 'middle', color: '#f59e0b' }}>
                                                                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                                                            </svg>
                                                                        )}
                                                                    </strong>
                                                                    <span>@{user.username}</span>
                                                                </div>
                                                                {(!userData || userData.username !== user.username) && (
                                                                    <button 
                                                                        className={`btn-follow ${user.is_following ? 'following' : ''}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleFollowToggle(user);
                                                                        }}
                                                                    >
                                                                        {user.is_following ? 'Seguindo' : 'Seguir'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p>{user.bio}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-results">Nenhum usuário encontrado para "{query}".</p>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'publicacoes' && (
                                        <div className="posts-list">
                                            {posts.length > 0 ? (
                                                posts.map(post => (
                                                    <PostCard key={post.id} post={post} />
                                                ))
                                            ) : (
                                                <p className="no-results">Nenhuma publicação encontrada para "{query}".</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

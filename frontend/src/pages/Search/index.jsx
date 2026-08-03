import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import PostCard from '../../components/PostCard';
import './styles.css';

import { AuthContext } from '../../contexts/AuthContext';
import api from '../../../services/api.js';
import { buildImageUrl } from '../../utils/buildImageUrl.js';
import LockIcon from '../../assets/lock.svg?react';

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);
    
    const [searchInput, setSearchInput] = useState(query);
    const [activeTab, setActiveTab] = useState("usuarios"); // 'usuarios' | 'publicacoes'
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [nextPostsPage, setNextPostsPage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);

    const searchObserverTarget = useRef(null);

    useEffect(() => {
        setSearchInput(query);
    }, [query]);

    useEffect(() => {
        let isMounted = true;
        
        // Busca usuários e publicações correspondentes ao termo de pesquisa
        async function fetchResults() {
            if (query.trim() === '') {
                setUsers([]);
                setPosts([]);
                setNextPostsPage(null);
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                const [usersRes, postsRes] = await Promise.all([
                    api.get(`/api/search/users/${encodeURIComponent(query)}/`),
                    api.get(`/api/search/posts/${encodeURIComponent(query)}/`)
                ]);
                
                if (isMounted) {
                    setUsers(usersRes.data.results || usersRes.data || []);
                    const postsData = postsRes.data;
                    if (postsData && postsData.results !== undefined) {
                        setPosts(postsData.results);
                        setNextPostsPage(postsData.next || null);
                    } else if (Array.isArray(postsData)) {
                        setPosts(postsData);
                        setNextPostsPage(null);
                    } else {
                        setPosts([]);
                        setNextPostsPage(null);
                    }
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

    // Carrega páginas adicionais de publicações da busca na API
    const fetchMorePosts = useCallback(async () => {
        if (!nextPostsPage || isLoadingMorePosts) return;
        setIsLoadingMorePosts(true);

        try {
            const endpoint = nextPostsPage.replace(/^.*?\/api\//, '/api/');
            const res = await api.get(endpoint);
            const data = res.data;

            if (data && data.results !== undefined) {
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = data.results.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
                setNextPostsPage(data.next || null);
            } else {
                setNextPostsPage(null);
            }
        } catch (err) {
            console.error("Erro ao carregar mais posts da busca:", err);
        } finally {
            setIsLoadingMorePosts(false);
        }
    }, [nextPostsPage, isLoadingMorePosts]);

    // Lida com a rolagem infinita dos resultados de publicações via IntersectionObserver
    useEffect(() => {
        if (activeTab !== 'publicacoes' || !nextPostsPage || isLoadingMorePosts) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextPostsPage && !isLoadingMorePosts) {
                    fetchMorePosts();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        const currentTarget = searchObserverTarget.current;
        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [activeTab, nextPostsPage, isLoadingMorePosts, fetchMorePosts]);

    // Atualiza a rota com o novo termo de pesquisa submetido no formulário
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/pesquisa?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    // Lida com o seguimento ou cancelamento de solicitação diretamente no card da busca
    const handleFollowToggle = async (userParam) => {
        if (userData?.isAnonymous) {
            navigate('/signin');
            return;
        }
        try {
            await api.post(`/api/users/follow/${userParam.username}/`);
            setUsers(users.map(u => {
                if (u.username !== userParam.username) return u;
                if (u.is_following) {
                    return { ...u, is_following: false, is_pending: false };
                } else if (u.is_private) {
                    return { ...u, is_pending: !u.is_pending, is_following: false };
                } else {
                    return { ...u, is_following: true, is_pending: false };
                }
            }));
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
                                                                            <LockIcon className="icon-private-lock" title="Conta Privada" style={{ marginLeft: '4px', verticalAlign: 'middle', color: '#f59e0b' }} />
                                                                        )}
                                                                    </strong>
                                                                    <span>@{user.username}</span>
                                                                </div>
                                                                {(!userData || userData.username !== user.username) && (
                                                                    <button 
                                                                        className={`btn-follow ${user.is_following ? 'following' : ''} ${user.is_pending ? 'pending' : ''}`}
                                                                        title={user.is_pending ? "Solicitação enviada. Clique para cancelar." : undefined}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleFollowToggle(user);
                                                                        }}
                                                                    >
                                                                        {user.is_following ? 'Seguindo' : user.is_pending ? 'Solicitado' : 'Seguir'}
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
                                                <>
                                                    {posts.map(post => (
                                                        <PostCard 
                                                            key={post.id} 
                                                            post={post} 
                                                            onPostDeleted={(deletedId) => setPosts(prev => prev.filter(p => p.id !== deletedId))}
                                                        />
                                                    ))}

                                                    <div ref={searchObserverTarget} style={{ height: '20px', width: '100%' }} />

                                                    {isLoadingMorePosts && (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: '10px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                                                            <div className="feed-spinner small"></div>
                                                            <span>Carregando mais publicações...</span>
                                                        </div>
                                                    )}

                                                    {!nextPostsPage && posts.length >= 10 && (
                                                        <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                                                            <span>Você chegou ao fim das publicações</span>
                                                        </div>
                                                    )}
                                                </>
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

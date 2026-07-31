import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from '../../components/RightSidebar';
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
    
    const [activeTab, setActiveTab] = useState("usuarios"); // 'usuarios' | 'publicacoes'
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleFollowToggle = async (userParam) => {
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
                <header className="home-header">
                    <h2>Resultados para "{query}"</h2>
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
                                                            <strong>{user.name}</strong>
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
                </div>
            </main>

            <RightSidebar />
        </div>
    );
}

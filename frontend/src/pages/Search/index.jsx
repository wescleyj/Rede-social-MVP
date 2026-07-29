import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from '../../components/RightSidebar';
import PostCard from '../../components/PostCard';
import './styles.css';

// Mocks for Search
const MOCK_SEARCH_USERS = [
    { id: 1, name: "Usuário Teste", username: "teste_front", bio: "Testando a interface", isFollowing: false },
    { id: 2, name: "Outra Pessoa", username: "pessoa_2", bio: "Falo sobre react", isFollowing: true },
    { id: 3, name: "Maria Silva", username: "maria_silva", bio: "", isFollowing: false }
];

const MOCK_SEARCH_POSTS = [
    {
        id: 1,
        content: "Procurando por testes no frontend? Achou!",
        media_url: null,
        comments_count: 5,
        reposts_count: 2,
        likes_count: 10,
        isLiked: false,
        isReply: false,
        author: {
            name: "Usuário Teste",
            username: "teste_front",
            avatar_url: null
        },
        created_at: "2026-07-27T10:00:00Z"
    },
    {
        id: 2,
        content: "React é muito bom para criar SPAs.",
        media_url: null,
        comments_count: 1,
        reposts_count: 0,
        likes_count: 3,
        isLiked: true,
        isReply: false,
        author: {
            name: "Outra Pessoa",
            username: "pessoa_2",
            avatar_url: null
        },
        created_at: "2026-07-26T15:30:00Z"
    }
];

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState("usuarios"); // 'usuarios' | 'publicacoes'
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simular requisição de busca
        setIsLoading(true);
        setTimeout(() => {
            if (query.trim() === '') {
                setUsers([]);
                setPosts([]);
            } else {
                const lowerQuery = query.toLowerCase();
                setUsers(MOCK_SEARCH_USERS.filter(u => u.name.toLowerCase().includes(lowerQuery) || u.username.toLowerCase().includes(lowerQuery)));
                setPosts(MOCK_SEARCH_POSTS.filter(p => p.content.toLowerCase().includes(lowerQuery) || p.author.name.toLowerCase().includes(lowerQuery) || p.author.username.toLowerCase().includes(lowerQuery)));
            }
            setIsLoading(false);
        }, 300);
    }, [query]);

    const handleFollowToggle = (userId) => {
        setUsers(users.map(u => u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u));
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
                                            <div key={user.id} className="search-user-card" onClick={() => navigate(`/profile/${user.username}`)}>
                                                <div className="user-avatar-large"></div>
                                                <div className="user-info-search">
                                                    <div className="user-info-header">
                                                        <div className="user-names">
                                                            <strong>{user.name}</strong>
                                                            <span>@{user.username}</span>
                                                        </div>
                                                        <button 
                                                            className={`btn-follow ${user.isFollowing ? 'following' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleFollowToggle(user.id);
                                                            }}
                                                        >
                                                            {user.isFollowing ? 'Seguindo' : 'Seguir'}
                                                        </button>
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

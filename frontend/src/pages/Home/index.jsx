import "./styles.css";
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from "../../components/RightSidebar";
import PostCard from '../../components/PostCard';
import api from "../../../services/api.js";
import { AuthContext } from '../../contexts/AuthContext';

// Dados de fallback para desenvolvimento sem backend
const MOCK_FEED = [
    {
        id: 1,
        content: "Primeira publicação de teste no frontend! Sem curtidas ou reposts meus, com midia.",
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
        content: "Testando a renderização de números grandes e botões ativos.",
        media_url: null,
        comments_count: 1500,
        reposts_count: 25000,
        likes_count: 3000000,
        isLiked: true,
        isReply: true,
        author: {
            name: "Outra Pessoa",
            username: "pessoa_2",
            avatar_url: null
        },
        created_at: "2026-07-26T15:30:00Z"
    },
    {
        id: 3,
        content: "Este card foi repostado na sua timeline por outro usuário. Observe o cabeçalho!",
        media_url: null,
        comments_count: 42,
        reposts_count: 100,
        likes_count: 850,
        isLiked: false,
        isReply: false,
        author: {
            name: "Criador Original",
            username: "original",
            avatar_url: null
        },
        repostedBy: {
            name: "Maria Silva",
            username: "maria_silva"
        },
        created_at: "2026-07-25T08:15:00Z"
    }
];

export default function Home() {
    const { userData } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [postContent, setPostContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    const handlePublish = async () => {
        if (!postContent.trim() && !mediaFile) return;
        setIsPublishing(true);
        
        try {
            const formData = new FormData();
            formData.append('content', postContent);
            if (mediaFile) formData.append('media', mediaFile);
            
            const response = await api.post('/posts', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setPosts([response.data, ...posts]);
            setPostContent('');
            setMediaFile(null);
        } catch (error) {
            console.warn('Backend indisponível para postar. Mockando localmente...', error.message);
            const newPost = {
                id: Date.now(),
                content: postContent,
                media_url: mediaFile ? URL.createObjectURL(mediaFile) : null,
                comments_count: 0,
                reposts_count: 0,
                likes_count: 0,
                isLiked: false,
                isReply: false,
                author: {
                    name: userData.name,
                    username: userData.username,
                    avatar_url: userData.avatar_url
                },
                created_at: new Date().toISOString()
            };
            setPosts([newPost, ...posts]);
            setPostContent('');
            setMediaFile(null);
        } finally {
            setIsPublishing(false);
        }
    };

    useEffect(() => {
        async function fetchFeed() {
            try {
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.warn('Backend indisponível, usando feed de teste:', error.message);
                setPosts(MOCK_FEED);
            }
        }
        fetchFeed();
    }, []);

    return (
        <div className="layout-wrapper">
            <LeftSidebar />

            <main className="content">
                <header className="home-header">
                    <h2>Página Inicial</h2>
                </header>

                <section className="compose-post">
                    <textarea 
                        placeholder="O que está acontecendo?" 
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        disabled={isPublishing}
                    />
                    
                    {mediaFile && (
                        <div className="media-preview">
                            <img src={URL.createObjectURL(mediaFile)} alt="Preview da mídia" />
                            <button className="btn-remove-media" onClick={() => setMediaFile(null)}>X</button>
                        </div>
                    )}

                    <div className="compose-actions">
                        {!userData?.isAnonymous ? (
                            <>
                                <div className="compose-tools">
                                    <button 
                                        className="btn-attach" 
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Adicionar mídia"
                                    >
                                        📷
                                    </button>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        ref={fileInputRef} 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => setMediaFile(e.target.files[0])}
                                    />
                                </div>
                                <button 
                                    className="btn-publish" 
                                    onClick={handlePublish} 
                                    disabled={isPublishing || (!postContent.trim() && !mediaFile)}
                                >
                                    {isPublishing ? 'Enviando...' : 'Publicar'}
                                </button>
                            </>
                        ) : (
                            <button className="btn-publish" onClick={() => navigate('/signin')}>Fazer Login</button>
                        )}
                    </div>
                </section>

                <section className="feed-container">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="post-placeholder">Nenhuma publicação ainda.</div>
                    )}
                </section>
            </main>

            <RightSidebar />
        </div>
    );
}
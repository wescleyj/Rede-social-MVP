import "./styles.css";
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from "../../components/RightSidebar";
import PostCard from '../../components/PostCard';
import api from "../../../services/api.js";
import { AuthContext } from '../../contexts/AuthContext';

// Mocks removidos, a página agora depende exclusivamente da API real

export default function Home() {
    const { userData } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [postContent, setPostContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    const navigate = useNavigate();

    const handlePublish = async () => {
        if (!postContent.trim() && !mediaUrl) return;
        setIsPublishing(true);
        
        try {
            const payload = {
                content: postContent,
                media_url: mediaUrl
            };
            
            const response = await api.post('/api/posts/create/', payload);
            setPosts([response.data, ...posts]);
            setPostContent('');
            setMediaUrl('');
        } catch (error) {
            console.error('Erro ao postar:', error.message);
            alert("Erro ao publicar. Verifique sua conexão e tente novamente.");
        } finally {
            setIsPublishing(false);
        }
    };

    useEffect(() => {
        async function fetchFeed() {
            try {
                // Fetch Global/Following Feed
                const response = await api.get('/api/posts/');
                // O Django Rest Framework retorna { count, next, previous, results } para paginação
                setPosts(response.data.results || response.data);
            } catch (error) {
                console.error('Erro ao carregar o feed:', error.message);
            }
        }
        if (!userData?.isAnonymous) {
            fetchFeed();
        }
    }, [userData]);

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
                    
                    <div className="compose-actions">
                        {!userData?.isAnonymous ? (
                            <>
                                <div className="compose-tools">
                                    <input 
                                        type="url"
                                        placeholder="Link de imagem ou GIF..."
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        style={{ background: 'var(--bg-secondary)', border: 'none', color: '#fff', padding: '10px', borderRadius: '15px', width: '250px' }}
                                    />
                                </div>
                                <button 
                                    className="btn-publish" 
                                    onClick={handlePublish} 
                                    disabled={isPublishing || (!postContent.trim() && !mediaUrl)}
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
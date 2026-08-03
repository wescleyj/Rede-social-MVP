import "./styles.css";
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import PostCard from '../../components/PostCard';
import api from "../../../services/api.js";
import { AuthContext } from '../../contexts/AuthContext';

export default function Home() {
    // Estados reativos para dados das publicações e controle de requisições
    const { userData } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    const observerTarget = useRef(null);
    const navigate = useNavigate();

    // Busca o feed de publicações na API, tratando paginação incremental e erros
    const fetchFeed = useCallback(async (url = null) => {
        const isMore = Boolean(url);
        if (isMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoadingInitial(true);
        }

        try {
            const endpoint = url ? url.replace(/^.*?\/api\//, '/api/') : '/api/posts/';
            const response = await api.get(endpoint);
            const data = response.data;

            if (data && data.results !== undefined) {
                if (isMore) {
                    setPosts(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = data.results.filter(p => !existingIds.has(p.id));
                        return [...prev, ...uniqueNew];
                    });
                } else {
                    setPosts(data.results);
                }
                setNextPage(data.next || null);
            } else if (Array.isArray(data)) {
                setPosts(data);
                setNextPage(null);
            } else {
                if (!isMore) setPosts([]);
                setNextPage(null);
            }
        } catch (error) {
            console.error('Erro ao carregar o feed:', error.message);
        } finally {
            if (isMore) {
                setIsLoadingMore(false);
            } else {
                setIsLoadingInitial(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed, userData]);

    // Lida com a rolagem infinita de publicações via IntersectionObserver
    useEffect(() => {
        if (!nextPage || isLoadingMore || isLoadingInitial) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextPage && !isLoadingMore) {
                    fetchFeed(nextPage);
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [nextPage, isLoadingMore, isLoadingInitial, fetchFeed]);

    // Lida com a criação de novas publicações, inserindo o post criado no topo do feed
    const handlePublish = async () => {
        if (!postContent.trim() && !mediaUrl) return;
        setIsPublishing(true);
        
        try {
            const payload = {
                content: postContent.trim(),
                media_url: mediaUrl.trim()
            };
            
            const response = await api.post('/api/posts/create/', payload);
            setPosts(prev => [response.data, ...prev]);
            setPostContent('');
            setMediaUrl('');
        } catch (error) {
            console.error('Erro ao postar:', error.message);
            alert("Erro ao publicar. Verifique sua conexão e tente novamente.");
        } finally {
            setIsPublishing(false);
        }
    };

    // Renderiza a página inicial com compositor de publicações e feed com rolagem infinita
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
                        maxLength={280}
                    />
                    
                    <div className="compose-actions">
                        {!userData?.isAnonymous ? (
                            <>
                                <div className="compose-tools">
                                    <input 
                                        type="url"
                                        className="compose-media-input"
                                        placeholder="Link de imagem ou GIF..."
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        maxLength={200}
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
                    {isLoadingInitial ? (
                        <div className="feed-loading-initial">
                            <div className="feed-spinner"></div>
                            <span>Carregando publicações...</span>
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            {posts.map((post) => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    onPostDeleted={(deletedId) => setPosts(prev => prev.filter(p => p.id !== deletedId))}
                                />
                            ))}

                            <div ref={observerTarget} className="feed-sentinel" />

                            {isLoadingMore && (
                                <div className="feed-loading-more">
                                    <div className="feed-spinner small"></div>
                                    <span>Carregando mais...</span>
                                </div>
                            )}

                            {!nextPage && posts.length >= 10 && (
                                <div className="feed-end-message">
                                    <span>Você chegou ao fim das publicações</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="post-placeholder">Nenhuma publicação ainda.</div>
                    )}
                </section>
            </main>
        </div>
    );
}
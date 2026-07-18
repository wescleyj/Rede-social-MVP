import "./styles.css";
import React, { useState, useEffect } from 'react';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from "../../components/RightSidebar/index.jsx";
import api, { baseURL } from "../../../services/api.js";

export default function Home() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function fetchFeed() {
            try {
                // Ajuste esta rota para o endpoint real de feed do seu backend
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.error(error);
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
                    <textarea placeholder="O que está acontecendo?" />
                    <div className="compose-actions">
                        <button className="btn-publish">Publicar</button>
                    </div>
                </section>

                <section className="feed-container">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <article key={post.id} className="post-card">
                                <div className="post-header">
                                    {post.author?.avatar_url ? (
                                        <img
                                            src={`${baseURL}/uploads/${post.autor.avatar_url}`}
                                            alt="Avatar"
                                            className="post-avatar-small"
                                        />
                                    ) : (
                                        <div className="post-avatar-small"></div>
                                    )}
                                    <div className="post-meta">
                                        <strong>{post.autor?.name || 'Usuário'}</strong>
                                        <span>@{post.autor?.username || 'usuario'}</span>
                                    </div>
                                </div>

                                <p className="post-text">{post.content}</p>

                                {post.media_url && (
                                    <img
                                        src={`${baseURL}/uploads/${post.media_url}`}
                                        alt="Mídia da publicação"
                                        className="post-media"
                                    />
                                )}

                                <div className="post-actions">
                                    <button className="btn-action">💬 {post.comments_count || 0}</button>
                                    <button className="btn-action">🔁 {post.reposts_count || 0}</button>
                                    <button className="btn-action">❤️ {post.likes_count || 0}</button>
                                </div>
                            </article>
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
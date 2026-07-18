import Sidebar from "../../components/Sidebar/index.jsx";
import React, { useState, useEffect } from "react";
import api, { baseURL } from "../../../services/api.js";
import "./styles.css";

export default function Profile() {
    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const userResponse = await api.get('/users/me');
                setUserData(userResponse.data);

                // Ajuste esta rota para o endpoint real do seu backend que retorna as publicações
                const postsResponse = await api.get('/users/me/posts');
                setPosts(postsResponse.data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchData();
    }, []);

    if (!userData) {
        return <div className="layout-wrapper">Carregando...</div>;
    }

    return (
        <div className="layout-wrapper">
            <Sidebar />

            <main className="profile-main-content">
                <header className="profile-header">
                    <button className="btn-back">{"<"}</button>
                    <div className="header-info">
                        <h2>{userData.nome}</h2>
                        <span>{userData.publicacoes_count || 0} publicações</span>
                    </div>
                </header>

                <section className="profile-banner">
                    {userData.banner && (
                        <img
                            src={`${baseURL}/uploads/${userData.banner}`}
                            alt="Banner do perfil"
                            className="banner-image"
                        />
                    )}
                </section>

                <section className="profile-details">
                    {userData.avatar ? (
                        <img
                            src={`${baseURL}/uploads/${userData.avatar}`}
                            alt={`Foto de perfil de ${userData.nome}`}
                            className="profile-avatar-large"
                        />
                    ) : (
                        <div className="profile-avatar-large"></div>
                    )}
                    <div className="profile-actions">
                        <button className="btn-icon">...</button>
                        <button className="btn-icon">✉</button>
                        <button className="btn-follow">Seguir</button>
                    </div>

                    <div className="profile-bio">
                        <h1>{userData.nome}</h1>
                        <span>@{userData.usuario}</span>
                        <p>{userData.bio || "Sem biografia"}</p>

                        <div className="profile-meta">
                            <span>{userData.usuario}</span>
                            <span>{userData.creation_year}</span>
                        </div>

                        <div className="profile-stats">
                            <span><strong>{userData.seguindo_count || 0}</strong> Seguindo</span>
                            <span><strong>{userData.seguidores_count || 0}</strong> Seguidores</span>
                        </div>
                    </div>
                </section>

                <nav className="profile-tabs">
                    <button className="active">Publicações</button>
                    <button>Respostas</button>
                    <button>Mídia</button>
                    <button>Curtidas</button>
                </nav>

                <section className="profile-feed">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <article key={post.id} className="post-card">
                                <div className="post-header">
                                    {userData.avatar ? (
                                        <img src={`${baseURL}/uploads/${userData.avatar}`} alt="" className="post-avatar-small" />
                                    ) : (
                                        <div className="post-avatar-small"></div>
                                    )}
                                    <div className="post-meta">
                                        <strong>{userData.nome}</strong> <span>@{userData.usuario}</span>
                                    </div>
                                </div>

                                <p className="post-content">{post.texto}</p>

                                {post.imagem && (
                                    <img src={`${baseURL}/uploads/${post.imagem}`} alt="Mídia da publicação" className="post-media" />
                                )}

                                <div className="post-actions">
                                    <button>💬 {post.comentarios_count || 0}</button>
                                    <button>🔁 {post.reposts_count || 0}</button>
                                    <button>❤️ {post.curtidas_count || 0}</button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <p className="no-posts-message">Nenhuma publicação encontrada.</p>
                    )}
                </section>
            </main>

            <aside className="right-sidebar">
                <div className="search-bar">
                    <input type="text" placeholder="Buscar na rede" />
                </div>

                <div className="who-to-follow">
                    <h3>Quem seguir</h3>
                </div>
            </aside>
        </div>
    );
}
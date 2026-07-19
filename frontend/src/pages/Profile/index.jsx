import LeftSidebar from "../../components/LeftSidebar/index.jsx";
import React, {useState, useEffect, useContext} from "react";
import api, { baseURL } from "../../../services/api.js";
import "./styles.css";
import RightSideBar from "../../components/RightSidebar/index.jsx";
import PostCard from "../../components/PostCard/index.jsx";
import {AuthContext} from "../../contexts/AuthContext";

export default function Profile() {
    const { userData } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);


    useEffect(() => {
        async function fetchData() {
            try {
                setPosts([
                    {
                        id: 1,
                        content: "Primeira publicação de teste no frontend!",
                        media_url: null,
                        comments_count: 5,
                        reposts_count: 2,
                        likes_count: 10,
                        author: {
                            name: "Usuário Teste",
                            username: "teste_front",
                            avatar_url: null
                        }
                    },
                    {
                        id: 2,
                        content: "Testando a renderização de múltiplos cards na tela inicial.",
                        media_url: null,
                        comments_count: 0,
                        reposts_count: 0,
                        likes_count: 3,
                        author: {
                            name: "Outra Pessoa",
                            username: "pessoa_2",
                            avatar_url: null
                        }
                    }
                ]);
                // const postsResponse = await api.get('/users/me/posts');
                // setPosts(postsResponse.data);
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
            <LeftSidebar />

            <main className="profile-main-content">
                <header className="profile-header">
                    <button className="btn-back">{"<"}</button>
                    <div className="header-info">
                        <h2>{userData.name}</h2>
                        <span>{userData.posts_count || 0} publicações</span>
                    </div>
                </header>

                <section className="profile-banner">
                    {userData.banner_url && (
                        <img
                            src={`${baseURL}/uploads/${userData.banner_url}`}
                            alt="Banner do perfil"
                            className="banner-image"
                        />
                    )}
                </section>

                <section className="profile-details">
                    {userData.avatar_url ? (
                        <img
                            src={`${baseURL}/uploads/${userData.avatar_url}`}
                            alt={`Foto de perfil de ${userData.name}`}
                            className="profile-avatar-large"
                        />
                    ) : (
                        <div className="profile-avatar-large"></div>
                    )}
                    <div className="profile-actions">
                        <button className="btn-secondary">Editar Perfil</button>
                    </div>

                    <div className="profile-bio">
                        <h1>{userData.name}</h1>
                        <span>@{userData.username}</span>
                        <p>{userData.bio || "Sem biografia"}</p>

                        <div className="profile-meta">
                            <span>📅 Entrou em {new Date(userData.created_at).getFullYear()}</span>
                        </div>

                        <div className="profile-stats">
                            <span><strong>{userData.following_count || 0}</strong> Seguindo</span>
                            <span><strong>{userData.followers_count || 0}</strong> Seguidores</span>
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
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <p className="no-posts-message">Nenhuma publicação encontrada.</p>
                    )}
                </section>
            </main>

            <RightSideBar />
        </div>
    );
}
import "./styles.css";
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from "../../components/RightSidebar";
import PostCard from '../../components/PostCard';
import api from "../../../services/api.js";
import { AuthContext } from '../../contexts/AuthContext';

export default function Home() {
    const { userData } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchFeed() {
            try {
                // const response = await api.get('/posts');
                // setPosts(response.data);

                // MOCK DO FEED:
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
                        {!userData?.isAnonymous ? (
                            <button className="btn-publish">+ Publicar</button>
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
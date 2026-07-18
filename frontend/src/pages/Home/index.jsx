import "./styles.css";
import React, { useState, useEffect } from 'react';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from "../../components/RightSidebar";
import PostCard from '../../components/PostCard';
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
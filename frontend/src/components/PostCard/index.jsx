import React from 'react';
import { baseURL } from "../../../services/api.js";
import './styles.css';

export default function PostCard({ post }) {
    return (
        <article className="post-card">
            <div className="post-header">
                {post.author?.avatar_url ? (
                    <img
                        src={`${baseURL}/uploads/${post.author.avatar_url}`}
                        alt="Avatar"
                        className="post-avatar-small"
                    />
                ) : (
                    <div className="post-avatar-small"></div>
                )}
                <div className="post-meta">
                    <strong>{post.author?.name || 'Usuário'}</strong>
                    <span>@{post.author?.username || 'usuario'}</span>
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
    );
}
import React, { useState } from 'react';
import api, { baseURL } from "../../../services/api.js";
import './styles.css';
import SpeechBubble from "../../assets/speech_bubble.svg?react"
import Heart from "../../assets/heart.svg?react"
import Arrow from "../../assets/arrows.svg?react"
import { formatNumber } from "../../utils/formatNumber.js";

export default function PostCard({ post }) {
    const [postUpd, setPost] = useState(post);
    const [likeIsLoading, setLikeIsLoading] = useState(false);
    const [repostIsLoading, setRepostIsLoading] = useState(false);

    async function like() {
        setLikeIsLoading(true);

        try {
            const response = await api.post('/post/like', {
                id: post.id,
            });

            setPost({
                ...postUpd,
                totalLikes: response.data.totalLikes,
                isLiked: response.data.isLiked
            });
        } catch (error) {
            console.error(error);
            alert('Erro desconhecido');
        } finally {
            setLikeIsLoading(false);
        }
    }

    async function repost() {
        setRepostIsLoading(true);

        try {
            const response = await api.post('/post/repost', {
                id: post.id,
            });

            setPost({
                ...postUpd,
                totalReposts: response.data.totalReposts,
                isReply: response.data.isReply
            });
        } catch (error) {
            console.error(error);
            alert('Erro desconhecido');
        } finally {
            setRepostIsLoading(false);
        }
    }

    async function comment() {

    }

    return (
        <article className="post-card">
            {postUpd.repostedBy && (
                <div className="post-reposted-by">
                    <Arrow /> Repostado por {postUpd.repostedBy.name}
                </div>
            )}

            <div className="post-header">
                {postUpd.author?.avatar_url ? (
                    <img
                        src={`${baseURL}/uploads/${postUpd.author.avatar_url}`}
                        alt="Avatar"
                        className="post-avatar-small"
                    />
                ) : (
                    <div className="post-avatar-small"></div>
                )}
                <div className="post-meta">
                    <strong>{postUpd.author?.name || 'Usuário'}</strong>
                    <span>@{postUpd.author?.username || 'usuario'}</span>
                </div>
            </div>

            <p className="post-text">{postUpd.content}</p>

            {postUpd.media_url && (
                <img
                    src={`${baseURL}/uploads/${postUpd.media_url}`}
                    alt="Mídia da publicação"
                    className="post-media"
                />
            )}

            <div className="post-actions">
                <button className="btn-action btn-message">
                    <SpeechBubble /> {formatNumber(postUpd.totalComments)}
                </button>
                <button className={`btn-action btn-repost ${postUpd.isReply ? 'reposted' : ''}`} disabled={repostIsLoading} onClick={repost}>
                    <Arrow /> {formatNumber(postUpd.totalReposts)}
                </button>
                <button className={`btn-action btn-like ${postUpd.isLiked ? 'liked' : ''}`} disabled={likeIsLoading} onClick={like} >
                    <Heart /> {formatNumber(postUpd.totalLikes)}
                </button>
            </div>
        </article>
    );
}
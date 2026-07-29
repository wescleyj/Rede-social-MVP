import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../contexts/AuthContext.jsx";
import api from "../../../services/api.js";
import './styles.css';
import SpeechBubble from "../../assets/speech_bubble.svg?react";
import Heart from "../../assets/heart.svg?react";
import Arrow from "../../assets/arrows.svg?react";
import { formatNumber } from "../../utils/formatNumber.js";
import { buildImageUrl } from "../../utils/buildImageUrl.js";



export default function PostCard({ post }) {
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [postUpd, setPost] = useState(post);
    const [likeIsLoading, setLikeIsLoading] = useState(false);
    const [repostIsLoading, setRepostIsLoading] = useState(false);
    
    // Estados do Modal de Denúncia
    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportCustom, setReportCustom] = useState('');

    // Estados de Comentários
    const [showComments, setShowComments] = useState(false);
    const [commentsList, setCommentsList] = useState([]);
    const [newComment, setNewComment] = useState('');

    const requireAuth = (actionFn) => (e) => {
        if (e) e.stopPropagation();
        if (userData?.isAnonymous) {
            navigate('/signin');
        } else {
            actionFn();
        }
    };

    async function like() {
        setLikeIsLoading(true);

        try {
            await api.post(`/api/posts/like/${post.id}/`);

            const wasLiked = postUpd.isLiked;
            const currentLikes = postUpd.likes_count ?? postUpd.totalLikes ?? 0;
            const newLikes = wasLiked ? currentLikes - 1 : currentLikes + 1;

            setPost({
                ...postUpd,
                likes_count: newLikes,
                totalLikes: newLikes,
                isLiked: !wasLiked
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLikeIsLoading(false);
        }
    }

    async function repost() {
        setRepostIsLoading(true);

        try {
            await api.post(`/api/posts/repost/${post.id}/`);

            const wasReposted = postUpd.isReply;
            const currentReposts = postUpd.reposts_count ?? postUpd.totalReposts ?? 0;
            const newReposts = wasReposted ? currentReposts - 1 : currentReposts + 1;

            setPost({
                ...postUpd,
                reposts_count: newReposts,
                totalReposts: newReposts,
                isReply: !wasReposted
            });
        } catch (error) {
            console.error(error);
        } finally {
            setRepostIsLoading(false);
        }
    }

    // Compatibilidade: aceita tanto os nomes do backend (likes_count) quanto os do mock (totalLikes)
    const commentsCount = postUpd.comments_count ?? postUpd.totalComments ?? 0;
    const repostsCount = postUpd.reposts_count ?? postUpd.totalReposts ?? 0;
    const likesCount = postUpd.likes_count ?? postUpd.totalLikes ?? 0;

    function handleReportSubmit(e) {
        e.preventDefault();
        alert(`Denúncia registrada com sucesso!\nMotivo: ${reportReason === 'outro' ? reportCustom : reportReason}`);
        setIsReporting(false);
        setReportReason('');
        setReportCustom('');
    }

    function toggleComments() {
        if (!showComments && commentsList.length === 0 && commentsCount > 0) {
            // Mock de carregamento inicial
            setCommentsList([{ id: 'm1', author: 'outra_pessoa', text: 'Excelente post!' }]);
        }
        setShowComments(!showComments);
    }

    function handleSendComment(e) {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        const added = {
            id: Date.now(),
            author: userData.username,
            text: newComment
        };
        setCommentsList([...commentsList, added]);
        setPost({ ...postUpd, comments_count: commentsCount + 1, totalComments: commentsCount + 1 });
        setNewComment('');
    }

    const avatarSrc = buildImageUrl(postUpd.author?.avatar_url);
    const mediaSrc = buildImageUrl(postUpd.media_url);
    
    const formattedDate = postUpd.created_at ? new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(postUpd.created_at)) : '';

    return (
        <article className="post-card">
            {postUpd.repostedBy && (
                <div className="post-reposted-by">
                    <Arrow /> Repostado por {postUpd.repostedBy.name}
                </div>
            )}

            <div className="post-header">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="post-avatar-small"
                    />
                ) : (
                    <div className="post-avatar-small"></div>
                )}
                <div 
                    className="post-meta" 
                    onClick={requireAuth(() => navigate(`/profile/${postUpd.author?.username}`))}
                    style={{ cursor: 'pointer' }}
                >
                    <strong className="post-author-name">{postUpd.author?.name || 'Usuário'}</strong>
                    <span className="post-author-handle">@{postUpd.author?.username || 'usuario'}</span>
                    {formattedDate && <span className="post-date">• {formattedDate}</span>}
                </div>
            </div>

            <p className="post-text">{postUpd.content}</p>

            {mediaSrc && (
                <img
                    src={mediaSrc}
                    alt="Mídia da publicação"
                    className="post-media"
                />
            )}

            <div className="post-actions">
                <div className="post-interactions">
                    <button className="btn-action btn-message" onClick={requireAuth(toggleComments)}>
                        <SpeechBubble /> {formatNumber(commentsCount)}
                    </button>
                    <button className={`btn-action btn-repost ${postUpd.isReply ? 'reposted' : ''}`} disabled={repostIsLoading} onClick={requireAuth(repost)}>
                        <Arrow /> {formatNumber(repostsCount)}
                    </button>
                    <button className={`btn-action btn-like ${postUpd.isLiked ? 'liked' : ''}`} disabled={likeIsLoading} onClick={requireAuth(like)}>
                        <Heart /> {formatNumber(likesCount)}
                    </button>
                </div>
                
                <button 
                    className="btn-action btn-report" 
                    onClick={requireAuth(() => setIsReporting(true))} 
                    title="Denunciar publicação"
                >
                    🚩
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    <div className="comments-list">
                        {commentsList.map(c => (
                            <div key={c.id} className="comment-item">
                                <strong>@{c.author}</strong>
                                <p>{c.text}</p>
                            </div>
                        ))}
                        {commentsCount === 0 && commentsList.length === 0 && (
                            <p className="no-comments">Seja o primeiro a comentar!</p>
                        )}
                    </div>
                    <form className="comment-input-area" onSubmit={handleSendComment}>
                        <input 
                            type="text" 
                            placeholder="Escreva um comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit" disabled={!newComment.trim()}>Enviar</button>
                    </form>
                </div>
            )}

            {isReporting && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Denunciar Publicação</h2>
                        <form onSubmit={handleReportSubmit}>
                            <p style={{marginBottom: '10px', color: 'var(--text-muted)'}}>Por que você está denunciando este post?</p>
                            
                            <div className="report-options">
                                <label>
                                    <input type="radio" name="reason" value="spam" onChange={(e) => setReportReason(e.target.value)} required />
                                    Spam ou enganoso
                                </label>
                                <label>
                                    <input type="radio" name="reason" value="abuso" onChange={(e) => setReportReason(e.target.value)} />
                                    Discurso de ódio ou racismo
                                </label>
                                <label>
                                    <input type="radio" name="reason" value="violencia" onChange={(e) => setReportReason(e.target.value)} />
                                    Violência ou danos físicos
                                </label>
                                <label>
                                    <input type="radio" name="reason" value="outro" onChange={(e) => setReportReason(e.target.value)} />
                                    Outro motivo
                                </label>
                            </div>

                            {reportReason === 'outro' && (
                                <textarea 
                                    className="report-textarea"
                                    placeholder="Descreva o motivo da denúncia..."
                                    value={reportCustom}
                                    onChange={(e) => setReportCustom(e.target.value)}
                                    required
                                />
                            )}

                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsReporting(false)}>Cancelar</button>
                                <button type="submit" className="btn-submit-report">Enviar Denúncia</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </article>
    );
}
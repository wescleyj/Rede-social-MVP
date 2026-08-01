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
    const [isDeleted, setIsDeleted] = useState(false);

    const isAuthor = userData && userData.username === postUpd.author?.username;
    
    // Estados do Modal de Denúncia
    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportCustom, setReportCustom] = useState('');

    // Estados de Comentários
    const [showComments, setShowComments] = useState(false);
    const [commentsList, setCommentsList] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSendingComment, setIsSendingComment] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const requireAuth = (actionFn) => (e) => {
        if (e) e.stopPropagation();
        if (userData?.isAnonymous) {
            navigate('/signin');
        } else {
            actionFn();
        }
    };

    async function like() {
        if (likeIsLoading) return;
        setLikeIsLoading(true);

        try {
            await api.post(`/api/posts/like/${post.id}/`);

            const wasLiked = postUpd.isLiked || postUpd.is_liked;
            const currentLikes = postUpd.likes_count ?? postUpd.totalLikes ?? 0;
            const newLikes = wasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

            setPost({
                ...postUpd,
                likes_count: newLikes,
                totalLikes: newLikes,
                isLiked: !wasLiked,
                is_liked: !wasLiked
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLikeIsLoading(false);
        }
    }

    async function repost() {
        if (repostIsLoading) return;
        setRepostIsLoading(true);

        try {
            await api.post(`/api/posts/repost/${post.id}/`);

            const wasReposted = postUpd.isReply || postUpd.is_reposted;
            const currentReposts = postUpd.reposts_count ?? postUpd.totalReposts ?? 0;
            const newReposts = wasReposted ? Math.max(0, currentReposts - 1) : currentReposts + 1;

            setPost({
                ...postUpd,
                reposts_count: newReposts,
                totalReposts: newReposts,
                isReply: !wasReposted,
                is_reposted: !wasReposted
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

    async function toggleComments() {
        if (!showComments) {
            try {
                const res = await api.get(`/api/posts/info/${post.id}/comments/`);
                setCommentsList(res.data.results || res.data);
            } catch (err) {
                console.error("Erro ao carregar comentários", err);
            }
        }
        setShowComments(!showComments);
    }

    async function handleSendComment(e) {
        e.preventDefault();
        if (!newComment.trim() || isSendingComment) return;
        setIsSendingComment(true);
        
        try {
            const res = await api.post('/api/comments/create/', {
                post_id: post.id,
                content: newComment.trim()
            });
            // O backend retorna o comentário criado
            setCommentsList([...commentsList, res.data]);
            setPost({ ...postUpd, comments_count: commentsCount + 1, totalComments: commentsCount + 1 });
            setNewComment('');
        } catch (err) {
            console.error("Erro ao enviar comentário", err);
            alert("Erro ao enviar comentário.");
        } finally {
            setIsSendingComment(false);
        }
    }

    async function handleCommentLike(commentId) {
        try {
            await api.post(`/api/comments/like/${commentId}/`);
            setCommentsList(prev => prev.map(c => {
                if (c.id === commentId) {
                    const wasLiked = c.is_liked;
                    const newCount = wasLiked ? Math.max(0, (c.likes_count ?? 1) - 1) : (c.likes_count ?? 0) + 1;
                    return { ...c, is_liked: !wasLiked, likes_count: newCount };
                }
                return c;
            }));
        } catch (err) {
            console.error("Erro ao curtir comentário", err);
        }
    }

    async function handleCommentDelete(commentId) {
        if (!window.confirm("Deseja excluir este comentário?")) return;
        try {
            await api.delete(`/api/comments/delete/${commentId}/`);
            setCommentsList(prev => prev.filter(c => c.id !== commentId));
            setPost(prev => ({
                ...prev,
                comments_count: Math.max(0, commentsCount - 1),
                totalComments: Math.max(0, commentsCount - 1)
            }));
        } catch (err) {
            console.error("Erro ao deletar comentário", err);
            alert("Erro ao excluir o comentário.");
        }
    }

    async function handleDelete() {
        if (isDeleting) return;
        if (!window.confirm("Tem certeza que deseja excluir esta publicação? Essa ação não pode ser desfeita.")) return;
        
        setIsDeleting(true);
        try {
            await api.delete(`/api/posts/delete/${post.id}/`);
            setIsDeleted(true);
            if (onPostDeleted) onPostDeleted(post.id);
        } catch (error) {
            console.error("Erro ao excluir post", error);
            alert("Erro ao excluir a publicação.");
        } finally {
            setIsDeleting(false);
        }
    }

    if (isDeleted) return null;

    const avatarSrc = buildImageUrl(postUpd.author?.avatar_url);
    const mediaSrc = buildImageUrl(postUpd.media_url);
    
    const formattedDate = postUpd.created_at ? new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(postUpd.created_at)) : '';

    return (
        <article className="post-card">
            {postUpd.repostedBy && (
                <div 
                    className="post-reposted-by"
                    onClick={(e) => {
                        if (postUpd.repostedBy.username) {
                            e.stopPropagation();
                            navigate(`/profile/${postUpd.repostedBy.username}`);
                        }
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <Arrow /> Repostado por @{postUpd.repostedBy.username || postUpd.repostedBy.name}
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
                    <button 
                        className={`btn-action btn-repost ${(postUpd.isReply || postUpd.is_reposted) ? 'reposted' : ''}`} 
                        disabled={repostIsLoading || isAuthor} 
                        onClick={requireAuth(repost)}
                        title={isAuthor ? "Você não pode repostar sua própria publicação" : "Repostar"}
                    >
                        <Arrow /> {formatNumber(repostsCount)}
                    </button>
                    <button className={`btn-action btn-like ${(postUpd.isLiked || postUpd.is_liked) ? 'liked' : ''}`} disabled={likeIsLoading} onClick={requireAuth(like)}>
                        <Heart /> {formatNumber(likesCount)}
                    </button>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    {(isAuthor || userData?.is_superuser) && (
                        <button 
                            className="btn-action btn-delete" 
                            onClick={requireAuth(handleDelete)} 
                            title={isAuthor ? "Excluir publicação" : "Excluir publicação (Admin)"}
                            style={{ filter: 'grayscale(100%) brightness(2)' }}
                        >
                            🗑️
                        </button>
                    )}
                    <button 
                        className="btn-action btn-report" 
                        onClick={requireAuth(() => setIsReporting(true))} 
                        title="Denunciar publicação"
                    >
                        ⚑
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="comments-section">
                    <div className="comments-list">
                        {commentsList.map(c => {
                            const authorObj = typeof c.author === 'object' ? c.author : { username: c.author, name: c.author };
                            const avatarSrc = buildImageUrl(authorObj?.avatar_url);
                            const canDeleteComment = userData && (userData.username === authorObj?.username || userData.is_superuser);

                            return (
                                <div key={c.id} className="comment-item">
                                    <div className="comment-avatar-container" onClick={() => navigate(`/profile/${authorObj?.username}`)}>
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt="Avatar" className="comment-avatar" />
                                        ) : (
                                            <div className="comment-avatar-placeholder"></div>
                                        )}
                                    </div>
                                    <div className="comment-main">
                                        <div className="comment-header">
                                            <div className="comment-author-info" onClick={() => navigate(`/profile/${authorObj?.username}`)}>
                                                <strong className="comment-name">{authorObj?.name || authorObj?.username}</strong>
                                                <span className="comment-username">@{authorObj?.username}</span>
                                                {c.created_at && (
                                                    <span className="comment-date">
                                                        • {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(c.created_at))}
                                                    </span>
                                                )}
                                            </div>
                                            {canDeleteComment && (
                                                <button 
                                                    type="button"
                                                    className="btn-comment-delete" 
                                                    onClick={() => handleCommentDelete(c.id)}
                                                    title="Excluir comentário"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                        <p className="comment-content">{c.content || c.text}</p>
                                        <div className="comment-footer">
                                            <button 
                                                type="button"
                                                className={`btn-comment-like ${c.is_liked ? 'liked' : ''}`}
                                                onClick={requireAuth(() => handleCommentLike(c.id))}
                                                title="Curtir comentário"
                                            >
                                                <Heart className="comment-heart-icon" />
                                                <span className="comment-likes-text">{formatNumber(c.likes_count ?? 0)}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                            maxLength={280}
                            disabled={isSendingComment}
                        />
                        <button type="submit" disabled={!newComment.trim() || isSendingComment}>
                            {isSendingComment ? 'Enviando...' : 'Enviar'}
                        </button>
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
                                    maxLength={300}
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
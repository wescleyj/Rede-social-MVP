import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../contexts/AuthContext.jsx";
import api from "../../../services/api.js";
import './styles.css';
import SpeechBubble from "../../assets/speech_bubble.svg?react";
import Heart from "../../assets/heart.svg?react";
import Arrow from "../../assets/arrows.svg?react";
import LockIcon from "../../assets/lock.svg?react";
import TrashIcon from "../../assets/trash.svg?react";
import FlagIcon from "../../assets/flag.svg?react";
import { formatNumber } from "../../utils/formatNumber.js";
import { buildImageUrl } from "../../utils/buildImageUrl.js";



export default function PostCard({ post, onPostDeleted }) {
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();

    // Estados reativos para dados da publicação e controle de requisições
    const [postUpd, setPost] = useState(post);
    const [likeIsLoading, setLikeIsLoading] = useState(false);
    const [repostIsLoading, setRepostIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const isAuthor = userData && userData.username === postUpd.author?.username;
    
    // Estados do Modal de Denúncia de Post
    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportCustom, setReportCustom] = useState('');

    // Estados do Modal de Denúncia de Comentário
    const [reportingCommentId, setReportingCommentId] = useState(null);
    const [commentReportReason, setCommentReportReason] = useState('');
    const [commentReportCustom, setCommentReportCustom] = useState('');

    // Estados de Comentários
    const [showComments, setShowComments] = useState(false);
    const [commentsList, setCommentsList] = useState([]);
    const [nextCommentsPage, setNextCommentsPage] = useState(null);
    const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSendingComment, setIsSendingComment] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Garante autenticação prévia antes de executar ações interativas
    const requireAuth = (actionFn) => (e) => {
        if (e) e.stopPropagation();
        if (userData?.isAnonymous) {
            navigate('/signin');
        } else {
            actionFn();
        }
    };

    // Lida com curtidas no post, tratando racing conditions e atualizando o contador localmente
    async function like() {
        if (likeIsLoading) return;
        setLikeIsLoading(true);

        try {
            await api.post(`/api/posts/like/${post.id}/`);

            // Atualiza os valores e estado do botão para as novas informações evitando ter que dar reload na pagina
            const wasLiked = Boolean(postUpd.is_liked);
            const currentLikes = postUpd.likes_count ?? 0;
            const newLikes = wasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

            setPost({
                ...postUpd,
                likes_count: newLikes,
                is_liked: !wasLiked
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLikeIsLoading(false);
        }
    }

    // Lida com reposts do post, tratando racing conditions e atualizando o contador localmente
    async function repost() {
        if (repostIsLoading) return;
        setRepostIsLoading(true);

        try {
            await api.post(`/api/posts/repost/${post.id}/`);

            // Atualiza os valores e estado do botão para as novas informações evitando ter que dar reload na pagina
            const wasReposted = Boolean(postUpd.is_reposted);
            const currentReposts = postUpd.reposts_count ?? 0;
            const newReposts = wasReposted ? Math.max(0, currentReposts - 1) : currentReposts + 1;

            setPost({
                ...postUpd,
                reposts_count: newReposts,
                is_reposted: !wasReposted
            });
        } catch (error) {
            console.error(error);
        } finally {
            setRepostIsLoading(false);
        }
    }

    // Valida o resultado colocando como 0 se tiver algum problema e retornar null
    const commentsCount = postUpd.comments_count ?? 0;
    const repostsCount = postUpd.reposts_count ?? 0;
    const likesCount = postUpd.likes_count ?? 0;

    // Lida com o envio de denúncias de publicações, tratando feedback visual e erros
    async function handleReportSubmit(e) {
        e.preventDefault();
        const reasonText = reportReason === 'outro' ? (reportCustom.trim() || 'Outro') : reportReason;
        try {
            await api.post('/api/reports/create/', {
                reported_id: post.id,
                reported_type: 'post',
                additional_info: reasonText
            });
            alert("Denúncia registrada com sucesso! Ela foi enviada para análise dos administradores.");
            setIsReporting(false);
            setReportReason('');
            setReportCustom('');
        } catch (err) {
            console.error("Erro ao enviar denúncia:", err);
            alert("Erro ao registrar denúncia. Tente novamente.");
        }
    }

    // Lida com o envio de denúncias de comentários, tratando feedback visual e erros
    async function handleCommentReportSubmit(e) {
        e.preventDefault();
        if (!reportingCommentId) return;
        const reasonText = commentReportReason === 'outro' ? (commentReportCustom.trim() || 'Outro') : commentReportReason;
        try {
            await api.post('/api/reports/create/', {
                reported_id: reportingCommentId,
                reported_type: 'comment',
                additional_info: reasonText
            });
            alert("Denúncia do comentário registrada com sucesso! Ela foi enviada para análise dos administradores.");
            setReportingCommentId(null);
            setCommentReportReason('');
            setCommentReportCustom('');
        } catch (err) {
            console.error("Erro ao denunciar comentário:", err);
            alert("Erro ao registrar denúncia do comentário.");
        }
    }

    // Lida com a abertura da seção de comentários, buscando a primeira página de dados
    async function toggleComments() {
        if (!showComments) {
            try {
                const res = await api.get(`/api/posts/info/${post.id}/comments/`);
                const data = res.data;
                if (data && data.results !== undefined) {
                    setCommentsList(data.results);
                    setNextCommentsPage(data.next || null);
                } else if (Array.isArray(data)) {
                    setCommentsList(data);
                    setNextCommentsPage(null);
                } else {
                    setCommentsList([]);
                    setNextCommentsPage(null);
                }
            } catch (err) {
                console.error("Erro ao carregar comentários", err);
            }
        }
        setShowComments(!showComments);
    }

    // Lida com o carregamento gradual das próximas páginas de comentários, tratando paginação e erros
    async function handleLoadMoreComments() {
        if (!nextCommentsPage || isLoadingMoreComments) return;
        setIsLoadingMoreComments(true);
        try {
            const endpoint = nextCommentsPage.replace(/^.*?\/api\//, '/api/');
            const res = await api.get(endpoint);
            const data = res.data;
            if (data && data.results !== undefined) {
                setCommentsList(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const uniqueNew = data.results.filter(c => !existingIds.has(c.id));
                    return [...prev, ...uniqueNew];
                });
                setNextCommentsPage(data.next || null);
            } else {
                setNextCommentsPage(null);
            }
        } catch (err) {
            console.error("Erro ao carregar mais comentários:", err);
        } finally {
            setIsLoadingMoreComments(false);
        }
    }

    // Lida com a publicação de novos comentários, atualizando a lista e a contagem localmente
    async function handleSendComment(e) {
        e.preventDefault();
        if (userData?.isAnonymous) {
            navigate('/signin');
            return;
        }
        if (!newComment.trim() || isSendingComment) return;
        setIsSendingComment(true);
        
        try {
            const res = await api.post('/api/comments/create/', {
                post_id: post.id,
                content: newComment.trim()
            });
            // O backend retorna o comentário criado de forma direta
            setCommentsList([...commentsList, res.data]);
            setPost({ ...postUpd, comments_count: commentsCount + 1 });
            setNewComment('');
        } catch (err) {
            console.error("Erro ao enviar comentário", err);
            alert("Erro ao enviar comentário.");
        } finally {
            setIsSendingComment(false);
        }
    }

    // Lida com curtidas em comentários, atualizando o contador e o estado do botão localmente
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

    // Lida com a exclusão de comentários, atualizando a contagem e a lista localmente
    async function handleCommentDelete(commentId) {
        if (!window.confirm("Deseja excluir este comentário?")) return;
        try {
            await api.delete(`/api/comments/delete/${commentId}/`);
            setCommentsList(prev => prev.filter(c => c.id !== commentId));
            setPost(prev => ({
                ...prev,
                comments_count: Math.max(0, (prev.comments_count ?? 1) - 1)
            }));
        } catch (err) {
            console.error("Erro ao deletar comentário", err);
            alert("Erro ao excluir o comentário.");
        }
    }

    // Lida com a exclusão da publicação, tratando confirmação, erros e remoção da tela
    async function handleDelete() {
        if (isDeleting) return;
        if (!window.confirm("Tem certeza que deseja excluir esta publicação? Essa ação não pode ser desfeita.")) return;
        
        setIsDeleting(true);
        try {
            await api.delete(`/api/posts/delete/${post.id}/`);
            setIsDeleted(true);
            if (typeof onPostDeleted === 'function') {
                onPostDeleted(post.id);
            }
        } catch (error) {
            console.error("Erro ao excluir post", error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.response?.data?.message || "Erro ao excluir a publicação.";
            alert(errorMsg);
        } finally {
            setIsDeleting(false);
        }
    }

    if (isDeleted) return null;

    const avatarSrc = buildImageUrl(postUpd.author?.avatar_url);
    const mediaSrc = buildImageUrl(postUpd.media_url);
    
    const formattedDate = postUpd.created_at ? new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(postUpd.created_at)) : '';

    // Renderiza o card da publicação, exibindo autor, mídias, ações interativas e seção de comentários
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
                        onClick={() => postUpd.author?.username && navigate(`/profile/${postUpd.author.username}`)}
                        style={{ cursor: 'pointer' }}
                    />
                ) : (
                    <div 
                        className="post-avatar-small"
                        onClick={() => postUpd.author?.username && navigate(`/profile/${postUpd.author.username}`)}
                        style={{ cursor: 'pointer' }}
                    ></div>
                )}
                <div 
                    className="post-meta" 
                    onClick={() => postUpd.author?.username && navigate(`/profile/${postUpd.author.username}`)}
                    style={{ cursor: 'pointer' }}
                >
                    <strong className="post-author-name">
                        {postUpd.author?.name || 'Usuário'}
                        {postUpd.author?.is_private && (
                            <LockIcon className="icon-private-lock" title="Conta Privada" />
                        )}
                    </strong>
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
                    <button className="btn-action btn-message" onClick={toggleComments}>
                        <SpeechBubble /> {formatNumber(commentsCount)}
                    </button>
                    <button 
                        className={`btn-action btn-repost ${postUpd.is_reposted ? 'reposted' : ''}`} 
                        disabled={repostIsLoading || isAuthor} 
                        onClick={requireAuth(repost)}
                        title={isAuthor ? "Você não pode repostar sua própria publicação" : "Repostar"}
                    >
                        <Arrow /> {formatNumber(repostsCount)}
                    </button>
                    <button className={`btn-action btn-like ${postUpd.is_liked ? 'liked' : ''}`} disabled={likeIsLoading} onClick={requireAuth(like)}>
                        <Heart /> {formatNumber(likesCount)}
                    </button>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    {(isAuthor || userData?.is_superuser) && (
                        <button 
                            className="btn-action btn-delete" 
                            onClick={requireAuth(handleDelete)} 
                            title={isAuthor ? "Excluir publicação" : "Excluir publicação (Admin)"}
                        >
                            <TrashIcon />
                        </button>
                    )}
                    <button 
                        className="btn-action btn-report" 
                        onClick={requireAuth(() => setIsReporting(true))} 
                        title="Denunciar publicação"
                    >
                        <FlagIcon />
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="comments-section">
                    <div className="comments-list">
                        {commentsList.map(c => {
                            const authorObj = typeof c.author === 'object' ? c.author : { username: c.author, name: c.author };
                            const avatarSrc = buildImageUrl(authorObj?.avatar_url);
                            const canDeleteComment = userData && !userData.isAnonymous && (userData.username === authorObj?.username || userData.is_superuser);

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
                                                <strong className="comment-name">
                                                    {authorObj?.name || authorObj?.username}
                                                    {authorObj?.is_private && (
                                                        <LockIcon className="icon-private-lock" title="Conta Privada" />
                                                    )}
                                                </strong>
                                                <span className="comment-username">@{authorObj?.username}</span>
                                                {c.created_at && (
                                                    <span className="comment-date">
                                                        • {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(c.created_at))}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="comment-actions-top">
                                                {canDeleteComment && (
                                                    <button 
                                                        type="button"
                                                        className="btn-comment-delete" 
                                                        onClick={() => handleCommentDelete(c.id)}
                                                        title="Excluir comentário"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                )}
                                                <button 
                                                    type="button"
                                                    className="btn-comment-report" 
                                                    onClick={requireAuth(() => {
                                                        setReportingCommentId(c.id);
                                                        setCommentReportReason('');
                                                        setCommentReportCustom('');
                                                    })}
                                                    title="Denunciar comentário"
                                                >
                                                    <FlagIcon />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="comment-content">{c.content}</p>
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
                        {nextCommentsPage && (
                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                                <button
                                    type="button"
                                    onClick={handleLoadMoreComments}
                                    disabled={isLoadingMoreComments}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--brand)',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {isLoadingMoreComments ? 'Carregando mais comentários...' : 'Carregar mais comentários'}
                                </button>
                            </div>
                        )}
                    </div>
                    {userData?.isAnonymous ? (
                        <div className="comment-login-prompt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: '8px', marginTop: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Faça login para poder comentar</span>
                            <button 
                                type="button" 
                                className="btn-primary" 
                                style={{ padding: '6px 14px', fontSize: '0.85rem' }} 
                                onClick={() => navigate('/signin')}
                            >
                                Entrar
                            </button>
                        </div>
                    ) : (
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
                    )}
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

            {reportingCommentId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Denunciar Comentário</h2>
                        <form onSubmit={handleCommentReportSubmit}>
                            <p style={{marginBottom: '10px', color: 'var(--text-muted)'}}>Por que você está denunciando este comentário?</p>
                            
                            <div className="report-options">
                                <label>
                                    <input type="radio" name="comment_reason" value="spam" onChange={(e) => setCommentReportReason(e.target.value)} required />
                                    Spam ou enganoso
                                </label>
                                <label>
                                    <input type="radio" name="comment_reason" value="abuso" onChange={(e) => setCommentReportReason(e.target.value)} />
                                    Discurso de ódio ou racismo
                                </label>
                                <label>
                                    <input type="radio" name="comment_reason" value="violencia" onChange={(e) => setCommentReportReason(e.target.value)} />
                                    Violência ou danos físicos
                                </label>
                                <label>
                                    <input type="radio" name="comment_reason" value="outro" onChange={(e) => setCommentReportReason(e.target.value)} />
                                    Outro motivo
                                </label>
                            </div>

                            {commentReportReason === 'outro' && (
                                <textarea 
                                    className="report-textarea"
                                    placeholder="Descreva o motivo da denúncia..."
                                    value={commentReportCustom}
                                    onChange={(e) => setCommentReportCustom(e.target.value)}
                                    maxLength={300}
                                    required
                                />
                            )}

                            <div className="modal-actions">
                                <button type="button" onClick={() => setReportingCommentId(null)}>Cancelar</button>
                                <button type="submit" className="btn-submit-report" disabled={!commentReportReason}>Enviar Denúncia</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </article>
    );
}
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/LeftSidebar/index.jsx";
import PostCard from "../../components/PostCard/index.jsx";
import api from "../../../services/api.js";
import { AuthContext } from "../../contexts/AuthContext";
import "./styles.css";
import { buildImageUrl } from "../../utils/buildImageUrl.js";
import LockIcon from "../../assets/lock.svg?react";
import CalendarIcon from "../../assets/calendar.svg?react";

export default function Profile() {
    const { userData, logout } = useContext(AuthContext);
    const { username } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [profileUser, setProfileUser] = useState(null);
    const [activeTab, setActiveTab] = useState("publicacoes");
    const [editPerfil, setEditPerfil] = useState(false);
    const [nameUpdate, setNameUpdate] = useState("");
    const [bioUpdate, setBioUpdate] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");
    const [isPrivateUpdate, setIsPrivateUpdate] = useState(false);

    // Estados para controle do modal e formulário de alteração de senha
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

    // Estados para controle do modal e formulário de exclusão de conta
    const [isDeletingAccountModal, setIsDeletingAccountModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

    const [isFollowing, setIsFollowing] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [followIsLoading, setFollowIsLoading] = useState(false);

    // Estados para paginação e carregamento gradual das publicações
    const [nextPostsPage, setNextPostsPage] = useState(null);
    const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
    const postsObserverTarget = React.useRef(null);

    const requireAuth = (callback) => (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (userData?.isAnonymous) {
            navigate('/signin');
            return;
        }
        callback(e);
    };

    const isOwnProfile = (!username && !userData?.isAnonymous) || (userData && !userData.isAnonymous && username === userData.username);

    // Carrega dados do perfil visualizado e status de seguimento
    useEffect(() => {
        async function fetchProfile() {
            if (!username) {
                if (userData?.isAnonymous) {
                    navigate('/signin');
                    return;
                }
                // Meu próprio perfil acessado via /profile
                setProfileUser(userData);
                return;
            }

            try {
                const response = await api.get(`/api/users/info/${username}/`);
                setProfileUser(response.data);
                setIsFollowing(Boolean(response.data.is_following));
                setIsPending(Boolean(response.data.is_pending));
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                setProfileUser(null);
                setIsFollowing(false);
                setIsPending(false);
            }
        }
        
        fetchProfile();
    }, [username, userData]);

    // Sincroniza os campos do formulário de edição com os dados atuais do perfil
    useEffect(() => {
        if (userData && isOwnProfile) {
            setNameUpdate(userData.name || "");
            setBioUpdate(userData.bio || "");
            setAvatarUrl(userData.avatar_url || "");
            setBannerUrl(userData.banner_url || "");
            setIsPrivateUpdate(Boolean(userData.is_private));
        }
    }, [userData, isOwnProfile]);

    const filteredPosts = posts.filter(post => {
        if (activeTab === "publicacoes") return true;
        if (activeTab === "midia") return Boolean(post.media_url);
        return false;
    });

    const alternar = () => {
        setEditPerfil(!editPerfil);
    };

    // Lida com a atualização dos dados do perfil, tratando erros e persistência
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // O backend exige name, username, email, bio, avatar_url, banner_url e is_private
        const payload = {
            name: nameUpdate,
            username: userData.username,
            email: userData.email,
            bio: bioUpdate,
            avatar_url: avatarUrl,
            banner_url: bannerUrl,
            is_private: isPrivateUpdate
        };

        try {
            const response = await api.put("/api/users/me/", payload);
            
            // Atualizar o contexto global de auth com os novos dados
            window.location.reload(); 
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar o perfil. Verifique os campos.");
        }
    };

    // Lida com a alteração de senha do usuário, validando requisitos e tratando erros
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword.length < 8) {
            setPasswordError('A nova senha deve ter no mínimo 8 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('A nova senha e a confirmação não coincidem.');
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError('A nova senha não pode ser igual à senha atual.');
            return;
        }

        setIsSubmittingPassword(true);
        try {
            await api.put('/api/users/me/update_passwd/', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setPasswordSuccess('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setIsChangingPassword(false);
                setPasswordSuccess('');
            }, 1500);
        } catch (err) {
            console.error("Erro ao alterar senha:", err);
            if (err.response?.status === 403 || err.response?.data?.detail) {
                setPasswordError(err.response.data.detail || 'Senha atual incorreta.');
            } else {
                setPasswordError('Erro ao alterar a senha. Verifique os dados e tente novamente.');
            }
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    // Lida com ações de seguir, deixar de seguir e envio de solicitações para contas privadas
    async function handleFollow() {
        if (followIsLoading) return;
        setFollowIsLoading(true);

        const targetUsername = profileUser?.username || username;

        try {
            await api.post(`/api/users/follow/${targetUsername}/`);
            
            if (isFollowing) {
                // Deixou de seguir
                setIsFollowing(false);
                setIsPending(false);
                setProfileUser(u => u ? ({
                    ...u,
                    followers_count: Math.max(0, (u.followers_count || 0) - 1),
                    is_following: false,
                    is_pending: false
                }) : u);
            } else if (profileUser?.is_private) {
                if (isPending) {
                    // Cancelou solicitação pendente
                    setIsPending(false);
                    setProfileUser(u => u ? ({
                        ...u,
                        is_pending: false
                    }) : u);
                } else {
                    // Enviou solicitação de seguir para perfil privado
                    setIsPending(true);
                    setProfileUser(u => u ? ({
                        ...u,
                        is_pending: true
                    }) : u);
                }
            } else {
                // Seguiu perfil público diretamente
                setIsFollowing(true);
                setIsPending(false);
                setProfileUser(u => u ? ({
                    ...u,
                    followers_count: (u.followers_count || 0) + 1,
                    is_following: true,
                    is_pending: false
                }) : u);
            }
        } catch (error) {
            console.error("Erro ao seguir usuário:", error);
            alert("Erro ao tentar processar ação de seguir.");
        } finally {
            setFollowIsLoading(false);
        }
    }



    // Lida com a exclusão definitiva da conta do usuário autenticado após validação de senha
    async function handleConfirmDeleteAccount(e) {
        e.preventDefault();
        if (isSubmittingDelete) return;

        if (!deletePassword) {
            setDeleteError("Por favor, digite sua senha.");
            return;
        }

        setDeleteError("");
        setIsSubmittingDelete(true);

        try {
            // 1. Valida a senha usando o endpoint existente de login (/api/auth/login/)
            await api.post('/api/auth/login/', {
                username: userData.username,
                password: deletePassword
            });

            // 2. Se a senha estiver correta, executa a exclusão da conta
            await api.delete('/api/users/me/delete/');
            alert("Sua conta foi excluída permanentemente com sucesso.");
            logout();
        } catch (error) {
            console.error("Erro ao validar senha ou excluir conta", error);
            if (error.response && (error.response.status === 401 || error.response.status === 400)) {
                setDeleteError("Senha incorreta. Não foi possível excluir a conta.");
            } else {
                setDeleteError("Ocorreu um erro ao tentar excluir sua conta. Tente novamente.");
            }
            setIsSubmittingDelete(false);
        }
    }

    // Lida com a exclusão de contas de terceiros por administradores
    async function handleAdminDeleteUser() {
        const targetUsername = profileUser?.username || username;
        const confirm = window.confirm(`[ADMIN] Tem certeza que deseja excluir permanentemente a conta de @${targetUsername} e todas as suas publicações?`);
        if (!confirm) return;

        try {
            await api.delete(`/api/users/delete/${targetUsername}/`);
            alert(`Usuário @${targetUsername} excluído com sucesso.`);
            navigate('/');
        } catch (error) {
            console.error("Erro ao excluir usuário pelo admin", error);
            alert("Erro ao excluir o usuário.");
        }
    }

    // Busca as publicações do perfil na API, tratando paginação incremental e erros
    const fetchProfilePosts = React.useCallback(async (url = null) => {
        if (!username && !userData?.username) return;
        const isMore = Boolean(url);
        if (isMore) {
            setIsLoadingMorePosts(true);
        }

        try {
            const defaultRoute = isOwnProfile 
                ? '/api/users/me/posts' 
                : `/api/posts/users/${username}`;
            const endpoint = url ? url.replace(/^.*?\/api\//, '/api/') : defaultRoute;
            
            const response = await api.get(endpoint);
            const data = response.data;

            if (data && data.results !== undefined) {
                if (isMore) {
                    setPosts(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const uniqueNew = data.results.filter(p => !existingIds.has(p.id));
                        return [...prev, ...uniqueNew];
                    });
                } else {
                    setPosts(data.results);
                }
                setNextPostsPage(data.next || null);
            } else if (Array.isArray(data)) {
                setPosts(data);
                setNextPostsPage(null);
            } else {
                if (!isMore) setPosts([]);
                setNextPostsPage(null);
            }
        } catch (error) {
            console.error('Erro ao carregar os posts do perfil:', error.message);
        } finally {
            if (isMore) setIsLoadingMorePosts(false);
        }
    }, [username, isOwnProfile, userData]);

    useEffect(() => {
        fetchProfilePosts();
    }, [fetchProfilePosts]);

    // Lida com a rolagem infinita das publicações do perfil via IntersectionObserver
    useEffect(() => {
        if (!nextPostsPage || isLoadingMorePosts) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextPostsPage && !isLoadingMorePosts) {
                    fetchProfilePosts(nextPostsPage);
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        const currentTarget = postsObserverTarget.current;
        if (currentTarget) observer.observe(currentTarget);

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [nextPostsPage, isLoadingMorePosts, fetchProfilePosts]);

    if (!userData || !profileUser) {
        return <div className="layout-wrapper">Carregando...</div>;
    }

    const avatarSrc = buildImageUrl(profileUser.avatar_url);
    const bannerSrc = buildImageUrl(profileUser.banner_url);

    return (
        <div className="layout-wrapper">
            <LeftSidebar />

            <main className="profile-main-content">
                <header className="profile-header">
                    <button className="btn-back" onClick={() => navigate(-1)} aria-label="Voltar">‹</button>
                    <div className="header-info">
                        <h2>{profileUser.name}</h2>
                        <span>{profileUser.posts_count || 0} publicações</span>
                    </div>
                </header>

                <section className="profile-banner">
                    {bannerSrc && (
                        <img
                            src={bannerSrc}
                            alt="Banner do perfil"
                            className="banner-image"
                        />
                    )}
                </section>

                <section className="profile-details">
                    {avatarSrc ? (
                        <img
                            src={avatarSrc}
                            alt={`Foto de perfil de ${profileUser.name}`}
                            className="profile-avatar-large"
                        />
                    ) : (
                        <div className="profile-avatar-large"></div>
                    )}

                    <div className="profile-actions">
                        {isOwnProfile ? (
                            <>
                                <button className="btn-secondary" onClick={alternar}>Editar Perfil</button>
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => { 
                                        setIsChangingPassword(true); 
                                        setPasswordError(''); 
                                        setPasswordSuccess(''); 
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                >
                                    Alterar Senha
                                </button>
                                <button 
                                    className="btn-secondary btn-danger" 
                                    onClick={() => {
                                        setIsDeletingAccountModal(true);
                                        setDeletePassword('');
                                        setDeleteError('');
                                    }}
                                    title="Excluir permanentemente sua conta"
                                >
                                    Excluir Conta
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className={`btn-primary ${isFollowing ? 'following' : ''} ${isPending ? 'pending' : ''}`}
                                    disabled={followIsLoading}
                                    onClick={requireAuth(handleFollow)}
                                    title={isPending ? "Solicitação enviada. Clique para cancelar." : undefined}
                                >
                                    {isFollowing ? 'Seguindo' : isPending ? 'Solicitado' : 'Seguir'}
                                </button>

                                {userData?.is_superuser && (
                                    <button 
                                        className="btn-secondary btn-danger" 
                                        onClick={handleAdminDeleteUser}
                                        title="Excluir este usuário como Administrador"
                                    >
                                        Excluir Usuário
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {editPerfil && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h2>Editar Perfil</h2>
                                <form onSubmit={handleEditSubmit}>
                                    <div className="form-group">
                                        <label>Nome:</label>
                                        <input
                                            type="text"
                                            value={nameUpdate}
                                            onChange={(e) => setNameUpdate(e.target.value)}
                                            required
                                            maxLength={25}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Biografia:</label>
                                        <textarea
                                            value={bioUpdate}
                                            onChange={(e) => setBioUpdate(e.target.value)}
                                            rows="3"
                                            maxLength={160}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Link da Foto de Perfil (ex: Imgur):</label>
                                        <input
                                            type="url"
                                            placeholder="https://i.imgur.com/foto.jpg"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            maxLength={200}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Link da Foto de Capa (Banner):</label>
                                        <input
                                            type="url"
                                            placeholder="https://i.imgur.com/capa.jpg"
                                            value={bannerUrl}
                                            onChange={(e) => setBannerUrl(e.target.value)}
                                            maxLength={200}
                                        />
                                    </div>

                                    <div className="form-group-checkbox">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={isPrivateUpdate}
                                                onChange={(e) => setIsPrivateUpdate(e.target.checked)}
                                            />
                                            <span>Conta Privada</span>
                                        </label>
                                        <span className="form-hint">
                                            Quando ativado, apenas seus seguidores poderão ver suas publicações.
                                        </span>
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" onClick={alternar}>Cancelar</button>
                                        <button type="submit">Salvar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isChangingPassword && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h2>Alterar Senha</h2>
                                {passwordError && <p className="auth-error-msg">{passwordError}</p>}
                                {passwordSuccess && <p className="auth-success-msg">{passwordSuccess}</p>}
                                <form onSubmit={handlePasswordChange}>
                                    <div className="form-group">
                                        <label>Senha Atual:</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            maxLength={128}
                                            placeholder="••••••••"
                                            disabled={isSubmittingPassword}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Nova Senha:</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            maxLength={128}
                                            placeholder="••••••••"
                                            disabled={isSubmittingPassword}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Confirmar Nova Senha:</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            maxLength={128}
                                            placeholder="••••••••"
                                            disabled={isSubmittingPassword}
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" onClick={() => setIsChangingPassword(false)} disabled={isSubmittingPassword}>Cancelar</button>
                                        <button type="submit" disabled={isSubmittingPassword}>
                                            {isSubmittingPassword ? 'Salvando...' : 'Salvar Senha'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isDeletingAccountModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: '440px' }}>
                                <h2 style={{ color: 'var(--danger)' }}>Excluir Conta</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                                    ⚠️ <strong>Atenção:</strong> Esta ação é irreversível. Todas as suas publicações, curtidas, comentários e dados serão excluídos permanentemente.
                                </p>
                                <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '16px' }}>
                                    Para confirmar a exclusão, digite sua <strong>senha atual</strong>:
                                </p>
                                <form onSubmit={handleConfirmDeleteAccount}>
                                    {deleteError && (
                                        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            {deleteError}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Sua Senha:</label>
                                        <input
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            required
                                            maxLength={128}
                                            placeholder="••••••••"
                                            disabled={isSubmittingDelete}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" onClick={() => setIsDeletingAccountModal(false)} disabled={isSubmittingDelete}>Cancelar</button>
                                        <button 
                                            type="submit" 
                                            disabled={isSubmittingDelete}
                                            style={{ backgroundColor: 'var(--danger)', color: '#fff', border: 'none' }}
                                        >
                                            {isSubmittingDelete ? 'Excluindo...' : 'Confirmar Exclusão'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="profile-bio">
                        <div className="profile-name-row">
                            <h1>{profileUser.name}</h1>
                            {profileUser.is_private && (
                                <span className="badge-private-profile" title="Esta conta é privada">
                                    <LockIcon width="13" height="13" />
                                    Privada
                                </span>
                            )}
                        </div>
                        <span>@{profileUser.username}</span>
                        <p>{profileUser.bio || "Sem biografia"}</p>

                        <div className="profile-meta">
                            <span><CalendarIcon width="14" height="14" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Entrou em {profileUser.created_at ? new Date(profileUser.created_at).getFullYear() : '—'}</span>
                        </div>

                        <div className="profile-stats">
                            <span><strong>{profileUser.following_count || 0}</strong> Seguindo</span>
                            <span><strong>{profileUser.followers_count || 0}</strong> Seguidores</span>
                        </div>
                    </div>
                </section>

                <nav className="profile-tabs">
                    <button className={activeTab === "publicacoes" ? "active" : ""} onClick={() => setActiveTab("publicacoes")}>
                        Publicações
                    </button>
                    <button className={activeTab === "midia" ? "active" : ""} onClick={() => setActiveTab("midia")}>
                        Mídia
                    </button>
                </nav>

                <section className="profile-feed">
                    {!isOwnProfile && profileUser?.is_private && !isFollowing && !userData?.is_superuser ? (
                        <div className="profile-private-lock-box">
                            <div className="lock-icon-circle">
                                <LockIcon width="32" height="32" />
                            </div>
                            <h3>Esta conta é privada</h3>
                            <p>
                                {isPending 
                                    ? `Sua solicitação para seguir @${profileUser.username} foi enviada e está aguardando aprovação.`
                                    : `Siga @${profileUser.username} para ver as publicações e fotos.`
                                }
                            </p>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <>
                            {filteredPosts.map((post) => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    onPostDeleted={(deletedId) => {
                                        setPosts(prev => prev.filter(p => p.id !== deletedId));
                                        setProfileUser(prev => prev ? { ...prev, posts_count: Math.max(0, (prev.posts_count ?? 1) - 1) } : prev);
                                    }}
                                />
                            ))}

                            <div ref={postsObserverTarget} style={{ height: '20px', width: '100%' }} />

                            {isLoadingMorePosts && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: '10px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                                    <div className="feed-spinner small"></div>
                                    <span>Carregando mais publicações...</span>
                                </div>
                            )}

                            {!nextPostsPage && filteredPosts.length >= 10 && (
                                <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                                    <span>Você chegou ao fim das publicações</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="no-posts-message">Nenhuma publicação encontrada.</p>
                    )}
                </section>
            </main>

        </div>
    );
}
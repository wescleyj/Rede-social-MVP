import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/LeftSidebar/index.jsx";
import PostCard from "../../components/PostCard/index.jsx";
import api from "../../../services/api.js";
import { AuthContext } from "../../contexts/AuthContext";
import "./styles.css";
import { buildImageUrl } from "../../utils/buildImageUrl.js";

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

    // Estados para Alteração de Senha
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

    // Estados para Exclusão de Conta com Senha
    const [isDeletingAccountModal, setIsDeletingAccountModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

    const [isFollowing, setIsFollowing] = useState(false);
    const [followIsLoading, setFollowIsLoading] = useState(false);

    // Mock: vamos simular que pessoa_2 nos segue de volta para testar as DMs
    const isMutualFollow = isFollowing || username === 'pessoa_2';

    // Estados do Modal de Denúncia de Perfil
    const [isReportingProfile, setIsReportingProfile] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportCustom, setReportCustom] = useState('');

    const isOwnProfile = !username || (userData && username === userData.username);

    // Carregar os dados do perfil visualizado
    useEffect(() => {
        async function fetchProfile() {
            if (!username && userData) {
                // Meu próprio perfil acessado via /profile
                setProfileUser(userData);
                return;
            }

            try {
                const response = await api.get(`/api/users/info/${username}/`);
                setProfileUser(response.data);
                setIsFollowing(Boolean(response.data.is_following));
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                setProfileUser(null);
                setIsFollowing(false);
            }
        }
        
        fetchProfile();
    }, [username, userData]);

    // Sincronizar estados do modal com userData
    useEffect(() => {
        if (userData && isOwnProfile) {
            setNameUpdate(userData.name || "");
            setBioUpdate(userData.bio || "");
            setAvatarUrl(userData.avatar_url || "");
            setBannerUrl(userData.banner_url || "");
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

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // O backend atual exige name, username, email, bio, avatar_url e banner_url no UserUpdateSerializer
        const payload = {
            name: nameUpdate,
            username: userData.username,
            email: userData.email,
            bio: bioUpdate,
            avatar_url: avatarUrl,
            banner_url: bannerUrl
        };

        try {
            const response = await api.put("/api/users/me/", payload);
            
            // Atualizar o contexto global de auth com os novos dados
            // Opcionalmente podemos forçar um recarregamento da página para simplicidade
            window.location.reload(); 
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar o perfil. Verifique os campos.");
        }
    };

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

    async function handleFollow() {
        if (followIsLoading) return;
        setFollowIsLoading(true);

        try {
            await api.post(`/api/users/follow/${username}/`);
            setIsFollowing(prev => {
                const nextState = !prev;
                setProfileUser(u => u ? ({
                    ...u,
                    followers_count: Math.max(0, (u.followers_count || 0) + (nextState ? 1 : -1)),
                    is_following: nextState
                }) : u);
                return nextState;
            });
        } catch (error) {
            console.error("Erro ao seguir usuário:", error);
            alert("Erro ao tentar seguir o usuário.");
        } finally {
            setFollowIsLoading(false);
        }
    }

    function handleReportSubmit(e) {
        e.preventDefault();
        // Na vida real isso faria POST /reports/users
        alert(`Denúncia enviada com sucesso! Analisaremos o perfil @${username || userData.username}.`);
        setIsReportingProfile(false);
        setReportReason('');
        setReportCustom('');
    }

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

    // Carregar Feed do Perfil
    useEffect(() => {
        async function fetchProfilePosts() {
            if (!username && !userData?.username) return;
            
            try {
                // Usa a rota do usuário logado se for o próprio perfil, caso contrário, usa a rota pública
                const route = isOwnProfile 
                    ? '/api/users/me/posts' 
                    : `/api/posts/users/${username}`;
                
                const response = await api.get(route);
                setPosts(response.data.results || response.data);
            } catch (error) {
                console.error('Erro ao carregar os posts do perfil:', error.message);
            }
        }
        
        fetchProfilePosts();
    }, [username, isOwnProfile, userData]);

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
                                    className={`btn-primary ${isFollowing ? 'following' : ''}`}
                                    disabled={followIsLoading}
                                    onClick={handleFollow}
                                >
                                    {isFollowing ? 'Seguindo' : 'Seguir'}
                                </button>
                                
                                <button 
                                    className="btn-secondary" 
                                    onClick={() => navigate(`/messages/${username}`)}
                                    disabled={!isMutualFollow}
                                    title={!isMutualFollow ? "Vocês precisam se seguir para trocar mensagens" : "Enviar Mensagem"}
                                >
                                    ✉️ Mensagem
                                </button>

                                <button className="btn-secondary btn-report" onClick={() => setIsReportingProfile(true)}>
                                    ⚑ Denunciar
                                </button>

                                {userData?.is_superuser && (
                                    <button 
                                        className="btn-secondary btn-danger" 
                                        onClick={handleAdminDeleteUser}
                                        title="Excluir este usuário como Administrador"
                                    >
                                        🗑️ Excluir Usuário
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
                        <h1>{profileUser.name}</h1>
                        <span>@{profileUser.username}</span>
                        <p>{profileUser.bio || "Sem biografia"}</p>

                        <div className="profile-meta">
                            <span>📅 Entrou em {profileUser.created_at ? new Date(profileUser.created_at).getFullYear() : '—'}</span>
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
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <p className="no-posts-message">Nenhuma publicação encontrada.</p>
                    )}
                </section>
            </main>

            {isReportingProfile && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Denunciar Perfil</h2>
                        <form onSubmit={handleReportSubmit} className="report-form">
                            <label>
                                <input type="radio" name="reason" value="spam" onChange={(e) => setReportReason(e.target.value)} required /> Spam
                            </label>
                            <label>
                                <input type="radio" name="reason" value="falso" onChange={(e) => setReportReason(e.target.value)} /> Falsidade Ideológica
                            </label>
                            <label>
                                <input type="radio" name="reason" value="abuso" onChange={(e) => setReportReason(e.target.value)} /> Assédio ou Abuso
                            </label>
                            <label>
                                <input type="radio" name="reason" value="outro" onChange={(e) => setReportReason(e.target.value)} /> Outro
                            </label>

                            {reportReason === 'outro' && (
                                <textarea 
                                    className="report-custom-text" 
                                    placeholder="Descreva o motivo da denúncia..."
                                    value={reportCustom}
                                    onChange={(e) => setReportCustom(e.target.value)}
                                    required
                                />
                            )}

                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsReportingProfile(false)}>Cancelar</button>
                                <button type="submit" className="btn-submit-report" disabled={!reportReason}>Enviar Denúncia</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
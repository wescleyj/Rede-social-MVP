import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/LeftSidebar/index.jsx";
import RightSidebar from "../../components/RightSidebar/index.jsx";
import PostCard from "../../components/PostCard/index.jsx";
import api from "../../../services/api.js";
import { AuthContext } from "../../contexts/AuthContext";
import "./styles.css";
import { buildImageUrl } from "../../utils/buildImageUrl.js";

export default function Profile() {
    const { userData } = useContext(AuthContext);
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
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                setProfileUser(null);
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
        if (activeTab === "curtidas") return post.isLiked;
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

    async function handleFollow() {
        setFollowIsLoading(true);

        try {
            await api.post(`/api/users/follow/${username}/`);
            setIsFollowing(!isFollowing); // Alternar o estado de seguir baseando-se no clique
        } catch (error) {
            console.error(error);
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
                            <button className="btn-secondary" onClick={alternar}>Editar Perfil</button>
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
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Biografia:</label>
                                        <textarea
                                            value={bioUpdate}
                                            onChange={(e) => setBioUpdate(e.target.value)}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Link da Foto de Perfil (ex: Imgur):</label>
                                        <input
                                            type="url"
                                            placeholder="https://i.imgur.com/foto.jpg"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Link da Foto de Capa (Banner):</label>
                                        <input
                                            type="url"
                                            placeholder="https://i.imgur.com/capa.jpg"
                                            value={bannerUrl}
                                            onChange={(e) => setBannerUrl(e.target.value)}
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
                    <button className={activeTab === "curtidas" ? "active" : ""} onClick={() => setActiveTab("curtidas")}>
                        Curtidas
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

            <RightSidebar />
        </div>
    );
}
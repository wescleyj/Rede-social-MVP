import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/LeftSidebar/index.jsx";
import RightSidebar from "../../components/RightSidebar/index.jsx";
import PostCard from "../../components/PostCard/index.jsx";
import api from "../../../services/api.js";
import { AuthContext } from "../../contexts/AuthContext";
import "./styles.css";
import { buildImageUrl } from "../../utils/buildImageUrl.js";

// Dados de fallback para posts do perfil durante desenvolvimento
const MOCK_PROFILE_POSTS = [
    {
        id: 1,
        content: "Primeira publicação de teste no frontend! Sem curtidas ou reposts meus, com midia.",
        media_url: null,
        comments_count: 5,
        reposts_count: 2,
        likes_count: 10,
        isLiked: false,
        isReply: false,
        author: {
            name: "Usuário Teste",
            username: "teste_front",
            avatar_url: null
        },
        created_at: "2026-07-27T10:00:00Z"
    },
    {
        id: 2,
        content: "Testando a renderização de números grandes e botões ativos.",
        media_url: null,
        comments_count: 1500,
        reposts_count: 25000,
        likes_count: 3000000,
        isLiked: true,
        isReply: true,
        author: {
            name: "Outra Pessoa",
            username: "pessoa_2",
            avatar_url: null
        },
        created_at: "2026-07-26T15:30:00Z"
    },
    {
        id: 3,
        content: "Este card foi repostado na sua timeline por outro usuário. Observe o cabeçalho!",
        media_url: null,
        comments_count: 42,
        reposts_count: 100,
        likes_count: 850,
        isLiked: false,
        isReply: false,
        author: {
            name: "Criador Original",
            username: "original",
            avatar_url: null
        },
        repostedBy: {
            name: "Maria Silva",
            username: "maria_silva"
        },
        created_at: "2026-07-25T08:15:00Z"
    }
];

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
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

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
        if (isOwnProfile) {
            setProfileUser(userData);
        } else {
            // Mock para quando acessa o perfil de outra pessoa sem backend
            setProfileUser({
                name: "Usuário: " + username,
                username: username,
                bio: "Esta é a biografia de @" + username,
                posts_count: 12,
                followers_count: 350,
                following_count: 120,
                created_at: "2024-01-01T10:00:00Z",
                avatar_url: null,
                banner_url: null
            });
        }
    }, [username, userData, isOwnProfile]);

    // Sincronizar estados do modal com userData
    useEffect(() => {
        if (userData && isOwnProfile) {
            setNameUpdate(userData.name || "");
            setBioUpdate(userData.bio || "");
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

        const formData = new FormData();
        formData.append("name", nameUpdate);
        formData.append("bio", bioUpdate);

        if (avatarFile) {
            formData.append("avatar", avatarFile);
        }
        if (bannerFile) {
            formData.append("banner", bannerFile);
        }

        try {
            await api.put("/users/me/edit", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            alternar();
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar");
        }
    };

    async function handleFollow() {
        setFollowIsLoading(true);

        try {
            const response = await api.post('/users/follow', {
                username: username,
            });

            setIsFollowing(response.data.isFollowing);
        } catch (error) {
            console.error(error);
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

    useEffect(() => {
        async function fetchData() {
            try {
                const postsResponse = await api.get('/users/me/posts');
                setPosts(postsResponse.data);
            } catch (error) {
                console.warn('Backend indisponível, usando posts de teste:', error.message);
                setPosts(MOCK_PROFILE_POSTS);
            }
        }

        fetchData();
    }, []);

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
                                        <label>Foto de Perfil:</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setAvatarFile(e.target.files[0])}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Foto de Capa (Banner):</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setBannerFile(e.target.files[0])}
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
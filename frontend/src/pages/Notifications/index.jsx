import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar';
import api from '../../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { buildImageUrl } from '../../utils/buildImageUrl.js';
import UsersIcon from '../../assets/users.svg?react';
import './styles.css';

export default function Notifications() {
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [followRequests, setFollowRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // Busca solicitações de seguidores pendentes e obtém dados detalhados dos solicitantes
    const fetchFollowRequests = useCallback(async () => {
        if (!userData || userData.isAnonymous) return;
        setIsLoadingRequests(true);
        try {
            const response = await api.get('/api/users/follow/requests/list/');
            const rawResults = response.data.results || response.data || [];
            
            if (!Array.isArray(rawResults) || rawResults.length === 0) {
                setFollowRequests([]);
                return;
            }

            // Buscar informações detalhadas de perfil (avatar, nome) de cada solicitante
            const enriched = await Promise.all(
                rawResults.map(async (req) => {
                    try {
                        const userRes = await api.get(`/api/users/info/${req.requester}/`);
                        return {
                            ...req,
                            requester_name: userRes.data.name || req.requester,
                            requester_avatar: userRes.data.avatar_url || null,
                            requester_is_private: userRes.data.is_private || false
                        };
                    } catch (err) {
                        return {
                            ...req,
                            requester_name: req.requester,
                            requester_avatar: null,
                            requester_is_private: false
                        };
                    }
                })
            );

            setFollowRequests(enriched);
        } catch (error) {
            console.error("Erro ao carregar solicitações de seguir:", error);
            setFollowRequests([]);
        } finally {
            setIsLoadingRequests(false);
        }
    }, [userData]);

    useEffect(() => {
        fetchFollowRequests();
    }, [fetchFollowRequests]);

    // Exibe notificações temporárias (toast) de feedback para o usuário
    const showToast = (type, text) => {
        setToastMessage({ type, text });
        setTimeout(() => {
            setToastMessage(null);
        }, 3500);
    };

    // Lida com a aprovação de uma solicitação para seguir, tratando feedback e erros
    const handleAcceptRequest = async (reqItem) => {
        if (actionLoadingId) return;
        setActionLoadingId(reqItem.id);
        try {
            await api.post(`/api/users/follow/requests/manage/${reqItem.id}/`, { action: 'accept' });
            setFollowRequests(prev => prev.filter(r => r.id !== reqItem.id));
            showToast('success', `Você aceitou a solicitação de @${reqItem.requester}.`);
        } catch (error) {
            console.error("Erro ao aceitar solicitação:", error);
            showToast('error', 'Não foi possível aceitar a solicitação. Tente novamente.');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Lida com a recusa de uma solicitação para seguir, tratando feedback e erros
    const handleDeclineRequest = async (reqItem) => {
        if (actionLoadingId) return;
        setActionLoadingId(reqItem.id);
        try {
            await api.post(`/api/users/follow/requests/manage/${reqItem.id}/`, { action: 'decline' });
            setFollowRequests(prev => prev.filter(r => r.id !== reqItem.id));
            showToast('info', `Solicitação de @${reqItem.requester} recusada.`);
        } catch (error) {
            console.error("Erro ao recusar solicitação:", error);
            showToast('error', 'Não foi possível recusar a solicitação. Tente novamente.');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="layout-wrapper">
            <LeftSidebar />

            <main className="content notifications-main">
                <header className="notifications-header">
                    <h2>Notificações</h2>
                    <span className="notifications-subtitle">Solicitações para seguir sua conta</span>
                </header>

                {toastMessage && (
                    <div className={`notifications-toast ${toastMessage.type}`}>
                        {toastMessage.text}
                    </div>
                )}

                <div className="notifications-content">
                    {isLoadingRequests ? (
                        <div className="notifications-loading">
                            <div className="notifications-spinner"></div>
                            <span>Carregando solicitações...</span>
                        </div>
                    ) : followRequests.length > 0 ? (
                        <div className="requests-container">
                            <div className="requests-header-info">
                                <span>Você tem <strong>{followRequests.length}</strong> {followRequests.length === 1 ? 'solicitação pendente' : 'solicitações pendentes'}</span>
                            </div>
                            <div className="requests-list">
                                {followRequests.map(req => {
                                    const avatarSrc = buildImageUrl(req.requester_avatar);
                                    return (
                                        <div key={req.id} className="request-card">
                                            <div 
                                                className="request-user"
                                                onClick={() => navigate(`/profile/${req.requester}`)}
                                                title={`Ver perfil de @${req.requester}`}
                                            >
                                                {avatarSrc ? (
                                                    <img 
                                                        src={avatarSrc} 
                                                        alt={`Foto de ${req.requester}`} 
                                                        className="request-avatar-img" 
                                                    />
                                                ) : (
                                                    <div className="request-avatar-fallback">
                                                        {req.requester.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="request-info">
                                                    <div className="request-names-row">
                                                        <strong className="request-display-name">
                                                            {req.requester_name || req.requester}
                                                        </strong>
                                                        <span className="request-handle">@{req.requester}</span>
                                                    </div>
                                                    <span className="request-subtext">
                                                        Solicitou seguir você • {req.created_at ? new Date(req.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'recente'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="request-actions">
                                                <button
                                                    className="btn-request-accept"
                                                    disabled={actionLoadingId === req.id}
                                                    onClick={() => handleAcceptRequest(req)}
                                                >
                                                    {actionLoadingId === req.id ? '...' : 'Aceitar'}
                                                </button>
                                                <button
                                                    className="btn-request-decline"
                                                    disabled={actionLoadingId === req.id}
                                                    onClick={() => handleDeclineRequest(req)}
                                                >
                                                    {actionLoadingId === req.id ? '...' : 'Recusar'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="notifications-empty">
                            <div className="empty-icon-wrapper">
                                <UsersIcon width="32" height="32" />
                            </div>
                            <h3>Nenhuma solicitação pendente</h3>
                            <p>Quando alguém solicitar para seguir sua conta privada, as solicitações aparecerão aqui para você aceitar ou recusar.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

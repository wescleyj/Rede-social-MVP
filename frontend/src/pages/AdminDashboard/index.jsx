import React, { useState, useEffect, useCallback } from 'react';
import LeftSidebar from '../../components/LeftSidebar';
import api from '../../../services/api';
import { buildImageUrl } from '../../utils/buildImageUrl.js';
import './styles.css';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'create_admin'
    
    // Estados para listagem de denúncias e paginação
    const [reports, setReports] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Controle de estado para ações de moderação individuais
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Estados do formulário de criação de administrador
    const [adminName, setAdminName] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

    // Busca as denúncias em aberto na API, tratando paginação e permissões
    const fetchReports = useCallback(async (url = null) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const endpoint = url ? url.replace(/^.*?\/api\//, '/api/') : '/api/reports/open/';
            const res = await api.get(endpoint);
            
            if (res.data && res.data.results !== undefined) {
                setReports(res.data.results);
                setTotalCount(res.data.count || 0);
                setNextPage(res.data.next);
                setPrevPage(res.data.previous);
            } else if (Array.isArray(res.data)) {
                setReports(res.data);
                setTotalCount(res.data.length);
                setNextPage(null);
                setPrevPage(null);
            } else {
                setReports([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error("Erro ao carregar denúncias:", error);
            setErrorMsg("Não foi possível carregar as denúncias. Verifique se você possui permissões de Administrador.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        }
    }, [activeTab, fetchReports]);

    // Lida com a conclusão ou reabertura de uma denúncia, atualizando a listagem
    const handleToggleReport = async (reportId) => {
        setActionLoadingId(reportId);
        try {
            await api.post(`/api/reports/toggle/${reportId}/`);
            fetchReports();
        } catch (error) {
            console.error("Erro ao concluir denúncia:", error);
            alert("Erro ao alterar o status da denúncia.");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Lida com a exclusão de uma publicação denunciada, tratando erros e confirmações
    const handleDeletePost = async (reportId, postId) => {
        if (!window.confirm(`Confirmar exclusão da publicação #${postId}?`)) return;
        setActionLoadingId(reportId);
        try {
            await api.delete(`/api/posts/delete/${postId}/`);
            alert("Publicação excluída com sucesso.");
            fetchReports();
        } catch (error) {
            console.error("Erro ao deletar post:", error);
            alert("Erro ao excluir a publicação.");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Lida com a exclusão de um comentário denunciado, tratando erros e confirmações
    const handleDeleteComment = async (reportId, commentId) => {
        if (!window.confirm(`Confirmar exclusão do comentário #${commentId}?`)) return;
        setActionLoadingId(reportId);
        try {
            await api.delete(`/api/comments/delete/${commentId}/`);
            alert("Comentário excluído com sucesso.");
            fetchReports();
        } catch (error) {
            console.error("Erro ao deletar comentário:", error);
            alert("Erro ao excluir o comentário.");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Lida com o banimento e exclusão da conta de um usuário denunciado
    const handleDeleteUser = async (reportId, username) => {
        if (!username) {
            alert("Não foi possível identificar o usuário para exclusão.");
            return;
        }
        const confirmText = window.prompt(`ATENÇÃO: A exclusão da conta de @${username} é irreversível e removerá todo o histórico.\n\nPara confirmar a exclusão, digite DELETE:`);
        if (confirmText !== 'DELETE') {
            if (confirmText !== null) {
                alert("Confirmação incorreta. Digite exatamente 'DELETE' para confirmar.");
            }
            return;
        }
        setActionLoadingId(reportId);
        try {
            await api.delete(`/api/users/delete/${username}/`);
            alert(`O usuário @${username} foi excluído com sucesso.`);
            fetchReports();
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            alert("Erro ao excluir o usuário.");
        } finally {
            setActionLoadingId(null);
        }
    };

    // Lida com o cadastro de uma nova conta de administrador, tratando erros de validação
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        if (isCreatingAdmin) return;
        setIsCreatingAdmin(true);
        try {
            await api.post('/api/auth/register/', {
                name: adminName.trim(),
                username: adminUser.trim(),
                email: adminEmail.trim(),
                password: adminPass
            });
            alert(`Administrador @${adminUser.trim()} cadastrado com sucesso.`);
            setAdminName('');
            setAdminUser('');
            setAdminEmail('');
            setAdminPass('');
        } catch (error) {
            console.error("Erro ao criar admin:", error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.response?.data?.message || "Erro ao criar o administrador. Verifique se o username ou e-mail já estão em uso ou se a senha atende aos requisitos.";
            alert(errorMsg);
        } finally {
            setIsCreatingAdmin(false);
        }
    };



    return (
        <div className="layout-wrapper">
            <LeftSidebar />

            <main className="content admin-main">
                <header className="admin-header">
                    <div>
                        <h2>Painel Administrativo</h2>
                        <span className="admin-subtitle">Gerenciamento de denúncias, moderação e administradores</span>
                    </div>
                </header>

                <div className="admin-tabs">
                    <button 
                        className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        Denúncias {totalCount > 0 && activeTab === 'reports' && `(${totalCount})`}
                    </button>
                    <button 
                        className={`admin-tab ${activeTab === 'create_admin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create_admin')}
                    >
                        Novo Administrador
                    </button>
                </div>

                <div className="admin-content">
                    {activeTab === 'reports' && (
                        <div className="reports-section">
                            {isLoading ? (
                                <div className="admin-loading-box">
                                    <div className="spinner"></div>
                                    <span>Carregando denúncias...</span>
                                </div>
                            ) : errorMsg ? (
                                <div className="admin-error-box">{errorMsg}</div>
                            ) : reports.length === 0 ? (
                                <div className="admin-empty-box">
                                    <h4>Nenhuma denúncia em aberto</h4>
                                    <p>Todas as denúncias foram moderadas e concluídas.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="reports-list">
                                        {reports.map(report => {
                                            const reporter = report.author;
                                            const reporterAvatar = buildImageUrl(reporter?.avatar_url);
                                            const targetType = report.reported_type;
                                            const targetInstance = report.obj_instance;
                                            const isActionRunning = actionLoadingId === report.id;

                                            const targetTypeLabels = {
                                                post: 'Publicação',
                                                user: 'Usuário',
                                                comment: 'Comentário'
                                            };

                                            return (
                                                <div key={report.id} className="report-card-modern">
                                                    <div className="report-card-top">
                                                        <div className="report-badge-group">
                                                            <span className="type-pill">
                                                                {targetTypeLabels[targetType] || targetType}
                                                            </span>
                                                        </div>
                                                        <span className="report-time">
                                                            {report.created_at ? new Intl.DateTimeFormat('pt-BR', {
                                                                day: '2-digit', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            }).format(new Date(report.created_at)) : 'Data indisponível'}
                                                        </span>
                                                    </div>

                                                    <div className="reporter-bar">
                                                        <div className="reporter-info">
                                                            {reporterAvatar ? (
                                                                <img src={reporterAvatar} alt="Reporter" className="reporter-avatar" />
                                                            ) : (
                                                                <div className="reporter-avatar-placeholder"></div>
                                                            )}
                                                            <div>
                                                                <span className="reporter-label">Denunciado por: </span>
                                                                <strong>{reporter?.name || reporter?.username || 'Usuário'}</strong>
                                                                <span className="reporter-handle"> @{reporter?.username || 'anon'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="report-reason-tag">
                                                            <strong>Motivo:</strong> {report.additional_info || 'Não especificado'}
                                                        </div>
                                                    </div>

                                                    <div className="target-preview-box">
                                                        <div className="target-preview-header">
                                                            <span>Conteúdo Denunciado:</span>
                                                        </div>

                                                        {targetInstance === null ? (
                                                            <div className="target-deleted-notice">
                                                                Este item ({targetTypeLabels[targetType] || targetType}) já foi excluído do sistema ou não está mais acessível.
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {targetType === 'post' && (
                                                                    <div className="preview-post">
                                                                        <div className="preview-author-header">
                                                                            <strong>{targetInstance.author?.name || 'Autor'}</strong>
                                                                            <span>@{targetInstance.author?.username}</span>
                                                                        </div>
                                                                        <p className="preview-content">{targetInstance.content}</p>
                                                                        {targetInstance.media_url && (
                                                                            <img 
                                                                                src={buildImageUrl(targetInstance.media_url)} 
                                                                                alt="Mídia da publicação" 
                                                                                className="preview-media" 
                                                                            />
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {targetType === 'user' && (
                                                                    <div className="preview-user">
                                                                        <div className="preview-user-details">
                                                                            {targetInstance.avatar_url && (
                                                                                <img 
                                                                                    src={buildImageUrl(targetInstance.avatar_url)} 
                                                                                    alt="Avatar" 
                                                                                    className="preview-user-avatar" 
                                                                                />
                                                                            )}
                                                                            <div>
                                                                                <strong>{targetInstance.name}</strong>
                                                                                <div>@{targetInstance.username}</div>
                                                                                {targetInstance.bio && <p className="preview-bio">{targetInstance.bio}</p>}
                                                                                <span className="preview-followers">
                                                                                    {targetInstance.followers_count || 0} seguidores • {targetInstance.following_count || 0} seguindo
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {targetType === 'comment' && (
                                                                    <div className="preview-comment">
                                                                        <div className="preview-author-header">
                                                                            <strong>{targetInstance.author?.name || targetInstance.author?.username}</strong>
                                                                            <span>@{targetInstance.author?.username}</span>
                                                                        </div>
                                                                        <p className="preview-content">{targetInstance.content}</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="report-actions-row">
                                                        <button 
                                                            type="button" 
                                                            className="btn-toggle-status btn-close"
                                                            onClick={() => handleToggleReport(report.id)}
                                                            disabled={isActionRunning}
                                                        >
                                                            {isActionRunning ? 'Concluindo...' : 'Concluir Denúncia'}
                                                        </button>

                                                        {targetInstance !== null && (
                                                            <>
                                                                {targetType === 'post' && (
                                                                    <>
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn-danger-action"
                                                                            onClick={() => handleDeletePost(report.id, report.reported_id)}
                                                                            disabled={isActionRunning}
                                                                        >
                                                                            Excluir Post
                                                                        </button>
                                                                        {targetInstance?.author?.username && (
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn-ban-action"
                                                                                onClick={() => handleDeleteUser(report.id, targetInstance.author.username)}
                                                                                disabled={isActionRunning}
                                                                            >
                                                                                Excluir Usuário
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {targetType === 'comment' && (
                                                                    <>
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn-danger-action"
                                                                            onClick={() => handleDeleteComment(report.id, report.reported_id)}
                                                                            disabled={isActionRunning}
                                                                        >
                                                                            Excluir Comentário
                                                                        </button>
                                                                        {(targetInstance?.author?.username || targetInstance?.author) && (
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn-ban-action"
                                                                                onClick={() => handleDeleteUser(report.id, targetInstance?.author?.username || targetInstance?.author)}
                                                                                disabled={isActionRunning}
                                                                            >
                                                                                Excluir Usuário
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {targetType === 'user' && (
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn-ban-action"
                                                                        onClick={() => handleDeleteUser(report.id, targetInstance.username)}
                                                                        disabled={isActionRunning}
                                                                    >
                                                                        Excluir Usuário
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {(nextPage || prevPage) && (
                                        <div className="admin-pagination">
                                            <button 
                                                className="pagination-btn"
                                                disabled={!prevPage || isLoading}
                                                onClick={() => fetchReports(prevPage)}
                                            >
                                                Anterior
                                            </button>
                                            <span className="pagination-info">Total: {totalCount} denúncias em aberto</span>
                                            <button 
                                                className="pagination-btn"
                                                disabled={!nextPage || isLoading}
                                                onClick={() => fetchReports(nextPage)}
                                            >
                                                Próxima
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'create_admin' && (
                        <div className="create-admin-section">
                            <div className="create-admin-card">
                                <h3>Criar nova conta de Administrador</h3>
                                <p className="admin-help-text">
                                    Usuários criados aqui terão acesso completo ao painel de administração e poderão gerenciar denúncias e usuários.
                                </p>
                                <form className="admin-form" onSubmit={handleCreateAdmin}>
                                    <div className="form-group">
                                        <label>Nome Completo</label>
                                        <input 
                                            type="text" 
                                            required 
                                            maxLength={25}
                                            placeholder="Ex: Moderador Vórtice"
                                            value={adminName}
                                            onChange={e => setAdminName(e.target.value)}
                                            disabled={isCreatingAdmin}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input 
                                            type="text" 
                                            required 
                                            maxLength={20}
                                            placeholder="Ex: mod_vortice"
                                            value={adminUser}
                                            onChange={e => setAdminUser(e.target.value)}
                                            disabled={isCreatingAdmin}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>E-mail</label>
                                        <input 
                                            type="email" 
                                            required 
                                            maxLength={100}
                                            placeholder="Ex: mod@vortice.com"
                                            value={adminEmail}
                                            onChange={e => setAdminEmail(e.target.value)}
                                            disabled={isCreatingAdmin}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Senha Segura</label>
                                        <input 
                                            type="password" 
                                            required 
                                            minLength={8}
                                            maxLength={128}
                                            placeholder="••••••••"
                                            value={adminPass}
                                            onChange={e => setAdminPass(e.target.value)}
                                            disabled={isCreatingAdmin}
                                        />
                                    </div>
                                    <button type="submit" className="btn-submit-admin" disabled={isCreatingAdmin}>
                                        {isCreatingAdmin ? 'Criando...' : 'Criar Administrador'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

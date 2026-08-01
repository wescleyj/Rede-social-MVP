import React, { useState } from 'react';
import LeftSidebar from '../../components/LeftSidebar';
import api from '../../../services/api';
import './styles.css';

export default function AdminDashboard() {
    const [reports, setReports] = useState([]);
    const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'create_admin'

    // Form states
    const [adminName, setAdminName] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

    const handleDismissReport = (reportId) => {
        setReports(reports.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
    };

    const handleDeletePost = async (reportId, postId) => {
        try {
            await api.delete(`/api/posts/delete/${postId}/`);
            setReports(reports.map(r => r.id === reportId ? { ...r, status: 'deleted' } : r));
            alert("Publicação excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar post", error);
            alert("Erro ao excluir publicação.");
        }
    };

    const handleBanUser = async (username) => {
        if (window.confirm(`Tem certeza que deseja banir o usuário @${username}? Esta ação é irreversível.`)) {
            try {
                await api.delete(`/api/users/delete/${username}/`);
                setReports(reports.map(r => r.author_username === username ? { ...r, status: 'deleted' } : r));
                alert(`O usuário @${username} foi banido com sucesso!`);
            } catch (error) {
                console.error("Erro ao banir usuário", error);
                alert("Erro ao banir usuário.");
            }
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        if (isCreatingAdmin) return;
        setIsCreatingAdmin(true);
        try {
            await api.post('/api/auth/register/', {
                name: adminName.trim(),
                username: adminUser.trim(),
                email: `${adminUser.trim()}@vortice.com`, // Email auto-gerado pois o formulário não pede
                password: adminPass
            });
            alert(`Sucesso! O administrador @${adminUser} foi criado.`);
            setAdminName('');
            setAdminUser('');
            setAdminPass('');
        } catch (error) {
            console.error("Erro ao criar admin", error);
            alert("Erro ao criar o administrador. Verifique os dados.");
        } finally {
            setIsCreatingAdmin(false);
        }
    };

    const pendingReports = reports.filter(r => r.status === 'pending');

    return (
        <div className="layout-wrapper">
            <LeftSidebar />

            <main className="content">
                <header className="home-header">
                    <h2>Painel Administrativo</h2>
                </header>

                <div className="admin-tabs">
                    <button 
                        className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        Denúncias ({pendingReports.length})
                    </button>
                    <button 
                        className={`admin-tab ${activeTab === 'create_admin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create_admin')}
                    >
                        Novo Admin
                    </button>
                </div>

                <div className="admin-content">
                    {activeTab === 'reports' && (
                        <div className="reports-section">
                            {pendingReports.length > 0 ? (
                                pendingReports.map(report => (
                                    <div key={report.id} className="report-card">
                                        <div className="report-header">
                                            <span className="report-reason">
                                                Motivo: <strong>{report.reason === 'outro' ? 'Outro' : report.reason.toUpperCase()}</strong>
                                            </span>
                                            <span className="report-date">
                                                {new Date(report.reported_at).toLocaleString()}
                                            </span>
                                        </div>
                                        {report.reason === 'outro' && (
                                            <div className="report-custom-reason">
                                                <em>"{report.custom_reason}"</em>
                                            </div>
                                        )}
                                        <div className="report-post-preview">
                                            <strong>@{report.author_username} escreveu:</strong>
                                            <p>{report.post_content}</p>
                                        </div>
                                        <div className="report-actions">
                                            <button className="btn-dismiss" onClick={() => handleDismissReport(report.id)}>Ignorar</button>
                                            <button className="btn-delete-post" onClick={() => handleDeletePost(report.id, report.post_id)}>Excluir Publicação</button>
                                            <button className="btn-ban-user" onClick={() => handleBanUser(report.author_username)}>Banir @{report.author_username}</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="post-placeholder">Nenhuma denúncia pendente.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'create_admin' && (
                        <div className="create-admin-section">
                            <h3>Criar nova conta de Administrador</h3>
                            <p className="admin-help-text">
                                Usuários criados aqui terão acesso completo ao painel de administração e poderão avaliar denúncias e excluir publicações.
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
                    )}
                </div>
            </main>
        </div>
    );
}

import React, { useState } from 'react';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from '../../components/RightSidebar';
import './styles.css';

const MOCK_REPORTS = [
    {
        id: 101,
        post_id: 1,
        post_content: "Primeira publicação de teste no frontend! Sem curtidas ou reposts meus, com midia.",
        author_username: "teste_front",
        reason: "spam",
        custom_reason: "",
        status: "pending", // pending, dismissed, deleted
        reported_at: "2026-07-27T10:00:00Z"
    },
    {
        id: 102,
        post_id: 2,
        post_content: "Compre meu curso 100% garantido de ficar rico rápido!!!",
        author_username: "pessoa_2",
        reason: "outro",
        custom_reason: "Propaganda enganosa clara.",
        status: "pending",
        reported_at: "2026-07-27T11:30:00Z"
    }
];

export default function AdminDashboard() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'create_admin'

    // Form states
    const [adminName, setAdminName] = useState('');
    const [adminUser, setAdminUser] = useState('');
    const [adminPass, setAdminPass] = useState('');

    const handleDismissReport = (reportId) => {
        setReports(reports.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
    };

    const handleDeletePost = (reportId) => {
        // Na vida real isso faria um DELETE /posts/:post_id e marcaria o report como resolvido
        setReports(reports.map(r => r.id === reportId ? { ...r, status: 'deleted' } : r));
    };

    const handleBanUser = (username) => {
        if (window.confirm(`Tem certeza que deseja banir o usuário @${username}? Esta ação é irreversível.`)) {
            // Na vida real faria DELETE /users/:username
            // Para o mock, vamos marcar todas as denúncias desse usuário como deletadas (pois o usuário sumiu)
            setReports(reports.map(r => r.author_username === username ? { ...r, status: 'deleted' } : r));
            alert(`O usuário @${username} foi banido com sucesso! Suas postagens foram removidas.`);
        }
    };

    const handleCreateAdmin = (e) => {
        e.preventDefault();
        // Na vida real: POST /users/create_admin
        alert(`Sucesso! O administrador @${adminUser} foi criado.\n\n(Ação simulada, dados não foram salvos no backend)`);
        setAdminName('');
        setAdminUser('');
        setAdminPass('');
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
                                            <button className="btn-delete-post" onClick={() => handleDeletePost(report.id)}>Excluir Publicação</button>
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
                                        placeholder="Ex: Moderador Vórtice"
                                        value={adminName}
                                        onChange={e => setAdminName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Ex: mod_vortice"
                                        value={adminUser}
                                        onChange={e => setAdminUser(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Senha Segura</label>
                                    <input 
                                        type="password" 
                                        required 
                                        placeholder="••••••••"
                                        value={adminPass}
                                        onChange={e => setAdminPass(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn-submit-admin">Criar Administrador</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>

            <RightSidebar />
        </div>
    );
}

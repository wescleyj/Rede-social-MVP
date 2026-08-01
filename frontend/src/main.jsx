import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/Sign_in';
import SignUp from './pages/Sign_up';
import Home from './pages/Home';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Search from './pages/Search';
import AdminDashboard from './pages/AdminDashboard';
import { RotaPublica, RotaPrivada, RotaAdmin } from "../services/routes.jsx";
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Feed e Pesquisa - acessível por todos (visitantes e logados) */}
                    <Route path="/" element={<Home />} />
                    <Route path="/pesquisa" element={<Search />} />

                    {/* Autenticação - só acessível se NÃO estiver logado */}
                    <Route path="/signin" element={<RotaPublica><SignIn /></RotaPublica>} />
                    <Route path="/signup" element={<RotaPublica><SignUp /></RotaPublica>} />

                    {/* Perfil - /profile próprio requer login; /profile/:username é público */}
                    <Route path="/profile" element={<RotaPrivada><Profile /></RotaPrivada>} />
                    <Route path="/profile/:username" element={<Profile />} />


                    {/* Admin Dashboard - acessível apenas para is_staff === true */}
                    <Route path="/admin" element={<RotaAdmin><AdminDashboard /></RotaAdmin>} />

                    {/* Rota curinga para capturar qualquer caminho não listado acima */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);
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
import Notifications from './pages/Notifications';
import { RotaPublica, RotaPrivada, RotaAdmin } from "../services/routes.jsx";
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Ponto de entrada da aplicação, configurando provedor de autenticação e roteamento
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/pesquisa" element={<Search />} />
                    <Route path="/signin" element={<RotaPublica><SignIn /></RotaPublica>} />
                    <Route path="/signup" element={<RotaPublica><SignUp /></RotaPublica>} />
                    <Route path="/notificacoes" element={<RotaPrivada><Notifications /></RotaPrivada>} />
                    <Route path="/notifications" element={<RotaPrivada><Notifications /></RotaPrivada>} />
                    <Route path="/profile" element={<RotaPrivada><Profile /></RotaPrivada>} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/admin" element={<RotaAdmin><AdminDashboard /></RotaAdmin>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);
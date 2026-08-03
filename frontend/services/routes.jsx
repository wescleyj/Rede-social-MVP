import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../src/contexts/AuthContext.jsx';

// Restringe o acesso apenas a usuários autenticados, redirecionando visitantes para o login
export function RotaPrivada({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    return children;
}

// Restringe o acesso a visitantes, redirecionando usuários autenticados para a página inicial
export function RotaPublica({ children }) {
    const token = localStorage.getItem('token');

    if (token) {
        return <Navigate to="/" replace />;
    }

    return children;
}

// Restringe o acesso apenas a administradores, redirecionando usuários comuns para a página inicial
export function RotaAdmin({ children }) {
    const { userData } = useContext(AuthContext);

    if (!userData) {
        return <div>Carregando...</div>;
    }

    if (!userData.is_superuser) {
        return <Navigate to="/" replace />;
    }

    return children;
}
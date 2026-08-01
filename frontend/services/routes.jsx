import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../src/contexts/AuthContext.jsx';

// Protege páginas como /home. Se não houver token, joga pro login.
export function RotaPrivada({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    return children;
}

// Protege páginas como /signin e /signup. Se já houver token, joga pra home.
export function RotaPublica({ children }) {
    const token = localStorage.getItem('token');

    if (token) {
        return <Navigate to="/" replace />;
    }

    return children;
}

// Protege páginas administrativas. Se não for admin, joga para home.
export function RotaAdmin({ children }) {
    const { userData } = useContext(AuthContext);

    // Se userData for null, significa que ainda está carregando no AuthProvider
    if (!userData) {
        return <div>Carregando...</div>;
    }

    if (!userData.is_superuser) {
        return <Navigate to="/" replace />;
    }

    return children;
}
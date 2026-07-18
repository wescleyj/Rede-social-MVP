import { Navigate } from 'react-router-dom';

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
import React, { createContext, useState, useEffect } from 'react';
import api from '../../services/api';

export const AuthContext = createContext({});

// Dados de fallback para desenvolvimento sem backend
const MOCK_USER = {
    name: "Usuário Teste",
    username: "teste_front",
    bio: "Testando a interface sem backend.",
    created_at: "2024-01-01T12:00:00Z",
    following_count: 15,
    followers_count: 32,
    posts_count: 2,
    avatar_url: null,
    banner_url: null,
    isAnonymous: false,
    is_staff: false,
    is_private: false
};

const MOCK_ADMIN = {
    name: "Administrador Supremo",
    username: "admin_vortice",
    bio: "Responsável por manter a ordem.",
    created_at: "2023-01-01T12:00:00Z",
    following_count: 0,
    followers_count: 999,
    posts_count: 1,
    avatar_url: null,
    banner_url: null,
    isAnonymous: false,
    is_staff: true
};

const VISITOR_USER = { name: 'Visitante', username: 'visitante', avatar_url: null, isAnonymous: true };

export function AuthProvider({ children }) {
    const [userData, setUserData] = useState(null);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUserData(VISITOR_USER);
        window.location.href = '/signin';
    };

    const togglePrivacy = () => {
        if (!userData || userData.isAnonymous) return;
        // Na vida real isso faria PUT /users/me/privacy
        const newPrivacyStatus = !userData.is_private;
        setUserData({ ...userData, is_private: newPrivacyStatus });
        alert(`Sua conta agora é ${newPrivacyStatus ? 'PRIVADA' : 'PÚBLICA'}.`);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        async function fetchUserData() {
            try {
                const response = await api.get('/users/me');
                setUserData({
                    ...response.data,
                    isAnonymous: false
                });
            } catch (error) {
                console.warn('Backend indisponível, usando dados de teste:', error.message);
                if (token === 'admin-token') {
                    setUserData(MOCK_ADMIN);
                } else {
                    setUserData(MOCK_USER);
                }
            }
        }

        if (token) {
            fetchUserData();
        } else {
            setUserData(VISITOR_USER);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ userData, setUserData, logout, togglePrivacy }}>
            {children}
        </AuthContext.Provider>
    );
}
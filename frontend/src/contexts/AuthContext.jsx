import React, { createContext, useState, useEffect } from 'react';
import api from '../../services/api';

export const AuthContext = createContext({});

const VISITOR_USER = { name: 'Visitante', username: 'visitante', avatar_url: null, isAnonymous: true };

export function AuthProvider({ children }) {
    const [userData, setUserData] = useState(null);

    const login = async (username, password) => {
        const response = await api.post('/api/auth/login/', { username, password });
        
        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            if (response.data.refresh) {
                localStorage.setItem('refreshToken', response.data.refresh);
            }
            
            // Buscar os dados após o login bem sucedido
            // O interceptor já vai injetar o token no header
            const userResponse = await api.get('/api/users/me/');
            setUserData({ ...userResponse.data, isAnonymous: false });
            return true;
        }
        return false;
    };

    const logout = () => {
        // Tentar deslogar no backend (invalidar refresh token)
        const refresh = localStorage.getItem('refreshToken');
        if (refresh) {
            api.post('/api/logout/', { refresh }).catch(err => console.error("Erro no logout remoto", err));
        }
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
                const response = await api.get('/api/users/me/');
                setUserData({
                    ...response.data,
                    isAnonymous: false
                });
            } catch (error) {
                console.error('Erro ao buscar dados do usuário. Sessão expirou?', error.message);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                setUserData(VISITOR_USER);
            }
        }

        if (token) {
            fetchUserData();
        } else {
            setUserData(VISITOR_USER);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ userData, setUserData, login, logout, togglePrivacy }}>
            {children}
        </AuthContext.Provider>
    );
}
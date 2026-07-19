import React, { createContext, useState, useEffect } from 'react';
import api from '../../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        async function fetchUserData() {
            try {
                // MOCK DO USUÁRIO LOCAL:
                setUserData({
                    name: "Usuário Teste",
                    username: "teste_front",
                    bio: "Testando a interface sem backend.",
                    created_at: "2024-01-01T12:00:00Z",
                    following_count: 15,
                    followers_count: 32,
                    posts_count: 2,
                    avatar_url: null,
                    banner_url: null,
                    isAnonymous: false
                });

                // const response = await api.get('/users/me');
                // setUserData(response.data);
            } catch (error) {
                console.error(error);
                setUserData({ name: 'Visitante', username: 'visitante', avatar_url: null, isAnonymous: true });
            }
        }

        if (token) {
            fetchUserData();
        } else {
            setUserData({ name: 'Visitante', username: 'visitante', avatar_url: null, isAnonymous: true });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ userData }}>
            {children}
        </AuthContext.Provider>
    );
}
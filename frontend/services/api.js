import axios from 'axios';

// Endereço base da API
export const baseURL = 'http://localhost:8000';

const api = axios.create({
    baseURL: baseURL,
});

// Injeta o token JWT de autenticação no cabeçalho das requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Trata renovação automática de tokens expirados e encerramento de sessão
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isAuthRequest = originalRequest?.url?.includes('/api/auth/login/') || originalRequest?.url?.includes('/api/auth/refresh/');
        const isSkipAuthRedirect = originalRequest?.skipAuthRedirect;

        // Lida com erro 401 tentando renovar o token de acesso via refresh token
        if (error.response?.status === 401 && !isAuthRequest && !isSkipAuthRedirect && !originalRequest?._retry) {
            const refreshToken = localStorage.getItem('refreshToken');

            // Executa o refresh do token no servidor e repete a requisição original
            if (refreshToken) {
                originalRequest._retry = true;
                try {
                    const res = await axios.post(`${baseURL}/api/auth/refresh/`, { refresh: refreshToken });
                    if (res.data?.access) {
                        localStorage.setItem('token', res.data.access);
                        if (res.data.refresh) {
                            localStorage.setItem('refreshToken', res.data.refresh);
                        }
                        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                        return api(originalRequest);
                    }
                } catch (refreshErr) {
                    console.warn("Sessão expirada. Redirecionando para login.");
                }
            }

            // Limpa credenciais inválidas e redireciona o usuário para o login quando a renovação falha
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

export default api;
import axios from 'axios'

export const baseURL = 'http://localhost:8000';

const api = axios.create({
    baseURL: baseURL,
})

// Intercepta as requisições para injetar o token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepta as respostas para tratar tokens inválidos/falsos apontados pelo backend
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/api/auth/login/');
        const isSkipAuthRedirect = error.config?.skipAuthRedirect;

        // Não desloga nem redireciona se for uma tentativa de login ou verificação de credenciais que falhou
        if (error.response?.status === 401 && !isLoginRequest && !isSkipAuthRedirect) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

export default api
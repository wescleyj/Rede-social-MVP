import axios from 'axios';

export const baseURL = 'http://localhost:8000';

const api = axios.create({
    baseURL: baseURL,
});

// Intercepta as requisições para injetar o token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepta as respostas para renovar o token via /api/auth/refresh/ ou redirecionar se expirado
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isAuthRequest = originalRequest?.url?.includes('/api/auth/login/') || originalRequest?.url?.includes('/api/auth/refresh/');
        const isSkipAuthRedirect = originalRequest?.skipAuthRedirect;

        if (error.response?.status === 401 && !isAuthRequest && !isSkipAuthRedirect && !originalRequest?._retry) {
            const refreshToken = localStorage.getItem('refreshToken');
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

            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

export default api;
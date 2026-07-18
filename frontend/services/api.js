import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000'
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
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

export default api
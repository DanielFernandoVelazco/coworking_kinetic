import axios from 'axios';

// Usar la URL relativa para que el proxy de Vite funcione
const API_URL = '/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para agregar el token (solo si existe)
axiosInstance.interceptors.request.use(
    (config) => {
        // No agregar token para endpoints públicos
        const publicEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/spaces/featured', '/spaces/available'];
        const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

        if (!isPublic) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Solo intentar refresh si:
        // 1. Es un error 401
        // 2. No es un endpoint público
        // 3. No se ha intentado ya
        // 4. Hay refresh token disponible
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest._isPublic) {

            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Si no hay refresh token, redirigir al login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(new Error('No refresh token available'));
                }

                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Si falla el refresh, redirigir al login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
// frontend/src/api/axios.config.js
import axios from 'axios';

const API_URL = '/api';

// ✅ Definir endpoints públicos
const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/refresh-token',
    '/spaces',
    '/spaces/featured',
    '/spaces/available',
    '/spaces/search',
    '/spaces/city',
];

const isPublicEndpoint = (url) => {
    if (!url) return false;
    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Interceptor de Request
axiosInstance.interceptors.request.use(
    (config) => {
        const isPublic = isPublicEndpoint(config.url);

        // ✅ Solo agregar token si NO es público
        if (!isPublic) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url} ${isPublic ? '(público)' : '(autenticado)'}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de Response
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // ❌ Error de conexión
        if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
            console.error('❌ No se puede conectar con el servidor');
            return Promise.reject(new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.'));
        }

        // 🔄 Refresh token solo si es 401 y NO es público
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !isPublicEndpoint(originalRequest.url)) {

            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
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
                // ❌ Refresh falló - redirigir a login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        console.error(`❌ Error en ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
            error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default axiosInstance;
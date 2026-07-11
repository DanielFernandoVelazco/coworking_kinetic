// frontend/src/api/axios.config.js
import axios from 'axios';

// Usar la URL relativa para que el proxy de Vite funcione
const API_URL = '/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Interceptor para agregar el token
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

        console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si el error es de conexión (ECONNREFUSED)
        if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
            console.error('❌ No se puede conectar con el servidor. ¿El backend está corriendo?');
            // Mostrar mensaje amigable
            return Promise.reject(new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.'));
        }

        // Solo intentar refresh si es 401 y no es público
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest._isPublic) {

            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
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
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        console.error(`❌ Error en ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default axiosInstance;
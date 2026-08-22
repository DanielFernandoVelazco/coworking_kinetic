// frontend/src/api/axios.config.js
import axios from 'axios';

const API_URL = '/api';

// Definir endpoints públicos (SOLO GETs públicos)
const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/refresh-token',
    '/spaces',           // GET /spaces es público
    '/spaces/featured',  // GET /spaces/featured es público
    '/spaces/available', // GET /spaces/available es público
    '/spaces/search',    // GET /spaces/search es público
    '/spaces/city',      // GET /spaces/city es público
];

// Función mejorada para detectar si un endpoint es público
const isPublicEndpoint = (config) => {
    const url = config.url || '';
    const method = (config.method || '').toUpperCase();

    // Las solicitudes POST, PUT, PATCH, DELETE NUNCA son públicas
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return false;
    }

    // Solo GET puede ser público
    if (method === 'GET') {
        return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
    }

    return false;
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
        const isPublic = isPublicEndpoint(config);

        // Solo agregar token si NO es público
        if (!isPublic) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                // Si no hay token y no es público, loguear advertencia
                console.warn(`⚠️ No hay token para ${config.method?.toUpperCase()} ${config.url} (requiere autenticación)`);
            }
        }

        console.log(`📤 ${config.method?.toUpperCase()} ${config.url} ${isPublic ? '(público)' : '(autenticado)'}`);
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

        // Error de conexión
        if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
            console.error('❌ No se puede conectar con el servidor');
            return Promise.reject(new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.'));
        }

        // Refresh token solo si es 401 y NO es público
        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !isPublicEndpoint(originalRequest)) {

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
                // Refresh falló - redirigir a login
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
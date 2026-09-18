// frontend/src/api/axios.config.js
import axios from 'axios';
import { isPublicEndpoint } from './config/publicEndpoints';
import tokenStorage from './config/tokenStorage';
import { refreshAccessToken, forceLogout } from './config/refreshTokenHandler';

const API_URL = '/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// ==================== INTERCEPTOR DE REQUEST ====================
axiosInstance.interceptors.request.use(
    (config) => {
        const isPublic = isPublicEndpoint(config);

        if (!isPublic) {
            const token = tokenStorage.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn(
                    `⚠️ No hay token para ${config.method?.toUpperCase()} ${config.url} (requiere autenticación)`
                );
            }
        }

        console.log(
            `📤 ${config.method?.toUpperCase()} ${config.url} ${isPublic ? '(público)' : '(autenticado)'}`
        );

        return config;
    },
    (error) => Promise.reject(error)
);

// ==================== INTERCEPTOR DE RESPONSE ====================
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(
            `📥 ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
        );
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Error de conexión
        if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
            console.error('❌ No se puede conectar con el servidor');
            return Promise.reject(
                new Error(
                    'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.'
                )
            );
        }

        // Refresh token solo si es 401, no es público y no se reintentó antes
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isPublicEndpoint(originalRequest)
        ) {
            originalRequest._retry = true;

            try {
                const accessToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                forceLogout();
                return Promise.reject(refreshError);
            }
        }

        const url = error.config?.url || '';
        const status = error.response?.status;
        const isExpected404 =
            status === 404 && url.includes('/prereservations/cart/');

        if (!isExpected404) {
            console.error(
                `❌ Error en ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
                status,
                error.response?.data
            );
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
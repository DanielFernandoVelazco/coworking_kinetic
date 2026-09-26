// frontend/src/api/config/publicEndpoints.js

/**
 * Endpoints que NO requieren autenticación.
 * Formato: { method: 'POST', path: '/auth/login' }
 *
 * Reglas:
 * - Los GET públicos están permitidos sin token.
 * - Algunos POST también son públicos (login, register, forgot, reset).
 * - Cualquier endpoint NO listado aquí asume que requiere autenticación.
 */

const PUBLIC_ENDPOINTS = [
    // ============ AUTH (POST, pero sin token) ============
    { method: 'POST', path: '/auth/login' },
    { method: 'POST', path: '/auth/register' },
    { method: 'POST', path: '/auth/forgot-password' },
    { method: 'POST', path: '/auth/reset-password' },
    { method: 'POST', path: '/auth/refresh-token' },

    // ============ PÚBLICOS (GET) ============
    { method: 'GET', path: '/spaces' },
    { method: 'GET', path: '/spaces/featured' },
    { method: 'GET', path: '/spaces/available' },
    { method: 'GET', path: '/spaces/search' },
    { method: 'GET', path: '/spaces/city' },

    // ============ HEALTH ============
    { method: 'GET', path: '/health' },
];

/**
 * Verifica si una request coincide con un endpoint público.
 *
 * Match por prefijo: '/spaces' matchea también '/spaces/featured' y '/spaces/123'.
 * Match por método: solo se considera público si el método coincide exactamente.
 */
export const isPublicEndpoint = (config) => {
    const url = config.url || '';
    const method = (config.method || '').toUpperCase();

    if (!method || !url) return false;

    return PUBLIC_ENDPOINTS.some((endpoint) => {
        const matchesMethod = endpoint.method === method;
        const matchesPath = url.includes(endpoint.path);
        return matchesMethod && matchesPath;
    });
};

export default PUBLIC_ENDPOINTS;
// frontend/src/api/config/publicEndpoints.js

/**
 * Endpoints que NO requieren autenticación (solo GET).
 * Cualquier método POST/PUT/PATCH/DELETE NUNCA es público.
 */
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

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Determina si una petición es a un endpoint público.
 */
export const isPublicEndpoint = (config) => {
    const url = config.url || '';
    const method = (config.method || '').toUpperCase();

    // Los métodos mutantes nunca son públicos
    if (MUTATING_METHODS.includes(method)) return false;

    // Solo GET puede ser público
    if (method !== 'GET') return false;

    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

export default PUBLIC_ENDPOINTS;
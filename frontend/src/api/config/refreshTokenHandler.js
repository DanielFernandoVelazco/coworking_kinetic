// frontend/src/api/config/refreshTokenHandler.js
import axios from 'axios';
import tokenStorage from './tokenStorage';

const API_URL = '/api';

/**
 * Intenta renovar el access token usando el refresh token.
 * Devuelve el nuevo access token, o lanza si falla.
 */
export const refreshAccessToken = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token');
    }

    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    tokenStorage.setTokens(accessToken, newRefreshToken);

    return accessToken;
};

/**
 * Redirige a login limpiando sesión. Usado cuando el refresh falla.
 */
export const forceLogout = () => {
    tokenStorage.clear();
    window.location.href = '/login';
};

export default { refreshAccessToken, forceLogout };
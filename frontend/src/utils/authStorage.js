// frontend/src/utils/authStorage.js
import tokenStorage from '../api/config/tokenStorage';

const USER_KEY = 'user';

/**
 * Guarda toda la info de sesión tras login/register.
 */
export const saveAuth = ({ accessToken, refreshToken, user }) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

/**
 * Lee la sesión guardada. Devuelve { tokens, user } o null si no hay sesión.
 */
export const loadAuth = () => {
    const accessToken = tokenStorage.getAccessToken();
    const userData = localStorage.getItem(USER_KEY);

    if (!accessToken || !userData) return null;

    try {
        return {
            accessToken,
            user: JSON.parse(userData),
        };
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem(USER_KEY);
        return null;
    }
};

/**
 * Limpia toda la sesión.
 */
export const clearAuth = () => {
    tokenStorage.clear();
    localStorage.removeItem(USER_KEY);
};

export default { saveAuth, loadAuth, clearAuth };
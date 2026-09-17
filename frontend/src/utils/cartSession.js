// frontend/src/utils/cartSession.js

const SESSION_KEY = 'cartSessionId';

/**
 * Genera un sessionId único para el carrito.
 */
const generateSessionId = () => {
    return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Obtiene el sessionId guardado, o crea uno nuevo si no existe.
 */
export const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
};

/**
 * Limpia el sessionId (útil tras completar un pago).
 */
export const clearSessionId = () => {
    localStorage.removeItem(SESSION_KEY);
};

export default { getOrCreateSessionId, clearSessionId };
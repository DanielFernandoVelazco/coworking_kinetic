import axiosInstance from './axios.config';

const API_URL = '/auth';

export const authService = {
    // Registrar usuario
    register: async (userData) => {
        const response = await axiosInstance.post(`${API_URL}/register`, userData);
        return response.data;
    },

    // Iniciar sesión
    login: async (credentials) => {
        const response = await axiosInstance.post(`${API_URL}/login`, credentials);
        return response.data;
    },

    // Cerrar sesión
    logout: async () => {
        const response = await axiosInstance.post(`${API_URL}/logout`);
        return response.data;
    },

    // Refrescar token
    refreshToken: async (refreshToken) => {
        const response = await axiosInstance.post(`${API_URL}/refresh-token`, { refreshToken });
        return response.data;
    },

    // Recuperar contraseña
    forgotPassword: async (email) => {
        const response = await axiosInstance.post(`${API_URL}/forgot-password`, { email });
        return response.data;
    },

    // Resetear contraseña
    resetPassword: async (token, newPassword) => {
        const response = await axiosInstance.post(`${API_URL}/reset-password`, { token, newPassword });
        return response.data;
    },
};

export default authService;
import axiosInstance from './axios.config';

const API_URL = '/users';

export const usersService = {
    // Obtener perfil del usuario
    getProfile: async () => {
        const response = await axiosInstance.get(`${API_URL}/profile`);
        return response.data;
    },

    // Actualizar perfil
    updateProfile: async (userData) => {
        const response = await axiosInstance.put(`${API_URL}/profile`, userData);
        return response.data;
    },

    // Cambiar contraseña
    changePassword: async (passwordData) => {
        const response = await axiosInstance.post(`${API_URL}/change-password`, passwordData);
        return response.data;
    },

    // Obtener todos los usuarios (Admin)
    getAll: async () => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    // Obtener usuario por ID (Admin)
    getById: async (id) => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Actualizar usuario (Admin)
    update: async (id, userData) => {
        const response = await axiosInstance.put(`${API_URL}/${id}`, userData);
        return response.data;
    },

    // Eliminar usuario (Admin)
    delete: async (id) => {
        const response = await axiosInstance.delete(`${API_URL}/${id}`);
        return response.data;
    },
};

export default usersService;
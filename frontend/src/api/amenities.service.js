// frontend/src/api/amenities.service.js
import axiosInstance from './axios.config';

const API_URL = '/amenities';

export const amenitiesService = {
    // Obtener todas las amenidades (Admin)
    getAll: async () => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    // Obtener amenidades activas (Público)
    getActive: async () => {
        const response = await axiosInstance.get(`${API_URL}/active`);
        return response.data;
    },

    // Obtener amenidad por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Crear amenidad
    create: async (data) => {
        const response = await axiosInstance.post(API_URL, data);
        return response.data;
    },

    // Actualizar amenidad
    update: async (id, data) => {
        const response = await axiosInstance.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    // Eliminar amenidad
    delete: async (id) => {
        const response = await axiosInstance.delete(`${API_URL}/${id}`);
        return response.data;
    },

    // Activar/Desactivar amenidad
    toggleStatus: async (id) => {
        const response = await axiosInstance.patch(`${API_URL}/${id}/toggle`);
        return response.data;
    },

    // Buscar amenidades
    search: async (term) => {
        const response = await axiosInstance.get(`${API_URL}/search`, {
            params: { term }
        });
        return response.data;
    }
};

export default amenitiesService;
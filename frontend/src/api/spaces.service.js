import axiosInstance from './axios.config';

const API_URL = '/spaces';

export const spacesService = {
    // Obtener todos los espacios
    getAll: async () => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    // Obtener espacios disponibles
    getAvailable: async (startTime, endTime) => {
        const response = await axiosInstance.get(`${API_URL}/available`, {
            params: { startTime, endTime }
        });
        return response.data;
    },

    // Obtener espacios destacados
    getFeatured: async (limit = 10) => {
        const response = await axiosInstance.get(`${API_URL}/featured`, {
            params: { limit }
        });
        return response.data;
    },

    // Obtener espacios por ciudad
    getByCity: async (city) => {
        const response = await axiosInstance.get(`${API_URL}/city/${city}`);
        return response.data;
    },

    // Buscar espacios
    search: async (term, city = null, type = null) => {
        const response = await axiosInstance.get(`${API_URL}/search`, {
            params: { term, city, type }
        });
        return response.data;
    },

    // Obtener espacio por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Crear espacio (Admin)
    create: async (spaceData) => {
        const response = await axiosInstance.post(API_URL, spaceData);
        return response.data;
    },

    // Actualizar espacio (Admin)
    update: async (id, spaceData) => {
        const response = await axiosInstance.put(`${API_URL}/${id}`, spaceData);
        return response.data;
    },

    // Eliminar espacio (Admin)
    delete: async (id) => {
        const response = await axiosInstance.delete(`${API_URL}/${id}`);
        return response.data;
    },

    // Verificar disponibilidad
    checkAvailability: async (id, startTime, endTime) => {
        const response = await axiosInstance.get(`${API_URL}/${id}/availability`, {
            params: { startTime, endTime }
        });
        return response.data;
    },
};

export default spacesService;
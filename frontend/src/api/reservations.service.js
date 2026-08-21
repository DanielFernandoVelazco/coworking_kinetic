// frontend/src/api/reservations.service.js
import axiosInstance from './axios.config';

const API_URL = '/reservations';

export const reservationsService = {
    // Obtener reservas con filtros y ordenamiento
    getUserReservationsFiltered: async (page = 1, pageSize = 10, sortBy = 'date_desc', status = 'all') => {
        const response = await axiosInstance.get(`${API_URL}/user/filtered`, {
            params: { page, pageSize, sortBy, status }
        });
        return response.data;
    },

    // Obtener reservas del usuario (método original - se mantiene por compatibilidad)
    getUserReservations: async (page = 1, pageSize = 10) => {
        const response = await axiosInstance.get(`${API_URL}/user`, {
            params: { page, pageSize }
        });
        return response.data;
    },

    // Obtener reservas próximas
    getUpcoming: async (limit = 10) => {
        const response = await axiosInstance.get(`${API_URL}/user/upcoming`, {
            params: { limit }
        });
        return response.data;
    },

    // Obtener resumen de reservas
    getSummary: async () => {
        const response = await axiosInstance.get(`${API_URL}/user/summary`);
        return response.data;
    },

    // Obtener reservas de un espacio
    getBySpace: async (spaceId) => {
        const response = await axiosInstance.get(`${API_URL}/space/${spaceId}`);
        return response.data;
    },

    // Obtener reserva por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Crear reserva
    create: async (reservationData) => {
        const response = await axiosInstance.post(API_URL, reservationData);
        return response.data;
    },

    // Actualizar reserva
    update: async (id, reservationData) => {
        const response = await axiosInstance.put(`${API_URL}/${id}`, reservationData);
        return response.data;
    },

    // Cancelar reserva
    cancel: async (id, reason) => {
        const response = await axiosInstance.post(`${API_URL}/${id}/cancel`, { reason });
        return response.data;
    },

    // Confirmar reserva (Admin)
    confirm: async (id) => {
        const response = await axiosInstance.post(`${API_URL}/${id}/confirm`);
        return response.data;
    },

    // Obtener reservas activas (Admin)
    getActive: async () => {
        const response = await axiosInstance.get(`${API_URL}/active`);
        return response.data;
    },

    // Obtener TODAS las reservas (solo admin)
    getAllReservations: async (page = 1, pageSize = 15, sortBy = 'date_desc', status = 'all', search = '', userId = null, spaceId = null) => {
        const params = { page, pageSize, sortBy, status };
        if (search) params.search = search;
        if (userId) params.userId = userId;
        if (spaceId) params.spaceId = spaceId;

        const response = await axiosInstance.get(`${API_URL}/admin/all`, { params });
        return response.data;
    },
};

export default reservationsService;
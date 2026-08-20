// frontend/src/api/alerts.service.js
import axiosInstance from './axios.config';

const API_URL = '/alerts';

export const alertsService = {
    // Obtener todas las alertas del usuario
    getAll: async (isRead = null, limit = 50) => {
        const params = {};
        if (isRead !== null) params.isRead = isRead;
        params.limit = limit;
        const response = await axiosInstance.get(API_URL, { params });
        return response.data;
    },

    // Obtener solo alertas no leídas
    getUnread: async () => {
        const response = await axiosInstance.get(`${API_URL}/unread`);
        return response.data;
    },

    // Obtener conteo de alertas no leídas
    getUnreadCount: async () => {
        const response = await axiosInstance.get(`${API_URL}/unread/count`);
        return response.data.count;
    },

    // Obtener resumen de alertas
    getSummary: async () => {
        const response = await axiosInstance.get(`${API_URL}/summary`);
        return response.data;
    },

    // Obtener alerta por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Marcar alerta como leída
    markAsRead: async (id) => {
        const response = await axiosInstance.put(`${API_URL}/${id}/read`);
        return response.data;
    },

    // Marcar todas las alertas como leídas
    markAllAsRead: async () => {
        const response = await axiosInstance.put(`${API_URL}/read-all`);
        return response.data;
    },

    // Eliminar alerta
    delete: async (id) => {
        const response = await axiosInstance.delete(`${API_URL}/${id}`);
        return response.data;
    },

    // Eliminar todas las alertas leídas
    deleteAllRead: async () => {
        const response = await axiosInstance.delete(`${API_URL}/read`);
        return response.data;
    },

    // Crear alerta (Admin)
    create: async (data) => {
        const response = await axiosInstance.post(API_URL, data);
        return response.data;
    },

    // Crear alerta para usuario específico (Admin)
    createForUser: async (userId, data) => {
        const response = await axiosInstance.post(`${API_URL}/user/${userId}`, data);
        return response.data;
    },

    // Limpiar alertas antiguas (Admin)
    cleanOld: async (daysOld = 30) => {
        const response = await axiosInstance.post(`${API_URL}/clean`, null, {
            params: { daysOld }
        });
        return response.data;
    }
};

export default alertsService;
// frontend/src/api/admin.service.js
import axiosInstance from './axios.config';

const API_URL = '/admin';

export const adminService = {
    // ========== MÉTODOS EXISTENTES ==========
    getDashboard: async () => {
        const response = await axiosInstance.get(`${API_URL}/dashboard`);
        return response.data;
    },

    getSummary: async () => {
        const response = await axiosInstance.get(`${API_URL}/summary`);
        return response.data;
    },

    getMonthlyReservations: async (months = 12) => {
        const response = await axiosInstance.get(`${API_URL}/monthly-reservations`, {
            params: { months }
        });
        return response.data;
    },

    getMonthlyRevenue: async (months = 12) => {
        const response = await axiosInstance.get(`${API_URL}/monthly-revenue`, {
            params: { months }
        });
        return response.data;
    },

    getRecentReservations: async (limit = 10) => {
        const response = await axiosInstance.get(`${API_URL}/recent-reservations`, {
            params: { limit }
        });
        return response.data;
    },

    getTopUsers: async (limit = 10) => {
        const response = await axiosInstance.get(`${API_URL}/top-users`, {
            params: { limit }
        });
        return response.data;
    },

    getTopSpaces: async (limit = 10) => {
        const response = await axiosInstance.get(`${API_URL}/top-spaces`, {
            params: { limit }
        });
        return response.data;
    },

    getSystemHealth: async () => {
        const response = await axiosInstance.get(`${API_URL}/health`);
        return response.data;
    },

    exportReport: async (startDate, endDate) => {
        const response = await axiosInstance.get(`${API_URL}/export`, {
            params: { startDate, endDate },
            responseType: 'blob'
        });
        return response.data;
    },

    // ========== ✅ NUEVOS MÉTODOS DE ALERTAS ==========

    // Obtener todas las alertas (admin)
    getAllAlerts: async (isRead = null, limit = 100) => {
        const params = { limit };
        if (isRead !== null) params.isRead = isRead;
        const response = await axiosInstance.get(`${API_URL}/alerts`, { params });
        return response.data;
    },

    // Obtener estadísticas de alertas
    getAlertStats: async () => {
        const response = await axiosInstance.get(`${API_URL}/alerts/stats`);
        return response.data;
    },

    // Enviar alerta masiva a todos los usuarios
    broadcastAlert: async (data) => {
        const response = await axiosInstance.post(`${API_URL}/alerts/broadcast`, data);
        return response.data;
    },

    // Crear alerta para usuario específico
    createAlertForUser: async (userId, data) => {
        const response = await axiosInstance.post(`${API_URL}/alerts/user/${userId}`, data);
        return response.data;
    },

    // Obtener alerta por ID
    getAlertById: async (id) => {
        const response = await axiosInstance.get(`${API_URL}/alerts/${id}`);
        return response.data;
    },

    // Eliminar alerta (admin)
    deleteAlert: async (id) => {
        const response = await axiosInstance.delete(`${API_URL}/alerts/${id}`);
        return response.data;
    },

    // Limpiar alertas antiguas
    cleanOldAlerts: async (daysOld = 30) => {
        const response = await axiosInstance.post(`${API_URL}/alerts/clean`, null, {
            params: { daysOld }
        });
        return response.data;
    }
};

export default adminService;
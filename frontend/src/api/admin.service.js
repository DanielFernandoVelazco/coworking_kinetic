// frontend/src/api/admin.service.js
import axiosInstance from './axios.config';

const API_URL = '/admin';

export const adminService = {
    // Obtener todos los datos del dashboard
    getDashboard: async () => {
        const response = await axiosInstance.get(`${API_URL}/dashboard`);
        return response.data;
    },

    // Obtener métricas resumidas
    getSummary: async () => {
        const response = await axiosInstance.get(`${API_URL}/summary`);
        return response.data;
    },

    // Obtener reservas mensuales
    getMonthlyReservations: async (months = 12) => {
        const response = await axiosInstance.get(`${API_URL}/monthly-reservations`, {
            params: { months }
        });
        return response.data;
    },

    // Obtener ingresos mensuales
    getMonthlyRevenue: async (months = 12) => {
        const response = await axiosInstance.get(`${API_URL}/monthly-revenue`, {
            params: { months }
        });
        return response.data;
    },

    // Obtener reservas recientes
    getRecentReservations: async (limit = 10) => {
        const response = await axiosInstance.get(`${API_URL}/recent-reservations`, {
            params: { limit }
        });
        return response.data;
    },

    // Obtener top usuarios
    getTopUsers: async (limit = 10) => {
        const response = await axiosInstance.get(`${API_URL}/top-users`, {
            params: { limit }
        });
        return response.data;
    },

    // Obtener top espacios
    getTopSpaces: async (limit = 10) => {
        const response = await axiosInstance.get(`${API_URL}/top-spaces`, {
            params: { limit }
        });
        return response.data;
    },

    // Obtener estado del sistema
    getSystemHealth: async () => {
        const response = await axiosInstance.get(`${API_URL}/health`);
        return response.data;
    },

    // Exportar reporte
    exportReport: async (startDate, endDate) => {
        const response = await axiosInstance.get(`${API_URL}/export`, {
            params: { startDate, endDate },
            responseType: 'blob'
        });
        return response.data;
    }
};

export default adminService;
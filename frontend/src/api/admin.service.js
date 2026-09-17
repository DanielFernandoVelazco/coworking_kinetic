// frontend/src/api/admin.service.js
import request from './helpers/request';

const API_URL = '/admin';

export const adminService = {
    // ============ DASHBOARD ============
    getDashboard: () => request.get(`${API_URL}/dashboard`),

    getSummary: () => request.get(`${API_URL}/summary`),

    getMonthlyReservations: (months = 12) =>
        request.get(`${API_URL}/monthly-reservations`, { params: { months } }),

    getMonthlyRevenue: (months = 12) =>
        request.get(`${API_URL}/monthly-revenue`, { params: { months } }),

    getRecentReservations: (limit = 10) =>
        request.get(`${API_URL}/recent-reservations`, { params: { limit } }),

    getTopUsers: (limit = 10) =>
        request.get(`${API_URL}/top-users`, { params: { limit } }),

    getTopSpaces: (limit = 10) =>
        request.get(`${API_URL}/top-spaces`, { params: { limit } }),

    getSystemHealth: () => request.get(`${API_URL}/health`),

    // ============ REPORTES ============
    exportReport: async (startDate, endDate) => {
        const response = await request.get(`${API_URL}/export`, {
            params: { startDate, endDate },
            responseType: 'blob',
        });
        return response;
    },

    // ============ ALERTAS ============
    getAllAlerts: (isRead = null, limit = 100) => {
        const params = { limit };
        if (isRead !== null) params.isRead = isRead;
        return request.get(`${API_URL}/alerts`, { params });
    },

    getAlertStats: () => request.get(`${API_URL}/alerts/stats`),

    broadcastAlert: (data) =>
        request.post(`${API_URL}/alerts/broadcast`, data),

    createAlertForUser: (userId, data) =>
        request.post(`${API_URL}/alerts/user/${userId}`, data),

    getAlertById: (id) => request.get(`${API_URL}/alerts/${id}`),

    deleteAlert: (id) => request.delete(`${API_URL}/alerts/${id}`),

    cleanOldAlerts: (daysOld = 30) =>
        request.post(`${API_URL}/alerts/clean`, null, { params: { daysOld } }),
};

export default adminService;
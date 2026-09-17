// frontend/src/api/alerts.service.js
import request from './helpers/request';

const API_URL = '/alerts';

export const alertsService = {
    // ============ USUARIO ============
    getAll: (isRead = null, limit = 50) => {
        const params = { limit };
        if (isRead !== null) params.isRead = isRead;
        return request.get(API_URL, { params });
    },

    getUnread: () => request.get(`${API_URL}/unread`),

    getUnreadCount: () => request.get(`${API_URL}/unread/count`),

    getSummary: () => request.get(`${API_URL}/summary`),

    getById: (id) => request.get(`${API_URL}/${id}`),

    markAsRead: (id) => request.put(`${API_URL}/${id}/read`),

    markAllAsRead: () => request.put(`${API_URL}/read-all`),

    delete: (id) => request.delete(`${API_URL}/${id}`),

    deleteAllRead: () => request.delete(`${API_URL}/read`),

    // ============ ADMIN ============
    create: (data) => request.post(API_URL, data),

    createForUser: (userId, data) => request.post(`${API_URL}/user/${userId}`, data),

    cleanOld: (daysOld = 30) =>
        request.post(`${API_URL}/clean`, null, { params: { daysOld } }),
};

export default alertsService;
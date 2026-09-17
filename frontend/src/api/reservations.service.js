// frontend/src/api/reservations.service.js
import request from './helpers/request';

const API_URL = '/reservations';

export const reservationsService = {
    // ============ USUARIO ============
    getUserReservationsFiltered: (page = 1, pageSize = 10, sortBy = 'date_desc', status = 'all') =>
        request.get(`${API_URL}/user/filtered`, {
            params: { page, pageSize, sortBy, status },
        }),

    getUserReservations: (page = 1, pageSize = 10) =>
        request.get(`${API_URL}/user`, { params: { page, pageSize } }),

    getUpcoming: (limit = 10) =>
        request.get(`${API_URL}/user/upcoming`, { params: { limit } }),

    getSummary: () => request.get(`${API_URL}/user/summary`),

    getBySpace: (spaceId) => request.get(`${API_URL}/space/${spaceId}`),

    getById: (id) => request.get(`${API_URL}/${id}`),

    getLatest: () => request.get(`${API_URL}/latest`),

    create: (reservationData) => request.post(API_URL, reservationData),

    update: (id, reservationData) => request.put(`${API_URL}/${id}`, reservationData),

    cancel: (id, reason) =>
        request.post(`${API_URL}/${id}/cancel`, { reason }),

    // ============ ADMIN ============
    confirm: (id) => request.post(`${API_URL}/${id}/confirm`),

    getActive: () => request.get(`${API_URL}/active`),

    getAllReservations: (page = 1, pageSize = 15, sortBy = 'date_desc', status = 'all', search = '', userId = null, spaceId = null) => {
        const params = { page, pageSize, sortBy, status };
        if (search) params.search = search;
        if (userId) params.userId = userId;
        if (spaceId) params.spaceId = spaceId;

        return request.get(`${API_URL}/admin/all`, { params });
    },
};

export default reservationsService;
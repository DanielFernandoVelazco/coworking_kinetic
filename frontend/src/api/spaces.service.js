// frontend/src/api/spaces.service.js
import request from './helpers/request';

const API_URL = '/spaces';

export const spacesService = {
    // ============ LECTURA ============
    getAll: (page = 1, pageSize = 100) =>
        request.get(API_URL, { params: { page, pageSize } }),

    getAllUnpaginated: () => request.get(`${API_URL}/all`),

    getAvailable: (startTime, endTime, page = 1, pageSize = 10) =>
        request.get(`${API_URL}/available`, {
            params: { startTime, endTime, page, pageSize },
        }),

    getFeatured: (limit = 10) =>
        request.get(`${API_URL}/featured`, { params: { limit } }),

    getByCity: (city) => request.get(`${API_URL}/city/${city}`),

    search: (term, city = null, type = null) =>
        request.get(`${API_URL}/search`, { params: { term, city, type } }),

    getById: (id) => request.get(`${API_URL}/${id}`),

    checkAvailability: (id, startTime, endTime) =>
        request.get(`${API_URL}/${id}/availability`, {
            params: { startTime, endTime },
        }),

    // ============ ADMIN ============
    create: (spaceData) => request.post(API_URL, spaceData),

    update: (id, spaceData) => request.put(`${API_URL}/${id}`, spaceData),

    delete: (id) => request.delete(`${API_URL}/${id}`),
};

export default spacesService;
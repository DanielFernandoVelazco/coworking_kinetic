// frontend/src/api/amenities.service.js
import request from './helpers/request';

const API_URL = '/amenities';

export const amenitiesService = {
    // ============ LECTURA ============
    getAll: () => request.get(API_URL),

    getActive: () => request.get(`${API_URL}/active`),

    getById: (id) => request.get(`${API_URL}/${id}`),

    search: (term) => request.get(`${API_URL}/search`, { params: { term } }),

    // ============ ADMIN ============
    create: (data) => request.post(API_URL, data),

    update: (id, data) => request.put(`${API_URL}/${id}`, data),

    delete: (id) => request.delete(`${API_URL}/${id}`),

    toggleStatus: (id) => request.patch(`${API_URL}/${id}/toggle`),
};

export default amenitiesService;
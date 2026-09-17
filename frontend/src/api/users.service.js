// frontend/src/api/users.service.js
import request from './helpers/request';

const API_URL = '/users';

export const usersService = {
    // ============ PERFIL ============
    getProfile: () => request.get(`${API_URL}/profile`),

    updateProfile: (userData) => request.put(`${API_URL}/profile`, userData),

    changePassword: (passwordData) =>
        request.post(`${API_URL}/change-password`, passwordData),

    // ============ ADMIN ============
    getAll: () => request.get(API_URL),

    getById: (id) => request.get(`${API_URL}/${id}`),

    update: (id, userData) => request.put(`${API_URL}/${id}`, userData),

    delete: (id) => request.delete(`${API_URL}/${id}`),
};

export default usersService;
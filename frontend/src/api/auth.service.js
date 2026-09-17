// frontend/src/api/auth.service.js
import request from './helpers/request';

const API_URL = '/auth';

export const authService = {
    register: (userData) => request.post(`${API_URL}/register`, userData),

    login: (credentials) => request.post(`${API_URL}/login`, credentials),

    logout: () => request.post(`${API_URL}/logout`),

    refreshToken: (refreshToken) =>
        request.post(`${API_URL}/refresh-token`, { refreshToken }),

    forgotPassword: (email) =>
        request.post(`${API_URL}/forgot-password`, { email }),

    resetPassword: (token, newPassword) =>
        request.post(`${API_URL}/reset-password`, { token, newPassword }),
};

export default authService;
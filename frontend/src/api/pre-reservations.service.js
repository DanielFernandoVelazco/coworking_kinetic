// frontend/src/api/pre-reservations.service.js
import request from './helpers/request';

const API_URL = '/prereservations';

export const preReservationsService = {
    // ============ CARRITO ============
    create: (data) => request.post(API_URL, data),

    getById: (id) => request.get(`${API_URL}/${id}`),

    getStatus: (id) => request.get(`${API_URL}/status/${id}`),

    getUserPreReservations: (status = null) => {
        const params = status ? { status } : {};
        return request.get(`${API_URL}/user`, { params });
    },

    getActiveCart: (sessionId) => request.get(`${API_URL}/cart/${sessionId}`),

    // ============ PAGO ============
    processPayment: (data) => request.post(`${API_URL}/payment`, data),

    confirmPayment: (data) => request.post(`${API_URL}/confirm`, data),

    cancel: (id, reason = null) =>
        request.post(`${API_URL}/${id}/cancel`, reason ? { reason } : {}),

    cleanExpired: () => request.post(`${API_URL}/clean-expired`),

    // ============ HELPERS ============
    checkIfPaid: async (id) => {
        try {
            const data = await preReservationsService.getById(id);
            return data.status === 'Paid';
        } catch {
            return false;
        }
    },
};

export default preReservationsService;
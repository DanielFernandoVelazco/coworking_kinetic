// frontend/src/api/pre-reservations.service.js
import axiosInstance from './axios.config';

const API_URL = '/prereservations';

export const preReservationsService = {
    // Crear una pre-reserva (carrito)
    create: async (data) => {
        const response = await axiosInstance.post(API_URL, data);
        return response.data;
    },

    // ✅ NUEVO: Verificar estado de una pre-reserva
    getStatus: async (id) => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    // ✅ NUEVO: Verificar si una pre-reserva fue pagada
    checkIfPaid: async (id) => {
        try {
            const data = await preReservationsService.getById(id);
            return data.status === 'Paid';
        } catch {
            return false;
        }
    },

    // Obtener pre-reserva por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`${API_URL}/${id}`);
        return response.data;
    },

    // Obtener todas las pre-reservas del usuario (carrito activo)
    getUserPreReservations: async (status = null) => {
        const params = status ? { status } : {};
        const response = await axiosInstance.get(`${API_URL}/user`, { params });
        return response.data;
    },

    // Obtener carrito activo por sessionId
    getActiveCart: async (sessionId) => {
        const response = await axiosInstance.get(`${API_URL}/cart/${sessionId}`);
        return response.data;
    },

    // Procesar pago de la pre-reserva
    processPayment: async (data) => {
        const response = await axiosInstance.post(`${API_URL}/payment`, data);
        return response.data;
    },

    // Confirmar pago y convertir en reserva definitiva
    confirmPayment: async (data) => {
        const response = await axiosInstance.post(`${API_URL}/confirm`, data);
        return response.data;
    },

    // Cancelar pre-reserva
    cancel: async (id, reason = null) => {
        const response = await axiosInstance.post(`${API_URL}/${id}/cancel`, reason ? { reason } : {});
        return response.data;
    },

    // Limpiar pre-reservas expiradas
    cleanExpired: async () => {
        const response = await axiosInstance.post(`${API_URL}/clean-expired`);
        return response.data;
    },
};

export default preReservationsService;
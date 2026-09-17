// frontend/src/api/helpers/request.js
import axiosInstance from '../axios.config';

/**
 * Wrappers que devuelven directamente response.data.
 * Mantienen el manejo de errores nativo de axios.
 */
export const request = {
    get: async (url, config = {}) => {
        const response = await axiosInstance.get(url, config);
        return response.data;
    },

    post: async (url, data = null, config = {}) => {
        const response = await axiosInstance.post(url, data, config);
        return response.data;
    },

    put: async (url, data = null, config = {}) => {
        const response = await axiosInstance.put(url, data, config);
        return response.data;
    },

    patch: async (url, data = null, config = {}) => {
        const response = await axiosInstance.patch(url, data, config);
        return response.data;
    },

    delete: async (url, config = {}) => {
        const response = await axiosInstance.delete(url, config);
        return response.data;
    },
};

export default request;
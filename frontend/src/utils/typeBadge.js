// frontend/src/utils/typeBadge.js

/**
 * Clases CSS para el badge de tipo de alerta.
 */
export const getTypeColor = (type) => {
    const colors = {
        info: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        success: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
        error: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[type] || 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
};

/**
 * Ícono (Material Symbols) para el tipo de alerta.
 */
export const getTypeIcon = (type) => {
    const icons = {
        info: 'info',
        success: 'check_circle',
        warning: 'warning',
        error: 'error',
    };
    return icons[type] || 'notifications';
};

/**
 * Etiqueta con emoji para la categoría de una alerta.
 */
export const getCategoryLabel = (category) => {
    const labels = {
        booking: '📅 Booking',
        payment: '💳 Payment',
        system: '⚙️ System',
        promotion: '🎉 Promotion',
        general: '📌 General',
    };
    return labels[category] || category;
};

export default {
    getTypeColor,
    getTypeIcon,
    getCategoryLabel,
};
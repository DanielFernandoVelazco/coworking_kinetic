// frontend/src/utils/statusBadge.js

/**
 * Clases CSS para el badge de estado de una reserva.
 */
export const getStatusBadge = (status) => {
    const styles = {
        Confirmed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        Completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
};

/**
 * Clases CSS para el badge de estado (versión clara, sin dark mode).
 * Usada en ProfileOverview y ReservationDetailModal.
 */
export const getStatusBadgeLight = (status) => {
    const styles = {
        Confirmed: 'bg-emerald-100 text-emerald-700',
        Pending: 'bg-amber-100 text-amber-700',
        Completed: 'bg-blue-100 text-blue-700',
        Cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
};

/**
 * Ícono (Material Symbols) para el estado de una reserva.
 */
export const getStatusIcon = (status) => {
    const icons = {
        Confirmed: 'check_circle',
        Pending: 'pending',
        Completed: 'task_alt',
        Cancelled: 'cancel',
    };
    return icons[status] || 'circle';
};

/**
 * Color de texto para el estado (usado en gráficos / dashboards).
 */
export const getStatusColor = (status) => {
    const colors = {
        Confirmed: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
        Pending: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
        Completed: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        Cancelled: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
};

export default {
    getStatusBadge,
    getStatusBadgeLight,
    getStatusIcon,
    getStatusColor,
};
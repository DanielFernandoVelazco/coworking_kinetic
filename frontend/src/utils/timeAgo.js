// frontend/src/utils/timeAgo.js

/**
 * Convierte una fecha en texto relativo: "Just now", "5m ago", "2h ago", etc.
 */
export const formatTimeAgo = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    if (diff < 2592000000) return `${Math.floor(diff / 604800000)}w ago`;
    return date.toLocaleDateString();
};

export default { formatTimeAgo };
// frontend/src/utils/dateFormatter.js

/**
 * Formatea una fecha con hora: "Jan 15, 2026, 03:30 PM"
 */
export const formatDate = (dateString, locale = 'en-US') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Formatea una fecha sin hora: "Jan 15, 2026"
 */
export const formatDateShort = (dateString, locale = 'en-US') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Formatea fecha corta con solo mes/día: "Jan 15"
 */
export const formatDateOnly = (dateString, locale = 'en-US') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Formatea solo la hora: "03:30 PM"
 */
export const formatTime = (dateString, locale = 'en-US') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Formatea fecha larga: "January 2026"
 */
export const formatMonthYear = (dateString, locale = 'en-US') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Formatea una fecha "es-ES" (mes abreviado + año): "ene 2026"
 */
export const formatMonthShort = (dateString, locale = 'es-ES') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        month: 'short',
        year: 'numeric',
    });
};

export default {
    formatDate,
    formatDateShort,
    formatDateOnly,
    formatTime,
    formatMonthYear,
    formatMonthShort,
};
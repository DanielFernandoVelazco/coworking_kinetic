// frontend/src/hooks/useAlertPolling.js
import { useState, useEffect, useCallback, useRef } from 'react';
import alertsService from '../api/alerts.service';

/**
 * Hook para obtener el conteo de alertas no leídas y el resumen.
 * Opcionalmente puede hacer polling (deshabilitado por defecto).
 *
 * @param {boolean} isAuthenticated - Si el usuario está autenticado
 * @param {object} options - { pollInterval: number|null }
 * @returns { count, summary, loading, refresh }
 */
export const useAlertPolling = (isAuthenticated, options = {}) => {
    const { pollInterval = null } = options;

    const [count, setCount] = useState(0);
    const [summary, setSummary] = useState({
        total: 0,
        unread: 0,
        read: 0,
        byType: {},
        byCategory: {},
    });
    const [loading, setLoading] = useState(false);

    const intervalRef = useRef(null);

    const refresh = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const [countData, summaryData] = await Promise.all([
                alertsService.getUnreadCount(),
                alertsService.getSummary(),
            ]);

            setCount(countData || 0);
            setSummary(
                summaryData || {
                    total: 0,
                    unread: 0,
                    read: 0,
                    byType: {},
                    byCategory: {},
                }
            );
        } catch (error) {
            console.error('Error refreshing alerts:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Carga inicial cuando cambia la autenticación
    useEffect(() => {
        if (isAuthenticated) {
            refresh();
        } else {
            setCount(0);
            setSummary({
                total: 0,
                unread: 0,
                read: 0,
                byType: {},
                byCategory: {},
            });
        }
    }, [isAuthenticated, refresh]);

    // Polling opcional
    useEffect(() => {
        if (!isAuthenticated || !pollInterval) return;

        intervalRef.current = setInterval(refresh, pollInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isAuthenticated, pollInterval, refresh]);

    return {
        count,
        summary,
        loading,
        refresh,
        setCount,
        setSummary,
    };
};

export default useAlertPolling;
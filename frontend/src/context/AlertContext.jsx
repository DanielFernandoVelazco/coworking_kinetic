// frontend/src/context/AlertContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import alertsService from '../api/alerts.service';
import { useAlertPolling } from '../hooks/useAlertPolling';
import toast from 'react-hot-toast';

const AlertContext = createContext();

export const useAlerts = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlerts must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Hook dedicado al count + summary (con polling opcional)
    const {
        count: unreadCount,
        summary,
        refresh: refreshCountAndSummary,
        setCount: setUnreadCount,
    } = useAlertPolling(isAuthenticated, { pollInterval: null });

    // Reset al cerrar sesión
    useEffect(() => {
        if (!isAuthenticated || !user) {
            setAlerts([]);
        }
    }, [isAuthenticated, user]);

    // ==================== CARGA DE LISTADOS ====================

    const loadAlerts = useCallback(async (isRead = null) => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const data = await alertsService.getAll(isRead);
            setAlerts(Array.isArray(data) ? data : []);
            return data;
        } catch (error) {
            console.error('Error loading alerts:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const loadUnreadAlerts = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await alertsService.getUnread();
            setAlerts(Array.isArray(data) ? data : []);
            return data;
        } catch (error) {
            console.error('Error loading unread alerts:', error);
            return [];
        }
    }, [isAuthenticated]);

    // Delegamos a helpers del hook
    const loadUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        await refreshCountAndSummary();
    }, [isAuthenticated, refreshCountAndSummary]);

    const loadSummary = useCallback(async () => {
        if (!isAuthenticated) return;
        await refreshCountAndSummary();
    }, [isAuthenticated, refreshCountAndSummary]);

    // ==================== MUTACIONES ====================

    const markAsRead = useCallback(async (alertId) => {
        try {
            await alertsService.markAsRead(alertId);
            setAlerts(prev => prev.map(a =>
                a.id === alertId ? { ...a, isRead: true, readAt: new Date().toISOString() } : a
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Alerta marcada como leída');
            return true;
        } catch (error) {
            console.error('Error marking alert as read:', error);
            toast.error('Error al marcar alerta como leída');
            return false;
        }
    }, [setUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        try {
            await alertsService.markAllAsRead();
            setAlerts(prev => prev.map(a => ({ ...a, isRead: true, readAt: new Date().toISOString() })));
            setUnreadCount(0);
            toast.success('Todas las alertas marcadas como leídas');
            return true;
        } catch (error) {
            console.error('Error marking all alerts as read:', error);
            toast.error('Error al marcar todas las alertas como leídas');
            return false;
        }
    }, [setUnreadCount]);

    const deleteAlert = useCallback(async (alertId) => {
        try {
            await alertsService.delete(alertId);
            const deleted = alerts.find(a => a.id === alertId);
            setAlerts(prev => prev.filter(a => a.id !== alertId));
            if (deleted && !deleted.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            toast.success('Alerta eliminada');
            return true;
        } catch (error) {
            console.error('Error deleting alert:', error);
            toast.error('Error al eliminar alerta');
            return false;
        }
    }, [alerts, setUnreadCount]);

    const deleteAllRead = useCallback(async () => {
        try {
            await alertsService.deleteAllRead();
            setAlerts(prev => prev.filter(a => !a.isRead));
            toast.success('Alertas leídas eliminadas');
            return true;
        } catch (error) {
            console.error('Error deleting read alerts:', error);
            toast.error('Error al eliminar alertas leídas');
            return false;
        }
    }, []);

    // ==================== REFRESH GLOBAL ====================

    const refresh = useCallback(async () => {
        await Promise.all([
            loadAlerts(),
            refreshCountAndSummary(),
        ]);
    }, [loadAlerts, refreshCountAndSummary]);

    const createAlert = useCallback(async (data) => {
        try {
            const result = await alertsService.create(data);
            await loadAlerts();
            await refreshCountAndSummary();
            toast.success('Alerta creada');
            return result;
        } catch (error) {
            console.error('Error creating alert:', error);
            toast.error('Error al crear alerta');
            return null;
        }
    }, [loadAlerts, refreshCountAndSummary]);

    const value = {
        alerts,
        unreadCount,
        loading,
        summary,
        loadAlerts,
        loadUnreadAlerts,
        loadUnreadCount,
        loadSummary,
        markAsRead,
        markAllAsRead,
        deleteAlert,
        deleteAllRead,
        refresh,
        createAlert,
    };

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContext;
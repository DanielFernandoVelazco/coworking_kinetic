// frontend/src/context/AlertContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import alertsService from '../api/alerts.service';
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
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        total: 0,
        unread: 0,
        read: 0,
        byType: {},
        byCategory: {}
    });

    // Cargar alertas cuando el usuario se autentica
    useEffect(() => {
        if (isAuthenticated && user) {
            loadAlerts();
            loadUnreadCount();
        } else {
            setAlerts([]);
            setUnreadCount(0);
            setSummary({ total: 0, unread: 0, read: 0, byType: {}, byCategory: {} });
        }
    }, [isAuthenticated, user]);

    // Cargar todas las alertas
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

    // Cargar solo no leídas
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

    // Cargar conteo de no leídas
    const loadUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const count = await alertsService.getUnreadCount();
            setUnreadCount(count || 0);
            return count;
        } catch (error) {
            console.error('Error loading unread count:', error);
            return 0;
        }
    }, [isAuthenticated]);

    // Cargar resumen
    const loadSummary = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await alertsService.getSummary();
            setSummary(data || { total: 0, unread: 0, read: 0, byType: {}, byCategory: {} });
            return data;
        } catch (error) {
            console.error('Error loading summary:', error);
            return null;
        }
    }, [isAuthenticated]);

    // Marcar como leída
    const markAsRead = useCallback(async (alertId) => {
        try {
            await alertsService.markAsRead(alertId);
            // Actualizar estado local
            setAlerts(prev => prev.map(a =>
                a.id === alertId ? { ...a, isRead: true, readAt: new Date().toISOString() } : a
            ));
            // Actualizar conteo
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Alerta marcada como leída');
            return true;
        } catch (error) {
            console.error('Error marking alert as read:', error);
            toast.error('Error al marcar alerta como leída');
            return false;
        }
    }, []);

    // Marcar todas como leídas
    const markAllAsRead = useCallback(async () => {
        try {
            await alertsService.markAllAsRead();
            // Actualizar estado local
            setAlerts(prev => prev.map(a => ({ ...a, isRead: true, readAt: new Date().toISOString() })));
            setUnreadCount(0);
            toast.success('Todas las alertas marcadas como leídas');
            return true;
        } catch (error) {
            console.error('Error marking all alerts as read:', error);
            toast.error('Error al marcar todas las alertas como leídas');
            return false;
        }
    }, []);

    // Eliminar alerta
    const deleteAlert = useCallback(async (alertId) => {
        try {
            await alertsService.delete(alertId);
            // Actualizar estado local
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
    }, [alerts]);

    // Eliminar todas las leídas
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

    // Refrescar todo
    const refresh = useCallback(async () => {
        await Promise.all([
            loadAlerts(),
            loadUnreadCount(),
            loadSummary()
        ]);
    }, [loadAlerts, loadUnreadCount, loadSummary]);

    // Crear alerta (para uso interno)
    const createAlert = useCallback(async (data) => {
        try {
            const result = await alertsService.create(data);
            // Recargar alertas
            await loadAlerts();
            await loadUnreadCount();
            toast.success('Alerta creada');
            return result;
        } catch (error) {
            console.error('Error creating alert:', error);
            toast.error('Error al crear alerta');
            return null;
        }
    }, [loadAlerts, loadUnreadCount]);

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
        createAlert
    };

    return (
        <AlertContext.Provider value={value}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContext;
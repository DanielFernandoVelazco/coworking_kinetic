// frontend/src/components/common/AlertBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

const AlertBell = () => {
    const { unreadCount, alerts, markAsRead, markAllAsRead, loadAlerts } = useAlerts();
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showCount, setShowCount] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Cargar alertas al abrir el dropdown
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            loadAlerts(false); // Solo no leídas
        }
    }, [isOpen, isAuthenticated, loadAlerts]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Animar el contador
    useEffect(() => {
        if (unreadCount > 0) {
            setShowCount(true);
        }
    }, [unreadCount]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleAlertClick = async (alertId) => {
        await markAsRead(alertId);
        // Redirigir si tiene URL de acción
        const alert = alerts.find(a => a.id === alertId);
        if (alert?.actionUrl) {
            navigate(alert.actionUrl);
        }
        setIsOpen(false);
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/alerts');
    };

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        await markAllAsRead();
        // Actualizar la lista
        await loadAlerts(false);
    };

    const getTypeColor = (type) => {
        const colors = {
            'info': 'text-blue-600 bg-blue-100',
            'success': 'text-emerald-600 bg-emerald-100',
            'warning': 'text-amber-600 bg-amber-100',
            'error': 'text-red-600 bg-red-100'
        };
        return colors[type] || 'text-gray-600 bg-gray-100';
    };

    const getTypeIcon = (type) => {
        const icons = {
            'info': 'info',
            'success': 'check_circle',
            'warning': 'warning',
            'error': 'error'
        };
        return icons[type] || 'notifications';
    };

    const formatTimeAgo = (dateString) => {
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

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de campana */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low"
                aria-label="Notificaciones"
            >
                <span className="material-symbols-outlined text-2xl">
                    {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                </span>

                {/* Contador animado */}
                {unreadCount > 0 && (
                    <span className={`
                        absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full 
                        min-w-5 h-5 px-1.5 flex items-center justify-center
                        transition-all duration-300
                        ${showCount ? 'scale-100' : 'scale-0'}
                    `}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl shadow-2xl border border-outline-variant dark:border-outline-dark-variant overflow-hidden z-50 animate-slideDown">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-outline-variant dark:border-outline-dark-variant">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">notifications</span>
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-body-sm text-red-600 font-normal">
                                    ({unreadCount} new)
                                </span>
                            )}
                        </h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-body-xs text-primary hover:underline transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Lista de alertas */}
                    <div className="max-h-96 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="p-8 text-center text-on-surface-variant">
                                <span className="material-symbols-outlined text-4xl block mb-2">notifications_off</span>
                                <p className="text-body-md">No new notifications</p>
                                <p className="text-body-sm">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-outline-variant dark:divide-outline-dark-variant">
                                {alerts.slice(0, 5).map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 cursor-pointer hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors ${!alert.isRead ? 'bg-primary/5 dark:bg-primary-dark/5' : ''
                                            }`}
                                        onClick={() => handleAlertClick(alert.id)}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icono de tipo */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(alert.type)}`}>
                                                <span className="material-symbols-outlined text-lg">
                                                    {getTypeIcon(alert.type)}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="font-body-sm font-semibold text-on-surface dark:text-on-dark-surface truncate">
                                                        {alert.title}
                                                    </p>
                                                    {!alert.isRead && (
                                                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                                                    )}
                                                </div>
                                                <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant line-clamp-2 mt-0.5">
                                                    {alert.message}
                                                </p>
                                                <div className="flex justify-between items-center mt-1.5">
                                                    <span className="text-body-xs text-on-surface-variant/60">
                                                        {formatTimeAgo(alert.createdAt)}
                                                    </span>
                                                    {alert.actionLabel && (
                                                        <span className="text-body-xs text-primary hover:underline">
                                                            {alert.actionLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-outline-variant dark:border-outline-dark-variant text-center">
                        <button
                            onClick={handleViewAll}
                            className="text-body-sm text-primary hover:underline transition-colors w-full"
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}

            {/* Estilos de animación */}
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AlertBell;
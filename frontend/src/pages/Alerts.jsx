// frontend/src/pages/Alerts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Alerts = () => {
    const {
        alerts,
        unreadCount,
        loading,
        summary,
        loadAlerts,
        loadUnreadCount,
        loadSummary,
        markAsRead,
        markAllAsRead,
        deleteAlert,
        deleteAllRead,
        refresh
    } = useAlerts();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        refresh();
    }, [isAuthenticated, navigate, refresh]);

    // Filtrar alertas
    const getFilteredAlerts = useCallback(() => {
        let filtered = [...alerts];

        // Filtro de lectura
        if (filter === 'unread') {
            filtered = filtered.filter(a => !a.isRead);
        } else if (filter === 'read') {
            filtered = filtered.filter(a => a.isRead);
        }

        // Filtro por tipo
        if (selectedType !== 'all') {
            filtered = filtered.filter(a => a.type === selectedType);
        }

        // Filtro por categoría
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(a => a.category === selectedCategory);
        }

        return filtered;
    }, [alerts, filter, selectedType, selectedCategory]);

    const filteredAlerts = getFilteredAlerts();

    const getTypeColor = (type) => {
        const colors = {
            'info': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
            'success': 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
            'warning': 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
            'error': 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[type] || 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
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

    const getCategoryLabel = (category) => {
        const labels = {
            'booking': '📅 Booking',
            'payment': '💳 Payment',
            'system': '⚙️ System',
            'promotion': '🎉 Promotion',
            'general': '📌 General'
        };
        return labels[category] || category;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleMarkRead = async (alertId) => {
        await markAsRead(alertId);
        await refresh();
    };

    const handleDelete = async (alertId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta alerta?')) {
            await deleteAlert(alertId);
            await refresh();
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) {
            toast.info('No hay alertas no leídas');
            return;
        }
        await markAllAsRead();
        await refresh();
    };

    const handleDeleteAllRead = async () => {
        const readCount = alerts.filter(a => a.isRead).length;
        if (readCount === 0) {
            toast.info('No hay alertas leídas para eliminar');
            return;
        }
        if (window.confirm(`¿Eliminar ${readCount} alertas leídas?`)) {
            await deleteAllRead();
            await refresh();
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const getStatusBadge = (isRead) => {
        return isRead
            ? 'bg-surface-container-low text-on-surface-variant'
            : 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark';
    };

    if (loading && alerts.length === 0) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-on-surface-variant mt-4">Cargando alertas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">notifications</span>
                        Notifications
                    </h1>
                    <p className="text-body-md text-on-surface-variant mt-1">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'All caught up! No unread notifications'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">done_all</span>
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={handleDeleteAllRead}
                        className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">delete_sweep</span>
                        Clear read
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="font-headline-md text-primary">{summary.total}</div>
                    <div className="text-body-xs text-on-surface-variant">Total</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="font-headline-md text-red-600">{summary.unread}</div>
                    <div className="text-body-xs text-on-surface-variant">Unread</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="font-headline-md text-emerald-600">{summary.read}</div>
                    <div className="text-body-xs text-on-surface-variant">Read</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant">By Category</div>
                    <div className="text-body-sm font-semibold text-on-surface">
                        {Object.entries(summary.byCategory || {}).length > 0
                            ? Object.entries(summary.byCategory).map(([key, val]) =>
                                `${getCategoryLabel(key)}: ${val}`
                            ).join(', ')
                            : 'No data'
                        }
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-primary text-white shadow-md'
                            : 'hover:bg-surface-container-lowest text-on-surface-variant'
                            }`}
                    >
                        All ({alerts.length})
                    </button>
                    <button
                        onClick={() => handleFilterChange('unread')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'unread'
                            ? 'bg-primary text-white shadow-md'
                            : 'hover:bg-surface-container-lowest text-on-surface-variant'
                            }`}
                    >
                        Unread ({alerts.filter(a => !a.isRead).length})
                    </button>
                    <button
                        onClick={() => handleFilterChange('read')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'read'
                            ? 'bg-primary text-white shadow-md'
                            : 'hover:bg-surface-container-lowest text-on-surface-variant'
                            }`}
                    >
                        Read ({alerts.filter(a => a.isRead).length})
                    </button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    >
                        <option value="all">All Types</option>
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    >
                        <option value="all">All Categories</option>
                        <option value="booking">Booking</option>
                        <option value="payment">Payment</option>
                        <option value="system">System</option>
                        <option value="promotion">Promotion</option>
                        <option value="general">General</option>
                    </select>
                </div>
            </div>

            {/* Lista de alertas */}
            {filteredAlerts.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">notifications_off</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No notifications</h3>
                    <p className="text-body-md text-on-surface-variant">
                        {filter !== 'all'
                            ? `You don't have any ${filter} notifications`
                            : 'No notifications to display'}
                    </p>
                    {filter !== 'all' && (
                        <button
                            onClick={() => handleFilterChange('all')}
                            className="mt-4 text-primary hover:underline"
                        >
                            View all notifications
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`flex items-start gap-4 p-4 bg-surface-container-lowest rounded-xl border transition-all hover:shadow-md ${alert.isRead
                                    ? 'border-outline-variant opacity-75'
                                    : 'border-primary/30 shadow-sm'
                                }`}
                        >
                            {/* Icono de tipo */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(alert.type)}`}>
                                <span className="material-symbols-outlined text-2xl">
                                    {getTypeIcon(alert.type)}
                                </span>
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <h4 className="font-body-md font-semibold text-on-surface flex items-center gap-2">
                                            {alert.title}
                                            {!alert.isRead && (
                                                <span className="w-2 h-2 bg-primary rounded-full inline-block"></span>
                                            )}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className={`text-body-xs px-2 py-0.5 rounded-full ${getTypeColor(alert.type)}`}>
                                                {alert.type}
                                            </span>
                                            <span className="text-body-xs text-on-surface-variant">
                                                {getCategoryLabel(alert.category)}
                                            </span>
                                            <span className="text-body-xs text-on-surface-variant">
                                                {formatDate(alert.createdAt)}
                                            </span>
                                            {alert.isRead && (
                                                <span className="text-body-xs text-emerald-600">
                                                    ✓ Read
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        {!alert.isRead && (
                                            <button
                                                onClick={() => handleMarkRead(alert.id)}
                                                className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">check</span>
                                                Mark read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(alert.id)}
                                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-body-md text-on-surface-variant mt-2 whitespace-pre-wrap">
                                    {alert.message}
                                </p>
                                {alert.actionUrl && (
                                    <Link
                                        to={alert.actionUrl}
                                        onClick={() => {
                                            if (!alert.isRead) {
                                                markAsRead(alert.id);
                                            }
                                        }}
                                        className="inline-block mt-3 text-sm text-primary hover:underline font-medium"
                                    >
                                        {alert.actionLabel || 'View Details'} →
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer con información */}
            <div className="mt-6 text-center text-body-xs text-on-surface-variant">
                Showing {filteredAlerts.length} of {alerts.length} notifications
                {alerts.length > 50 && ` · Showing latest ${alerts.length} notifications`}
            </div>
        </div>
    );
};

export default Alerts;
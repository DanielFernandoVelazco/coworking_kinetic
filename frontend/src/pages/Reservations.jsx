// frontend/src/pages/Reservations.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import reservationsService from '../api/reservations.service';
import ReservationDetailModal from '../components/reservations/ReservationDetailModal';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const PAGE_SIZE = 10;

// Opciones de ordenamiento
const SORT_OPTIONS = [
    { value: 'date_desc', label: '📅 Date (Newest first)' },
    { value: 'date_asc', label: '📅 Date (Oldest first)' },
    { value: 'price_desc', label: '💰 Price (Highest first)' },
    { value: 'price_asc', label: '💰 Price (Lowest first)' },
    { value: 'guests_desc', label: '👥 Guests (Most first)' },
    { value: 'guests_asc', label: '👥 Guests (Least first)' },
];

const Reservations = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [reservations, setReservations] = useState([]);
    const [allReservations, setAllReservations] = useState([]); // Todas las reservas sin filtrar
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [showCancelModal, setShowCancelModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal de detalles
    const [selectedReservation, setSelectedReservation] = useState(null);

    // ✅ Resumen calculado en el frontend basado en todas las reservas
    const summary = useMemo(() => {
        if (!allReservations || allReservations.length === 0) {
            return {
                totalReservations: 0,
                activeReservations: 0,
                upcomingReservations: 0,
                completedReservations: 0,
                cancelledReservations: 0,
                totalHoursBooked: 0,
                totalSpent: 0
            };
        }

        const now = new Date();
        const active = allReservations.filter(r =>
            r.status === 'Confirmed' &&
            new Date(r.startTime) <= now &&
            new Date(r.endTime) >= now
        );
        const upcoming = allReservations.filter(r =>
            r.status === 'Confirmed' &&
            new Date(r.startTime) > now
        );
        const completed = allReservations.filter(r => r.status === 'Completed');
        const cancelled = allReservations.filter(r => r.status === 'Cancelled');

        // Calcular horas totales
        let totalHours = 0;
        allReservations.forEach(r => {
            if (r.status !== 'Cancelled') {
                const start = new Date(r.startTime);
                const end = new Date(r.endTime);
                const hours = (end - start) / (1000 * 60 * 60);
                totalHours += hours;
            }
        });

        // Calcular gasto total
        const totalSpent = allReservations
            .filter(r => r.status === 'Completed' || r.status === 'Confirmed')
            .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

        return {
            totalReservations: allReservations.length,
            activeReservations: active.length,
            upcomingReservations: upcoming.length,
            completedReservations: completed.length,
            cancelledReservations: cancelled.length,
            totalHoursBooked: Math.round(totalHours),
            totalSpent: Math.round(totalSpent)
        };
    }, [allReservations]);

    // Función para obtener TODAS las reservas del usuario (sin filtros)
    const fetchAllReservations = useCallback(async () => {
        try {
            // Usar el endpoint con filtro 'all' para obtener todas
            const response = await reservationsService.getUserReservationsFiltered(
                1,
                999, // Traer todas (máximo 999)
                'date_desc',
                'all'
            );

            if (response && response.items) {
                setAllReservations(response.items);
                return response.items;
            }
            return [];
        } catch (error) {
            console.error('Error fetching all reservations:', error);
            return [];
        }
    }, []);

    // Función para obtener reservas con filtros (para mostrar)
    const fetchReservations = useCallback(async (page, sort, status) => {
        setLoading(true);
        try {
            const response = await reservationsService.getUserReservationsFiltered(
                page,
                PAGE_SIZE,
                sort,
                status
            );

            if (response) {
                setReservations(response.items || []);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalCount || 0);
            } else {
                setReservations([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            toast.error('Error al cargar tus reservaciones');
            setReservations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar todas las reservas y las filtradas
    useEffect(() => {
        const loadData = async () => {
            await fetchAllReservations();
            await fetchReservations(currentPage, sortBy, filter);
        };
        loadData();
    }, [currentPage, sortBy, filter, fetchAllReservations, fetchReservations]);

    // Cambiar página
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cambiar ordenamiento
    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        setCurrentPage(1);
    };

    // Cambiar filtro de estado
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Confirmed': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
            'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
            'Completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'Cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        };
        return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Confirmed': 'check_circle',
            'Pending': 'pending',
            'Completed': 'task_alt',
            'Cancelled': 'cancel'
        };
        return icons[status] || 'circle';
    };

    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleCancelReservation = async () => {
        if (!showCancelModal) return;

        setCancelling(true);
        try {
            await reservationsService.cancel(showCancelModal, cancelReason || 'Cancelado por el usuario');
            toast.success('Reservación cancelada exitosamente');
            setShowCancelModal(null);
            setCancelReason('');
            // Recargar ambas listas
            await fetchAllReservations();
            await fetchReservations(currentPage, sortBy, filter);
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            toast.error(error.response?.data?.message || 'Error al cancelar la reservación');
        } finally {
            setCancelling(false);
        }
    };

    const getFilterCount = (filterType) => {
        if (!allReservations || allReservations.length === 0) return 0;
        const now = new Date();
        switch (filterType) {
            case 'upcoming':
                return allReservations.filter(r =>
                    r.status === 'Confirmed' && new Date(r.startTime) > now
                ).length;
            case 'active':
                return allReservations.filter(r =>
                    r.status === 'Confirmed' &&
                    new Date(r.startTime) <= now &&
                    new Date(r.endTime) >= now
                ).length;
            case 'past':
                return allReservations.filter(r =>
                    r.status === 'Completed' || new Date(r.endTime) < now
                ).length;
            case 'pending':
                return allReservations.filter(r => r.status === 'Pending').length;
            case 'cancelled':
                return allReservations.filter(r => r.status === 'Cancelled').length;
            default:
                return allReservations.length;
        }
    };

    const handleReservationClick = (reservation) => {
        setSelectedReservation(reservation);
    };

    const getCurrentSortLabel = () => {
        const option = SORT_OPTIONS.find(opt => opt.value === sortBy);
        return option?.label || 'Sort by';
    };

    if (loading && reservations.length === 0) {
        return (
            <div className="max-w-container-max mx-auto px-4 md:px-10 py-12">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto"></div>
                    <p className="text-on-surface-variant dark:text-on-dark-surface-variant mt-4">Loading your reservations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 transition-colors duration-300">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface">My Reservations</h1>
                <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                    Manage all your workspace bookings in one place
                </p>
            </div>

            {/* ✅ Summary Cards - Calculado desde allReservations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-primary dark:text-primary-dark">{summary.totalReservations}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Total Bookings</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-primary dark:text-primary-dark">{summary.activeReservations}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Active</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-primary dark:text-primary-dark">{summary.totalHoursBooked}h</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Hours Booked</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-primary dark:text-primary-dark">${summary.totalSpent}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Total Spent</div>
                </div>
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-outline-variant dark:border-outline-dark-variant pb-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'all'
                            ? 'bg-primary dark:bg-primary-dark text-white shadow-md'
                            : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface-variant dark:text-on-dark-surface-variant'
                            }`}
                    >
                        All ({getFilterCount('all')})
                    </button>
                    <button
                        onClick={() => handleFilterChange('upcoming')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'upcoming'
                            ? 'bg-primary dark:bg-primary-dark text-white shadow-md'
                            : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface-variant dark:text-on-dark-surface-variant'
                            }`}
                    >
                        Upcoming ({getFilterCount('upcoming')})
                    </button>
                    <button
                        onClick={() => handleFilterChange('active')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'active'
                            ? 'bg-primary dark:bg-primary-dark text-white shadow-md'
                            : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface-variant dark:text-on-dark-surface-variant'
                            }`}
                    >
                        Active ({getFilterCount('active')})
                    </button>
                    <button
                        onClick={() => handleFilterChange('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'pending'
                            ? 'bg-primary dark:bg-primary-dark text-white shadow-md'
                            : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface-variant dark:text-on-dark-surface-variant'
                            }`}
                    >
                        Pending ({getFilterCount('pending')})
                    </button>
                    <button
                        onClick={() => handleFilterChange('past')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'past'
                            ? 'bg-primary dark:bg-primary-dark text-white shadow-md'
                            : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface-variant dark:text-on-dark-surface-variant'
                            }`}
                    >
                        Past ({getFilterCount('past')})
                    </button>
                    <button
                        onClick={() => handleFilterChange('cancelled')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'cancelled'
                            ? 'bg-primary dark:bg-primary-dark text-white shadow-md'
                            : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface-variant dark:text-on-dark-surface-variant'
                            }`}
                    >
                        Cancelled ({getFilterCount('cancelled')})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">sort</span>
                        Sort by:
                    </span>
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="bg-surface-container-low dark:bg-surface-dark-container-low border border-outline-variant dark:border-outline-dark-variant rounded-lg px-3 py-1.5 text-sm text-on-surface dark:text-on-dark-surface focus:border-primary dark:focus:border-primary-dark focus:outline-none transition-all"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Indicador de ordenamiento actual */}
            <div className="flex items-center gap-2 mb-4 text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>
                    Showing {reservations.length} reservations sorted by: <strong>{getCurrentSortLabel()}</strong>
                </span>
            </div>

            {/* Lista de reservaciones */}
            {reservations.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl border border-outline-variant dark:border-outline-dark-variant transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant dark:text-on-dark-surface-variant mb-4 block">event_busy</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">No reservations found</h3>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        {filter !== 'all'
                            ? `You don't have any ${filter} reservations`
                            : 'You haven\'t made any reservations yet'}
                    </p>
                    <Link to="/catalog" className="mt-6 inline-block btn-primary dark:btn-primary-dark">
                        Browse Spaces
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {reservations.map((reservation) => {
                            const isUpcoming = new Date(reservation.startTime) > new Date();
                            const isActive = new Date(reservation.startTime) <= new Date() &&
                                new Date(reservation.endTime) >= new Date();
                            const canCancel = (reservation.status === 'Confirmed' || reservation.status === 'Pending') &&
                                isUpcoming;

                            return (
                                <div
                                    key={reservation.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl border border-outline-variant dark:border-outline-dark-variant hover:shadow-md hover:border-primary/30 dark:hover:border-primary-dark/30 transition-all duration-200 cursor-pointer"
                                    onClick={() => handleReservationClick(reservation)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h4 className="font-body-lg font-semibold text-on-surface dark:text-on-dark-surface">
                                                {reservation.spaceName}
                                            </h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(reservation.status)}`}>
                                                <span className="material-symbols-outlined text-sm">{getStatusIcon(reservation.status)}</span>
                                                {reservation.status}
                                            </span>
                                            {isActive && reservation.status === 'Confirmed' && (
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    Active Now
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                            <p className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">event</span>
                                                <span className="font-medium">{formatDateShort(reservation.startTime)}</span>
                                                <span>•</span>
                                                <span>{new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span>to</span>
                                                <span>{new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {reservation.spaceType}
                                            </p>
                                            {reservation.numberOfGuests && (
                                                <p className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">group</span>
                                                    {reservation.numberOfGuests} {reservation.numberOfGuests === 1 ? 'guest' : 'guests'}
                                                </p>
                                            )}
                                            {reservation.paymentStatus && (
                                                <p className={`flex items-center gap-1 ${reservation.paymentStatus === 'Completed'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-sm">payments</span>
                                                    Payment: {reservation.paymentStatus}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                                        <span className="font-headline-md text-primary dark:text-primary-dark">
                                            ${reservation.totalPrice?.toFixed(2) || '0.00'}
                                        </span>
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleReservationClick(reservation)}
                                                className="text-sm text-primary dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">info</span>
                                                Details
                                            </button>
                                            {canCancel && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowCancelModal(reservation.id);
                                                    }}
                                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                        {reservation.status === 'Pending' && (
                                            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">pending</span>
                                                Awaiting confirmation
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-on-surface dark:text-on-dark-surface"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    Previous
                                </button>

                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum
                                                    ? 'bg-primary dark:bg-primary-dark text-white'
                                                    : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface dark:text-on-dark-surface'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-on-surface dark:text-on-dark-surface"
                                >
                                    Next
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>

                            <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                Showing {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems} reservations
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal de Cancelación */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCancelModal(null)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Cancel Reservation
                        </h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-4">
                            Are you sure you want to cancel this reservation? This action cannot be undone.
                        </p>
                        <div className="mb-4">
                            <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                Reason (Optional)
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows="2"
                                placeholder="Why are you cancelling?"
                                className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(null);
                                    setCancelReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                            >
                                Keep Reservation
                            </button>
                            <button
                                onClick={handleCancelReservation}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalles */}
            {selectedReservation && (
                <ReservationDetailModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                />
            )}
        </div>
    );
};

export default Reservations;
// frontend/src/pages/Reservations.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import reservationsService from '../api/reservations.service';
import spacesService from '../api/spaces.service';
import toast from 'react-hot-toast';

const Reservations = () => {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCancelModal, setShowCancelModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const [reservationsData, summaryData] = await Promise.all([
                reservationsService.getUserReservations(),
                reservationsService.getSummary()
            ]);

            setReservations(Array.isArray(reservationsData) ? reservationsData : []);
            setSummary(summaryData);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            toast.error('Error al cargar tus reservaciones');
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredReservations = () => {
        const now = new Date();
        switch (filter) {
            case 'upcoming':
                return reservations.filter(r =>
                    r.status === 'Confirmed' && new Date(r.startTime) > now
                );
            case 'active':
                return reservations.filter(r =>
                    r.status === 'Confirmed' &&
                    new Date(r.startTime) <= now &&
                    new Date(r.endTime) >= now
                );
            case 'past':
                return reservations.filter(r =>
                    r.status === 'Completed' || new Date(r.endTime) < now
                );
            case 'pending':
                return reservations.filter(r => r.status === 'Pending');
            case 'cancelled':
                return reservations.filter(r => r.status === 'Cancelled');
            default:
                return reservations;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Confirmed': 'bg-emerald-100 text-emerald-700',
            'Pending': 'bg-amber-100 text-amber-700',
            'Completed': 'bg-blue-100 text-blue-700',
            'Cancelled': 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            await fetchReservations();
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            toast.error(error.response?.data?.message || 'Error al cancelar la reservación');
        } finally {
            setCancelling(false);
        }
    };

    const getFilterCount = (filterType) => {
        const now = new Date();
        switch (filterType) {
            case 'upcoming':
                return reservations.filter(r =>
                    r.status === 'Confirmed' && new Date(r.startTime) > now
                ).length;
            case 'active':
                return reservations.filter(r =>
                    r.status === 'Confirmed' &&
                    new Date(r.startTime) <= now &&
                    new Date(r.endTime) >= now
                ).length;
            case 'past':
                return reservations.filter(r =>
                    r.status === 'Completed' || new Date(r.endTime) < now
                ).length;
            case 'pending':
                return reservations.filter(r => r.status === 'Pending').length;
            case 'cancelled':
                return reservations.filter(r => r.status === 'Cancelled').length;
            default:
                return reservations.length;
        }
    };

    const filteredReservations = getFilteredReservations();

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-on-surface-variant mt-4">Loading your reservations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">My Reservations</h1>
                <p className="text-body-md text-on-surface-variant">
                    Manage all your workspace bookings in one place
                </p>
            </div>

            {/* Summary Cards */}
            {summary && reservations.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                        <div className="font-headline-md text-primary">{summary.totalReservations}</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant">Total Bookings</div>
                    </div>
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                        <div className="font-headline-md text-primary">{summary.activeReservations}</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant">Active</div>
                    </div>
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                        <div className="font-headline-md text-primary">{summary.totalHoursBooked || 0}h</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant">Hours Booked</div>
                    </div>
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                        <div className="font-headline-md text-primary">${summary.totalSpent?.toFixed(0) || 0}</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant">Total Spent</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-outline-variant pb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'all'
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'hover:bg-surface-container-low text-on-surface-variant'
                        }`}
                >
                    All ({getFilterCount('all')})
                </button>
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'upcoming'
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'hover:bg-surface-container-low text-on-surface-variant'
                        }`}
                >
                    Upcoming ({getFilterCount('upcoming')})
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'active'
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'hover:bg-surface-container-low text-on-surface-variant'
                        }`}
                >
                    Active ({getFilterCount('active')})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'pending'
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'hover:bg-surface-container-low text-on-surface-variant'
                        }`}
                >
                    Pending ({getFilterCount('pending')})
                </button>
                <button
                    onClick={() => setFilter('past')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'past'
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'hover:bg-surface-container-low text-on-surface-variant'
                        }`}
                >
                    Past ({getFilterCount('past')})
                </button>
                <button
                    onClick={() => setFilter('cancelled')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === 'cancelled'
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'hover:bg-surface-container-low text-on-surface-variant'
                        }`}
                >
                    Cancelled ({getFilterCount('cancelled')})
                </button>
            </div>

            {/* Lista de reservaciones */}
            {filteredReservations.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">event_busy</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No reservations found</h3>
                    <p className="text-body-md text-on-surface-variant">
                        {filter !== 'all'
                            ? `You don't have any ${filter} reservations`
                            : 'You haven\'t made any reservations yet'}
                    </p>
                    <Link to="/catalog" className="mt-6 inline-block btn-primary">
                        Browse Spaces
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReservations.map((reservation) => {
                        const isUpcoming = new Date(reservation.startTime) > new Date();
                        const isActive = new Date(reservation.startTime) <= new Date() &&
                            new Date(reservation.endTime) >= new Date();
                        const canCancel = (reservation.status === 'Confirmed' || reservation.status === 'Pending') &&
                            isUpcoming;

                        return (
                            <div
                                key={reservation.id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface-container-lowest rounded-xl border border-outline-variant hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h4 className="font-body-lg font-semibold text-on-surface">
                                            {reservation.spaceName}
                                        </h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(reservation.status)}`}>
                                            <span className="material-symbols-outlined text-sm">{getStatusIcon(reservation.status)}</span>
                                            {reservation.status}
                                        </span>
                                        {isActive && reservation.status === 'Confirmed' && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Active Now
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 text-body-sm text-on-surface-variant">
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
                                                    ? 'text-emerald-600'
                                                    : 'text-amber-600'
                                                }`}>
                                                <span className="material-symbols-outlined text-sm">payments</span>
                                                Payment: {reservation.paymentStatus}
                                            </p>
                                        )}
                                        {reservation.notes && (
                                            <p className="text-on-surface-variant italic text-sm mt-1">
                                                "{reservation.notes}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                                    <span className="font-headline-md text-primary">
                                        ${reservation.totalPrice?.toFixed(2) || '0.00'}
                                    </span>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/spaces/${reservation.spaceId}`}
                                            className="text-sm text-primary hover:text-secondary transition-colors"
                                        >
                                            View Space
                                        </Link>
                                        {canCancel && (
                                            <button
                                                onClick={() => setShowCancelModal(reservation.id)}
                                                className="text-sm text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                    {reservation.status === 'Pending' && (
                                        <span className="text-xs text-amber-600 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">pending</span>
                                            Awaiting confirmation
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer con contador */}
            {reservations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-outline-variant">
                    <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
                        <span>
                            Showing {filteredReservations.length} of {reservations.length} reservations
                            {filter !== 'all' && ` (filtered by: ${filter})`}
                        </span>
                        <span>
                            Total spent: <strong className="text-primary">${summary?.totalSpent?.toFixed(2) || '0.00'}</strong>
                        </span>
                    </div>
                </div>
            )}

            {/* Modal de Cancelación */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                            Cancel Reservation
                        </h3>
                        <p className="text-body-md text-on-surface-variant mb-4">
                            Are you sure you want to cancel this reservation? This action cannot be undone.
                        </p>
                        <div className="mb-4">
                            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                Reason (Optional)
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows="2"
                                placeholder="Why are you cancelling?"
                                className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(null);
                                    setCancelReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
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
        </div>
    );
};

export default Reservations;
// frontend/src/components/reservations/ReservationDetailModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ReservationDetailModal = ({ reservation, onClose }) => {
    if (!reservation) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    const calculateDuration = (start, end) => {
        const diff = new Date(end) - new Date(start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;
    };

    // Cerrar con tecla ESC
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-surface-container-lowest z-10 border-b border-outline-variant p-6 flex justify-between items-start">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">
                                Reservation Details
                            </h2>
                            <p className="text-body-sm text-on-surface-variant">
                                #{reservation.id} • {reservation.spaceName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-surface-container-low rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Status & Quick Info */}
                        <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-outline-variant">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${getStatusBadge(reservation.status)}`}>
                                <span className="material-symbols-outlined text-base">{getStatusIcon(reservation.status)}</span>
                                {reservation.status}
                            </span>
                            {reservation.paymentStatus && (
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${reservation.paymentStatus === 'Completed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    <span className="material-symbols-outlined text-base">payments</span>
                                    {reservation.paymentStatus}
                                </span>
                            )}
                            <span className="text-body-sm text-on-surface-variant ml-auto">
                                Booked on {formatDateShort(reservation.createdAt)}
                            </span>
                        </div>

                        {/* Grid de información */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Espacio */}
                            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-sm">meeting_room</span>
                                    <h4 className="font-body-sm font-semibold text-on-surface">Space</h4>
                                </div>
                                <Link
                                    to={`/spaces/${reservation.spaceId}`}
                                    className="text-body-md text-primary hover:underline font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {reservation.spaceName}
                                </Link>
                                <p className="text-body-sm text-on-surface-variant">{reservation.spaceType}</p>
                            </div>

                            {/* Fecha y Hora */}
                            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-sm">event</span>
                                    <h4 className="font-body-sm font-semibold text-on-surface">Date & Time</h4>
                                </div>
                                <p className="text-body-md font-medium text-on-surface">
                                    {formatDate(reservation.startTime)}
                                </p>
                                <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                                    <span>→</span>
                                    <span>{formatDate(reservation.endTime)}</span>
                                    <span className="px-2 py-0.5 bg-surface-container rounded-full text-xs">
                                        {calculateDuration(reservation.startTime, reservation.endTime)}
                                    </span>
                                </div>
                            </div>

                            {/* Precio */}
                            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-sm">payments</span>
                                    <h4 className="font-body-sm font-semibold text-on-surface">Price</h4>
                                </div>
                                <p className="font-headline-lg text-primary">
                                    ${reservation.totalPrice?.toFixed(2) || '0.00'}
                                </p>
                                {reservation.paidAmount && (
                                    <p className="text-body-sm text-emerald-600">
                                        Paid: ${reservation.paidAmount.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            {/* Invitados */}
                            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-sm">group</span>
                                    <h4 className="font-body-sm font-semibold text-on-surface">Guests</h4>
                                </div>
                                <p className="text-body-lg font-medium text-on-surface">
                                    {reservation.numberOfGuests || 1}
                                </p>
                                <p className="text-body-sm text-on-surface-variant">
                                    {reservation.numberOfGuests === 1 ? 'person' : 'people'}
                                </p>
                            </div>
                        </div>

                        {/* Notas */}
                        {reservation.notes && (
                            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-sm">note</span>
                                    <h4 className="font-body-sm font-semibold text-on-surface">Notes</h4>
                                </div>
                                <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">
                                    {reservation.notes}
                                </p>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center pt-4 border-t border-outline-variant">
                            <div>
                                <p className="text-body-xs text-on-surface-variant">Created</p>
                                <p className="text-body-sm font-medium text-on-surface">
                                    {formatDateShort(reservation.createdAt)}
                                </p>
                            </div>
                            {reservation.updatedAt && (
                                <div>
                                    <p className="text-body-xs text-on-surface-variant">Updated</p>
                                    <p className="text-body-sm font-medium text-on-surface">
                                        {formatDateShort(reservation.updatedAt)}
                                    </p>
                                </div>
                            )}
                            {reservation.cancelledAt && (
                                <div>
                                    <p className="text-body-xs text-on-surface-variant">Cancelled</p>
                                    <p className="text-body-sm font-medium text-red-600">
                                        {formatDateShort(reservation.cancelledAt)}
                                    </p>
                                </div>
                            )}
                            {reservation.completedAt && (
                                <div>
                                    <p className="text-body-xs text-on-surface-variant">Completed</p>
                                    <p className="text-body-sm font-medium text-emerald-600">
                                        {formatDateShort(reservation.completedAt)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-outline-variant">
                            <Link
                                to={`/spaces/${reservation.spaceId}`}
                                className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                View Space
                            </Link>
                            {reservation.status !== 'Cancelled' && reservation.status !== 'Completed' && (
                                <button
                                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                                    onClick={() => {
                                        onClose();
                                        // La cancelación se maneja en el padre
                                    }}
                                >
                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors ml-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </>
    );
};

export default ReservationDetailModal;
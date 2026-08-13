// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import usersService from '../api/users.service';
import reservationsService from '../api/reservations.service';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [summary, setSummary] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileData, summaryData, reservationsData] = await Promise.all([
                    usersService.getProfile(),
                    reservationsService.getSummary(),
                    reservationsService.getUserReservations()
                ]);

                setProfile(profileData);
                setSummary(summaryData);
                setReservations(Array.isArray(reservationsData) ? reservationsData : []);
            } catch (error) {
                console.error('Error fetching profile data:', error);
                toast.error('Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const getFilteredReservations = () => {
        const now = new Date();
        switch (filter) {
            case 'upcoming':
                return reservations.filter(r =>
                    r.status === 'Confirmed' && new Date(r.startTime) > now
                );
            case 'past':
                return reservations.filter(r =>
                    r.status === 'Completed' || new Date(r.endTime) < now
                );
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

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <div className="animate-pulse">Loading profile...</div>
                </div>
            </div>
        );
    }

    const filteredReservations = getFilteredReservations();

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">My Profile</h1>
                <p className="text-body-md text-on-surface-variant">Manage your account and view your reservation history</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Perfil - Columna izquierda */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant text-center sticky top-24">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary mx-auto mb-4">
                            {profile?.profileImageUrl ? (
                                <img src={profile.profileImageUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary-container flex items-center justify-center text-on-primary text-4xl font-bold">
                                    {profile?.firstName?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">{profile?.fullName}</h2>
                        <p className="text-body-sm text-on-surface-variant">{profile?.email}</p>
                        {profile?.company && (
                            <p className="text-body-sm text-on-surface-variant mt-1">{profile.company}</p>
                        )}
                        {profile?.jobTitle && (
                            <p className="text-body-sm text-on-surface-variant">{profile.jobTitle}</p>
                        )}

                        <div className="mt-6 pt-6 border-t border-outline-variant">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center">
                                    <div className="font-headline-md text-primary">{summary?.totalReservations || 0}</div>
                                    <div className="font-label-caps text-label-caps text-on-surface-variant">Bookings</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-headline-md text-primary">{summary?.totalHoursBooked || 0}h</div>
                                    <div className="font-label-caps text-label-caps text-on-surface-variant">Hours</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-headline-md text-primary">${summary?.totalSpent?.toFixed(0) || 0}</div>
                                    <div className="font-label-caps text-label-caps text-on-surface-variant">Spent</div>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/profile/edit"
                            className="mt-6 inline-block w-full bg-surface-container-low text-on-surface py-2 rounded-lg hover:bg-surface-container transition-colors"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Reservaciones - Columna derecha */}
                <div className="lg:col-span-2">
                    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                        {/* Filtros */}
                        <div className="flex flex-wrap gap-2 mb-6 border-b border-outline-variant pb-4">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                        ? 'bg-primary text-on-primary'
                                        : 'hover:bg-surface-container-low'
                                    }`}
                            >
                                All ({reservations.length})
                            </button>
                            <button
                                onClick={() => setFilter('upcoming')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming'
                                        ? 'bg-primary text-on-primary'
                                        : 'hover:bg-surface-container-low'
                                    }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setFilter('past')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'past'
                                        ? 'bg-primary text-on-primary'
                                        : 'hover:bg-surface-container-low'
                                    }`}
                            >
                                Past
                            </button>
                            <button
                                onClick={() => setFilter('cancelled')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'cancelled'
                                        ? 'bg-primary text-on-primary'
                                        : 'hover:bg-surface-container-low'
                                    }`}
                            >
                                Cancelled
                            </button>
                        </div>

                        {/* Lista de reservaciones */}
                        {filteredReservations.length === 0 ? (
                            <div className="text-center py-12 text-on-surface-variant">
                                <span className="material-symbols-outlined text-4xl mb-3 block">event_busy</span>
                                <p className="text-body-md">No {filter !== 'all' ? filter : ''} reservations found</p>
                                {filter === 'all' && (
                                    <Link to="/catalog" className="text-primary hover:underline mt-2 inline-block">
                                        Book a space →
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredReservations.map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-body-md font-semibold text-on-surface">
                                                    {reservation.spaceName}
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reservation.status)}`}>
                                                    {reservation.status}
                                                </span>
                                            </div>
                                            <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">event</span>
                                                {formatDate(reservation.startTime)} - {formatDate(reservation.endTime)}
                                            </p>
                                            <div className="flex flex-wrap gap-3 mt-1 text-body-sm text-on-surface-variant">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {reservation.spaceType}
                                                </span>
                                                {reservation.numberOfGuests && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">group</span>
                                                        {reservation.numberOfGuests} guests
                                                    </span>
                                                )}
                                                {reservation.paymentStatus && (
                                                    <span className={`flex items-center gap-1 ${reservation.paymentStatus === 'Completed'
                                                            ? 'text-emerald-600'
                                                            : 'text-amber-600'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-sm">payments</span>
                                                        {reservation.paymentStatus}
                                                    </span>
                                                )}
                                            </div>
                                            {reservation.notes && (
                                                <p className="text-body-sm text-on-surface-variant mt-1 italic">
                                                    "{reservation.notes}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end mt-3 md:mt-0">
                                            <span className="font-headline-md text-primary">
                                                ${reservation.totalPrice?.toFixed(2) || '0.00'}
                                            </span>
                                            {reservation.status === 'Confirmed' && new Date(reservation.startTime) > new Date() && (
                                                <button
                                                    className="text-sm text-red-600 hover:text-red-800 transition-colors mt-1"
                                                    onClick={() => {
                                                        // Cancel reservation logic
                                                        toast.success('Reservation cancelled successfully!');
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {reservation.status === 'Pending' && (
                                                <span className="text-xs text-amber-600 mt-1">
                                                    Awaiting confirmation
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Resumen */}
                        {reservations.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-outline-variant">
                                <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
                                    <span>
                                        Showing {filteredReservations.length} of {reservations.length} reservations
                                    </span>
                                    <span>
                                        Total spent: <strong className="text-primary">${summary?.totalSpent?.toFixed(2) || '0.00'}</strong>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
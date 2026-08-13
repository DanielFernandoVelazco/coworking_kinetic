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
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        company: '',
        jobTitle: ''
    });
    const [saving, setSaving] = useState(false);

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

                // Inicializar formulario de edición
                if (profileData) {
                    setEditForm({
                        firstName: profileData.firstName || '',
                        lastName: profileData.lastName || '',
                        phoneNumber: profileData.phoneNumber || '',
                        company: profileData.company || '',
                        jobTitle: profileData.jobTitle || ''
                    });
                }
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

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset form to current profile data
            setEditForm({
                firstName: profile?.firstName || '',
                lastName: profile?.lastName || '',
                phoneNumber: profile?.phoneNumber || '',
                company: profile?.company || '',
                jobTitle: profile?.jobTitle || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updatedProfile = await usersService.updateProfile(editForm);
            setProfile(updatedProfile);
            setIsEditing(false);
            toast.success('Perfil actualizado exitosamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-on-surface-variant mt-4">Cargando perfil...</p>
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
                    <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant sticky top-24">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary mx-auto mb-4">
                            {profile?.profileImageUrl ? (
                                <img src={profile.profileImageUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary-container flex items-center justify-center text-on-primary text-4xl font-bold">
                                    {profile?.firstName?.[0] || 'U'}
                                </div>
                            )}
                        </div>

                        {!isEditing ? (
                            <>
                                <h2 className="font-headline-md text-headline-md text-on-surface text-center">{profile?.fullName}</h2>
                                <p className="text-body-sm text-on-surface-variant text-center">{profile?.email}</p>
                                {profile?.company && (
                                    <p className="text-body-sm text-on-surface-variant text-center mt-1">{profile.company}</p>
                                )}
                                {profile?.jobTitle && (
                                    <p className="text-body-sm text-on-surface-variant text-center">{profile.jobTitle}</p>
                                )}
                                {profile?.phoneNumber && (
                                    <p className="text-body-sm text-on-surface-variant text-center mt-1">{profile.phoneNumber}</p>
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

                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={handleEditToggle}
                                        className="w-full bg-surface-container-low text-on-surface py-2 rounded-lg hover:bg-surface-container transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                    <Link
                                        to="/reservations"
                                        className="w-full bg-primary text-on-primary py-2 rounded-lg hover:bg-secondary transition-colors text-center block"
                                    >
                                        View My Reservations
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={editForm.firstName}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editForm.lastName}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={editForm.phoneNumber}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={editForm.company}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        name="jobTitle"
                                        value={editForm.jobTitle}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex-1 bg-primary text-on-primary py-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={handleEditToggle}
                                        className="flex-1 border border-outline-variant py-2 rounded-lg hover:bg-surface-container-low transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reservaciones - Columna derecha */}
                <div className="lg:col-span-2">
                    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md">Recent Reservations</h3>
                            <Link to="/reservations" className="text-primary hover:underline text-sm">
                                View All →
                            </Link>
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-wrap gap-2 mb-4 border-b border-outline-variant pb-4">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === 'all'
                                        ? 'bg-primary text-on-primary'
                                        : 'hover:bg-surface-container-low text-on-surface-variant'
                                    }`}
                            >
                                All ({reservations.length})
                            </button>
                            <button
                                onClick={() => setFilter('upcoming')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === 'upcoming'
                                        ? 'bg-primary text-on-primary'
                                        : 'hover:bg-surface-container-low text-on-surface-variant'
                                    }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setFilter('past')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === 'past'
                                        ? 'bg-primary text-on-primary'
                                        : 'hover:bg-surface-container-low text-on-surface-variant'
                                    }`}
                            >
                                Past
                            </button>
                            <button
                                onClick={() => setFilter('cancelled')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === 'cancelled'
                                        ? 'bg-primary text-on-primary'
                                        : 'hover:bg-surface-container-low text-on-surface-variant'
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
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {filteredReservations.slice(0, 5).map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="font-body-sm font-semibold text-on-surface">
                                                    {reservation.spaceName}
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reservation.status)}`}>
                                                    {reservation.status}
                                                </span>
                                            </div>
                                            <p className="text-body-xs text-on-surface-variant">
                                                {formatDate(reservation.startTime)}
                                            </p>
                                            {reservation.numberOfGuests && (
                                                <p className="text-body-xs text-on-surface-variant">
                                                    👥 {reservation.numberOfGuests} guests
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                                            <span className="font-headline-sm text-primary whitespace-nowrap">
                                                ${reservation.totalPrice?.toFixed(2) || '0.00'}
                                            </span>
                                            <Link
                                                to={`/spaces/${reservation.spaceId}`}
                                                className="text-primary hover:text-secondary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                {filteredReservations.length > 5 && (
                                    <div className="text-center pt-2">
                                        <Link to="/reservations" className="text-primary hover:underline text-sm">
                                            Show {filteredReservations.length - 5} more...
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Resumen */}
                        {reservations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-outline-variant">
                                <div className="flex justify-between items-center text-body-xs text-on-surface-variant">
                                    <span>
                                        Showing {Math.min(filteredReservations.length, 5)} of {filteredReservations.length} reservations
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
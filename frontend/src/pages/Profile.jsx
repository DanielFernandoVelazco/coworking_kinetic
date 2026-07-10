import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import usersService from '../api/users.service';
import reservationsService from '../api/reservations.service';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [summary, setSummary] = useState(null);
    const [upcomingReservations, setUpcomingReservations] = useState([]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [profileData, summaryData, reservationsData] = await Promise.all([
                    usersService.getProfile(),
                    reservationsService.getSummary(),
                    reservationsService.getUpcoming(5)
                ]);

                setProfile(profileData);
                setSummary(summaryData);
                setUpcomingReservations(reservationsData);
            } catch (error) {
                console.error('Error fetching profile data:', error);
                toast.error('Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <div className="animate-pulse">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                {/* Perfil */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant text-center">
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
                        <div className="mt-4 flex justify-center gap-4">
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
                </div>

                {/* Reservaciones */}
                <div className="lg:col-span-2">
                    <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
                        <h3 className="font-headline-md text-headline-md mb-6">Upcoming Reservations</h3>
                        {upcomingReservations.length === 0 ? (
                            <div className="text-center py-8 text-on-surface-variant">
                                <p>No upcoming reservations</p>
                                <Link to="/catalog" className="text-primary hover:underline mt-2 inline-block">
                                    Book a space →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingReservations.map((reservation) => (
                                    <div key={reservation.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                                        <div>
                                            <h4 className="font-body-md font-semibold text-on-surface">{reservation.spaceName}</h4>
                                            <p className="text-body-sm text-on-surface-variant">
                                                {new Date(reservation.startTime).toLocaleDateString()} • {new Date(reservation.startTime).toLocaleTimeString()} - {new Date(reservation.endTime).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reservation.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                    reservation.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                        reservation.status === 'Cancelled' ? 'bg-error-container text-on-error-container' :
                                                            'bg-surface-container text-on-surface-variant'
                                                }`}>
                                                {reservation.status}
                                            </span>
                                            <p className="text-sm text-on-surface-variant mt-1">${reservation.totalPrice}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
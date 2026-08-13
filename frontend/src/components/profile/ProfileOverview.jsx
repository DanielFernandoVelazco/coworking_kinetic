// frontend/src/components/profile/ProfileOverview.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import usersService from '../../api/users.service';
import reservationsService from '../../api/reservations.service';
import toast from 'react-hot-toast';

const ProfileOverview = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [summary, setSummary] = useState(null);
    const [recentReservations, setRecentReservations] = useState([]);
    const [monthlyHistory, setMonthlyHistory] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, summaryData, reservationsData] = await Promise.all([
                    usersService.getProfile(),
                    reservationsService.getSummary(),
                    reservationsService.getUserReservations()
                ]);

                setProfile(profileData);
                setSummary(summaryData);
                setRecentReservations(Array.isArray(reservationsData) ? reservationsData.slice(0, 5) : []);

                // Calcular histórico de los últimos 3 meses
                const history = calculateMonthlyHistory(reservationsData);
                setMonthlyHistory(history);

            } catch (error) {
                console.error('Error fetching profile data:', error);
                toast.error('Error al cargar el perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculateMonthlyHistory = (reservations) => {
        const months = [];
        const now = new Date();

        for (let i = 2; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            const monthReservations = reservations.filter(r => {
                const rDate = new Date(r.startTime);
                return rDate.getMonth() === date.getMonth() &&
                    rDate.getFullYear() === date.getFullYear() &&
                    r.status !== 'Cancelled';
            });

            const totalSpent = monthReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
            const totalHours = monthReservations.reduce((sum, r) => {
                const hours = (new Date(r.endTime) - new Date(r.startTime)) / (1000 * 60 * 60);
                return sum + hours;
            }, 0);

            months.push({
                month: monthName,
                count: monthReservations.length,
                totalSpent: totalSpent,
                totalHours: Math.round(totalHours)
            });
        }

        return months;
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
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const maxCount = Math.max(...monthlyHistory.map(m => m.count), 1);
    const maxSpent = Math.max(...monthlyHistory.map(m => m.totalSpent), 1);

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-on-surface-variant mt-4">Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* User Info Card */}
            <div className="flex items-start gap-6 p-6 bg-surface-container-low rounded-xl border border-outline-variant">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary flex-shrink-0">
                    {profile?.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary-container flex items-center justify-center text-on-primary text-2xl font-bold">
                            {profile?.firstName?.[0] || 'U'}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="font-headline-md text-headline-md text-on-surface">{profile?.fullName}</h2>
                    <p className="text-body-md text-on-surface-variant">{profile?.email}</p>
                    {profile?.company && (
                        <p className="text-body-sm text-on-surface-variant mt-1">{profile.company}</p>
                    )}
                    <div className="flex gap-4 mt-3">
                        <div>
                            <span className="font-headline-sm text-primary">{summary?.totalReservations || 0}</span>
                            <span className="text-body-sm text-on-surface-variant ml-1">Total Bookings</span>
                        </div>
                        <div>
                            <span className="font-headline-sm text-primary">{summary?.totalHoursBooked || 0}h</span>
                            <span className="text-body-sm text-on-surface-variant ml-1">Hours</span>
                        </div>
                        <div>
                            <span className="font-headline-sm text-primary">${summary?.totalSpent?.toFixed(0) || 0}</span>
                            <span className="text-body-sm text-on-surface-variant ml-1">Total Spent</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly History Chart */}
            <div>
                <h3 className="font-headline-md text-headline-md mb-4">Reservation History (Last 3 Months)</h3>
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
                    {/* Chart - Bookings count */}
                    <div className="mb-6">
                        <div className="flex justify-between text-body-sm text-on-surface-variant mb-2">
                            <span>Bookings</span>
                            <span>Total: {monthlyHistory.reduce((sum, m) => sum + m.count, 0)}</span>
                        </div>
                        <div className="flex items-end gap-4 h-32">
                            {monthlyHistory.map((item, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-surface-container-lowest rounded-t-lg overflow-hidden" style={{ height: '100px' }}>
                                        <div
                                            className="w-full bg-primary transition-all duration-500 rounded-t-lg"
                                            style={{
                                                height: `${(item.count / maxCount) * 100}%`,
                                                minHeight: item.count > 0 ? '4px' : '0'
                                            }}
                                        />
                                    </div>
                                    <span className="text-body-xs text-on-surface-variant">{item.month}</span>
                                    <span className="text-body-xs font-semibold text-on-surface">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart - Spending */}
                    <div>
                        <div className="flex justify-between text-body-sm text-on-surface-variant mb-2">
                            <span>Spending ($)</span>
                            <span>Total: ${monthlyHistory.reduce((sum, m) => sum + m.totalSpent, 0).toFixed(0)}</span>
                        </div>
                        <div className="flex items-end gap-4 h-32">
                            {monthlyHistory.map((item, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-surface-container-lowest rounded-t-lg overflow-hidden" style={{ height: '100px' }}>
                                        <div
                                            className="w-full bg-secondary transition-all duration-500 rounded-t-lg"
                                            style={{
                                                height: `${(item.totalSpent / maxSpent) * 100}%`,
                                                minHeight: item.totalSpent > 0 ? '4px' : '0'
                                            }}
                                        />
                                    </div>
                                    <span className="text-body-xs text-on-surface-variant">{item.month}</span>
                                    <span className="text-body-xs font-semibold text-on-surface">${item.totalSpent.toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-outline-variant">
                        <div className="text-center">
                            <div className="font-headline-sm text-primary">
                                {monthlyHistory.reduce((sum, m) => sum + m.count, 0)}
                            </div>
                            <div className="text-body-xs text-on-surface-variant">Total Bookings</div>
                        </div>
                        <div className="text-center">
                            <div className="font-headline-sm text-primary">
                                {monthlyHistory.reduce((sum, m) => sum + m.totalHours, 0)}h
                            </div>
                            <div className="text-body-xs text-on-surface-variant">Total Hours</div>
                        </div>
                        <div className="text-center">
                            <div className="font-headline-sm text-primary">
                                ${monthlyHistory.reduce((sum, m) => sum + m.totalSpent, 0).toFixed(0)}
                            </div>
                            <div className="text-body-xs text-on-surface-variant">Total Spent</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reservations */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline-md text-headline-md">Recent Reservations</h3>
                    <Link to="/reservations" className="text-primary hover:underline text-sm">
                        View All →
                    </Link>
                </div>
                {recentReservations.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl block mb-2">event_busy</span>
                        <p>No reservations yet</p>
                        <Link to="/catalog" className="text-primary hover:underline mt-2 inline-block">
                            Book a space →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentReservations.map((reservation) => (
                            <div key={reservation.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                                <div>
                                    <h4 className="font-body-md font-semibold text-on-surface">{reservation.spaceName}</h4>
                                    <p className="text-body-sm text-on-surface-variant">{formatDate(reservation.startTime)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reservation.status)}`}>
                                        {reservation.status}
                                    </span>
                                    <span className="font-headline-sm text-primary">${reservation.totalPrice?.toFixed(2) || '0.00'}</span>
                                    <Link to={`/spaces/${reservation.spaceId}`} className="text-primary hover:text-secondary">
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileOverview;
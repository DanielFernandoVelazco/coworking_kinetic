// frontend/src/components/profile/ProfileOverview.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Bar,
    AreaChart
} from 'recharts';
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
    const [statistics, setStatistics] = useState({
        totalBookings: 0,
        totalHours: 0,
        totalSpent: 0,
        averagePerBooking: 0,
        favoriteSpaceType: '',
        mostBookedMonth: '',
        bestMonth: { month: '', count: 0, spent: 0 },
        monthlyAverage: 0,
        trend: 'stable'
    });

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

                // Calcular histórico de los últimos 6 meses
                const history = calculateMonthlyHistory(reservationsData);
                setMonthlyHistory(history);

                // Calcular estadísticas detalladas
                const stats = calculateStatistics(reservationsData, history);
                setStatistics(stats);

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

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

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
                bookings: monthReservations.length,
                spending: Math.round(totalSpent),
                hours: Math.round(totalHours),
                averagePerBooking: monthReservations.length > 0 ? Math.round(totalSpent / monthReservations.length) : 0
            });
        }

        return months;
    };

    const calculateStatistics = (reservations, history) => {
        const activeReservations = reservations.filter(r => r.status !== 'Cancelled');
        const totalBookings = activeReservations.length;
        const totalHours = activeReservations.reduce((sum, r) => {
            const hours = (new Date(r.endTime) - new Date(r.startTime)) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);
        const totalSpent = activeReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        const averagePerBooking = totalBookings > 0 ? totalSpent / totalBookings : 0;

        // Espacio favorito
        const spaceTypes = {};
        activeReservations.forEach(r => {
            spaceTypes[r.spaceType] = (spaceTypes[r.spaceType] || 0) + 1;
        });
        let favoriteSpaceType = '';
        let maxCount = 0;
        Object.entries(spaceTypes).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteSpaceType = type;
            }
        });

        // Mejor mes
        let bestMonth = { month: '', count: 0, spent: 0 };
        history.forEach(h => {
            if (h.bookings > bestMonth.count) {
                bestMonth = { month: h.month, count: h.bookings, spent: h.spending };
            }
        });

        // Tendencia (comparar últimos 3 meses con los 3 anteriores)
        const last3 = history.slice(-3).reduce((sum, h) => sum + h.bookings, 0);
        const prev3 = history.slice(0, 3).reduce((sum, h) => sum + h.bookings, 0);
        let trend = 'stable';
        if (last3 > prev3 * 1.2) trend = 'up';
        else if (last3 < prev3 * 0.8) trend = 'down';

        // Promedio mensual
        const monthlyAverage = history.length > 0 ?
            history.reduce((sum, h) => sum + h.bookings, 0) / history.length : 0;

        return {
            totalBookings,
            totalHours: Math.round(totalHours),
            totalSpent: Math.round(totalSpent),
            averagePerBooking: Math.round(averagePerBooking),
            favoriteSpaceType,
            mostBookedMonth: bestMonth.month,
            bestMonth,
            monthlyAverage: Math.round(monthlyAverage * 10) / 10,
            trend
        };
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
        return date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant shadow-lg">
                    <p className="font-body-sm font-semibold text-on-surface">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-body-sm text-on-surface-variant">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getTrendIcon = () => {
        switch (statistics.trend) {
            case 'up': return 'trending_up';
            case 'down': return 'trending_down';
            default: return 'trending_flat';
        }
    };

    const getTrendColor = () => {
        switch (statistics.trend) {
            case 'up': return 'text-emerald-600';
            case 'down': return 'text-red-600';
            default: return 'text-amber-600';
        }
    };

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
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-outline-variant">
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
                    <div className="flex flex-wrap gap-4 mt-3">
                        {/* Job Title */}
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">work</span>
                            <span className="text-body-md text-on-surface">
                                {profile?.jobTitle || 'No job title set'}
                            </span>
                        </div>

                        {/* Company */}
                        {profile?.company && (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">business</span>
                                <span className="text-body-md text-on-surface">{profile.company}</span>
                            </div>
                        )}

                        {/* Member since */}
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                            <span className="text-body-sm text-on-surface-variant">
                                Member since {new Date(profile?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Total Bookings</div>
                    <div className="font-headline-xl text-primary mt-1">{statistics.totalBookings}</div>
                    <div className="text-body-xs text-on-surface-variant mt-1">
                        ⭐ {statistics.favoriteSpaceType || 'No bookings'}
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Total Hours</div>
                    <div className="font-headline-xl text-primary mt-1">{statistics.totalHours}h</div>
                    <div className="text-body-xs text-on-surface-variant mt-1">
                        Avg: {statistics.monthlyAverage}/month
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Total Spent</div>
                    <div className="font-headline-xl text-primary mt-1">${statistics.totalSpent}</div>
                    <div className="text-body-xs text-on-surface-variant mt-1">
                        Avg: ${statistics.averagePerBooking}/booking
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant text-center">
                    <div className="text-body-xs text-on-surface-variant uppercase tracking-wider">Best Month</div>
                    <div className="font-headline-xl text-primary mt-1">{statistics.bestMonth.count}</div>
                    <div className="text-body-xs text-on-surface-variant mt-1">
                        {statistics.bestMonth.month} (${statistics.bestMonth.spent})
                    </div>
                </div>
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                <span className={`material-symbols-outlined ${getTrendColor()}`}>{getTrendIcon()}</span>
                <span className="text-body-sm text-on-surface-variant">
                    Your booking activity is
                    <span className={`font-semibold ${getTrendColor()} ml-1`}>
                        {statistics.trend === 'up' ? 'increasing' :
                            statistics.trend === 'down' ? 'decreasing' : 'stable'}
                    </span>
                    {' '}compared to previous months
                </span>
            </div>

            {/* Chart - Líneas combinadas */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline-md text-headline-md">Reservation History (Last 6 Months)</h3>
                    <div className="flex gap-4 text-body-xs text-on-surface-variant">
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-0.5 bg-primary block"></span>
                            <span>Bookings</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-3 h-0.5 bg-secondary block"></span>
                            <span>Spending ($)</span>
                        </div>
                    </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={monthlyHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddc0ba" opacity={0.3} />
                            <XAxis
                                dataKey="month"
                                stroke="#56423d"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#56423d"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#56423d"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="line"
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="bookings"
                                fill="#a03f28"
                                fillOpacity={0.1}
                                stroke="#a03f28"
                                strokeWidth={3}
                                name="Bookings"
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="spending"
                                stroke="#c0573e"
                                strokeWidth={3}
                                name="Spending ($)"
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>

                    {/* Stats debajo del gráfico */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-outline-variant">
                        <div className="text-center">
                            <div className="text-body-xs text-on-surface-variant">Total Bookings</div>
                            <div className="font-body-md font-semibold text-on-surface">
                                {monthlyHistory.reduce((sum, m) => sum + m.bookings, 0)}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-body-xs text-on-surface-variant">Total Hours</div>
                            <div className="font-body-md font-semibold text-on-surface">
                                {monthlyHistory.reduce((sum, m) => sum + m.hours, 0)}h
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-body-xs text-on-surface-variant">Total Spent</div>
                            <div className="font-body-md font-semibold text-on-surface">
                                ${monthlyHistory.reduce((sum, m) => sum + m.spending, 0)}
                            </div>
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
                    <div className="text-center py-8 text-on-surface-variant bg-surface-container-low rounded-lg border border-outline-variant">
                        <span className="material-symbols-outlined text-4xl block mb-2">event_busy</span>
                        <p>No reservations yet</p>
                        <Link to="/catalog" className="text-primary hover:underline mt-2 inline-block">
                            Book a space →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentReservations.map((reservation) => (
                            <div key={reservation.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-body-md font-semibold text-on-surface">{reservation.spaceName}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reservation.status)}`}>
                                            {reservation.status}
                                        </span>
                                    </div>
                                    <p className="text-body-sm text-on-surface-variant">{formatDate(reservation.startTime)}</p>
                                    {reservation.numberOfGuests && (
                                        <p className="text-body-xs text-on-surface-variant">👥 {reservation.numberOfGuests} guests</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-headline-sm text-primary">${reservation.totalPrice?.toFixed(2) || '0.00'}</span>
                                    <Link to={`/spaces/${reservation.spaceId}`} className="text-primary hover:text-secondary transition-colors">
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

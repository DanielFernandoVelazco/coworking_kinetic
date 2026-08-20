// frontend/src/pages/Home.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import spacesService from '../api/spaces.service';
import reservationsService from '../api/reservations.service';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
    const { user, logout } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [featuredSpaces, setFeaturedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allReservations, setAllReservations] = useState([]); // ✅ Todas las reservas del usuario

    // ✅ Resumen calculado en el frontend basado en todas las reservas
    const summary = useMemo(() => {
        if (!allReservations || allReservations.length === 0) {
            return {
                totalReservations: 0,
                activeReservations: 0,
                totalSpent: 0,
                upcomingReservations: 0,
                completedReservations: 0,
                cancelledReservations: 0,
                totalHoursBooked: 0
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

        // Calcular gasto total
        const totalSpent = allReservations
            .filter(r => r.status === 'Completed' || r.status === 'Confirmed')
            .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

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

    // Función para obtener TODAS las reservas del usuario
    const fetchAllReservations = async () => {
        if (!user) return;

        try {
            const response = await reservationsService.getUserReservationsFiltered(
                1,
                999, // Traer todas
                'date_desc',
                'all'
            );

            if (response && response.items) {
                setAllReservations(response.items);
                return response.items;
            }
            return [];
        } catch (error) {
            console.error('Error fetching reservations:', error);
            // Si falla, intentar con el endpoint antiguo
            try {
                const oldResponse = await reservationsService.getUserReservations();
                if (Array.isArray(oldResponse)) {
                    setAllReservations(oldResponse);
                    return oldResponse;
                }
            } catch (err) {
                console.error('Error fetching reservations with old endpoint:', err);
            }
            return [];
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Obtener espacios destacados
                const spacesData = await spacesService.getFeatured(15);
                setFeaturedSpaces(spacesData || []);

                // Obtener reservas del usuario si está autenticado
                if (user) {
                    await fetchAllReservations();
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error al cargar los espacios');

                // Datos de ejemplo para desarrollo
                setFeaturedSpaces([
                    {
                        id: 1,
                        name: 'Premium Office',
                        city: 'Stockholm',
                        country: 'Sweden',
                        pricePerHour: 45,
                        averageRating: 4.8,
                        type: 'Premium Office',
                        capacity: 12,
                        isFeatured: true,
                        imageUrls: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']
                    },
                    {
                        id: 2,
                        name: 'Creative Space',
                        city: 'Gothenburg',
                        country: 'Sweden',
                        pricePerHour: 35,
                        averageRating: 4.5,
                        type: 'Creative Space',
                        capacity: 20,
                        isFeatured: true,
                        imageUrls: ['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800']
                    },
                    {
                        id: 3,
                        name: 'Meeting Room',
                        city: 'Malmö',
                        country: 'Sweden',
                        pricePerHour: 25,
                        averageRating: 4.2,
                        type: 'Meeting Room',
                        capacity: 15,
                        isFeatured: true,
                        imageUrls: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800']
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // ✅ Recargar reservas cuando el usuario cambia (login/logout)
    useEffect(() => {
        if (user) {
            fetchAllReservations();
        } else {
            setAllReservations([]);
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user && !loading) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-background transition-colors duration-300">
            {/* Navbar */}
            <nav className="bg-surface dark:bg-surface-dark border-b border-outline-variant dark:border-outline-dark-variant px-4 md:px-10 py-4 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">
                <div className="text-2xl font-bold text-primary dark:text-primary-dark font-manrope">
                    Kinetic Workspace
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                        {user?.firstName} {user?.lastName}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="bg-primary dark:bg-primary-dark text-white px-5 py-2 rounded transition-colors hover:bg-primary-dark dark:hover:bg-primary font-work-sans text-sm"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-10">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary rounded-xl p-8 md:p-12 mb-10 text-white">
                    <h1 className="text-3xl md:text-5xl font-bold font-manrope mb-2">
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="text-lg font-work-sans opacity-90">
                        Your high-performance workspace awaits.
                    </p>
                </div>

                {/* ✅ Stats Cards - Calculado desde allReservations */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center shadow-sm transition-colors duration-300">
                        <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-dark font-manrope">
                            {summary.totalReservations}
                        </div>
                        <div className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                            Total Bookings
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center shadow-sm transition-colors duration-300">
                        <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-dark font-manrope">
                            {summary.activeReservations}
                        </div>
                        <div className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                            Active Bookings
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center shadow-sm transition-colors duration-300">
                        <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-dark font-manrope">
                            ${summary.totalSpent}
                        </div>
                        <div className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                            Total Spent
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center shadow-sm transition-colors duration-300">
                        <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-dark font-manrope">
                            {summary.upcomingReservations}
                        </div>
                        <div className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                            Upcoming
                        </div>
                    </div>
                </div>

                {/* Featured Spaces */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl md:text-3xl font-bold text-on-surface dark:text-on-dark-surface font-manrope">
                            Featured Spaces
                        </h2>
                        <Link to="/catalog" className="text-primary dark:text-primary-dark hover:underline font-work-sans font-medium">
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-surface-container-low dark:bg-surface-dark-container-low h-72 rounded-lg animate-pulse transition-colors duration-300"></div>
                            ))}
                        </div>
                    ) : featuredSpaces.length === 0 ? (
                        <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-10 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center text-on-surface-variant dark:text-on-dark-surface-variant transition-colors duration-300">
                            <p className="text-lg">No featured spaces available yet.</p>
                            <p className="text-sm">Check back later!</p>
                        </div>
                    ) : (
                        <>
                            {['Premium Office', 'Creative Space', 'Meeting Room'].map((type) => {
                                const spacesOfType = featuredSpaces
                                    .filter(s => s.type === type)
                                    .slice(0, 3);

                                if (spacesOfType.length === 0) return null;

                                return (
                                    <div key={type} className="mb-8">
                                        <h3 className="text-xl font-semibold text-on-surface dark:text-on-dark-surface font-manrope mb-4">
                                            {type}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {spacesOfType.map((space) => (
                                                <Link
                                                    key={space.id}
                                                    to={`/spaces/${space.id}`}
                                                    className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-lg border border-outline-variant dark:border-outline-dark-variant overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                                >
                                                    <div className="h-44 bg-surface-container-low dark:bg-surface-dark-container-low flex items-center justify-center text-on-surface-variant dark:text-on-dark-surface-variant overflow-hidden relative">
                                                        {space.imageUrls?.[0] ? (
                                                            <img
                                                                src={space.imageUrls[0]}
                                                                alt={space.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = '<span class="material-symbols-outlined text-6xl">meeting_room</span>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-6xl">meeting_room</span>
                                                        )}
                                                        {space.isFeatured && (
                                                            <span className="absolute top-3 left-3 bg-primary dark:bg-primary-dark text-white px-3 py-1 text-xs font-semibold rounded">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="text-lg font-semibold text-on-surface dark:text-on-dark-surface font-manrope mb-1">
                                                            {space.name}
                                                        </h3>
                                                        <p className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                                                            {space.city}, {space.country}
                                                        </p>
                                                        <div className="flex justify-between items-center mt-3">
                                                            <span className="text-lg font-bold text-primary dark:text-primary-dark font-manrope">
                                                                ${space.pricePerHour}
                                                                <span className="text-sm font-normal text-on-surface-variant dark:text-on-dark-surface-variant">
                                                                    /hr
                                                                </span>
                                                            </span>
                                                            <span className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                                                                ⭐ {space.averageRating?.toFixed(1) || 'New'} · 👥 {space.capacity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/catalog" className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="text-4xl mb-2">🏢</div>
                        <div className="text-lg font-semibold text-on-surface dark:text-on-dark-surface font-manrope">
                            Browse All Spaces
                        </div>
                        <div className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                            {featuredSpaces.length} premium spaces available
                        </div>
                    </Link>

                    <Link to="/profile" className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="text-4xl mb-2">👤</div>
                        <div className="text-lg font-semibold text-on-surface dark:text-on-dark-surface font-manrope">
                            My Profile
                        </div>
                        <div className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                            View and edit your profile
                        </div>
                    </Link>

                    <Link to="/reservations" className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="text-4xl mb-2">📅</div>
                        <div className="text-lg font-semibold text-on-surface dark:text-on-dark-surface font-manrope">
                            My Reservations
                        </div>
                        <div className="text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                            View your booking history
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
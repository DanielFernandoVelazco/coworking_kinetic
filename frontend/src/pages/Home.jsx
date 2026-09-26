// frontend/src/pages/Home.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import spacesService from '../api/spaces.service';
import reservationsService from '../api/reservations.service';
import toast from 'react-hot-toast';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const [featuredSpaces, setFeaturedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allReservations, setAllReservations] = useState([]);

    // ==================== SUMMARY (solo si hay sesión) ====================
    const summary = useMemo(() => {
        if (!allReservations || allReservations.length === 0) {
            return {
                totalReservations: 0,
                activeReservations: 0,
                totalSpent: 0,
                upcomingReservations: 0,
            };
        }

        const now = new Date();
        const active = allReservations.filter(r =>
            r.status === 'Confirmed' &&
            new Date(r.startTime) <= now &&
            new Date(r.endTime) >= now
        );
        const upcoming = allReservations.filter(r =>
            r.status === 'Confirmed' && new Date(r.startTime) > now
        );
        const totalSpent = allReservations
            .filter(r => r.status === 'Completed' || r.status === 'Confirmed')
            .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

        return {
            totalReservations: allReservations.length,
            activeReservations: active.length,
            upcomingReservations: upcoming.length,
            totalSpent: Math.round(totalSpent),
        };
    }, [allReservations]);

    // ==================== FETCH RESERVAS ====================
    const fetchAllReservations = async () => {
        if (!user) return;
        try {
            const response = await reservationsService.getUserReservationsFiltered(
                1, 100, 'date_desc', 'all'
            );
            if (response?.items) {
                setAllReservations(response.items);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    };

    // ==================== FETCH ESPACIOS DESTACADOS ====================
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const spacesData = await spacesService.getFeatured(15);
                setFeaturedSpaces(spacesData || []);

                if (user) {
                    await fetchAllReservations();
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error al cargar los espacios');
                setFeaturedSpaces([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchAllReservations();
        } else {
            setAllReservations([]);
        }
    }, [user]);

    // ==================== RENDER: LANDING PÚBLICA ====================
    if (!isAuthenticated) {
        return (
            <div className="transition-colors duration-300">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white overflow-hidden">
                    <div className="max-w-container-max mx-auto px-4 md:px-10 py-20 md:py-32">
                        <div className="max-w-3xl">
                            <h1 className="font-manrope font-extrabold text-4xl md:text-6xl leading-tight mb-6">
                                Your high-performance <br />
                                workspace awaits.
                            </h1>
                            <p className="font-work-sans text-lg md:text-xl opacity-90 mb-8">
                                Premium offices, meeting rooms, and creative spaces designed
                                for teams that demand the best.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/register"
                                    className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-surface-container-low transition-colors"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    to="/catalog"
                                    className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                                >
                                    Browse Spaces
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-8 mt-12 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>Instant booking</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>24/7 access</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Strip */}
                <section className="border-b border-outline-variant dark:border-outline-dark-variant bg-surface-container-low dark:bg-surface-dark-container-low">
                    <div className="max-w-container-max mx-auto px-4 md:px-10 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <div className="font-headline-lg text-primary dark:text-primary-dark">75+</div>
                                <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Premium Spaces</div>
                            </div>
                            <div>
                                <div className="font-headline-lg text-primary dark:text-primary-dark">10</div>
                                <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Cities in Sweden</div>
                            </div>
                            <div>
                                <div className="font-headline-lg text-primary dark:text-primary-dark">24/7</div>
                                <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Access Available</div>
                            </div>
                            <div>
                                <div className="font-headline-lg text-primary dark:text-primary-dark">4.8★</div>
                                <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Average Rating</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Spaces (Público) */}
                <section className="max-w-container-max mx-auto px-4 md:px-10 py-16">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-2">
                                Featured Workspaces
                            </h2>
                            <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                                Handpicked spaces from our premium catalog
                            </p>
                        </div>
                        <Link to="/catalog" className="text-primary dark:text-primary-dark hover:underline font-medium">
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-surface-container-low dark:bg-surface-dark-container-low h-72 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : featuredSpaces.length === 0 ? (
                        <div className="text-center py-12 text-on-surface-variant dark:text-on-dark-surface-variant">
                            <span className="material-symbols-outlined text-6xl mb-4">meeting_room</span>
                            <p>No featured spaces available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredSpaces.slice(0, 6).map((space) => (
                                <Link
                                    key={space.id}
                                    to={`/spaces/${space.id}`}
                                    className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl overflow-hidden border border-outline-variant dark:border-outline-dark-variant hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="h-44 bg-surface-container-low dark:bg-surface-dark-container-low relative overflow-hidden">
                                        {space.imageUrls?.[0] ? (
                                            <img
                                                src={space.imageUrls[0]}
                                                alt={space.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="material-symbols-outlined text-6xl text-on-surface-variant">
                                                    meeting_room
                                                </span>
                                            </div>
                                        )}
                                        {space.isFeatured && (
                                            <span className="absolute top-3 left-3 bg-primary dark:bg-primary-dark text-white px-3 py-1 text-xs font-semibold rounded-full">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-1">
                                            {space.name}
                                        </h3>
                                        <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {space.city}, {space.country}
                                        </p>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="font-headline-md text-primary dark:text-primary-dark">
                                                ${space.pricePerHour}
                                                <span className="text-body-sm font-normal text-on-surface-variant"> /hr</span>
                                            </span>
                                            <span className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                                ⭐ {space.averageRating?.toFixed(1) || 'New'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Features Section */}
                <section className="bg-surface-container-low dark:bg-surface-dark-container-low py-16 transition-colors duration-300">
                    <div className="max-w-container-max mx-auto px-4 md:px-10">
                        <div className="text-center mb-12">
                            <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-3">
                                Why Kinetic Workspace?
                            </h2>
                            <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant max-w-2xl mx-auto">
                                Everything you need to work productively, in one place.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark text-5xl mb-4">
                                    bolt
                                </span>
                                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                                    Instant Booking
                                </h3>
                                <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                                    Reserve any space in seconds with our streamlined checkout.
                                </p>
                            </div>

                            <div className="text-center">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark text-5xl mb-4">
                                    verified
                                </span>
                                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                                    Premium Quality
                                </h3>
                                <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                                    Every space is verified and equipped with high-end amenities.
                                </p>
                            </div>

                            <div className="text-center">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark text-5xl mb-4">
                                    support_agent
                                </span>
                                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                                    24/7 Support
                                </h3>
                                <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                                    Our team is available around the clock to help you.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Final */}
                <section className="max-w-container-max mx-auto px-4 md:px-10 py-20 text-center">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-4">
                        Ready to find your space?
                    </h2>
                    <p className="text-body-lg text-on-surface-variant dark:text-on-dark-surface-variant mb-8 max-w-2xl mx-auto">
                        Join thousands of professionals who trust Kinetic Workspace for their daily work.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-8 py-4 bg-primary dark:bg-primary-dark text-white rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-primary transition-colors"
                    >
                        Create Free Account
                    </Link>
                </section>
            </div>
        );
    }

    // ==================== RENDER: DASHBOARD (usuario autenticado) ====================
    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 transition-colors duration-300">
            {/* Hero autenticado */}
            <div className="bg-gradient-to-r from-primary to-primary-dark dark:from-primary-dark dark:to-primary rounded-xl p-8 md:p-12 mb-10 text-white">
                <h1 className="font-manrope font-bold text-3xl md:text-5xl mb-2">
                    Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="font-work-sans text-lg opacity-90">
                    Your high-performance workspace awaits.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center shadow-sm">
                    <div className="font-headline-lg text-primary dark:text-primary-dark">
                        {summary.totalReservations}
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        Total Bookings
                    </div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center shadow-sm">
                    <div className="font-headline-lg text-primary dark:text-primary-dark">
                        {summary.activeReservations}
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        Active Bookings
                    </div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center shadow-sm">
                    <div className="font-headline-lg text-primary dark:text-primary-dark">
                        ${summary.totalSpent}
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        Total Spent
                    </div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center shadow-sm">
                    <div className="font-headline-lg text-primary dark:text-primary-dark">
                        {summary.upcomingReservations}
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        Upcoming
                    </div>
                </div>
            </div>

            {/* Featured Spaces */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface">
                        Featured Spaces
                    </h2>
                    <Link to="/catalog" className="text-primary dark:text-primary-dark hover:underline font-medium">
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-surface-container-low dark:bg-surface-dark-container-low h-72 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {featuredSpaces.slice(0, 6).map((space) => (
                            <Link
                                key={space.id}
                                to={`/spaces/${space.id}`}
                                className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-lg border border-outline-variant dark:border-outline-dark-variant overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="h-44 bg-surface-container-low dark:bg-surface-dark-container-low flex items-center justify-center overflow-hidden relative">
                                    {space.imageUrls?.[0] ? (
                                        <img
                                            src={space.imageUrls[0]}
                                            alt={space.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-6xl text-on-surface-variant">
                                            meeting_room
                                        </span>
                                    )}
                                    {space.isFeatured && (
                                        <span className="absolute top-3 left-3 bg-primary dark:bg-primary-dark text-white px-3 py-1 text-xs font-semibold rounded">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-1">
                                        {space.name}
                                    </h3>
                                    <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                        {space.city}, {space.country}
                                    </p>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="font-headline-md text-primary dark:text-primary-dark">
                                            ${space.pricePerHour}
                                            <span className="text-body-sm font-normal text-on-surface-variant"> /hr</span>
                                        </span>
                                        <span className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                            ⭐ {space.averageRating?.toFixed(1) || 'New'} · 👥 {space.capacity}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/catalog" className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-4xl mb-2">🏢</div>
                    <div className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface">
                        Browse All Spaces
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        {featuredSpaces.length} premium spaces available
                    </div>
                </Link>

                <Link to="/profile" className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-4xl mb-2">👤</div>
                    <div className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface">
                        My Profile
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        View and edit your profile
                    </div>
                </Link>

                <Link to="/reservations" className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-4xl mb-2">📅</div>
                    <div className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface">
                        My Reservations
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        View your booking history
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Home;
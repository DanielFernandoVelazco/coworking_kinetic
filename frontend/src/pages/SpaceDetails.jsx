// frontend/src/pages/SpaceDetails.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import spacesService from '../api/spaces.service';
import toast from 'react-hot-toast';

// ✅ react-datepicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SpaceDetails = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);

    // Rango de fechas [start, end]
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    // Horas
    const [startTimeOnly, setStartTimeOnly] = useState('09:00');
    const [endTimeOnly, setEndTimeOnly] = useState('17:00');

    // Notas y huéspedes
    const [notes, setNotes] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState(1);

    const [bookingLoading, setBookingLoading] = useState(false);

    // ==================== HELPERS ====================

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // Duración en vivo
    const { durationHours, durationMinutes, durationTotalMinutes } = useMemo(() => {
        if (!startDate || !endDate || !startTimeOnly || !endTimeOnly) {
            return { durationHours: 0, durationMinutes: 0, durationTotalMinutes: 0 };
        }

        const [sh, sm] = startTimeOnly.split(':').map(Number);
        const [eh, em] = endTimeOnly.split(':').map(Number);

        const start = new Date(
            startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), sh, sm
        );
        const end = new Date(
            endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), eh, em
        );

        if (end <= start) {
            return { durationHours: 0, durationMinutes: 0, durationTotalMinutes: 0 };
        }

        const totalMin = Math.floor((end - start) / 60000);
        return {
            durationHours: Math.floor(totalMin / 60),
            durationMinutes: totalMin % 60,
            durationTotalMinutes: totalMin,
        };
    }, [startDate, endDate, startTimeOnly, endTimeOnly]);

    // Precio estimado en vivo
    const estimatedPrice = useMemo(() => {
        if (!space || durationTotalMinutes === 0) return 0;
        const totalHours = durationTotalMinutes / 60;
        const dayDiff = Math.floor(durationTotalMinutes / (60 * 24));

        if (dayDiff >= 1 && space.pricePerDay && space.pricePerDay > 0) {
            const remainingHours = totalHours - dayDiff * 24;
            return dayDiff * space.pricePerDay + Math.max(0, remainingHours) * space.pricePerHour;
        }
        return totalHours * space.pricePerHour;
    }, [space, durationTotalMinutes]);

    // ==================== CARGA DEL ESPACIO ====================

    useEffect(() => {
        const fetchSpace = async () => {
            try {
                const data = await spacesService.getById(id);
                setSpace(data);
            } catch (error) {
                console.error('Error fetching space:', error);
                toast.error('Error al cargar el espacio');
                navigate('/catalog');
            } finally {
                setLoading(false);
            }
        };
        fetchSpace();
    }, [id, navigate]);

    // ==================== HANDLERS ====================

    const handleAddToCart = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Por favor, inicia sesión para reservar');
            navigate('/login');
            return;
        }

        if (!startDate || !endDate) {
            toast.error('Por favor, selecciona un rango de fechas');
            return;
        }

        const [sh, sm] = startTimeOnly.split(':').map(Number);
        const [eh, em] = endTimeOnly.split(':').map(Number);

        const start = new Date(
            startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), sh, sm
        );
        const end = new Date(
            endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), eh, em
        );

        if (start >= end) {
            toast.error('La fecha de inicio debe ser anterior a la de fin');
            return;
        }

        if (start < new Date()) {
            toast.error('No se pueden hacer reservas en el pasado');
            return;
        }

        if (durationTotalMinutes < 30) {
            toast.error('La duración mínima es de 30 minutos');
            return;
        }

        const guests = parseInt(numberOfGuests) || 1;
        if (guests > space.capacity) {
            toast.error(`La capacidad máxima es de ${space.capacity} personas`);
            return;
        }

        setBookingLoading(true);

        try {
            const result = await addToCart(
                parseInt(id),
                start.toISOString(),
                end.toISOString(),
                notes,
                guests
            );

            if (result.success) {
                setShowBooking(false);
                setDateRange([null, null]);
                setStartTimeOnly('09:00');
                setEndTimeOnly('17:00');
                setNotes('');
                setNumberOfGuests(1);
                navigate('/cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            const message = error.response?.data?.message || 'Error al agregar al carrito';
            toast.error(message);
        } finally {
            setBookingLoading(false);
        }
    };

    // Helpers amenities
    const getAmenityIcon = (a) => (typeof a === 'object' && a.icon ? a.icon : 'check_circle');
    const getAmenityName = (a) => (typeof a === 'object' ? a.name : a);

    // ==================== LOADING / NOT FOUND ====================

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-4 md:px-10 py-12">
                <div className="animate-pulse">
                    <div className="h-96 bg-surface-container-low rounded-xl mb-8"></div>
                    <div className="h-8 bg-surface-container-low w-1/3 rounded mb-4"></div>
                    <div className="h-4 bg-surface-container-low w-1/2 rounded mb-8"></div>
                </div>
            </div>
        );
    }

    if (!space) {
        return (
            <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 text-center">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
                    Space not found
                </h2>
                <Link to="/catalog" className="text-primary hover:underline">
                    Back to catalog
                </Link>
            </div>
        );
    }

    // ==================== RENDER ====================

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 transition-colors duration-300">
            {/* Breadcrumb */}
            <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant mb-6">
                <Link to="/" className="hover:text-primary dark:hover:text-primary-dark">Home</Link>
                {' / '}
                <Link to="/catalog" className="hover:text-primary dark:hover:text-primary-dark">Catalog</Link>
                {' / '}
                <span className="text-primary dark:text-primary-dark">{space.name}</span>
            </div>

            {/* Imagen */}
            <div className="rounded-xl overflow-hidden border border-outline-variant dark:border-outline-dark-variant mb-8 h-96 bg-surface-container-low dark:bg-surface-dark-container-low">
                {space.imageUrls?.[0] ? (
                    <img
                        src={space.imageUrls[0]}
                        alt={space.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML =
                                '<div class="flex items-center justify-center h-full"><span class="material-symbols-outlined text-6xl">meeting_room</span></div>';
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-on-surface-variant">
                        <span className="material-symbols-outlined text-6xl">meeting_room</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Detalles */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-2">
                                {space.name}
                            </h1>
                            <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {space.address}, {space.city}, {space.country}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="font-headline-xl text-primary dark:text-primary-dark">
                                ${space.pricePerHour}
                            </span>
                            <span className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant"> /hour</span>
                            {space.pricePerDay && (
                                <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                    ${space.pricePerDay} /day
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-surface-container-low dark:bg-surface-dark-container-low rounded-full text-body-sm text-on-surface dark:text-on-dark-surface">
                            👥 {space.capacity} people
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low dark:bg-surface-dark-container-low rounded-full text-body-sm text-on-surface dark:text-on-dark-surface">
                            ⭐ {space.averageRating?.toFixed(1) || 'No reviews'}
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low dark:bg-surface-dark-container-low rounded-full text-body-sm text-on-surface dark:text-on-dark-surface">
                            {space.type}
                        </span>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">Description</h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant leading-relaxed">
                            {space.description || 'No description available.'}
                        </p>
                    </div>

                    {space.amenities?.length > 0 && (
                        <div className="mb-8">
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark">stars</span>
                                Amenities
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {space.amenities.map((amenity, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-2 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg text-body-sm border border-outline-variant dark:border-outline-dark-variant flex items-center gap-2 text-on-surface dark:text-on-dark-surface"
                                    >
                                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-sm">
                                            {getAmenityIcon(amenity)}
                                        </span>
                                        {getAmenityName(amenity)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar reserva */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant sticky top-24 transition-colors duration-300">
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary dark:text-primary-dark">
                                shopping_cart
                            </span>
                            Reserve This Space
                        </h3>

                        {!showBooking ? (
                            <button
                                onClick={() => setShowBooking(true)}
                                className="w-full bg-primary dark:bg-primary-dark text-on-primary py-3 rounded-lg font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                Add to Cart
                            </button>
                        ) : (
                            <form onSubmit={handleAddToCart}>
                                <div className="space-y-4">
                                    {/* ============ CALENDARIO DE RANGO ============ */}
                                    <div>
                                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-2">
                                            SELECT DATES
                                        </label>

                                        {/*
                                          ✅ Contenedor con `dark` class duplicada — así el CSS
                                          de abajo puede apuntar a `.dark .react-datepicker`
                                          sin depender del contexto global.
                                        */}
                                        <div className="range-picker-wrapper kinetic-calendar-wrapper">
                                            <DatePicker
                                                selectsRange
                                                startDate={startDate}
                                                endDate={endDate}
                                                onChange={(update) => setDateRange(update)}
                                                minDate={today}
                                                monthsShown={1}
                                                inline
                                                calendarClassName="kinetic-calendar"
                                                weekDayClassName={() => 'kinetic-weekday'}
                                                dayClassName={(date) => {
                                                    if (!startDate || !endDate) return 'kinetic-day';
                                                    const d = new Date(date).setHours(0, 0, 0, 0);
                                                    const s = new Date(startDate).setHours(0, 0, 0, 0);
                                                    const e = new Date(endDate).setHours(0, 0, 0, 0);
                                                    if (d > s && d < e) return 'kinetic-day kinetic-day--in-range';
                                                    return 'kinetic-day';
                                                }}
                                            />
                                        </div>

                                        <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant mt-2">
                                            {startDate && !endDate && '📅 Ahora selecciona la fecha de fin'}
                                            {startDate && endDate && (
                                                <>
                                                    📅 {startDate.toLocaleDateString()} →{' '}
                                                    {endDate.toLocaleDateString()}
                                                </>
                                            )}
                                            {!startDate && '📅 Selecciona la fecha de inicio'}
                                        </p>
                                    </div>

                                    {/* ============ HORAS ============ */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                                START TIME
                                            </label>
                                            <input
                                                type="time"
                                                value={startTimeOnly}
                                                onChange={(e) => setStartTimeOnly(e.target.value)}
                                                step="900"
                                                required
                                                className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-2 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none rounded-t text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                                END TIME
                                            </label>
                                            <input
                                                type="time"
                                                value={endTimeOnly}
                                                onChange={(e) => setEndTimeOnly(e.target.value)}
                                                step="900"
                                                required
                                                className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-2 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none rounded-t text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* ============ DURACIÓN + PRECIO ============ */}
                                    {durationTotalMinutes > 0 && (
                                        <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg border border-outline-variant dark:border-outline-dark-variant space-y-1">
                                            <div className="flex items-center justify-between text-body-sm">
                                                <span className="flex items-center gap-1 text-on-surface-variant dark:text-on-dark-surface-variant">
                                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                                    Duración
                                                </span>
                                                <strong className="text-on-surface dark:text-on-dark-surface">
                                                    {durationHours > 0 && `${durationHours}h `}
                                                    {durationMinutes > 0 && `${durationMinutes}m`}
                                                </strong>
                                            </div>
                                            <div className="flex items-center justify-between text-body-sm">
                                                <span className="flex items-center gap-1 text-on-surface-variant dark:text-on-dark-surface-variant">
                                                    <span className="material-symbols-outlined text-sm">payments</span>
                                                    Estimado
                                                </span>
                                                <strong className="text-primary dark:text-primary-dark text-base">
                                                    ${estimatedPrice.toFixed(2)}
                                                </strong>
                                            </div>
                                            {durationTotalMinutes < 30 && (
                                                <p className="text-body-xs text-amber-600 dark:text-amber-400 mt-1">
                                                    ⚠️ Duración mínima: 30 minutos
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* ============ GUESTS ============ */}
                                    <div>
                                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                            GUESTS
                                        </label>
                                        <input
                                            type="number"
                                            value={numberOfGuests}
                                            onChange={(e) => setNumberOfGuests(e.target.value)}
                                            min="1"
                                            max={space.capacity}
                                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                        />
                                        <span className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                            Max: {space.capacity} people
                                        </span>
                                    </div>

                                    {/* ============ NOTES ============ */}
                                    <div>
                                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                            NOTES (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows="2"
                                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                            placeholder="Special requests..."
                                        />
                                    </div>

                                    {/* ============ BOTONES ============ */}
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={bookingLoading || durationTotalMinutes < 30}
                                            className="flex-1 bg-primary dark:bg-primary-dark text-on-primary py-2 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {bookingLoading ? (
                                                <>
                                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                                    Add to Cart
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowBooking(false)}
                                            className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="mt-4 text-center text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">security</span>
                            Secure booking • Pay after confirmation
                        </div>

                        <div className="mt-4 pt-4 border-t border-outline-variant dark:border-outline-dark-variant text-center text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                            <p className="flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Your reservation will be held for 30 minutes
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaceDetails;
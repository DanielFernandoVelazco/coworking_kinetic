// frontend/src/pages/SpaceDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import spacesService from '../api/spaces.service';
import toast from 'react-hot-toast';

const SpaceDetails = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const { addToCart } = useCart(); // ✅ Usar el carrito
    const navigate = useNavigate();

    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingData, setBookingData] = useState({
        startTime: '',
        endTime: '',
        notes: '',
        numberOfGuests: 1
    });
    const [bookingLoading, setBookingLoading] = useState(false);

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

    const handleBookingChange = (e) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };

    // ✅ Cambiado de handleBooking a handleAddToCart
    const handleAddToCart = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Por favor, inicia sesión para reservar');
            navigate('/login');
            return;
        }

        const startTime = new Date(bookingData.startTime);
        const endTime = new Date(bookingData.endTime);

        if (startTime >= endTime) {
            toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
            return;
        }

        if (startTime < new Date()) {
            toast.error('No se pueden hacer reservas en el pasado');
            return;
        }

        setBookingLoading(true);

        try {
            const numberOfGuests = parseInt(bookingData.numberOfGuests) || 1;

            // ✅ Agregar al carrito usando el contexto
            const result = await addToCart(
                parseInt(id),
                startTime.toISOString(),
                endTime.toISOString(),
                bookingData.notes,
                numberOfGuests
            );

            if (result.success) {
                setShowBooking(false);
                // Resetear formulario
                setBookingData({
                    startTime: '',
                    endTime: '',
                    notes: '',
                    numberOfGuests: 1
                });
                // ✅ Navegar al carrito
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

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="animate-pulse">
                    <div className="h-96 bg-surface-container-low rounded-xl mb-8"></div>
                    <div className="h-8 bg-surface-container-low w-1/3 rounded mb-4"></div>
                    <div className="h-4 bg-surface-container-low w-1/2 rounded mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-20 bg-surface-container-low rounded"></div>
                        <div className="h-20 bg-surface-container-low rounded"></div>
                        <div className="h-20 bg-surface-container-low rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!space) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12 text-center">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Space not found</h2>
                <Link to="/catalog" className="text-primary hover:underline">
                    Back to catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            {/* Breadcrumb */}
            <div className="text-body-sm text-on-surface-variant mb-6">
                <Link to="/" className="hover:text-primary">Home</Link>
                {' / '}
                <Link to="/catalog" className="hover:text-primary">Catalog</Link>
                {' / '}
                <span className="text-primary">{space.name}</span>
            </div>

            {/* Imagen Principal */}
            <div className="rounded-xl overflow-hidden border border-outline-variant mb-8 h-96 bg-surface-container-low">
                {space.imageUrls?.[0] ? (
                    <img
                        src={space.imageUrls[0]}
                        alt={space.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-on-surface-variant"><span class="material-symbols-outlined text-6xl">meeting_room</span></div>';
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-on-surface-variant">
                        <span className="material-symbols-outlined text-6xl">meeting_room</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Detalles del Espacio */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                                {space.name}
                            </h1>
                            <p className="text-body-md text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {space.address}, {space.city}, {space.country}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="font-headline-xl text-primary">
                                ${space.pricePerHour}
                            </span>
                            <span className="text-body-sm text-on-surface-variant"> /hour</span>
                            {space.pricePerDay && (
                                <div className="text-body-sm text-on-surface-variant">
                                    ${space.pricePerDay} /day
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-surface-container-low rounded-full text-body-sm">
                            👥 {space.capacity} people
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low rounded-full text-body-sm">
                            ⭐ {space.averageRating?.toFixed(1) || 'No reviews'}
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low rounded-full text-body-sm">
                            {space.type}
                        </span>
                        {space.isFeatured && (
                            <span className="px-3 py-1 bg-primary text-on-primary rounded-full text-body-sm">
                                Featured
                            </span>
                        )}
                    </div>

                    <div className="mb-8">
                        <h3 className="font-headline-md text-headline-md mb-3">Description</h3>
                        <p className="text-body-md text-on-surface-variant leading-relaxed">
                            {space.description || 'No description available.'}
                        </p>
                    </div>

                    {/* Amenidades */}
                    {space.amenities?.length > 0 && (
                        <div className="mb-8">
                            <h3 className="font-headline-md text-headline-md mb-3">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {space.amenities.map((amenity, index) => (
                                    <span key={index} className="px-3 py-2 bg-surface-container-low rounded-lg text-body-sm border border-outline-variant">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Carrito */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant sticky top-24">
                        <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">shopping_cart</span>
                            Reserve This Space
                        </h3>

                        {!showBooking ? (
                            <button
                                onClick={() => setShowBooking(true)}
                                className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                Add to Cart
                            </button>
                        ) : (
                            <form onSubmit={handleAddToCart}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                            START DATE & TIME
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="startTime"
                                            value={bookingData.startTime}
                                            onChange={handleBookingChange}
                                            required
                                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                            END DATE & TIME
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="endTime"
                                            value={bookingData.endTime}
                                            onChange={handleBookingChange}
                                            required
                                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                            NUMBER OF GUESTS
                                        </label>
                                        <input
                                            type="number"
                                            name="numberOfGuests"
                                            value={bookingData.numberOfGuests}
                                            onChange={handleBookingChange}
                                            min="1"
                                            max={space.capacity}
                                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                        />
                                        <span className="text-body-xs text-on-surface-variant">
                                            Max: {space.capacity} people
                                        </span>
                                    </div>
                                    <div>
                                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                            NOTES (Optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={bookingData.notes}
                                            onChange={handleBookingChange}
                                            rows="2"
                                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                            placeholder="Special requests..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={bookingLoading}
                                            className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                                            className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="mt-4 text-center text-body-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm align-middle">security</span>
                            Secure booking • Pay after confirmation
                        </div>

                        {/* ✅ Info adicional del carrito */}
                        <div className="mt-4 pt-4 border-t border-outline-variant text-center text-body-xs text-on-surface-variant">
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
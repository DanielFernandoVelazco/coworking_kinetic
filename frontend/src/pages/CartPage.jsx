// frontend/src/pages/CartPage.jsx
// ✅ AGREGAR imports faltantes
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/cart/PaymentModal';
import toast from 'react-hot-toast';

const CartPage = () => {
    const {
        cartItems,
        loading,
        cancelItem,
        getTotal,
        refreshCart,
        clearCart // ✅ AGREGAR clearCart
    } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastPaymentData, setLastPaymentData] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    // ✅ useCallback ya está importado
    const handlePaymentSuccess = useCallback(async (paymentData) => {
        console.log('✅ Pago exitoso, datos:', paymentData);

        toast.success('🎉 ¡Reserva creada exitosamente!');

        // Guardar datos para el modal de éxito
        setLastPaymentData(paymentData);
        setShowSuccess(true);

        // Cerrar modal de pago
        setShowPaymentModal(false);
        setSelectedItem(null);

        // ✅ Limpiar y refrescar carrito
        await refreshCart();

        // ✅ Navegar después de un momento
        setTimeout(() => {
            navigate('/reservations');
        }, 2000);
    }, [refreshCart, navigate]);

    const handlePaymentError = useCallback((error) => {
        console.error('❌ Error en pago:', error);
        toast.error(error?.message || 'Error al procesar el pago');
        setShowPaymentModal(false);
        setSelectedItem(null);
    }, []);

    // ✅ useMemo para calcular total
    const total = useMemo(() => getTotal(), [getTotal, cartItems]);

    // ✅ useMemo para verificar si hay items
    const hasItems = useMemo(() => cartItems.length > 0, [cartItems]);

    // Formatear fecha
    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Manejar checkout
    const handleCheckout = useCallback((item) => {
        if (!item) {
            toast.error('No hay item seleccionado');
            return;
        }
        setSelectedItem(item);
        setShowPaymentModal(true);
    }, []);

    // Manejar cancelación
    const handleCancelItem = useCallback(async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este item del carrito?')) {
            const result = await cancelItem(id);
            if (result.success) {
                toast.success('Item eliminado del carrito');
            }
        }
    }, [cancelItem]);

    // Cerrar modal de éxito
    const handleCloseSuccess = useCallback(() => {
        setShowSuccess(false);
        setLastPaymentData(null);
        navigate('/catalog');
    }, [navigate]);

    // Si está cargando
    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-on-surface-variant mt-4">Cargando carrito...</p>
                </div>
            </div>
        );
    }

    // Si el carrito está vacío
    if (!hasItems) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">shopping_cart</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Tu carrito está vacío</h2>
                    <p className="text-body-md text-on-surface-variant mb-6">
                        Explora nuestros espacios y agrega tus favoritos al carrito
                    </p>
                    <Link to="/catalog" className="btn-primary inline-block">
                        Ver Espacios
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            {/* Modal de Éxito */}
            {showSuccess && lastPaymentData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-8 shadow-xl text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
                        </div>
                        <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                            🎉 ¡Reserva Confirmada!
                        </h3>
                        <p className="text-body-md text-on-surface-variant mb-4">
                            Tu reserva ha sido creada exitosamente.
                            {lastPaymentData?.invoiceNumber && (
                                <span className="block text-sm text-primary mt-1">
                                    Factura: {lastPaymentData.invoiceNumber}
                                </span>
                            )}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setShowSuccess(false);
                                    navigate('/reservations');
                                }}
                                className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">list_alt</span>
                                Ver mis reservas
                            </button>
                            <button
                                onClick={handleCloseSuccess}
                                className="px-6 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                Seguir comprando
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header del Carrito */}
            <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Carrito de Compras</h1>
                <span className="text-body-sm text-on-surface-variant ml-2">
                    ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </span>
            </div>

            {/* Items del Carrito */}
            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface-container-lowest rounded-xl border border-outline-variant hover:shadow-md transition-all"
                    >
                        {/* Info del espacio */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-headline-md text-headline-md text-on-surface">
                                    {item.spaceName}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isExpired
                                    ? 'bg-red-100 text-red-700'
                                    : item.status === 'PaymentPending'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {item.isExpired ? 'Expirado' : item.status}
                                </span>
                            </div>

                            <div className="space-y-1 text-body-sm text-on-surface-variant">
                                <p className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">event</span>
                                    {formatDate(item.startTime)} → {formatDate(item.endTime)}
                                </p>
                                <p className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {item.spaceType}
                                </p>
                                {item.numberOfGuests && (
                                    <p className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">group</span>
                                        {item.numberOfGuests} {item.numberOfGuests === 1 ? 'persona' : 'personas'}
                                    </p>
                                )}
                                {item.expiresAt && (
                                    <p className={`flex items-center gap-1 text-xs ${item.isExpired ? 'text-red-600' : 'text-amber-600'
                                        }`}>
                                        <span className="material-symbols-outlined text-sm">timer</span>
                                        {item.isExpired
                                            ? 'Expirado'
                                            : `Expira en ${item.expiresInMinutes} minutos`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Precio y acciones */}
                        <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
                            <span className="font-headline-lg text-primary">
                                ${item.totalPrice?.toFixed(2) || '0.00'}
                            </span>
                            <div className="flex gap-2">
                                <Link
                                    to={`/spaces/${item.spaceId}`}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Ver espacio
                                </Link>
                                {!item.isExpired && item.status !== 'Paid' && (
                                    <>
                                        <button
                                            onClick={() => handleCheckout(item)}
                                            className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors text-sm flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">payment</span>
                                            Pagar
                                        </button>
                                        <button
                                            onClick={() => handleCancelItem(item.id)}
                                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resumen */}
            <div className="mt-8 p-6 bg-surface-container-low rounded-xl border border-outline-variant">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface">Resumen del Pedido</h3>
                        <p className="text-body-sm text-on-surface-variant">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} en tu carrito
                        </p>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-body-sm text-on-surface-variant">Total</p>
                            <span className="font-headline-xl text-primary">${total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => {
                                if (cartItems.length === 1) {
                                    handleCheckout(cartItems[0]);
                                } else {
                                    toast.info('Procesa cada item individualmente');
                                }
                            }}
                            className="px-6 py-3 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">payment</span>
                            Proceder al Pago
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Pago */}
            {showPaymentModal && selectedItem && (
                <PaymentModal
                    item={selectedItem}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedItem(null);
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                />
            )}
        </div>
    );
};

// ✅ AGREGAR estilos de animación
const styles = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
    }
`;

// ✅ Inyectar estilos si no existen
if (!document.getElementById('cart-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'cart-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

export default CartPage;
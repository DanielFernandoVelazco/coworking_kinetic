// frontend/src/pages/CartPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/cart/PaymentModal';
import toast from 'react-hot-toast';

const CartPage = () => {
    const { cartItems, loading, cancelItem, getTotal, refreshCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);

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

    const handleCheckout = (item) => {
        setSelectedItem(item);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async () => {
        setShowPaymentModal(false);
        setSelectedItem(null);
        await refreshCart();
        navigate('/reservations');
    };

    const handleCancelItem = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este item del carrito?')) {
            await cancelItem(id);
        }
    };

    if (loading) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-on-surface-variant mt-4">Loading cart...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
                <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">shopping_cart</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Your cart is empty</h2>
                    <p className="text-body-md text-on-surface-variant mb-6">
                        Browse our workspaces and add your favorites to the cart
                    </p>
                    <Link to="/catalog" className="btn-primary inline-block">
                        Browse Workspaces
                    </Link>
                </div>
            </div>
        );
    }

    const total = getTotal();

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Shopping Cart</h1>
                <span className="text-body-sm text-on-surface-variant ml-2">
                    ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </span>
            </div>

            {/* Cart Items */}
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
                                    {item.isExpired ? 'Expired' : item.status}
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
                                        {item.numberOfGuests} guests
                                    </p>
                                )}
                                {item.expiresAt && (
                                    <p className={`flex items-center gap-1 text-xs ${item.isExpired ? 'text-red-600' : 'text-amber-600'
                                        }`}>
                                        <span className="material-symbols-outlined text-sm">timer</span>
                                        {item.isExpired
                                            ? 'Expired'
                                            : `Expires in ${item.expiresInMinutes} minutes`}
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
                                    View Space
                                </Link>
                                {!item.isExpired && item.status !== 'Paid' && (
                                    <>
                                        <button
                                            onClick={() => handleCheckout(item)}
                                            className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors text-sm flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">payment</span>
                                            Checkout
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
                        <h3 className="font-headline-md text-headline-md text-on-surface">Order Summary</h3>
                        <p className="text-body-sm text-on-surface-variant">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
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
                                    toast.error('Por favor, procesa cada item individualmente');
                                }
                            }}
                            className="px-6 py-3 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">payment</span>
                            Proceed to Checkout
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
                />
            )}
        </div>
    );
};

export default CartPage;
// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import preReservationsService from '../api/pre-reservations.service';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    // Generar o recuperar sessionId
    useEffect(() => {
        let storedSessionId = localStorage.getItem('cartSessionId');
        if (!storedSessionId) {
            storedSessionId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('cartSessionId', storedSessionId);
        }
        setSessionId(storedSessionId);
    }, []);

    // Cargar carrito cuando el usuario se autentica
    useEffect(() => {
        if (isAuthenticated && sessionId) {
            loadCart();
        } else if (!isAuthenticated) {
            setCartItems([]);
        }
    }, [isAuthenticated, sessionId]);

    // Cargar carrito desde el backend
    const loadCart = useCallback(async () => {
        if (!isAuthenticated || !sessionId) return;

        setLoading(true);
        try {
            const cart = await preReservationsService.getActiveCart(sessionId);
            if (cart) {
                setCartItems([cart]);
            } else {
                // Intentar cargar todas las pre-reservas pendientes
                const preReservations = await preReservationsService.getUserPreReservations('Pending');
                if (Array.isArray(preReservations) && preReservations.length > 0) {
                    setCartItems(preReservations);
                } else {
                    setCartItems([]);
                }
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, sessionId]);

    // Agregar al carrito (crear pre-reserva)
    const addToCart = async (spaceId, startTime, endTime, notes = '', numberOfGuests = 1) => {
        if (!isAuthenticated) {
            toast.error('Por favor, inicia sesión para reservar');
            return { success: false, error: 'Not authenticated' };
        }

        setLoading(true);
        try {
            const data = {
                spaceId,
                startTime,
                endTime,
                notes,
                numberOfGuests,
                sessionId
            };

            const result = await preReservationsService.create(data);
            setCartItems([result]);
            toast.success('Espacio agregado al carrito');
            return { success: true, data: result };
        } catch (error) {
            const message = error.response?.data?.message || 'Error al agregar al carrito';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Procesar pago
    const processPayment = async (preReservationId, paymentMethod, billingInfo = null) => {
        setLoading(true);
        try {
            const data = {
                preReservationId,
                paymentMethod,
                ...billingInfo
            };

            const result = await preReservationsService.processPayment(data);
            toast.success('Pago iniciado correctamente');
            return { success: true, data: result };
        } catch (error) {
            const message = error.response?.data?.message || 'Error al procesar el pago';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    // Confirmar pago
    const confirmPayment = async (preReservationId, paymentIntentId) => {
        setLoading(true);
        try {
            console.log('📤 Confirmando pago:', { preReservationId, paymentIntentId });

            const result = await preReservationsService.confirmPayment({
                preReservationId,
                paymentIntentId
            });

            console.log('📥 Resultado confirmación:', result);

            if (result && result.status === 'Completed') {
                toast.success('✅ Pago confirmado exitosamente');
                return { success: true, data: result };
            } else {
                const errorMsg = result?.message || 'Error al confirmar el pago';
                toast.error(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('❌ Error en confirmPayment:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Error al confirmar el pago';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Cancelar pre-reserva
    const cancelItem = async (preReservationId, reason = '') => {
        try {
            await preReservationsService.cancel(preReservationId, reason);
            setCartItems(prev => prev.filter(item => item.id !== preReservationId));
            toast.success('Item removido del carrito');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Error al cancelar';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // ✅ Limpiar carrito (solo se llama en caso de éxito)
    const clearCart = useCallback(() => {
        setCartItems([]);
        // ✅ También limpiar la sessionId para forzar recarga
        // localStorage.removeItem('cartSessionId');
        console.log('🛒 Carrito limpiado');
    }, []);


    // ✅ AGREGAR MÉTODO PARA VERIFICAR SI HAY RESERVAS PENDIENTES
    const hasPendingItems = useCallback(() => {
        return cartItems.some(item =>
            item.status === 'Pending' ||
            item.status === 'PaymentPending'
        );
    }, [cartItems]);

    // ✅ AGREGAR MÉTODO PARA FORZAR RECARGA DESPUÉS DEL PAGO
    const refreshAfterPayment = useCallback(async () => {
        console.log('🔄 Refrescando carrito después del pago...');
        await clearCart();
        // Esperar un momento para que el backend procese
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadCart();
        console.log('✅ Carrito refrescado');
    }, [clearCart, loadCart]);

    // Recargar carrito
    const refreshCart = async () => {
        await loadCart();
    };

    // Calcular total
    const getTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    };

    const getItemCount = () => {
        return cartItems.length;
    };

    const value = {
        cartItems,
        loading,
        sessionId,
        addToCart,
        processPayment,
        confirmPayment,
        cancelItem,
        clearCart,
        refreshCart,
        refreshAfterPayment, // ✅ NUEVO
        getTotal,
        getItemCount,
        hasPendingItems, // ✅ NUEVO
        loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
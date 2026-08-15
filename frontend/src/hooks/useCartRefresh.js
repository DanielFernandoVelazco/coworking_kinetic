// frontend/src/hooks/useCartRefresh.js
import { useCallback } from 'react';
import { useCart } from '../context/CartContext';

export const useCartRefresh = () => {
    const { refreshCart, clearCart, loadCart } = useCart();

    const refreshAfterPayment = useCallback(async () => {
        console.log('🔄 Refrescando carrito después del pago...');

        // Limpiar carrito local
        clearCart();

        // Esperar un momento
        await new Promise(resolve => setTimeout(resolve, 300));

        // Recargar desde el backend
        await loadCart();

        console.log('✅ Carrito refrescado después del pago');
    }, [clearCart, loadCart]);

    const forceRefresh = useCallback(async () => {
        console.log('🔄 Forzando refresco del carrito...');
        await loadCart();
    }, [loadCart]);

    return {
        refreshAfterPayment,
        forceRefresh
    };
};

export default useCartRefresh;
// frontend/src/components/cart/PaymentModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PaymentStep from './payment/PaymentStep';
import ProcessingStep from './payment/ProcessingStep';
import ConfirmStep from './payment/ConfirmStep';
import ResultStep from './payment/ResultStep';

const PaymentModal = ({ item, onClose, onSuccess, onError }) => {
    const { processPayment, confirmPayment, clearCart } = useCart();
    const navigate = useNavigate();

    const [step, setStep] = useState('payment');
    const [paymentMethod, setPaymentMethod] = useState('CreditCard');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    const [preReservationId, setPreReservationId] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const redirectTimerRef = useRef(null);

    const [billingInfo, setBillingInfo] = useState({
        billingAddress: '',
        billingCity: '',
        billingPostalCode: '',
        billingCountry: 'Sweden',
        billingVatNumber: '',
    });

    const [cardData, setCardData] = useState({
        cardNumber: '4242 4242 4242 4242',
        cardExpiry: '12/26',
        cardCvv: '123',
    });

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const handleBillingChange = useCallback((e) => {
        setBillingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const handleCardChange = useCallback((e) => {
        setCardData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    // Limpiar timer al desmontar
    useEffect(() => {
        return () => {
            if (redirectTimerRef.current) {
                clearInterval(redirectTimerRef.current);
            }
        };
    }, []);

    // Contador de redirección tras éxito
    useEffect(() => {
        if (step === 'result' && paymentResult === 'success' && !isRedirecting) {
            setIsRedirecting(true);

            if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);

            let counter = 5;
            setCountdown(counter);

            redirectTimerRef.current = setInterval(() => {
                counter -= 1;
                setCountdown(counter);

                if (counter <= 0) {
                    clearInterval(redirectTimerRef.current);
                    redirectTimerRef.current = null;
                    onClose();
                    clearCart();
                    if (onSuccess) onSuccess();
                    navigate('/reservations');
                    toast.success('¡Reserva creada exitosamente!');
                }
            }, 1000);
        }
    }, [step, paymentResult, isRedirecting, onClose, clearCart, onSuccess, navigate]);

    // ==================== HANDLERS ====================

    const handleAutoConfirmPayment = useCallback(
        async (preResId, payIntentId) => {
            setLoading(true);
            setStep('processing');
            setError(null);

            try {
                console.log('✅ Confirmando pago automático para:', preResId, payIntentId);

                const result = await confirmPayment(preResId, payIntentId);

                console.log('📦 Resultado de confirmación:', result);

                if (result.success && result.data) {
                    setPaymentResult('success');
                    setStep('result');
                    toast.success('🎉 ¡Pago confirmado! Redirigiendo...');

                    if (onSuccess) {
                        setTimeout(() => onSuccess(result.data), 1000);
                    }
                } else {
                    setPaymentResult('failed');
                    setStep('result');
                    const errorMsg = result.error || 'Error al confirmar el pago';
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
            } catch (err) {
                console.error('❌ Confirm payment error:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Error al confirmar el pago';
                setPaymentResult('failed');
                setStep('result');
                setError(errorMessage);
                toast.error(errorMessage);
                if (onError) onError(err);
            } finally {
                setLoading(false);
            }
        },
        [confirmPayment, onSuccess, onError]
    );

    const handleProcessPayment = useCallback(async () => {
        if (!item) {
            toast.error('No hay item seleccionado');
            return;
        }

        setLoading(true);
        setStep('processing');
        setError(null);

        try {
            console.log('💰 Procesando pago para:', item.id);

            const result = await processPayment(item.id, paymentMethod, billingInfo);

            console.log('📦 Resultado del pago:', result);

            if (result.success && result.data) {
                setPaymentIntentId(result.data.paymentIntentId);
                setPreReservationId(result.data.preReservationId);

                console.log('🔄 Confirmando pago automáticamente...');
                await new Promise((resolve) => setTimeout(resolve, 1000));

                await handleAutoConfirmPayment(
                    result.data.preReservationId,
                    result.data.paymentIntentId
                );
            } else {
                setError(result.error || 'Error al procesar el pago');
                setStep('payment');
                toast.error(result.error || 'Error al procesar el pago');
            }
        } catch (err) {
            console.error('❌ Payment error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Error al procesar el pago';
            setError(errorMessage);
            setStep('payment');
            toast.error(errorMessage);
            if (onError) onError(err);
        } finally {
            setLoading(false);
        }
    }, [item, processPayment, paymentMethod, billingInfo, handleAutoConfirmPayment, onError]);

    const handleManualConfirmPayment = useCallback(async () => {
        if (!preReservationId || !paymentIntentId) {
            toast.error('Faltan datos para confirmar el pago');
            return;
        }
        await handleAutoConfirmPayment(preReservationId, paymentIntentId);
    }, [preReservationId, paymentIntentId, handleAutoConfirmPayment]);

    const handleBackToCart = useCallback(() => {
        if (redirectTimerRef.current) {
            clearInterval(redirectTimerRef.current);
            redirectTimerRef.current = null;
        }
        setStep('payment');
        setPaymentResult(null);
        setError(null);
        setCountdown(5);
        setIsRedirecting(false);
        onClose();
    }, [onClose]);

    const handleRetry = useCallback(() => {
        if (redirectTimerRef.current) {
            clearInterval(redirectTimerRef.current);
            redirectTimerRef.current = null;
        }
        setStep('payment');
        setPaymentResult(null);
        setError(null);
        setCountdown(5);
        setIsRedirecting(false);
    }, []);

    const handleGoToReservations = useCallback(() => {
        if (redirectTimerRef.current) {
            clearInterval(redirectTimerRef.current);
            redirectTimerRef.current = null;
        }
        onClose();
        clearCart();
        if (onSuccess) onSuccess();
        navigate('/reservations');
        toast.success('¡Reserva creada exitosamente!');
    }, [onClose, clearCart, onSuccess, navigate]);

    // ==================== RENDER ====================

    if (!item) return null;

    const renderStep = () => {
        if (step === 'result') {
            return (
                <ResultStep
                    paymentResult={paymentResult}
                    error={error}
                    countdown={countdown}
                    onBackToCart={handleBackToCart}
                    onRetry={handleRetry}
                    onGoToReservations={handleGoToReservations}
                />
            );
        }

        if (step === 'processing') return <ProcessingStep />;

        if (step === 'confirm') {
            return (
                <ConfirmStep
                    item={item}
                    onBack={() => {
                        setStep('payment');
                        setPaymentResult(null);
                        setError(null);
                    }}
                    onConfirm={handleManualConfirmPayment}
                    loading={loading}
                />
            );
        }

        return (
            <PaymentStep
                item={item}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cardData={cardData}
                handleCardChange={handleCardChange}
                billingInfo={billingInfo}
                handleBillingChange={handleBillingChange}
                onProcessPayment={handleProcessPayment}
                onCancel={handleBackToCart}
                loading={loading}
                error={error}
                formatDate={formatDate}
            />
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleBackToCart}>
            <div
                className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-surface-container-lowest z-10 border-b border-outline-variant p-6 flex justify-between items-start">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">payment</span>
                            Checkout
                        </h2>
                        <p className="text-body-sm text-on-surface-variant">
                            {step === 'payment' && 'Selecciona un método de pago'}
                            {step === 'processing' && 'Procesando tu pago...'}
                            {step === 'confirm' && 'Confirma tu pago'}
                            {step === 'result' && (paymentResult === 'success' ? 'Pago Exitoso' : 'Pago Fallido')}
                        </p>
                    </div>
                    <button
                        onClick={handleBackToCart}
                        className="p-2 hover:bg-surface-container-low rounded-lg transition-colors"
                        disabled={step === 'processing' || (step === 'result' && paymentResult === 'success')}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {renderStep()}
                </div>
            </div>

            {/* Estilos de animación */}
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce {
                    animation: bounce 1s infinite;
                }
            `}</style>
        </div>
    );
};

export default PaymentModal;
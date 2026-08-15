// frontend/src/components/cart/PaymentModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentModal = ({ item, onClose, onSuccess }) => {
    const { processPayment, confirmPayment, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState('payment'); // 'payment', 'processing', 'confirm', 'result'
    const [paymentMethod, setPaymentMethod] = useState('CreditCard');
    const [loading, setLoading] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    const [preReservationId, setPreReservationId] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'failed' | null
    const [countdown, setCountdown] = useState(5);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const redirectTimerRef = useRef(null);

    // Datos de facturación
    const [billingInfo, setBillingInfo] = useState({
        billingAddress: '',
        billingCity: '',
        billingPostalCode: '',
        billingCountry: 'Sweden',
        billingVatNumber: ''
    });

    // Datos de tarjeta (simulación)
    const [cardData, setCardData] = useState({
        cardNumber: '4242 4242 4242 4242',
        cardExpiry: '12/26',
        cardCvv: '123'
    });

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

    const handleBillingChange = (e) => {
        setBillingInfo({
            ...billingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleCardChange = (e) => {
        setCardData({
            ...cardData,
            [e.target.name]: e.target.value
        });
    };

    // ✅ Limpiar timer al desmontar
    useEffect(() => {
        return () => {
            if (redirectTimerRef.current) {
                clearInterval(redirectTimerRef.current);
            }
        };
    }, []);

    // ✅ Efecto para el contador de redirección
    useEffect(() => {
        if (step === 'result' && paymentResult === 'success' && !isRedirecting) {
            setIsRedirecting(true);

            // Limpiar timer anterior si existe
            if (redirectTimerRef.current) {
                clearInterval(redirectTimerRef.current);
            }

            let counter = 5;
            setCountdown(counter);

            redirectTimerRef.current = setInterval(() => {
                counter -= 1;
                setCountdown(counter);

                if (counter <= 0) {
                    clearInterval(redirectTimerRef.current);
                    redirectTimerRef.current = null;

                    // ✅ Cerrar modal
                    onClose();

                    // ✅ Limpiar carrito
                    clearCart();

                    // ✅ Notificar éxito
                    onSuccess();

                    // ✅ Redirigir a reservas
                    navigate('/reservations');

                    // ✅ Mostrar toast final
                    toast.success('¡Reserva creada exitosamente!');
                }
            }, 1000);
        }
    }, [step, paymentResult, isRedirecting, onClose, clearCart, onSuccess, navigate]);

    const handleProcessPayment = async () => {
        setLoading(true);
        setStep('processing');
        try {
            const result = await processPayment(
                item.id,
                paymentMethod,
                billingInfo
            );

            if (result.success) {
                setPaymentIntentId(result.data.paymentIntentId);
                setPreReservationId(result.data.preReservationId);
                setStep('confirm');
                toast.success('Pago procesado. Confirma para completar la reserva.');
            } else {
                setStep('payment');
                toast.error(result.error || 'Error al procesar el pago');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setStep('payment');
            toast.error('Error al procesar el pago. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        setLoading(true);
        setStep('processing');
        try {
            const result = await confirmPayment(preReservationId, paymentIntentId);

            if (result.success) {
                setPaymentResult('success');
                setStep('result');
                toast.success('¡Pago confirmado! Redirigiendo a tus reservas...');
            } else {
                setPaymentResult('failed');
                setStep('result');
                toast.error(result.error || 'Error al confirmar el pago');
            }
        } catch (error) {
            console.error('Confirm payment error:', error);
            setPaymentResult('failed');
            setStep('result');
            toast.error('Error al confirmar el pago. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToCart = () => {
        // Limpiar timer si existe
        if (redirectTimerRef.current) {
            clearInterval(redirectTimerRef.current);
            redirectTimerRef.current = null;
        }
        setStep('payment');
        setPaymentResult(null);
        setCountdown(5);
        setIsRedirecting(false);
        onClose();
    };

    const handleRetry = () => {
        // Limpiar timer si existe
        if (redirectTimerRef.current) {
            clearInterval(redirectTimerRef.current);
            redirectTimerRef.current = null;
        }
        setStep('payment');
        setPaymentResult(null);
        setCountdown(5);
        setIsRedirecting(false);
    };

    const paymentMethods = [
        { value: 'CreditCard', label: '💳 Credit Card', icon: 'credit_card' },
        { value: 'PayPal', label: '🅿️ PayPal', icon: 'paypal' },
        { value: 'BankTransfer', label: '🏦 Bank Transfer', icon: 'account_balance' },
    ];

    const renderResult = () => {
        const isSuccess = paymentResult === 'success';
        const icon = isSuccess ? 'check_circle' : 'cancel';
        const iconColor = isSuccess ? 'text-emerald-600' : 'text-red-600';
        const bgColor = isSuccess ? 'bg-emerald-100' : 'bg-red-100';
        const title = isSuccess ? '¡Pago Confirmado!' : 'Error en el Pago';
        const message = isSuccess
            ? 'Tu reserva ha sido confirmada exitosamente. Serás redirigido a tus reservas en unos segundos.'
            : 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o contacta a soporte.';

        return (
            <div className="text-center py-8">
                <div className={`w-24 h-24 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <span className={`material-symbols-outlined text-5xl ${iconColor}`}>{icon}</span>
                </div>
                <h3 className={`font-headline-lg text-headline-lg mb-3 ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
                    {title}
                </h3>
                <p className="text-body-md text-on-surface-variant mb-4 max-w-md mx-auto">
                    {message}
                </p>

                {isSuccess ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">timer</span>
                            <span>Redirigiendo en <strong className="text-primary text-lg">{countdown}</strong> segundos...</span>
                        </div>
                        <div className="w-32 h-1 bg-surface-container-low rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000 ease-linear"
                                style={{ width: `${(countdown / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                        <button
                            onClick={handleBackToCart}
                            className="px-6 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Volver al Carrito
                        </button>
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            Reintentar
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleBackToCart}>
            <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-surface-container-lowest z-10 border-b border-outline-variant p-6 flex justify-between items-start">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">payment</span>
                            Checkout
                        </h2>
                        <p className="text-body-sm text-on-surface-variant">
                            {step === 'payment' && 'Select payment method'}
                            {step === 'processing' && 'Processing your payment...'}
                            {step === 'confirm' && 'Confirm your payment'}
                            {step === 'result' && (paymentResult === 'success' ? 'Payment Successful' : 'Payment Failed')}
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
                    {/* Resumen del item */}
                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-body-md font-semibold text-on-surface">{item.spaceName}</h4>
                                <p className="text-body-sm text-on-surface-variant">
                                    {formatDate(item.startTime)} → {formatDate(item.endTime)}
                                </p>
                                {item.numberOfGuests && (
                                    <p className="text-body-sm text-on-surface-variant">
                                        👥 {item.numberOfGuests} guests
                                    </p>
                                )}
                            </div>
                            <span className="font-headline-md text-primary">
                                ${item.totalPrice?.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Estado de Resultado */}
                    {step === 'result' ? (
                        renderResult()
                    ) : step === 'processing' ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                                Procesando tu pago...
                            </h3>
                            <p className="text-body-md text-on-surface-variant">
                                Por favor espera mientras confirmamos tu transacción.
                            </p>
                            <div className="mt-4 flex justify-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    ) : step === 'confirm' ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-amber-600 text-4xl">warning</span>
                            </div>
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                                Confirmar Pago
                            </h3>
                            <p className="text-body-md text-on-surface-variant mb-6">
                                Estás a punto de confirmar el pago de <strong className="text-primary">${item.totalPrice?.toFixed(2)}</strong>.
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => {
                                        setStep('payment');
                                        setPaymentResult(null);
                                    }}
                                    className="px-6 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    Volver
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={loading}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            Confirmando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">check</span>
                                            Confirmar Pago
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // ✅ Estado de pago (selección de método)
                        <>
                            {/* Método de pago */}
                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-3">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.value}
                                            onClick={() => setPaymentMethod(method.value)}
                                            className={`p-4 rounded-xl border-2 transition-all text-center ${paymentMethod === method.value
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-outline-variant hover:border-primary/50'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-2xl block mb-1">
                                                {method.icon}
                                            </span>
                                            <span className="text-body-sm font-medium">{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Datos de tarjeta */}
                            {paymentMethod === 'CreditCard' && (
                                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                    <h4 className="font-body-sm font-semibold text-on-surface mb-3">Card Details</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-body-xs text-on-surface-variant block mb-1">Card Number</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={cardData.cardNumber}
                                                onChange={handleCardChange}
                                                className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                                placeholder="4242 4242 4242 4242"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-body-xs text-on-surface-variant block mb-1">Expiry Date</label>
                                                <input
                                                    type="text"
                                                    name="cardExpiry"
                                                    value={cardData.cardExpiry}
                                                    onChange={handleCardChange}
                                                    className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                                    placeholder="MM/YY"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-body-xs text-on-surface-variant block mb-1">CVV</label>
                                                <input
                                                    type="text"
                                                    name="cardCvv"
                                                    value={cardData.cardCvv}
                                                    onChange={handleCardChange}
                                                    className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                                    placeholder="123"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PayPal */}
                            {paymentMethod === 'PayPal' && (
                                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                    <h4 className="font-body-sm font-semibold text-on-surface mb-3">PayPal Details</h4>
                                    <div>
                                        <label className="text-body-xs text-on-surface-variant block mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : ''}
                                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                            placeholder="your@email.com"
                                            disabled
                                        />
                                    </div>
                                    <p className="text-body-xs text-on-surface-variant mt-2">
                                        You will be redirected to PayPal to complete the payment.
                                    </p>
                                </div>
                            )}

                            {/* Bank Transfer */}
                            {paymentMethod === 'BankTransfer' && (
                                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                    <h4 className="font-body-sm font-semibold text-on-surface mb-3">Bank Transfer Details</h4>
                                    <div className="space-y-2 text-body-sm text-on-surface-variant">
                                        <p><strong>Bank:</strong> SEB</p>
                                        <p><strong>Account Name:</strong> Kinetic Workspace AB</p>
                                        <p><strong>Account Number:</strong> 1234 5678 9012</p>
                                        <p><strong>SWIFT:</strong> SEBSSEBB</p>
                                        <p><strong>Reference:</strong> INV-{Date.now()}</p>
                                    </div>
                                </div>
                            )}

                            {/* Billing Information */}
                            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                                <h4 className="font-body-sm font-semibold text-on-surface mb-3">Billing Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-body-xs text-on-surface-variant block mb-1">Address</label>
                                        <input
                                            type="text"
                                            name="billingAddress"
                                            value={billingInfo.billingAddress}
                                            onChange={handleBillingChange}
                                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-body-xs text-on-surface-variant block mb-1">City</label>
                                        <input
                                            type="text"
                                            name="billingCity"
                                            value={billingInfo.billingCity}
                                            onChange={handleBillingChange}
                                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                            placeholder="Stockholm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-body-xs text-on-surface-variant block mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            name="billingPostalCode"
                                            value={billingInfo.billingPostalCode}
                                            onChange={handleBillingChange}
                                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                            placeholder="114 36"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-body-xs text-on-surface-variant block mb-1">Country</label>
                                        <select
                                            name="billingCountry"
                                            value={billingInfo.billingCountry}
                                            onChange={handleBillingChange}
                                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                        >
                                            <option value="Sweden">Sweden</option>
                                            <option value="Norway">Norway</option>
                                            <option value="Denmark">Denmark</option>
                                            <option value="Finland">Finland</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-body-xs text-on-surface-variant block mb-1">VAT Number (Optional)</label>
                                        <input
                                            type="text"
                                            name="billingVatNumber"
                                            value={billingInfo.billingVatNumber}
                                            onChange={handleBillingChange}
                                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                                            placeholder="SE1234567890"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-outline-variant">
                                <button
                                    onClick={handleBackToCart}
                                    className="flex-1 px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProcessPayment}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">payment</span>
                                            Pay ${item.totalPrice?.toFixed(2)}
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
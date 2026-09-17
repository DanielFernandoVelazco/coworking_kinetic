// frontend/src/components/cart/payment/ResultStep.jsx
import React from 'react';

const ResultStep = ({
    paymentResult,
    error,
    countdown,
    onBackToCart,
    onRetry,
    onGoToReservations,
}) => {
    const isSuccess = paymentResult === 'success';
    const icon = isSuccess ? 'check_circle' : 'cancel';
    const iconColor = isSuccess ? 'text-emerald-600' : 'text-red-600';
    const bgColor = isSuccess ? 'bg-emerald-100' : 'bg-red-100';
    const title = isSuccess ? '🎉 ¡Pago Confirmado!' : '❌ Error en el Pago';

    const message = isSuccess
        ? 'Tu reserva ha sido confirmada exitosamente. Serás redirigido a tus reservas en unos segundos.'
        : error || 'Hubo un problema al procesar tu pago. Por favor, intenta nuevamente o contacta a soporte.';

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
                    <button
                        onClick={onGoToReservations}
                        className="mt-2 px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        Ir a mis reservas ahora
                    </button>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                    <button
                        onClick={onBackToCart}
                        className="px-6 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Carrito
                    </button>
                    <button
                        onClick={onRetry}
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

export default ResultStep;
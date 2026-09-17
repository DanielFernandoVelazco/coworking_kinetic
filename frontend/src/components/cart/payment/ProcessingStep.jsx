// frontend/src/components/cart/payment/ProcessingStep.jsx
import React from 'react';

const ProcessingStep = () => {
    return (
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
    );
};

export default ProcessingStep;
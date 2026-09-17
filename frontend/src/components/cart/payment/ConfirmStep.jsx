// frontend/src/components/cart/payment/ConfirmStep.jsx
import React from 'react';

const ConfirmStep = ({ item, onBack, onConfirm, loading }) => {
    return (
        <div className="text-center py-8">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-amber-600 text-4xl">warning</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                Confirmar Pago
            </h3>
            <p className="text-body-md text-on-surface-variant mb-6">
                Estás a punto de confirmar el pago de <strong className="text-primary">${item.totalPrice?.toFixed(2)}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={onBack}
                    className="px-6 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Volver
                </button>
                <button
                    onClick={onConfirm}
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
    );
};

export default ConfirmStep;
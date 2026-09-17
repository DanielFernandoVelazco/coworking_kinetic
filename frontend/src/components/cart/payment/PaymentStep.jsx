// frontend/src/components/cart/payment/PaymentStep.jsx
import React from 'react';

const PAYMENT_METHODS = [
    { value: 'CreditCard', label: '💳 Credit Card', icon: 'credit_card' },
    { value: 'PayPal', label: '🅿️ PayPal', icon: 'paypal' },
    { value: 'BankTransfer', label: '🏦 Bank Transfer', icon: 'account_balance' },
];

const PaymentStep = ({
    item,
    paymentMethod,
    setPaymentMethod,
    cardData,
    handleCardChange,
    billingInfo,
    handleBillingChange,
    onProcessPayment,
    onCancel,
    loading,
    error,
    formatDate,
}) => {
    return (
        <>
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

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                    {error}
                </div>
            )}

            {/* Método de pago */}
            <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-3">
                    Método de Pago
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((method) => (
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
                    <h4 className="font-body-sm font-semibold text-on-surface mb-3">Datos de la Tarjeta</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="text-body-xs text-on-surface-variant block mb-1">Número de Tarjeta</label>
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
                                <label className="text-body-xs text-on-surface-variant block mb-1">Fecha Expiración</label>
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
                    <h4 className="font-body-sm font-semibold text-on-surface mb-3">Datos de PayPal</h4>
                    <div>
                        <label className="text-body-xs text-on-surface-variant block mb-1">Email</label>
                        <input
                            type="email"
                            value={localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : ''}
                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                            placeholder="tu@email.com"
                            disabled
                        />
                    </div>
                    <p className="text-body-xs text-on-surface-variant mt-2">
                        Serás redirigido a PayPal para completar el pago.
                    </p>
                </div>
            )}

            {/* Bank Transfer */}
            {paymentMethod === 'BankTransfer' && (
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                    <h4 className="font-body-sm font-semibold text-on-surface mb-3">Datos de Transferencia</h4>
                    <div className="space-y-2 text-body-sm text-on-surface-variant">
                        <p><strong>Banco:</strong> SEB</p>
                        <p><strong>Nombre:</strong> Kinetic Workspace AB</p>
                        <p><strong>Número de Cuenta:</strong> 1234 5678 9012</p>
                        <p><strong>SWIFT:</strong> SEBSSEBB</p>
                        <p><strong>Referencia:</strong> INV-{Date.now()}</p>
                    </div>
                </div>
            )}

            {/* Billing Information */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                <h4 className="font-body-sm font-semibold text-on-surface mb-3">Información de Facturación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-body-xs text-on-surface-variant block mb-1">Dirección</label>
                        <input
                            type="text"
                            name="billingAddress"
                            value={billingInfo.billingAddress}
                            onChange={handleBillingChange}
                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                            placeholder="Dirección"
                        />
                    </div>
                    <div>
                        <label className="text-body-xs text-on-surface-variant block mb-1">Ciudad</label>
                        <input
                            type="text"
                            name="billingCity"
                            value={billingInfo.billingCity}
                            onChange={handleBillingChange}
                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                            placeholder="Estocolmo"
                        />
                    </div>
                    <div>
                        <label className="text-body-xs text-on-surface-variant block mb-1">Código Postal</label>
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
                        <label className="text-body-xs text-on-surface-variant block mb-1">País</label>
                        <select
                            name="billingCountry"
                            value={billingInfo.billingCountry}
                            onChange={handleBillingChange}
                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface focus:border-primary focus:outline-none transition-all"
                        >
                            <option value="Sweden">Suecia</option>
                            <option value="Norway">Noruega</option>
                            <option value="Denmark">Dinamarca</option>
                            <option value="Finland">Finlandia</option>
                            <option value="Other">Otro</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-body-xs text-on-surface-variant block mb-1">VAT Number (Opcional)</label>
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
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={onProcessPayment}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            Procesando...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">payment</span>
                            Pagar ${item.totalPrice?.toFixed(2)}
                        </>
                    )}
                </button>
            </div>
        </>
    );
};

export default PaymentStep;

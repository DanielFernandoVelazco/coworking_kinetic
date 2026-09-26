// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../api/auth.service';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSent(true);
            toast.success('Si el email existe, recibirás instrucciones');
        } catch (error) {
            // El backend SIEMPRE devuelve 200 por seguridad (no filtra emails)
            // Solo errores de red o 500 llegarán aquí
            console.error('Error en forgot password:', error);
            toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface-dark-container-lowest border border-outline-variant dark:border-outline-dark-variant p-8 md:p-10 rounded shadow-sm transition-colors duration-300">
                {!sent ? (
                    <>
                        {/* Header */}
                        <div className="mb-8">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors mb-4"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to login
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-bold text-on-surface dark:text-on-dark-surface font-manrope mb-2">
                                Forgot password?
                            </h1>
                            <p className="text-base text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                                Enter your email and we'll send you instructions to reset your password.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    EMAIL ADDRESS
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    disabled={loading}
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base disabled:opacity-50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-primary dark:bg-primary-dark text-white py-4 text-xl font-semibold font-manrope border-none rounded transition-colors hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        Send Reset Link
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                            Remember your password?{' '}
                            <Link to="/login" className="text-primary dark:text-primary-dark font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </>
                ) : (
                    /* Estado de éxito */
                    <div className="text-center">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-4xl">
                                mark_email_read
                            </span>
                        </div>
                        <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Check your email
                        </h2>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-6">
                            If an account exists for <strong className="text-on-surface dark:text-on-dark-surface">{email}</strong>,
                            you'll receive password reset instructions shortly.
                        </p>
                        <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg border border-outline-variant dark:border-outline-dark-variant text-body-sm text-on-surface-variant dark:text-on-surface-variant mb-6 text-left">
                            <div className="flex gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark text-sm">
                                    info
                                </span>
                                <div>
                                    <p className="font-medium text-on-surface dark:text-on-dark-surface mb-1">
                                        Didn't receive it?
                                    </p>
                                    <ul className="space-y-0.5 list-disc list-inside">
                                        <li>Check your spam folder</li>
                                        <li>Make sure the email is correct</li>
                                        <li>Wait a few minutes before trying again</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Link
                            to="/login"
                            className="block w-full bg-primary dark:bg-primary-dark text-white py-3 rounded font-semibold hover:bg-primary-dark dark:hover:bg-primary transition-colors text-center"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
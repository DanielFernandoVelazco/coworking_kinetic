// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../api/auth.service';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Si no hay token, mostramos error
    useEffect(() => {
        if (!token) {
            setError('Token de recuperación no encontrado en la URL');
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (!token) {
            setError('Token inválido o ausente');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, formData.newPassword);
            setSuccess(true);
            toast.success('Contraseña actualizada exitosamente');

            // Redirigir a login tras 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Error en reset password:', err);
            const message = err.response?.data?.message || 'Token inválido o expirado';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // ==================== RENDER ====================

    // Sin token: mostrar error antes de renderizar el form
    if (!token && !success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4 transition-colors duration-300">
                <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface-dark-container-lowest border border-outline-variant dark:border-outline-dark-variant p-8 md:p-10 rounded shadow-sm text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-4xl">
                            error
                        </span>
                    </div>
                    <h1 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                        Invalid Reset Link
                    </h1>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-6">
                        {error || 'The password reset link is missing or invalid.'}
                    </p>
                    <Link
                        to="/forgot-password"
                        className="block w-full bg-primary dark:bg-primary-dark text-white py-3 rounded font-semibold hover:bg-primary-dark dark:hover:bg-primary transition-colors text-center"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    // Éxito
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4 transition-colors duration-300">
                <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface-dark-container-lowest border border-outline-variant dark:border-outline-dark-variant p-8 md:p-10 rounded shadow-sm text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-4xl">
                            check_circle
                        </span>
                    </div>
                    <h1 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                        Password Updated!
                    </h1>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-6">
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                    <Link
                        to="/login"
                        className="block w-full bg-primary dark:bg-primary-dark text-white py-3 rounded font-semibold hover:bg-primary-dark dark:hover:bg-primary transition-colors text-center"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Form
    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface-dark-container-lowest border border-outline-variant dark:border-outline-dark-variant p-8 md:p-10 rounded shadow-sm transition-colors duration-300">
                <div className="mb-8">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors mb-4"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to login
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-on-surface dark:text-on-dark-surface font-manrope mb-2">
                        Reset password
                    </h1>
                    <p className="text-base text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                        Enter your new password below.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4 text-sm font-work-sans">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            NEW PASSWORD
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            disabled={loading}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base disabled:opacity-50"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            CONFIRM NEW PASSWORD
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            disabled={loading}
                            className={`w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:outline-none font-work-sans text-base disabled:opacity-50 ${formData.confirmPassword &&
                                    formData.newPassword !== formData.confirmPassword
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-outline-variant dark:border-outline-dark-variant focus:border-primary dark:focus:border-primary-dark'
                                }`}
                        />
                        {formData.confirmPassword &&
                            formData.newPassword !== formData.confirmPassword && (
                                <p className="text-body-xs text-red-600 mt-1">
                                    Passwords do not match
                                </p>
                            )}
                        {formData.confirmPassword &&
                            formData.newPassword === formData.confirmPassword &&
                            formData.newPassword.length >= 6 && (
                                <p className="text-body-xs text-emerald-600 mt-1">
                                    ✓ Passwords match
                                </p>
                            )}
                    </div>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !formData.newPassword ||
                            !formData.confirmPassword ||
                            formData.newPassword !== formData.confirmPassword
                        }
                        className="w-full bg-primary dark:bg-primary-dark text-white py-4 text-xl font-semibold font-manrope border-none rounded transition-colors hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Updating...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">lock_reset</span>
                                Reset Password
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
            </div>
        </div>
    );
};

export default ResetPassword;
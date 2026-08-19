// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// ✅ IMPORTAR CORRECTAMENTE
import { useTheme } from '../context/ThemeContext';

const Register = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme(); // ✅ Ahora funciona
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        company: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...userData } = formData;
            const response = await axios.post('/api/auth/register', userData);

            if (response.data) {
                navigate('/login', { state: { message: 'Registro exitoso. Ahora puedes iniciar sesión.' } });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al registrar usuario';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4 py-5 transition-colors duration-300">
            <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface-dark-container-lowest border border-outline-variant dark:border-outline-dark-variant p-8 md:p-10 rounded shadow-sm max-h-[90vh] overflow-y-auto transition-colors duration-300">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-on-surface dark:text-on-dark-surface font-manrope mb-2">
                        Create Account
                    </h1>
                    <p className="text-base text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                        Join the Kinetic Workspace community
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4 text-sm font-work-sans">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                FIRST NAME
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                required
                                className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                LAST NAME
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                required
                                className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            EMAIL ADDRESS
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@kinetic.com"
                            required
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            PASSWORD
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            CONFIRM PASSWORD
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            COMPANY (Optional)
                        </label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your Company"
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary dark:bg-primary-dark text-white py-4 text-2xl font-semibold font-manrope border-none rounded transition-colors hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-70"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary dark:text-primary-dark font-bold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
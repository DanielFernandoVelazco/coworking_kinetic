// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        company: '',
        phoneNumber: '',
        jobTitle: ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the form errors');
            return;
        }

        setLoading(true);

        try {
            // Preparar datos para la API
            const registerData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                company: formData.company.trim() || undefined,
                phoneNumber: formData.phoneNumber.trim() || undefined,
                jobTitle: formData.jobTitle.trim() || undefined
            };

            console.log('📝 Registrando usuario:', { email: registerData.email });

            const result = await registerUser(registerData);

            if (result.success) {
                toast.success('¡Registro exitoso! Bienvenido a Kinetic Workspace');
                navigate('/');
            } else {
                console.error('❌ Error en registro:', result.error);
            }
        } catch (error) {
            console.error('❌ Error inesperado:', error);
            toast.error('Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant p-10 card-shadow">
                <div className="mb-8">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create Account</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        Join the Kinetic Workspace community
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="firstName">
                                FIRST NAME *
                            </label>
                            <input
                                className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.firstName ? 'border-error' : ''}`}
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            {errors.firstName && (
                                <p className="text-error text-sm mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="lastName">
                                LAST NAME *
                            </label>
                            <input
                                className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.lastName ? 'border-error' : ''}`}
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                            {errors.lastName && (
                                <p className="text-error text-sm mt-1">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="email">
                            EMAIL ADDRESS *
                        </label>
                        <input
                            className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.email ? 'border-error' : ''}`}
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@kinetic.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <p className="text-error text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="password">
                            PASSWORD *
                        </label>
                        <input
                            className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.password ? 'border-error' : ''}`}
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <p className="text-error text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="confirmPassword">
                            CONFIRM PASSWORD *
                        </label>
                        <input
                            className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.confirmPassword ? 'border-error' : ''}`}
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                            <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="company">
                            COMPANY (Optional)
                        </label>
                        <input
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none"
                            id="company"
                            name="company"
                            type="text"
                            placeholder="Your Company"
                            value={formData.company}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="phoneNumber">
                            PHONE NUMBER (Optional)
                        </label>
                        <input
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none"
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            placeholder="+1234567890"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="jobTitle">
                            JOB TITLE (Optional)
                        </label>
                        <input
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none"
                            id="jobTitle"
                            name="jobTitle"
                            type="text"
                            placeholder="Software Engineer"
                            value={formData.jobTitle}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-on-primary py-4 font-headline-md text-headline-md rounded-sm hover:bg-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center font-body-sm text-body-sm text-on-surface-variant">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
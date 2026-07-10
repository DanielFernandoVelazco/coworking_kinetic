import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        const result = await registerUser(data);
        setLoading(false);

        if (result.success) {
            navigate('/');
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="firstName">
                                FIRST NAME
                            </label>
                            <input
                                className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.firstName ? 'border-error' : ''}`}
                                id="firstName"
                                type="text"
                                placeholder="John"
                                {...register('firstName', { required: 'First name is required' })}
                            />
                            {errors.firstName && (
                                <p className="text-error text-sm mt-1">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="lastName">
                                LAST NAME
                            </label>
                            <input
                                className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.lastName ? 'border-error' : ''}`}
                                id="lastName"
                                type="text"
                                placeholder="Doe"
                                {...register('lastName', { required: 'Last name is required' })}
                            />
                            {errors.lastName && (
                                <p className="text-error text-sm mt-1">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="email">
                            EMAIL ADDRESS
                        </label>
                        <input
                            className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.email ? 'border-error' : ''}`}
                            id="email"
                            type="email"
                            placeholder="john@kinetic.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="text-error text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="password">
                            PASSWORD
                        </label>
                        <input
                            className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.password ? 'border-error' : ''}`}
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                        />
                        {errors.password && (
                            <p className="text-error text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="confirmPassword">
                            CONFIRM PASSWORD
                        </label>
                        <input
                            className={`w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none ${errors.confirmPassword ? 'border-error' : ''}`}
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value => value === password || 'Passwords do not match'
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="company">
                            COMPANY (Optional)
                        </label>
                        <input
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-3 text-on-surface transition-all focus:border-primary focus:outline-none"
                            id="company"
                            type="text"
                            placeholder="Your Company"
                            {...register('company')}
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
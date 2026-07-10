import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        const result = await login(data);
        setLoading(false);

        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant p-10 card-shadow relative z-10">
                <div className="mb-10">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome back</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        Access your high-performance workspace.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-1">
                        <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="email">
                            EMAIL ADDRESS
                        </label>
                        <input
                            className={`input-primary ${errors.email ? 'border-error' : ''}`}
                            id="email"
                            type="email"
                            placeholder="executive@kinetic.com"
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
                        <div className="flex justify-between items-center">
                            <label className="font-label-caps text-label-caps text-on-surface-variant block" htmlFor="password">
                                PASSWORD
                            </label>
                            <Link to="/forgot-password" className="font-body-sm text-body-sm text-primary hover:text-tertiary transition-colors">
                                Forgot?
                            </Link>
                        </div>
                        <input
                            className={`input-primary ${errors.password ? 'border-error' : ''}`}
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-on-primary py-4 font-headline-md text-headline-md rounded-sm hover:bg-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-outline-variant"></div>
                    </div>
                    <div className="relative flex justify-center text-label-caps font-label-caps">
                        <span className="bg-surface-container-lowest px-4 text-on-surface-variant">OR CONTINUE WITH</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center space-x-2 border border-outline-variant py-3 px-4 hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-primary">google</span>
                        <span className="font-body-sm text-body-sm font-medium">Google</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 border border-outline-variant py-3 px-4 hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-primary">work</span>
                        <span className="font-body-sm text-body-sm font-medium">SSO</span>
                    </button>
                </div>

                <p className="mt-10 text-center font-body-sm text-body-sm text-on-surface-variant">
                    New to Kinetic?{' '}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
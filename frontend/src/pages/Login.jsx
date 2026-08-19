// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useTheme from '../context/ThemeContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login({ email, password });
        setLoading(false);

        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-surface-container-lowest dark:bg-surface-dark-container-lowest border border-outline-variant dark:border-outline-dark-variant p-8 md:p-10 rounded shadow-sm transition-colors duration-300">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-on-surface dark:text-on-dark-surface font-manrope mb-2">
                        Welcome back
                    </h1>
                    <p className="text-base text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                        Access your high-performance workspace.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            EMAIL ADDRESS
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="executive@kinetic.com"
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base"
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant block">
                                PASSWORD
                            </label>
                            <Link to="/forgot-password" className="text-sm text-primary dark:text-primary-dark hover:underline font-work-sans">
                                Forgot?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-3 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none font-work-sans text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary dark:bg-primary-dark text-white py-4 text-2xl font-semibold font-manrope border-none rounded transition-colors hover:bg-primary-dark dark:hover:bg-primary disabled:opacity-70"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-outline-variant dark:border-outline-dark-variant"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest px-4 text-xs font-mono tracking-wider text-on-surface-variant dark:text-on-dark-surface-variant">
                            OR CONTINUE WITH
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 border border-outline-variant dark:border-outline-dark-variant py-3 px-4 bg-transparent rounded hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors font-work-sans text-sm">
                        <span className="text-primary dark:text-primary-dark font-bold">G</span>
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-2 border border-outline-variant dark:border-outline-dark-variant py-3 px-4 bg-transparent rounded hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors font-work-sans text-sm">
                        <span className="text-primary dark:text-primary-dark font-bold">W</span>
                        SSO
                    </button>
                </div>

                <p className="mt-10 text-center text-sm text-on-surface-variant dark:text-on-dark-surface-variant font-work-sans">
                    New to Kinetic?{' '}
                    <Link to="/register" className="text-primary dark:text-primary-dark font-bold hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
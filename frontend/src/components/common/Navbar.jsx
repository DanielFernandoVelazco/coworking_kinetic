// frontend/src/components/common/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import useTheme from '../../hooks/useTheme'; // ✅ NUEVO

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { getItemCount, cartItems } = useCart();
    const { theme, toggleTheme, isDark } = useTheme(); // ✅ NUEVO
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const cartCount = getItemCount();

    return (
        <nav className="bg-surface dark:bg-surface-dark w-full top-0 border-b border-outline-variant dark:border-outline-dark-variant z-50 sticky">
            <div className="flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto">
                {/* Brand */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-dark">
                        Kinetic Workspace
                    </Link>
                    {isAuthenticated && (
                        <div className="hidden md:flex gap-6 items-center">
                            <Link to="/" className="font-body-md text-body-md text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                Home
                            </Link>
                            <Link to="/catalog" className="font-body-md text-body-md text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                Workspaces
                            </Link>
                            <Link to="/reservations" className="font-body-md text-body-md text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                My Reservations
                            </Link>
                            {user?.isAdmin && (
                                <Link to="/admin" className="font-body-md text-body-md text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                    Admin
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* ✅ Toggle tema en el navbar (para móviles) */}
                    <button
                        onClick={toggleTheme}
                        className="md:hidden p-2 text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low"
                        aria-label="Toggle theme"
                    >
                        <span className="material-symbols-outlined">
                            {isDark ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* Carrito */}
                    {isAuthenticated && (
                        <Link to="/cart" className="relative p-2 text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-dark-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <>
                            <button className="p-2 text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <Link to="/profile" className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant dark:border-outline-dark-variant">
                                    {user?.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary-container dark:bg-primary-dark-container flex items-center justify-center text-on-primary dark:text-on-dark-primary text-lg font-bold">
                                            {user?.firstName?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors"
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="btn-secondary dark:btn-secondary-dark">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary dark:btn-primary-dark">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
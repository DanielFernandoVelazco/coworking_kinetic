// frontend/src/components/common/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { getItemCount } = useCart();
    const { theme, toggleTheme, isDark } = useTheme(); // ✅ Ahora funciona
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const cartCount = getItemCount();

    return (
        <nav className="bg-surface dark:bg-surface-dark w-full top-0 border-b border-outline-variant dark:border-outline-dark-variant z-50 sticky">
            <div className="flex justify-between items-center h-20 px-4 md:px-10 max-w-[1200px] mx-auto">
                <div className="flex items-center gap-8">
                    <Link to="/" className="font-bold text-xl md:text-2xl text-primary dark:text-primary-dark font-manrope">
                        Kinetic Workspace
                    </Link>
                    {isAuthenticated && (
                        <div className="hidden md:flex gap-6 items-center">
                            <Link to="/" className="text-sm md:text-base text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                Home
                            </Link>
                            <Link to="/catalog" className="text-sm md:text-base text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                Workspaces
                            </Link>
                            <Link to="/reservations" className="text-sm md:text-base text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                My Reservations
                            </Link>
                            {user?.isAdmin && (
                                <Link to="/admin" className="text-sm md:text-base text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                                    Admin
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Botón de tema en móvil */}
                    <button
                        onClick={toggleTheme}
                        className="md:hidden p-2 text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low"
                        aria-label="Toggle theme"
                    >
                        <span className="material-symbols-outlined">
                            {isDark ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {isAuthenticated && (
                        <Link to="/cart" className="relative p-2 text-on-surface-variant dark:text-on-dark-surface-variant hover:text-primary dark:hover:text-primary-dark transition-colors">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary dark:bg-primary-dark text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
                                        <div className="w-full h-full bg-primary dark:bg-primary-dark flex items-center justify-center text-white text-lg font-bold">
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
                            <Link to="/login" className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-sm font-medium">
                                Sign In
                            </Link>
                            <Link to="/register" className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors text-sm font-medium">
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
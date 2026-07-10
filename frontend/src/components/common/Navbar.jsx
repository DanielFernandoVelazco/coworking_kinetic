import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-surface w-full top-0 border-b border-outline-variant z-50 sticky">
            <div className="flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto">
                {/* Brand */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="font-headline-md text-headline-md font-bold text-primary">
                        Kinetic Workspace
                    </Link>
                    {isAuthenticated && (
                        <div className="hidden md:flex gap-6 items-center">
                            <Link to="/" className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1 font-semibold">
                                Workspaces
                            </Link>
                            <Link to="/reservations" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                                Reservations
                            </Link>
                            {user?.isAdmin && (
                                <Link to="/admin" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                                    Admin
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <Link to="/profile" className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
                                    {user?.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary-container flex items-center justify-center text-on-primary text-lg font-bold">
                                            {user?.firstName?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-on-surface-variant hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="btn-secondary">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary">
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
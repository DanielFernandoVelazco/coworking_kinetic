import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../components/layout/MainLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Catalog from '../pages/Catalog';
import SpaceDetails from '../pages/SpaceDetails';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main Routes */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="catalog" element={<Catalog />} />
                    <Route path="spaces/:id" element={<SpaceDetails />} />

                    {/* Protected Routes */}
                    <Route path="profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />

                    <Route path="reservations" element={
                        <ProtectedRoute>
                            <div>Reservations Page</div>
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="admin/*" element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
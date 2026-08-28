// frontend/src/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import SpaceDetails from './pages/SpaceDetails';
import Profile from './pages/Profile';
import Reservations from './pages/Reservations';
import CartPage from './pages/CartPage';
import Alerts from './pages/Alerts';
import AdminDashboard from './pages/AdminDashboard';
import AdminReservations from './pages/AdminReservations';
import AdminUsers from './pages/AdminUsers';
import AdminSpaces from './pages/AdminSpaces';
import NotFound from './pages/NotFound';
import AdminAmenities from './pages/AdminAmenities';
import AdminAlerts from './pages/AdminAlerts';

// Loading Component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
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
        return <LoadingSpinner />;
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
        <Routes>
            {/* Auth Routes - Sin layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main Routes - Con layout */}
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
                        <Reservations />
                    </ProtectedRoute>
                } />

                <Route path="cart" element={
                    <ProtectedRoute>
                        <CartPage />
                    </ProtectedRoute>
                } />

                {/* Alerts Route */}
                <Route path="alerts" element={
                    <ProtectedRoute>
                        <Alerts />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="admin" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />

                <Route path="admin/reservations" element={
                    <AdminRoute>
                        <AdminReservations />
                    </AdminRoute>
                } />

                <Route path="admin/users" element={
                    <AdminRoute>
                        <AdminUsers />
                    </AdminRoute>
                } />

                {/* Admin Spaces */}
                <Route path="admin/spaces" element={
                    <AdminRoute>
                        <AdminSpaces />
                    </AdminRoute>
                } />

                {/* ALERTAS */}
                <Route path="admin/alerts" element={
                    <AdminRoute>
                        <AdminAlerts />
                    </AdminRoute>
                } />

                {/* Redirecciones */}
                <Route path="admin/reservas" element={
                    <Navigate to="/admin/reservations" replace />
                } />

                <Route path="admin/amenities" element={
                    <AdminRoute>
                        <AdminAmenities />
                    </AdminRoute>
                } />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
// frontend/src/pages/AdminReservations.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import reservationsService from '../api/reservations.service';
import usersService from '../api/users.service';
import spacesService from '../api/spaces.service';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

// Opciones de ordenamiento
const SORT_OPTIONS = [
    { value: 'date_desc', label: '📅 Date (Newest first)' },
    { value: 'date_asc', label: '📅 Date (Oldest first)' },
    { value: 'price_desc', label: '💰 Price (Highest first)' },
    { value: 'price_asc', label: '💰 Price (Lowest first)' },
    { value: 'guests_desc', label: '👥 Guests (Most first)' },
    { value: 'guests_asc', label: '👥 Guests (Least first)' },
];

const AdminReservations = () => {
    const { user, isAuthenticated } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    // Estados principales
    const [reservations, setReservations] = useState([]);
    const [allReservations, setAllReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedSpaceId, setSelectedSpaceId] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Estados para usuarios y espacios (para selects)
    const [users, setUsers] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingSpaces, setLoadingSpaces] = useState(false);

    // Modal de edición
    const [editingReservation, setEditingReservation] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        userId: '',
        spaceId: '',
        startTime: '',
        endTime: '',
        notes: '',
        numberOfGuests: 1,
        changeNote: ''
    });
    const [editing, setEditing] = useState(false);

    // Modal de cancelación
    const [showCancelModal, setShowCancelModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Modal de detalles
    const [selectedReservation, setSelectedReservation] = useState(null);

    // Verificar autenticación y rol
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!user?.isAdmin) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, user, navigate]);

    // Cargar usuarios y espacios para los selects
    useEffect(() => {
        if (user?.isAdmin) {
            loadUsers();
            loadSpaces();
        }
    }, [user]);

    // ✅ Cargar TODAS las reservas (usando el endpoint de admin)
    const loadAllReservations = useCallback(async () => {
        try {
            const response = await reservationsService.getAllReservations(
                1,
                999,
                'date_desc',
                'all',
                '',
                null,
                null
            );
            if (response && response.items) {
                setAllReservations(response.items);
                return response.items;
            }
            return [];
        } catch (error) {
            console.error('Error loading all reservations:', error);
            return [];
        }
    }, []);

    // ✅ Cargar reservas con filtros (usando el endpoint de admin)
    const loadReservations = useCallback(async (page, sort, status, search, userId, spaceId) => {
        setLoading(true);
        try {
            const response = await reservationsService.getAllReservations(
                page,
                PAGE_SIZE,
                sort,
                status,
                search,
                userId ? parseInt(userId) : null,
                spaceId ? parseInt(spaceId) : null
            );

            if (response) {
                setReservations(response.items || []);
                setTotalPages(response.totalPages || 1);
                setTotalItems(response.totalCount || 0);
            } else {
                setReservations([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (error) {
            console.error('Error loading reservations:', error);
            toast.error('Error al cargar las reservaciones');
            setReservations([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar usuarios
    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const data = await usersService.getAll();
            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    // Cargar espacios
    const loadSpaces = useCallback(async () => {
        setLoadingSpaces(true);
        try {
            const data = await spacesService.getAllUnpaginated();
            setSpaces(data || []);
        } catch (error) {
            console.error('Error loading spaces:', error);
        } finally {
            setLoadingSpaces(false);
        }
    }, []);

    // ✅ Cargar datos iniciales - primero todas las reservas, luego las filtradas
    useEffect(() => {
        const loadData = async () => {
            await loadAllReservations();
            await loadReservations(currentPage, sortBy, filter, searchTerm, selectedUserId, selectedSpaceId);
        };
        loadData();
    }, [currentPage, sortBy, filter, searchTerm, selectedUserId, selectedSpaceId]);

    // Cambiar página
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cambiar ordenamiento
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    // Cambiar filtro de estado
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    // Buscar
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Filtrar por usuario
    const handleUserFilter = (e) => {
        setSelectedUserId(e.target.value);
        setCurrentPage(1);
    };

    // Filtrar por espacio
    const handleSpaceFilter = (e) => {
        setSelectedSpaceId(e.target.value);
        setCurrentPage(1);
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedUserId('');
        setSelectedSpaceId('');
        setFilter('all');
        setSortBy('date_desc');
        setCurrentPage(1);
    };

    // Abrir modal de edición
    const handleEditClick = (reservation) => {
        setEditingReservation(reservation);
        setEditFormData({
            userId: reservation.userId,
            spaceId: reservation.spaceId,
            startTime: reservation.startTime.slice(0, 16),
            endTime: reservation.endTime.slice(0, 16),
            notes: reservation.notes || '',
            numberOfGuests: reservation.numberOfGuests || 1,
            changeNote: ''
        });
        setShowEditModal(true);
    };

    // Guardar cambios de edición
    const handleSaveEdit = async () => {
        if (!editingReservation) return;

        // Validar fechas
        const startTime = new Date(editFormData.startTime);
        const endTime = new Date(editFormData.endTime);
        if (startTime >= endTime) {
            toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
            return;
        }
        if (startTime < new Date() && editingReservation.status !== 'Pending') {
            toast.error('No se puede modificar una reserva en el pasado');
            return;
        }

        // Validar nota de cambio
        if (!editFormData.changeNote.trim()) {
            toast.error('Por favor, ingresa una nota describiendo los cambios');
            return;
        }

        setEditing(true);
        try {
            const updateData = {
                userId: parseInt(editFormData.userId),
                spaceId: parseInt(editFormData.spaceId),
                startTime: editFormData.startTime,
                endTime: editFormData.endTime,
                notes: editFormData.notes
                    ? `${editFormData.notes}\n[Cambio: ${editFormData.changeNote}]`
                    : `[Cambio: ${editFormData.changeNote}]`,
                numberOfGuests: parseInt(editFormData.numberOfGuests) || 1
            };

            await reservationsService.update(editingReservation.id, updateData);

            toast.success(`✅ Reserva actualizada exitosamente`);
            setShowEditModal(false);
            setEditingReservation(null);

            // Recargar datos
            await loadAllReservations();
            await loadReservations(currentPage, sortBy, filter, searchTerm, selectedUserId, selectedSpaceId);
        } catch (error) {
            console.error('Error updating reservation:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar la reserva');
        } finally {
            setEditing(false);
        }
    };

    // Cancelar reserva
    const handleCancelReservation = async () => {
        if (!showCancelModal) return;

        setCancelling(true);
        try {
            await reservationsService.cancel(showCancelModal, cancelReason || 'Cancelado por administrador');
            toast.success('Reservación cancelada exitosamente');
            setShowCancelModal(null);
            setCancelReason('');

            // Recargar datos
            await loadAllReservations();
            await loadReservations(currentPage, sortBy, filter, searchTerm, selectedUserId, selectedSpaceId);
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            toast.error(error.response?.data?.message || 'Error al cancelar la reservación');
        } finally {
            setCancelling(false);
        }
    };

    // Confirmar reserva (Admin)
    const handleConfirmReservation = async (id) => {
        try {
            await reservationsService.confirm(id);
            toast.success('Reserva confirmada exitosamente');
            await loadAllReservations();
            await loadReservations(currentPage, sortBy, filter, searchTerm, selectedUserId, selectedSpaceId);
        } catch (error) {
            console.error('Error confirming reservation:', error);
            toast.error(error.response?.data?.message || 'Error al confirmar la reserva');
        }
    };

    // Obtener estado de la reserva
    const getStatusBadge = (status) => {
        const styles = {
            'Confirmed': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
            'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
            'Completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'Cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        };
        return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Confirmed': 'check_circle',
            'Pending': 'pending',
            'Completed': 'task_alt',
            'Cancelled': 'cancel'
        };
        return icons[status] || 'circle';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // ✅ Calcular estadísticas basadas en allReservations
    const stats = useMemo(() => {
        if (!allReservations || allReservations.length === 0) {
            return {
                total: 0,
                confirmed: 0,
                pending: 0,
                completed: 0,
                cancelled: 0
            };
        }
        return {
            total: allReservations.length,
            confirmed: allReservations.filter(r => r.status === 'Confirmed').length,
            pending: allReservations.filter(r => r.status === 'Pending').length,
            completed: allReservations.filter(r => r.status === 'Completed').length,
            cancelled: allReservations.filter(r => r.status === 'Cancelled').length
        };
    }, [allReservations]);

    // Verificar que el usuario es admin
    if (!user?.isAdmin) {
        return null;
    }

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl">list_alt</span>
                        Todas las Reservas
                    </h1>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        Gestiona todas las reservas del sistema {allReservations.length > 0 && `(${allReservations.length} total)`}
                    </p>
                </div>
                <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors flex items-center gap-2 text-on-surface dark:text-on-dark-surface"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Limpiar Filtros
                </button>
            </div>

            {/* ✅ Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-primary dark:text-primary-dark">{stats.total}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Total</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-emerald-600">{stats.confirmed}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Confirmadas</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-amber-600">{stats.pending}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Pendientes</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-blue-600">{stats.completed}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Completadas</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-red-600">{stats.cancelled}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Canceladas</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant mb-6 transition-colors duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Buscar
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Buscar por usuario o espacio..."
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        />
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Estado
                        </label>
                        <select
                            value={filter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="confirmed">Confirmadas</option>
                            <option value="pending">Pendientes</option>
                            <option value="completed">Completadas</option>
                            <option value="cancelled">Canceladas</option>
                        </select>
                    </div>

                    {/* Usuario */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Usuario
                        </label>
                        <select
                            value={selectedUserId}
                            onChange={handleUserFilter}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="">Todos los usuarios</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.firstName} {u.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Espacio */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Espacio
                        </label>
                        <select
                            value={selectedSpaceId}
                            onChange={handleSpaceFilter}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="">Todos los espacios</option>
                            {spaces.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ordenar */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Ordenar por
                        </label>
                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            {SORT_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="flex justify-between items-center mb-4 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                <span>
                    Mostrando {reservations.length} de {totalItems} reservas
                </span>
                {filter !== 'all' && (
                    <span className="text-primary dark:text-primary-dark">
                        Filtro: {filter}
                    </span>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto"></div>
                    <p className="text-on-surface-variant dark:text-on-dark-surface-variant mt-4">Cargando reservas...</p>
                </div>
            ) : reservations.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl border border-outline-variant dark:border-outline-dark-variant transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant dark:text-on-dark-surface-variant mb-4 block">event_busy</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">No hay reservas</h3>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        {filter !== 'all'
                            ? `No hay reservas con estado "${filter}"`
                            : 'No hay reservas en el sistema'}
                    </p>
                    {filter !== 'all' && (
                        <button
                            onClick={() => handleFilterChange('all')}
                            className="mt-4 text-primary dark:text-primary-dark hover:underline"
                        >
                            Ver todas las reservas
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant dark:border-outline-dark-variant">
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">ID</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Usuario</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Espacio</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Fecha/Hora</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Invitados</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Precio</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Estado</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation, index) => {
                                const isUpcoming = new Date(reservation.startTime) > new Date();
                                const canCancel = (reservation.status === 'Confirmed' || reservation.status === 'Pending') && isUpcoming;
                                const canEdit = reservation.status !== 'Cancelled' && reservation.status !== 'Completed';

                                return (
                                    <tr
                                        key={reservation.id}
                                        className={`border-b border-outline-variant dark:border-outline-dark-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors ${index % 2 === 0 ? 'bg-surface-container-lowest dark:bg-surface-dark-container-lowest' : ''}`}
                                    >
                                        <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface font-mono">
                                            #{reservation.id}
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="text-body-sm font-medium text-on-surface dark:text-on-dark-surface">
                                                {reservation.userName || `User ${reservation.userId}`}
                                            </div>
                                            <div className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                                {reservation.userEmail || ''}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="text-body-sm text-on-surface dark:text-on-dark-surface">
                                                {reservation.spaceName}
                                            </div>
                                            <div className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                                {reservation.spaceType}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="text-body-sm text-on-surface dark:text-on-dark-surface">
                                                {formatDate(reservation.startTime)}
                                            </div>
                                            <div className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                                → {formatDate(reservation.endTime)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface text-center">
                                            {reservation.numberOfGuests || 1}
                                        </td>
                                        <td className="py-3 px-3 font-headline-sm text-primary dark:text-primary-dark">
                                            ${reservation.totalPrice?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusBadge(reservation.status)}`}>
                                                <span className="material-symbols-outlined text-sm">{getStatusIcon(reservation.status)}</span>
                                                {reservation.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="flex flex-wrap gap-1">
                                                {reservation.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleConfirmReservation(reservation.id)}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                                        title="Confirmar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleEditClick(reservation)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                )}
                                                {canCancel && (
                                                    <button
                                                        onClick={() => setShowCancelModal(reservation.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedReservation(reservation)}
                                                    className="p-1.5 text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <span className="material-symbols-outlined text-sm">info</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-on-surface dark:text-on-dark-surface"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                            Anterior
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum
                                            ? 'bg-primary dark:bg-primary-dark text-white'
                                            : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface dark:text-on-dark-surface'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-on-surface dark:text-on-dark-surface"
                        >
                            Siguiente
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>

                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        Mostrando {Math.min(currentPage * PAGE_SIZE, totalItems)} de {totalItems} reservas
                    </div>
                </div>
            )}

            {/* ✅ Modal de Edición */}
            {showEditModal && editingReservation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark">edit</span>
                                Editar Reserva #{editingReservation.id}
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Usuario */}
                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Usuario
                                </label>
                                <select
                                    value={editFormData.userId}
                                    onChange={(e) => setEditFormData({ ...editFormData, userId: e.target.value })}
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                >
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.firstName} {u.lastName} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Espacio */}
                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Espacio
                                </label>
                                <select
                                    value={editFormData.spaceId}
                                    onChange={(e) => setEditFormData({ ...editFormData, spaceId: e.target.value })}
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                >
                                    {spaces.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fechas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Inicio
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editFormData.startTime}
                                        onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Fin
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editFormData.endTime}
                                        onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Invitados */}
                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Número de Invitados
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={editFormData.numberOfGuests}
                                    onChange={(e) => setEditFormData({ ...editFormData, numberOfGuests: parseInt(e.target.value) || 1 })}
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                />
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Notas de la Reserva
                                </label>
                                <textarea
                                    value={editFormData.notes}
                                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                    rows="2"
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none resize-y"
                                    placeholder="Notas adicionales..."
                                />
                            </div>

                            {/* ✅ Nota de Cambio - OBLIGATORIA */}
                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Nota del Cambio <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={editFormData.changeNote}
                                    onChange={(e) => setEditFormData({ ...editFormData, changeNote: e.target.value })}
                                    rows="2"
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none resize-y"
                                    placeholder="Describe los cambios realizados..."
                                    required
                                />
                                <p className="text-body-xs text-red-500 dark:text-red-400 mt-1">
                                    * Obligatorio - Describe qué cambios se están realizando
                                </p>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={editing || !editFormData.changeNote.trim()}
                                    className="flex-1 px-4 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {editing ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">save</span>
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Modal de Cancelación */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCancelModal(null)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Cancelar Reserva
                        </h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-4">
                            ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.
                        </p>
                        <div className="mb-4">
                            <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                Motivo (Opcional)
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows="2"
                                placeholder="¿Por qué se cancela?"
                                className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(null);
                                    setCancelReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                            >
                                Mantener Reserva
                            </button>
                            <button
                                onClick={handleCancelReservation}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelando...' : 'Sí, Cancelar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Modal de Detalles */}
            {selectedReservation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReservation(null)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark">info</span>
                                Detalles de Reserva #{selectedReservation.id}
                            </h3>
                            <button
                                onClick={() => setSelectedReservation(null)}
                                className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Usuario</p>
                                    <p className="text-body-md font-semibold text-on-surface dark:text-on-dark-surface">
                                        {selectedReservation.userName || `User ${selectedReservation.userId}`}
                                    </p>
                                    <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                        {selectedReservation.userEmail || ''}
                                    </p>
                                </div>
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Espacio</p>
                                    <p className="text-body-md font-semibold text-on-surface dark:text-on-dark-surface">
                                        {selectedReservation.spaceName}
                                    </p>
                                    <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                        {selectedReservation.spaceType}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Inicio</p>
                                    <p className="text-body-md font-semibold text-on-surface dark:text-on-dark-surface">
                                        {formatDate(selectedReservation.startTime)}
                                    </p>
                                </div>
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Fin</p>
                                    <p className="text-body-md font-semibold text-on-surface dark:text-on-dark-surface">
                                        {formatDate(selectedReservation.endTime)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg text-center">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Invitados</p>
                                    <p className="text-body-lg font-bold text-on-surface dark:text-on-dark-surface">
                                        {selectedReservation.numberOfGuests || 1}
                                    </p>
                                </div>
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg text-center">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Precio</p>
                                    <p className="text-body-lg font-bold text-primary dark:text-primary-dark">
                                        ${selectedReservation.totalPrice?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg text-center">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Estado</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusBadge(selectedReservation.status)}`}>
                                        <span className="material-symbols-outlined text-sm">{getStatusIcon(selectedReservation.status)}</span>
                                        {selectedReservation.status}
                                    </span>
                                </div>
                            </div>

                            {selectedReservation.notes && (
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Notas</p>
                                    <p className="text-body-md text-on-surface dark:text-on-dark-surface mt-1 whitespace-pre-wrap">
                                        {selectedReservation.notes}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2 text-center text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                                <div>
                                    <p>Creación</p>
                                    <p className="font-medium text-on-surface dark:text-on-dark-surface">
                                        {formatDateShort(selectedReservation.createdAt)}
                                    </p>
                                </div>
                                {selectedReservation.updatedAt && (
                                    <div>
                                        <p>Última actualización</p>
                                        <p className="font-medium text-on-surface dark:text-on-dark-surface">
                                            {formatDateShort(selectedReservation.updatedAt)}
                                        </p>
                                    </div>
                                )}
                                {selectedReservation.completedAt && (
                                    <div>
                                        <p>Completada</p>
                                        <p className="font-medium text-emerald-600">
                                            {formatDateShort(selectedReservation.completedAt)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                                <button
                                    onClick={() => setSelectedReservation(null)}
                                    className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                                >
                                    Cerrar
                                </button>
                                {selectedReservation.status === 'Pending' && (
                                    <button
                                        onClick={() => {
                                            handleConfirmReservation(selectedReservation.id);
                                            setSelectedReservation(null);
                                        }}
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        Confirmar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReservations;
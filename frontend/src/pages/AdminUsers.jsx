// frontend/src/pages/AdminUsers.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import usersService from '../api/users.service';
import reservationsService from '../api/reservations.service';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

const AdminUsers = () => {
    const { user, isAuthenticated } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal de detalles
    const [selectedUser, setSelectedUser] = useState(null);
    const [userReservations, setUserReservations] = useState([]);
    const [loadingReservations, setLoadingReservations] = useState(false);

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

    // Cargar usuarios
    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await usersService.getAll();
            let filteredData = data || [];

            // Filtrar por búsqueda
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                filteredData = filteredData.filter(u =>
                    u.firstName?.toLowerCase().includes(searchLower) ||
                    u.lastName?.toLowerCase().includes(searchLower) ||
                    u.email?.toLowerCase().includes(searchLower) ||
                    u.company?.toLowerCase().includes(searchLower)
                );
            }

            // Filtrar por rol
            if (filterRole !== 'all') {
                filteredData = filteredData.filter(u =>
                    filterRole === 'admin' ? u.isAdmin : !u.isAdmin
                );
            }

            // Filtrar por estado
            if (filterStatus !== 'all') {
                filteredData = filteredData.filter(u =>
                    filterStatus === 'active' ? u.isActive : !u.isActive
                );
            }

            // Ordenar por fecha de creación (más reciente primero)
            filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setUsers(filteredData);
            setTotalItems(filteredData.length);
            setTotalPages(Math.ceil(filteredData.length / PAGE_SIZE));
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Error al cargar los usuarios');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterRole, filterStatus]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Cambiar página
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Ver detalles del usuario
    const handleViewUserDetails = async (userId) => {
        setSelectedUser(users.find(u => u.id === userId));
        setLoadingReservations(true);
        try {
            // Obtener reservas del usuario usando el endpoint de admin
            const response = await reservationsService.getAllReservations(
                1,
                50,
                'date_desc',
                'all',
                '',
                userId,
                null
            );
            setUserReservations(response?.items || []);
        } catch (error) {
            console.error('Error loading user reservations:', error);
            setUserReservations([]);
        } finally {
            setLoadingReservations(false);
        }
    };

    // Obtener usuarios paginados
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return users.slice(startIndex, endIndex);
    }, [users, currentPage]);

    // Calcular estadísticas
    const stats = useMemo(() => {
        return {
            total: users.length,
            active: users.filter(u => u.isActive).length,
            inactive: users.filter(u => !u.isActive).length,
            admins: users.filter(u => u.isAdmin).length,
            regular: users.filter(u => !u.isAdmin).length
        };
    }, [users]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    if (!user?.isAdmin) {
        return null;
    }

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl">people</span>
                        Todos los Usuarios
                    </h1>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        Gestiona todos los usuarios del sistema
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm('');
                        setFilterRole('all');
                        setFilterStatus('all');
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors flex items-center gap-2 text-on-surface dark:text-on-dark-surface"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Limpiar Filtros
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-primary dark:text-primary-dark">{stats.total}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Total</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-emerald-600">{stats.active}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Activos</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-red-600">{stats.inactive}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Inactivos</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-blue-600">{stats.admins}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Administradores</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-purple-600">{stats.regular}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Usuarios</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant mb-6 transition-colors duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Buscar
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Buscar por nombre o email..."
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        />
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Rol
                        </label>
                        <select
                            value={filterRole}
                            onChange={(e) => {
                                setFilterRole(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="admin">Administradores</option>
                            <option value="user">Usuarios</option>
                        </select>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Estado
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="flex justify-between items-center mb-4 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                <span>
                    Mostrando {paginatedUsers.length} de {totalItems} usuarios
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto"></div>
                    <p className="text-on-surface-variant dark:text-on-dark-surface-variant mt-4">Cargando usuarios...</p>
                </div>
            ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl border border-outline-variant dark:border-outline-dark-variant transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant dark:text-on-dark-surface-variant mb-4 block">person_off</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">No hay usuarios</h3>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                            ? 'No hay usuarios que coincidan con los filtros seleccionados'
                            : 'No hay usuarios registrados en el sistema'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant dark:border-outline-dark-variant">
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Usuario</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Email</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Empresa</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Rol</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Estado</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Registro</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((u, index) => (
                                <tr
                                    key={u.id}
                                    className={`border-b border-outline-variant dark:border-outline-dark-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors ${index % 2 === 0 ? 'bg-surface-container-lowest dark:bg-surface-dark-container-lowest' : ''}`}
                                >
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                                                {getInitials(u.firstName, u.lastName)}
                                            </div>
                                            <div>
                                                <div className="text-body-sm font-medium text-on-surface dark:text-on-dark-surface">
                                                    {u.firstName} {u.lastName}
                                                </div>
                                                {u.jobTitle && (
                                                    <div className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                                        {u.jobTitle}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface">
                                        {u.email}
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface">
                                        {u.company || '-'}
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.isAdmin
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                            }`}>
                                            {u.isAdmin ? 'Admin' : 'Usuario'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.isActive
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            }`}>
                                            {u.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                        {formatDate(u.createdAt)}
                                    </td>
                                    <td className="py-3 px-3">
                                        <button
                                            onClick={() => handleViewUserDetails(u.id)}
                                            className="p-1.5 text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                                            title="Ver detalles"
                                        >
                                            <span className="material-symbols-outlined text-sm">info</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
                        Mostrando {Math.min(currentPage * PAGE_SIZE, totalItems)} de {totalItems} usuarios
                    </div>
                </div>
            )}

            {/* ✅ Modal de Detalles del Usuario */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark">person</span>
                                Detalles del Usuario
                            </h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Información del usuario */}
                            <div className="flex items-center gap-4 p-4 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold flex-shrink-0">
                                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                                </div>
                                <div>
                                    <h4 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </h4>
                                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                                        {selectedUser.email}
                                    </p>
                                    {selectedUser.company && (
                                        <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                            {selectedUser.company} {selectedUser.jobTitle && `• ${selectedUser.jobTitle}`}
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.isAdmin
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                            }`}>
                                            {selectedUser.isAdmin ? 'Admin' : 'Usuario'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.isActive
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            }`}>
                                            {selectedUser.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas del usuario */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg text-center">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Reservas</p>
                                    <p className="font-headline-md text-primary dark:text-primary-dark">{userReservations.length}</p>
                                </div>
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg text-center">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Total Gastado</p>
                                    <p className="font-headline-md text-primary dark:text-primary-dark">
                                        ${userReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg text-center">
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">Miembro desde</p>
                                    <p className="font-body-md font-semibold text-on-surface dark:text-on-dark-surface">
                                        {formatDate(selectedUser.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Reservas del usuario */}
                            <div>
                                <h4 className="font-body-lg font-semibold text-on-surface dark:text-on-dark-surface mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">event</span>
                                    Reservas del Usuario
                                    <span className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant font-normal">
                                        ({userReservations.length})
                                    </span>
                                </h4>
                                {loadingReservations ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-dark mx-auto"></div>
                                        <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant mt-2">Cargando reservas...</p>
                                    </div>
                                ) : userReservations.length === 0 ? (
                                    <div className="text-center py-8 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                        Este usuario no tiene reservas
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {userReservations.map((reservation) => (
                                            <div key={reservation.id} className="flex items-center justify-between p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg border border-outline-variant dark:border-outline-dark-variant">
                                                <div>
                                                    <p className="text-body-sm font-medium text-on-surface dark:text-on-dark-surface">
                                                        {reservation.spaceName}
                                                    </p>
                                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                                        {formatDate(reservation.startTime)} → {formatDate(reservation.endTime)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-body-sm font-semibold text-primary dark:text-primary-dark">
                                                        ${reservation.totalPrice?.toFixed(2) || '0.00'}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${reservation.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                        reservation.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                            reservation.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {reservation.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                                >
                                    Cerrar
                                </button>
                                <Link
                                    to={`/profile`}
                                    className="flex-1 px-4 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors text-center"
                                >
                                    Ver Perfil
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
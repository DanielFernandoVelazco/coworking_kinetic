// frontend/src/pages/AdminAlerts.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import adminService from '../api/admin.service';
import usersService from '../api/users.service';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const AdminAlerts = () => {
    const { user, isAuthenticated } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    // Estados
    const [alerts, setAlerts] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Filtros
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal de Broadcast
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        title: '',
        message: '',
        type: 'info',
        category: 'general',
        actionUrl: '',
        actionLabel: ''
    });
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    // ✅ NUEVOS ESTADOS PARA DESTINATARIOS
    const [recipientType, setRecipientType] = useState('active'); // 'active', 'inactive', 'custom'
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchUsers, setSearchUsers] = useState('');

    // Modal de confirmación de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);

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

    // Cargar datos
    const loadAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const [statsData, alertsData] = await Promise.all([
                adminService.getAlertStats(),
                adminService.getAllAlerts(null, 200)
            ]);
            setStats(statsData);
            setAlerts(alertsData || []);
            setFilteredAlerts(alertsData || []);
        } catch (error) {
            console.error('Error loading alerts:', error);
            toast.error('Error al cargar las alertas');
            setAlerts([]);
            setFilteredAlerts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Cargar usuarios para la checklist
    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const data = await usersService.getAll();
            setAllUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Error al cargar los usuarios');
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        loadAlerts();
    }, [loadAlerts]);

    // Cargar usuarios cuando se abre el modal y se selecciona 'custom'
    useEffect(() => {
        if (showBroadcastModal && recipientType === 'custom' && allUsers.length === 0) {
            loadUsers();
        }
    }, [showBroadcastModal, recipientType, allUsers.length, loadUsers]);

    // Aplicar filtros
    useEffect(() => {
        if (alerts.length === 0) {
            setFilteredAlerts([]);
            setTotalItems(0);
            setTotalPages(1);
            return;
        }

        let filtered = [...alerts];

        // Búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(searchLower) ||
                a.message.toLowerCase().includes(searchLower) ||
                a.userName?.toLowerCase().includes(searchLower) ||
                a.userEmail?.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por tipo
        if (filterType !== 'all') {
            filtered = filtered.filter(a => a.type === filterType);
        }

        // Filtro por categoría
        if (filterCategory !== 'all') {
            filtered = filtered.filter(a => a.category === filterCategory);
        }

        // Filtro por estado (leída/no leída)
        if (filterStatus !== 'all') {
            filtered = filtered.filter(a =>
                filterStatus === 'read' ? a.isRead :
                    filterStatus === 'unread' ? !a.isRead : true
            );
        }

        setFilteredAlerts(filtered);
        setTotalItems(filtered.length);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
        setCurrentPage(1);
    }, [alerts, searchTerm, filterType, filterCategory, filterStatus]);

    // ✅ Filtrar usuarios para la checklist
    const filteredUsers = useMemo(() => {
        if (!searchUsers.trim()) return allUsers;
        const searchLower = searchUsers.toLowerCase();
        return allUsers.filter(u =>
            u.firstName?.toLowerCase().includes(searchLower) ||
            u.lastName?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower)
        );
    }, [allUsers, searchUsers]);

    // ✅ Manejar selección de todos los usuarios
    const handleSelectAllUsers = useCallback(() => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
        }
    }, [filteredUsers, selectedUsers]);

    // ✅ Manejar selección individual
    const handleToggleUser = useCallback((userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    }, []);

    // ✅ Obtener el número de destinatarios según el tipo seleccionado
    const getRecipientCount = useCallback(() => {
        switch (recipientType) {
            case 'active':
                return allUsers.filter(u => u.isActive).length;
            case 'inactive':
                return allUsers.filter(u => !u.isActive).length;
            case 'custom':
                return selectedUsers.length;
            default:
                return 0;
        }
    }, [recipientType, allUsers, selectedUsers]);

    // ✅ Obtener la lista de IDs de destinatarios
    const getRecipientIds = useCallback(() => {
        switch (recipientType) {
            case 'active':
                return allUsers.filter(u => u.isActive).map(u => u.id);
            case 'inactive':
                return allUsers.filter(u => !u.isActive).map(u => u.id);
            case 'custom':
                return selectedUsers;
            default:
                return [];
        }
    }, [recipientType, allUsers, selectedUsers]);

    // Obtener usuarios paginados
    const paginatedAlerts = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return filteredAlerts.slice(startIndex, endIndex);
    }, [filteredAlerts, currentPage]);

    // Cambiar página
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterCategory('all');
        setFilterStatus('all');
        setCurrentPage(1);
    };

    // Eliminar alerta
    const handleDeleteAlert = async () => {
        if (!showDeleteModal) return;

        setDeleting(true);
        try {
            await adminService.deleteAlert(showDeleteModal);
            toast.success('✅ Alerta eliminada exitosamente');
            setShowDeleteModal(null);
            await loadAlerts();
        } catch (error) {
            console.error('Error deleting alert:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar la alerta');
        } finally {
            setDeleting(false);
        }
    };

    // ✅ Enviar broadcast con destinatarios seleccionados
    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();

        if (!broadcastData.title.trim() || !broadcastData.message.trim()) {
            toast.error('El título y mensaje son obligatorios');
            return;
        }

        const recipientIds = getRecipientIds();
        if (recipientIds.length === 0) {
            toast.error('No hay usuarios seleccionados para enviar la alerta');
            return;
        }

        setSendingBroadcast(true);
        try {
            // Enviar alerta a cada usuario seleccionado
            const promises = recipientIds.map(userId =>
                adminService.createAlertForUser(userId, broadcastData)
            );

            const results = await Promise.all(promises);
            const successCount = results.filter(r => r).length;

            toast.success(`✅ Alerta enviada a ${successCount} usuarios`);
            setShowBroadcastModal(false);
            setBroadcastData({
                title: '',
                message: '',
                type: 'info',
                category: 'general',
                actionUrl: '',
                actionLabel: ''
            });
            setSelectedUsers([]);
            setRecipientType('active');
            await loadAlerts();
        } catch (error) {
            console.error('Error sending broadcast:', error);
            toast.error(error.response?.data?.message || 'Error al enviar alerta masiva');
        } finally {
            setSendingBroadcast(false);
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeColor = (type) => {
        const colors = {
            'info': 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
            'success': 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
            'warning': 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
            'error': 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[type] || 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    };

    const getTypeIcon = (type) => {
        const icons = {
            'info': 'info',
            'success': 'check_circle',
            'warning': 'warning',
            'error': 'error'
        };
        return icons[type] || 'notifications';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'booking': '📅 Booking',
            'payment': '💳 Payment',
            'system': '⚙️ System',
            'promotion': '🎉 Promotion',
            'general': '📌 General'
        };
        return labels[category] || category;
    };

    const getStatusBadge = (isRead) => {
        return isRead
            ? 'bg-surface-container-low text-on-surface-variant'
            : 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark';
    };

    // ✅ Renderizar checklist de usuarios
    const renderUserChecklist = () => {
        if (loadingUsers) {
            return (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-body-sm text-on-surface-variant mt-2">Cargando usuarios...</p>
                </div>
            );
        }

        if (allUsers.length === 0) {
            return (
                <div className="text-center py-8 text-on-surface-variant">
                    <p className="text-body-sm">No hay usuarios registrados en el sistema</p>
                </div>
            );
        }

        const filtered = filteredUsers;
        const allSelected = filtered.length > 0 && filtered.every(u => selectedUsers.includes(u.id));

        return (
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSelectAllUsers}
                            className="text-body-sm text-primary hover:underline flex items-center gap-1"
                        >
                            {allSelected ? (
                                <>Deseleccionar todos</>
                            ) : (
                                <>Seleccionar todos ({filtered.length})</>
                            )}
                        </button>
                        <span className="text-body-xs text-on-surface-variant">
                            {selectedUsers.length} seleccionados
                        </span>
                    </div>
                    <input
                        type="text"
                        value={searchUsers}
                        onChange={(e) => setSearchUsers(e.target.value)}
                        placeholder="Buscar usuario..."
                        className="text-body-sm bg-surface-container-low border-b border-outline-variant px-0 py-1 text-on-surface focus:border-primary focus:outline-none transition-all w-48"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-surface-container-low rounded-lg border border-outline-variant">
                    {filtered.length === 0 ? (
                        <div className="col-span-2 text-center py-4 text-on-surface-variant">
                            No se encontraron usuarios
                        </div>
                    ) : (
                        filtered.map((u) => (
                            <label
                                key={u.id}
                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${selectedUsers.includes(u.id)
                                    ? 'bg-primary/10 border border-primary'
                                    : 'hover:bg-surface-container-high border border-transparent'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(u.id)}
                                    onChange={() => handleToggleUser(u.id)}
                                    className="w-4 h-4 accent-primary"
                                />
                                <div className="flex-1 min-w-0">
                                    <span className="text-body-sm text-on-surface truncate block">
                                        {u.firstName} {u.lastName}
                                    </span>
                                    <span className="text-body-xs text-on-surface-variant truncate block">
                                        {u.email}
                                    </span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {u.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </label>
                        ))
                    )}
                </div>
            </div>
        );
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
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl">notifications</span>
                        Alertas del Sistema
                    </h1>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        Gestiona todas las alertas y notificaciones del sistema
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors flex items-center gap-2 text-on-surface dark:text-on-dark-surface"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Limpiar Filtros
                    </button>
                    <button
                        onClick={() => setShowBroadcastModal(true)}
                        className="px-4 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">campaign</span>
                        Enviar Alerta Masiva
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                        <div className="font-headline-md text-primary dark:text-primary-dark">{stats.total}</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Total</div>
                    </div>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                        <div className="font-headline-md text-red-600">{stats.unread}</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">No leídas</div>
                    </div>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                        <div className="font-headline-md text-emerald-600">{stats.read}</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Leídas</div>
                    </div>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                        <div className="font-headline-md text-amber-600">{stats.last7Days}</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Últimos 7 días</div>
                    </div>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                        <div className="font-headline-md text-blue-600">
                            {stats.total > 0 ? Math.round((stats.unread / stats.total) * 100) : 0}%
                        </div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">% No leídas</div>
                    </div>
                </div>
            )}

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
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Buscar alerta..."
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        />
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Tipo
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="info">ℹ️ Info</option>
                            <option value="success">✅ Success</option>
                            <option value="warning">⚠️ Warning</option>
                            <option value="error">❌ Error</option>
                        </select>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Categoría
                        </label>
                        <select
                            value={filterCategory}
                            onChange={(e) => {
                                setFilterCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="all">Todas</option>
                            <option value="booking">📅 Booking</option>
                            <option value="payment">💳 Payment</option>
                            <option value="system">⚙️ System</option>
                            <option value="promotion">🎉 Promotion</option>
                            <option value="general">📌 General</option>
                        </select>
                    </div>

                    {/* Estado de lectura */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Estado de lectura
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
                            <option value="unread">No leídas</option>
                            <option value="read">Leídas</option>
                        </select>
                    </div>

                    {/* Limpiar */}
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Results count */}
            <div className="flex justify-between items-center mb-4 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                <span>
                    Mostrando {paginatedAlerts.length} de {totalItems} alertas
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto"></div>
                    <p className="text-on-surface-variant dark:text-on-dark-surface-variant mt-4">Cargando alertas...</p>
                </div>
            ) : paginatedAlerts.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl border border-outline-variant dark:border-outline-dark-variant transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant dark:text-on-dark-surface-variant mb-4 block">notifications_off</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">No hay alertas</h3>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                            ? 'No hay alertas que coincidan con los filtros seleccionados'
                            : 'No hay alertas en el sistema'}
                    </p>
                    <button
                        onClick={() => setShowBroadcastModal(true)}
                        className="mt-4 px-6 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors"
                    >
                        Enviar primera alerta
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant dark:border-outline-dark-variant">
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">ID</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Título / Mensaje</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Usuario</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Tipo</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Categoría</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Estado</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Creada</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAlerts.map((alert, index) => (
                                <tr
                                    key={alert.id}
                                    className={`border-b border-outline-variant dark:border-outline-dark-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors ${index % 2 === 0 ? 'bg-surface-container-lowest dark:bg-surface-dark-container-lowest' : ''}`}
                                >
                                    <td className="py-3 px-3 text-body-sm font-mono text-on-surface dark:text-on-dark-surface">
                                        #{alert.id}
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="text-body-sm font-medium text-on-surface dark:text-on-dark-surface">
                                            {alert.title}
                                            {!alert.isRead && (
                                                <span className="w-2 h-2 bg-primary rounded-full inline-block ml-2"></span>
                                            )}
                                        </div>
                                        <div className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant line-clamp-2 max-w-xs">
                                            {alert.message}
                                        </div>
                                        {alert.actionLabel && (
                                            <a
                                                href={alert.actionUrl || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-body-xs text-primary hover:underline"
                                            >
                                                {alert.actionLabel} →
                                            </a>
                                        )}
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="text-body-sm text-on-surface dark:text-on-dark-surface">
                                            {alert.userName || `User ${alert.userId}`}
                                        </div>
                                        <div className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                            {alert.userEmail || ''}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getTypeColor(alert.type)}`}>
                                            <span className="material-symbols-outlined text-sm">{getTypeIcon(alert.type)}</span>
                                            {alert.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface">
                                        {getCategoryLabel(alert.category)}
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(alert.isRead)}`}>
                                            {alert.isRead ? 'Leída' : 'No leída'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                        {formatDate(alert.createdAt)}
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                onClick={() => setShowDeleteModal(alert.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
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
                        Mostrando {Math.min(currentPage * PAGE_SIZE, totalItems)} de {totalItems} alertas
                    </div>
                </div>
            )}

            {/* ========== MODAL DE BROADCAST MODIFICADO ========== */}
            {showBroadcastModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowBroadcastModal(false)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark text-2xl">campaign</span>
                                Enviar Alerta Masiva
                            </h3>
                            <button
                                onClick={() => setShowBroadcastModal(false)}
                                className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Título <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={broadcastData.title}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                                    placeholder="Ej: Nuevo espacio disponible"
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Mensaje <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={broadcastData.message}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                                    rows="4"
                                    placeholder="Escribe el mensaje de la alerta..."
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none resize-y"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Tipo
                                    </label>
                                    <select
                                        value={broadcastData.type}
                                        onChange={(e) => setBroadcastData({ ...broadcastData, type: e.target.value })}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    >
                                        <option value="info">ℹ️ Info</option>
                                        <option value="success">✅ Success</option>
                                        <option value="warning">⚠️ Warning</option>
                                        <option value="error">❌ Error</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Categoría
                                    </label>
                                    <select
                                        value={broadcastData.category}
                                        onChange={(e) => setBroadcastData({ ...broadcastData, category: e.target.value })}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    >
                                        <option value="general">📌 General</option>
                                        <option value="booking">📅 Booking</option>
                                        <option value="payment">💳 Payment</option>
                                        <option value="system">⚙️ System</option>
                                        <option value="promotion">🎉 Promotion</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        URL de Acción
                                    </label>
                                    <input
                                        type="text"
                                        value={broadcastData.actionUrl}
                                        onChange={(e) => setBroadcastData({ ...broadcastData, actionUrl: e.target.value })}
                                        placeholder="/catalog"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Texto del Botón
                                    </label>
                                    <input
                                        type="text"
                                        value={broadcastData.actionLabel}
                                        onChange={(e) => setBroadcastData({ ...broadcastData, actionLabel: e.target.value })}
                                        placeholder="Ver más"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* ✅ NUEVA SECCIÓN: SELECCIÓN DE DESTINATARIOS */}
                            <div className="p-4 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg border border-outline-variant dark:border-outline-dark-variant">
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-2">
                                    Destinatarios
                                </label>

                                {/* Selector de tipo de destinatario */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRecipientType('active');
                                            setSelectedUsers([]);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${recipientType === 'active'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'border border-outline-variant hover:bg-surface-container-high text-on-surface-variant'
                                            }`}
                                    >
                                        Usuarios Activos
                                        <span className="ml-1 text-xs opacity-70">
                                            ({allUsers.filter(u => u.isActive).length})
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRecipientType('inactive');
                                            setSelectedUsers([]);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${recipientType === 'inactive'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'border border-outline-variant hover:bg-surface-container-high text-on-surface-variant'
                                            }`}
                                    >
                                        Usuarios Inactivos
                                        <span className="ml-1 text-xs opacity-70">
                                            ({allUsers.filter(u => !u.isActive).length})
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRecipientType('custom');
                                            if (allUsers.length === 0) loadUsers();
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${recipientType === 'custom'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'border border-outline-variant hover:bg-surface-container-high text-on-surface-variant'
                                            }`}
                                    >
                                        Personalizado
                                        <span className="ml-1 text-xs opacity-70">
                                            ({selectedUsers.length} seleccionados)
                                        </span>
                                    </button>
                                </div>

                                {/* Indicador de cantidad de destinatarios */}
                                <div className="text-body-sm text-on-surface-variant mb-2">
                                    {recipientType === 'active' && (
                                        <span>🔵 Enviando a <strong>{allUsers.filter(u => u.isActive).length}</strong> usuarios activos</span>
                                    )}
                                    {recipientType === 'inactive' && (
                                        <span>🔴 Enviando a <strong>{allUsers.filter(u => !u.isActive).length}</strong> usuarios inactivos</span>
                                    )}
                                    {recipientType === 'custom' && (
                                        <span>🟣 Enviando a <strong>{selectedUsers.length}</strong> usuarios seleccionados</span>
                                    )}
                                </div>

                                {/* Checklist de usuarios (solo para personalizado) */}
                                {recipientType === 'custom' && renderUserChecklist()}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBroadcastModal(false);
                                        setSelectedUsers([]);
                                        setRecipientType('active');
                                    }}
                                    className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingBroadcast || (recipientType === 'custom' && selectedUsers.length === 0)}
                                    className="flex-1 px-4 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {sendingBroadcast ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">send</span>
                                            Enviar Alerta
                                            {recipientType !== 'custom' && (
                                                <span className="text-xs opacity-70">
                                                    ({recipientType === 'active'
                                                        ? allUsers.filter(u => u.isActive).length
                                                        : allUsers.filter(u => !u.isActive).length} usuarios)
                                                </span>
                                            )}
                                            {recipientType === 'custom' && (
                                                <span className="text-xs opacity-70">
                                                    ({selectedUsers.length} usuarios)
                                                </span>
                                            )}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== MODAL DE ELIMINACIÓN ========== */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(null)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Eliminar Alerta
                        </h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-4">
                            ¿Estás seguro de que quieres eliminar esta alerta? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAlert}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAlerts;
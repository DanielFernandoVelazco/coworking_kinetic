// frontend/src/pages/AdminSpaces.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import spacesService from '../api/spaces.service';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

// Opciones de ordenamiento
const SORT_OPTIONS = [
    { value: 'name_asc', label: '📝 Nombre (A-Z)' },
    { value: 'name_desc', label: '📝 Nombre (Z-A)' },
    { value: 'price_asc', label: '💰 Precio (Menor a Mayor)' },
    { value: 'price_desc', label: '💰 Precio (Mayor a Menor)' },
    { value: 'capacity_desc', label: '👥 Capacidad (Mayor a Menor)' },
    { value: 'capacity_asc', label: '👥 Capacidad (Menor a Mayor)' },
    { value: 'rating_desc', label: '⭐ Rating (Mayor a Menor)' },
    { value: 'rating_asc', label: '⭐ Rating (Menor a Mayor)' },
];

// Tipos de espacios predefinidos
const SPACE_TYPES = [
    'Premium Office',
    'Meeting Room',
    'Dedicated Desk',
    'Focus Pod',
    'Creative Space'
];

const AdminSpaces = () => {
    const { user, isAuthenticated } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [allSpaces, setAllSpaces] = useState([]);
    const [filteredSpaces, setFilteredSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCity, setFilterCity] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal de creación
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        description: '',
        type: 'Premium Office',
        capacity: 1,
        pricePerHour: 0,
        pricePerDay: null,
        address: '',
        city: '',
        district: '',
        postalCode: '',
        country: 'Sweden',
        isAvailable: true,
        isFeatured: false,
        imageUrls: []
    });

    // Modal de edición
    const [editingSpace, setEditingSpace] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        type: '',
        capacity: 1,
        pricePerHour: 0,
        pricePerDay: null,
        address: '',
        city: '',
        district: '',
        postalCode: '',
        country: 'Sweden',
        isAvailable: true,
        isFeatured: false,
        amenities: []
    });
    const [editing, setEditing] = useState(false);

    // Modal de confirmación de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Ciudades y tipos únicos
    const cities = useMemo(() => {
        const unique = [...new Set(allSpaces.map(s => s.city).filter(Boolean))];
        return ['all', ...unique];
    }, [allSpaces]);

    const types = useMemo(() => {
        const unique = [...new Set(allSpaces.map(s => s.type).filter(Boolean))];
        return ['all', ...unique];
    }, [allSpaces]);

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

    // Cargar espacios
    const loadSpaces = useCallback(async () => {
        setLoading(true);
        try {
            const data = await spacesService.getAllUnpaginated();
            setAllSpaces(data || []);
        } catch (error) {
            console.error('Error loading spaces:', error);
            toast.error('Error al cargar los espacios');
            setAllSpaces([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSpaces();
    }, [loadSpaces]);

    // Aplicar filtros y ordenamiento
    useEffect(() => {
        let filtered = [...allSpaces];

        // Búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchLower) ||
                s.description?.toLowerCase().includes(searchLower) ||
                s.city.toLowerCase().includes(searchLower) ||
                s.type.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por tipo
        if (filterType !== 'all') {
            filtered = filtered.filter(s => s.type === filterType);
        }

        // Filtro por ciudad
        if (filterCity !== 'all') {
            filtered = filtered.filter(s => s.city === filterCity);
        }

        // Filtro por estado
        if (filterStatus !== 'all') {
            filtered = filtered.filter(s =>
                filterStatus === 'available' ? s.isAvailable && s.isActive :
                    filterStatus === 'unavailable' ? !s.isAvailable && s.isActive :
                        filterStatus === 'inactive' ? !s.isActive : true
            );
        }

        // Ordenamiento
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'price_asc':
                    return a.pricePerHour - b.pricePerHour;
                case 'price_desc':
                    return b.pricePerHour - a.pricePerHour;
                case 'capacity_desc':
                    return b.capacity - a.capacity;
                case 'capacity_asc':
                    return a.capacity - b.capacity;
                case 'rating_desc':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'rating_asc':
                    return (a.averageRating || 0) - (b.averageRating || 0);
                default:
                    return 0;
            }
        });

        setFilteredSpaces(filtered);
        setTotalItems(filtered.length);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
        setCurrentPage(1);
    }, [allSpaces, searchTerm, filterType, filterCity, filterStatus, sortBy]);

    // Obtener espacios paginados
    const paginatedSpaces = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return filteredSpaces.slice(startIndex, endIndex);
    }, [filteredSpaces, currentPage]);

    // Cambiar página
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterCity('all');
        setFilterStatus('all');
        setSortBy('name_asc');
        setCurrentPage(1);
    };

    // ========== CREAR ESPACIO ==========
    const handleCreateClick = () => {
        setCreateFormData({
            name: '',
            description: '',
            type: 'Premium Office',
            capacity: 1,
            pricePerHour: 0,
            pricePerDay: null,
            address: '',
            city: '',
            district: '',
            postalCode: '',
            country: 'Sweden',
            isAvailable: true,
            isFeatured: false,
            imageUrls: []
        });
        setShowCreateModal(true);
    };

    const handleCreateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCreateFormData({
            ...createFormData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleCreateSubmit = async () => {
        // Validaciones básicas
        if (!createFormData.name.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }
        if (!createFormData.type) {
            toast.error('El tipo es obligatorio');
            return;
        }
        if (createFormData.capacity < 1) {
            toast.error('La capacidad debe ser al menos 1');
            return;
        }
        if (createFormData.pricePerHour <= 0) {
            toast.error('El precio por hora debe ser mayor a 0');
            return;
        }
        if (!createFormData.city.trim()) {
            toast.error('La ciudad es obligatoria');
            return;
        }
        if (!createFormData.address.trim()) {
            toast.error('La dirección es obligatoria');
            return;
        }

        setCreating(true);
        try {
            const newSpace = {
                name: createFormData.name,
                description: createFormData.description,
                type: createFormData.type,
                capacity: parseInt(createFormData.capacity),
                pricePerHour: parseFloat(createFormData.pricePerHour),
                pricePerDay: createFormData.pricePerDay ? parseFloat(createFormData.pricePerDay) : null,
                address: createFormData.address,
                city: createFormData.city,
                district: createFormData.district,
                postalCode: createFormData.postalCode,
                country: createFormData.country,
                isAvailable: createFormData.isAvailable,
                isFeatured: createFormData.isFeatured,
                imageUrls: createFormData.imageUrls.length > 0 ? createFormData.imageUrls : ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']
            };

            await spacesService.create(newSpace);
            toast.success('✅ Espacio creado exitosamente');
            setShowCreateModal(false);
            await loadSpaces();
        } catch (error) {
            console.error('Error creating space:', error);
            toast.error(error.response?.data?.message || 'Error al crear el espacio');
        } finally {
            setCreating(false);
        }
    };

    // ========== EDITAR ESPACIO ==========
    const handleEditClick = (space) => {
        setEditingSpace(space);
        setEditFormData({
            name: space.name || '',
            description: space.description || '',
            type: space.type || '',
            capacity: space.capacity || 1,
            pricePerHour: space.pricePerHour || 0,
            pricePerDay: space.pricePerDay || null,
            address: space.address || '',
            city: space.city || '',
            district: space.district || '',
            postalCode: space.postalCode || '',
            country: space.country || 'Sweden',
            isAvailable: space.isAvailable !== undefined ? space.isAvailable : true,
            isFeatured: space.isFeatured || false,
            amenities: space.amenities || []
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSaveEdit = async () => {
        if (!editingSpace) return;

        setEditing(true);
        try {
            const updateData = {
                name: editFormData.name,
                description: editFormData.description,
                type: editFormData.type,
                capacity: parseInt(editFormData.capacity),
                pricePerHour: parseFloat(editFormData.pricePerHour),
                pricePerDay: editFormData.pricePerDay ? parseFloat(editFormData.pricePerDay) : null,
                address: editFormData.address,
                city: editFormData.city,
                district: editFormData.district,
                postalCode: editFormData.postalCode,
                country: editFormData.country,
                isAvailable: editFormData.isAvailable,
                isFeatured: editFormData.isFeatured
            };

            await spacesService.update(editingSpace.id, updateData);
            toast.success('✅ Espacio actualizado exitosamente');
            setShowEditModal(false);
            setEditingSpace(null);
            await loadSpaces();
        } catch (error) {
            console.error('Error updating space:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar el espacio');
        } finally {
            setEditing(false);
        }
    };

    // ========== ELIMINAR ESPACIO ==========
    const handleDeleteSpace = async () => {
        if (!showDeleteModal) return;

        setDeleting(true);
        try {
            await spacesService.delete(showDeleteModal);
            toast.success('✅ Espacio eliminado exitosamente');
            setShowDeleteModal(null);
            await loadSpaces();
        } catch (error) {
            console.error('Error deleting space:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar el espacio');
        } finally {
            setDeleting(false);
        }
    };

    // Toggle disponibilidad
    const handleToggleAvailability = async (spaceId, currentStatus) => {
        try {
            await spacesService.update(spaceId, { isAvailable: !currentStatus });
            toast.success(`Espacio ${!currentStatus ? 'disponible' : 'no disponible'}`);
            await loadSpaces();
        } catch (error) {
            console.error('Error toggling availability:', error);
            toast.error('Error al cambiar disponibilidad');
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = (space) => {
        if (!space.isActive) {
            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
        }
        if (space.isAvailable) {
            return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
        }
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    };

    const getStatusText = (space) => {
        if (!space.isActive) return 'Inactivo';
        if (space.isAvailable) return 'Disponible';
        return 'No Disponible';
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
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl">meeting_room</span>
                        Todos los Espacios
                    </h1>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        Gestiona todos los espacios del sistema
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
                        onClick={handleCreateClick}
                        className="px-4 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Crear Espacio
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-primary dark:text-primary-dark">{allSpaces.length}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Total</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-emerald-600">
                        {allSpaces.filter(s => s.isAvailable && s.isActive).length}
                    </div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Disponibles</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-amber-600">
                        {allSpaces.filter(s => !s.isAvailable && s.isActive).length}
                    </div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">No Disponibles</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-red-600">
                        {allSpaces.filter(s => !s.isActive).length}
                    </div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Inactivos</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant mb-6 transition-colors duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Search */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Buscar
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar espacio..."
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
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="all">Todos</option>
                            {types.filter(t => t !== 'all').map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ciudad */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Ciudad
                        </label>
                        <select
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="all">Todas</option>
                            {cities.filter(c => c !== 'all').map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Estado
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="available">Disponible</option>
                            <option value="unavailable">No Disponible</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>

                    {/* Ordenar */}
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                            Ordenar
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        >
                            {SORT_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
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
                    Mostrando {paginatedSpaces.length} de {totalItems} espacios
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto"></div>
                    <p className="text-on-surface-variant dark:text-on-dark-surface-variant mt-4">Cargando espacios...</p>
                </div>
            ) : paginatedSpaces.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl border border-outline-variant dark:border-outline-dark-variant transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant dark:text-on-dark-surface-variant mb-4 block">meeting_room</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">No hay espacios</h3>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        {searchTerm || filterType !== 'all' || filterCity !== 'all' || filterStatus !== 'all'
                            ? 'No hay espacios que coincidan con los filtros seleccionados'
                            : 'No hay espacios registrados en el sistema'}
                    </p>
                    <button
                        onClick={handleCreateClick}
                        className="mt-4 px-6 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors"
                    >
                        Crear primer espacio
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant dark:border-outline-dark-variant">
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Nombre</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Tipo</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Ciudad</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Capacidad</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Precio/h</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Rating</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Estado</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Destacado</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSpaces.map((space, index) => (
                                <tr
                                    key={space.id}
                                    className={`border-b border-outline-variant dark:border-outline-dark-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors ${index % 2 === 0 ? 'bg-surface-container-lowest dark:bg-surface-dark-container-lowest' : ''}`}
                                >
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant flex-shrink-0 overflow-hidden">
                                                {space.imageUrls?.[0] ? (
                                                    <img
                                                        src={space.imageUrls[0]}
                                                        alt={space.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="material-symbols-outlined text-sm">meeting_room</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-body-sm font-medium text-on-surface dark:text-on-dark-surface">
                                                    {space.name}
                                                </div>
                                                <div className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant truncate max-w-[150px]">
                                                    {space.address}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface">
                                        {space.type}
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface">
                                        {space.city}
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface text-center">
                                        {space.capacity}
                                    </td>
                                    <td className="py-3 px-3 text-body-sm font-semibold text-primary dark:text-primary-dark">
                                        ${space.pricePerHour}
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface text-center">
                                        {space.averageRating ? space.averageRating.toFixed(1) : 'N/A'}
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(space)}`}>
                                            {getStatusText(space)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        {space.isFeatured ? (
                                            <span className="text-primary dark:text-primary-dark">
                                                <span className="material-symbols-outlined text-sm">star</span>
                                            </span>
                                        ) : (
                                            <span className="text-on-surface-variant/30">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                onClick={() => handleToggleAvailability(space.id, space.isAvailable)}
                                                className={`p-1.5 rounded-lg transition-colors ${space.isAvailable && space.isActive
                                                    ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                                                    : 'text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                                                    }`}
                                                title={space.isAvailable ? 'Marcar como no disponible' : 'Marcar como disponible'}
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {space.isAvailable && space.isActive ? 'block' : 'check_circle'}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(space)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteModal(space.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                            <Link
                                                to={`/spaces/${space.id}`}
                                                className="p-1.5 text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                                                title="Ver espacio"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                            </Link>
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
                        Mostrando {Math.min(currentPage * PAGE_SIZE, totalItems)} de {totalItems} espacios
                    </div>
                </div>
            )}

            {/* ========== MODAL DE CREACIÓN ========== */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark">add</span>
                                Crear Nuevo Espacio                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={createFormData.name}
                                        onChange={handleCreateChange}
                                        placeholder="Ej: Skyline Premium Office"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Tipo <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="type"
                                        value={createFormData.type}
                                        onChange={handleCreateChange}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    >
                                        {SPACE_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    value={createFormData.description}
                                    onChange={handleCreateChange}
                                    rows="3"
                                    placeholder="Describe el espacio..."
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Capacidad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={createFormData.capacity}
                                        onChange={handleCreateChange}
                                        min="1"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Precio por Hora ($) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="pricePerHour"
                                        value={createFormData.pricePerHour}
                                        onChange={handleCreateChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Precio por Día ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="pricePerDay"
                                        value={createFormData.pricePerDay || ''}
                                        onChange={handleCreateChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="Opcional"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Ciudad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={createFormData.city}
                                        onChange={handleCreateChange}
                                        placeholder="Ej: Stockholm"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Dirección <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={createFormData.address}
                                    onChange={handleCreateChange}
                                    placeholder="Ej: Sturegatan 22"
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Distrito
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={createFormData.district}
                                        onChange={handleCreateChange}
                                        placeholder="Ej: Östermalm"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Código Postal
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={createFormData.postalCode || ''}
                                        onChange={handleCreateChange}
                                        placeholder="Ej: 114 36"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    País
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={createFormData.country}
                                    onChange={handleCreateChange}
                                    placeholder="Sweden"
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={createFormData.isAvailable}
                                        onChange={handleCreateChange}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <label className="text-body-sm text-on-surface dark:text-on-dark-surface">Disponible</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={createFormData.isFeatured}
                                        onChange={handleCreateChange}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <label className="text-body-sm text-on-surface dark:text-on-dark-surface">Destacado</label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreateSubmit}
                                    disabled={creating}
                                    className="flex-1 px-4 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Crear Espacio
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== MODAL DE EDICIÓN ========== */}
            {showEditModal && editingSpace && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark">edit</span>
                                Editar Espacio #{editingSpace.id}
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Tipo *
                                    </label>
                                    <select
                                        name="type"
                                        value={editFormData.type}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    >
                                        {SPACE_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Capacidad *
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={editFormData.capacity}
                                        onChange={handleEditChange}
                                        min="1"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Precio por Hora *
                                    </label>
                                    <input
                                        type="number"
                                        name="pricePerHour"
                                        value={editFormData.pricePerHour}
                                        onChange={handleEditChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Precio por Día
                                    </label>
                                    <input
                                        type="number"
                                        name="pricePerDay"
                                        value={editFormData.pricePerDay || ''}
                                        onChange={handleEditChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="Opcional"
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Ciudad *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={editFormData.city}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Dirección *
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleEditChange}
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Distrito
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={editFormData.district}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Código Postal
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={editFormData.postalCode || ''}
                                        onChange={handleEditChange}
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    País
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={editFormData.country}
                                    onChange={handleEditChange}
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={editFormData.isAvailable}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <label className="text-body-sm text-on-surface dark:text-on-dark-surface">Disponible</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={editFormData.isFeatured}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <label className="text-body-sm text-on-surface dark:text-on-dark-surface">Destacado</label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={editing}
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

            {/* ========== MODAL DE ELIMINACIÓN ========== */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(null)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Eliminar Espacio
                        </h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-4">
                            ¿Estás seguro de que quieres eliminar este espacio? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteSpace}
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

export default AdminSpaces;
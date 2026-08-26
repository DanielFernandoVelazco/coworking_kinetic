// frontend/src/pages/AdminSpaces.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import spacesService from '../api/spaces.service';
import amenitiesService from '../api/amenities.service';
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

    // ✅ Amenidades disponibles
    const [allAmenities, setAllAmenities] = useState([]);

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
        amenities: [],
        imageUrls: ['']
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
        isActive: true,
        amenities: [],
        imageUrls: ['']
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

    // Cargar amenidades disponibles
    const loadAmenities = useCallback(async () => {
        try {
            const data = await amenitiesService.getAll();
            setAllAmenities(data || []);
        } catch (error) {
            console.error('Error loading amenities:', error);
        }
    }, []);

    // Cargar espacios
    const loadSpaces = useCallback(async () => {
        setLoading(true);
        try {
            const data = await spacesService.getAllUnpaginated();
            setAllSpaces(data || []);
            setFilteredSpaces(data || []);
        } catch (error) {
            console.error('Error loading spaces:', error);
            toast.error('Error al cargar los espacios');
            setAllSpaces([]);
            setFilteredSpaces([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSpaces();
        loadAmenities();
    }, [loadSpaces, loadAmenities]);

    // Aplicar filtros y ordenamiento
    useEffect(() => {
        if (allSpaces.length === 0) {
            setFilteredSpaces([]);
            setTotalItems(0);
            setTotalPages(1);
            return;
        }

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

    // ========== MANEJO DE IMÁGENES ==========
    const handleImageChange = (e, index, isEdit = false) => {
        const value = e.target.value;
        if (isEdit) {
            const newImageUrls = [...editFormData.imageUrls];
            newImageUrls[index] = value;
            setEditFormData({ ...editFormData, imageUrls: newImageUrls });
        } else {
            const newImageUrls = [...createFormData.imageUrls];
            newImageUrls[index] = value;
            setCreateFormData({ ...createFormData, imageUrls: newImageUrls });
        }
    };

    const addImageField = (isEdit = false) => {
        if (isEdit) {
            setEditFormData({
                ...editFormData,
                imageUrls: [...editFormData.imageUrls, '']
            });
        } else {
            setCreateFormData({
                ...createFormData,
                imageUrls: [...createFormData.imageUrls, '']
            });
        }
    };

    const removeImageField = (index, isEdit = false) => {
        if (isEdit) {
            const newImageUrls = editFormData.imageUrls.filter((_, i) => i !== index);
            setEditFormData({ ...editFormData, imageUrls: newImageUrls });
        } else {
            const newImageUrls = createFormData.imageUrls.filter((_, i) => i !== index);
            setCreateFormData({ ...createFormData, imageUrls: newImageUrls });
        }
    };

    // ========== MANEJO DE AMENIDADES ==========
    const handleAmenityToggle = (amenityId, isEdit = false) => {
        if (isEdit) {
            const currentAmenities = editFormData.amenities || [];
            if (currentAmenities.includes(amenityId)) {
                setEditFormData({
                    ...editFormData,
                    amenities: currentAmenities.filter(id => id !== amenityId)
                });
            } else {
                setEditFormData({
                    ...editFormData,
                    amenities: [...currentAmenities, amenityId]
                });
            }
        } else {
            const currentAmenities = createFormData.amenities || [];
            if (currentAmenities.includes(amenityId)) {
                setCreateFormData({
                    ...createFormData,
                    amenities: currentAmenities.filter(id => id !== amenityId)
                });
            } else {
                setCreateFormData({
                    ...createFormData,
                    amenities: [...currentAmenities, amenityId]
                });
            }
        }
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
            amenities: [],
            imageUrls: ['']
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

        // Filtrar URLs vacías
        const imageUrls = createFormData.imageUrls.filter(url => url.trim() !== '');

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
                amenityIds: createFormData.amenities || [],
                imageUrls: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800']
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
        const imageUrls = space.imageUrls && space.imageUrls.length > 0
            ? space.imageUrls
            : [''];

        // Extraer IDs de amenidades del espacio
        const amenityIds = space.amenities?.map(a => a.id) || [];

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
            isActive: space.isActive !== undefined ? space.isActive : true,
            amenities: amenityIds,
            imageUrls: imageUrls
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

        const imageUrls = editFormData.imageUrls.filter(url => url.trim() !== '');

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
                isFeatured: editFormData.isFeatured,
                isActive: editFormData.isActive,
                amenityIds: editFormData.amenities || [],
                imageUrls: imageUrls
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
            setAllSpaces(prev => prev.filter(s => s.id !== showDeleteModal));
            toast.success('✅ Espacio eliminado exitosamente');
            setShowDeleteModal(null);
        } catch (error) {
            console.error('Error deleting space:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar el espacio');
        } finally {
            setDeleting(false);
        }
    };

    // ========== TOGGLE DESTACADO ==========
    const handleToggleFeatured = async (spaceId, currentFeatured) => {
        try {
            const space = allSpaces.find(s => s.id === spaceId);
            if (!space) {
                toast.error('Espacio no encontrado');
                return;
            }

            if (!space.isActive) {
                toast.error('No se puede cambiar destacado de un espacio inactivo');
                return;
            }

            const newStatus = !currentFeatured;

            const updateData = {
                name: space.name,
                description: space.description || '',
                type: space.type,
                capacity: space.capacity,
                pricePerHour: space.pricePerHour,
                pricePerDay: space.pricePerDay || null,
                address: space.address,
                city: space.city,
                district: space.district || '',
                postalCode: space.postalCode || '',
                country: space.country || 'Sweden',
                isAvailable: space.isAvailable,
                isFeatured: newStatus,
                isActive: space.isActive,
                amenityIds: space.amenities?.map(a => a.id) || [],
                imageUrls: space.imageUrls || []
            };

            await spacesService.update(spaceId, updateData);

            setAllSpaces(prev => prev.map(s =>
                s.id === spaceId
                    ? { ...s, ...updateData, isFeatured: newStatus }
                    : s
            ));

            toast.success(`Espacio ${newStatus ? 'destacado' : 'no destacado'}`);

        } catch (error) {
            console.error('Error toggling featured:', error);
            toast.error(error.response?.data?.message || 'Error al cambiar destacado');
        }
    };

    // ========== TOGGLE DISPONIBILIDAD ==========
    const handleToggleAvailability = async (spaceId, currentAvailable) => {
        try {
            const space = allSpaces.find(s => s.id === spaceId);
            if (!space) {
                toast.error('Espacio no encontrado');
                return;
            }

            if (!space.isActive) {
                toast.error('No se puede cambiar la disponibilidad de un espacio inactivo');
                return;
            }

            const newStatus = !currentAvailable;

            const updateData = {
                name: space.name,
                description: space.description || '',
                type: space.type,
                capacity: space.capacity,
                pricePerHour: space.pricePerHour,
                pricePerDay: space.pricePerDay || null,
                address: space.address,
                city: space.city,
                district: space.district || '',
                postalCode: space.postalCode || '',
                country: space.country || 'Sweden',
                isAvailable: newStatus,
                isFeatured: space.isFeatured || false,
                isActive: space.isActive,
                amenityIds: space.amenities?.map(a => a.id) || [],
                imageUrls: space.imageUrls || []
            };

            await spacesService.update(spaceId, updateData);

            setAllSpaces(prev => prev.map(s =>
                s.id === spaceId
                    ? { ...s, ...updateData, isAvailable: newStatus }
                    : s
            ));

            toast.success(`Espacio ${newStatus ? 'disponible' : 'no disponible'}`);

        } catch (error) {
            console.error('Error toggling availability:', error);
            toast.error(error.response?.data?.message || 'Error al cambiar disponibilidad');
        }
    };

    // ========== TOGGLE ACTIVO ==========
    const handleToggleActive = async (spaceId, currentActive) => {
        try {
            const space = allSpaces.find(s => s.id === spaceId);
            if (!space) {
                toast.error('Espacio no encontrado');
                return;
            }

            const newStatus = !currentActive;

            const updateData = {
                name: space.name,
                description: space.description || '',
                type: space.type,
                capacity: space.capacity,
                pricePerHour: space.pricePerHour,
                pricePerDay: space.pricePerDay || null,
                address: space.address,
                city: space.city,
                district: space.district || '',
                postalCode: space.postalCode || '',
                country: space.country || 'Sweden',
                isAvailable: newStatus ? space.isAvailable : false,
                isFeatured: newStatus ? space.isFeatured : false,
                isActive: newStatus,
                amenityIds: space.amenities?.map(a => a.id) || [],
                imageUrls: space.imageUrls || []
            };

            await spacesService.update(spaceId, updateData);

            setAllSpaces(prev => prev.map(s =>
                s.id === spaceId
                    ? {
                        ...s,
                        ...updateData,
                        isActive: newStatus,
                        isAvailable: newStatus ? s.isAvailable : false,
                        isFeatured: newStatus ? s.isFeatured : false
                    }
                    : s
            ));

            toast.success(`Espacio ${newStatus ? 'activado' : 'desactivado'}${!newStatus ? ' (destacado y disponible desmarcados)' : ''}`);

        } catch (error) {
            console.error('Error toggling active:', error);
            toast.error(error.response?.data?.message || 'Error al cambiar estado');
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

    // ========== RENDERIZAR CAMPOS DE IMÁGENES ==========
    const renderImageFields = (imageUrls, isEdit = false) => {
        const urls = isEdit ? editFormData.imageUrls : createFormData.imageUrls;

        return (
            <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                    URLs de Imágenes
                </label>
                <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant mb-2">
                    Agrega URLs de imágenes para el espacio. La primera imagen será la principal.
                </p>
                <div className="space-y-2">
                    {urls.map((url, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <div className="flex-1">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => handleImageChange(e, index, isEdit)}
                                    placeholder={`https://ejemplo.com/imagen-${index + 1}.jpg`}
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                />
                            </div>
                            {urls.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeImageField(index, isEdit)}
                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Eliminar imagen"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            )}
                            {index === 0 && (
                                <span className="text-body-xs text-primary dark:text-primary-dark font-medium whitespace-nowrap">
                                    Principal
                                </span>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addImageField(isEdit)}
                        className="text-body-sm text-primary dark:text-primary-dark hover:underline flex items-center gap-1 mt-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Agregar otra imagen
                    </button>
                </div>
                {urls[0] && urls[0].trim() !== '' && (
                    <div className="mt-3 p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg border border-outline-variant dark:border-outline-dark-variant">
                        <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant mb-2">Previsualización:</p>
                        <img
                            src={urls[0]}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-outline-variant"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/128x128?text=Error+al+cargar+imagen';
                                e.target.alt = 'Error al cargar imagen';
                            }}
                        />
                    </div>
                )}
            </div>
        );
    };

    // ========== RENDERIZAR SELECTOR DE AMENIDADES ==========
    const renderAmenitySelector = (isEdit = false) => {
        if (allAmenities.length === 0) {
            return (
                <div className="p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg border border-outline-variant dark:border-outline-dark-variant text-center">
                    <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        No hay amenidades disponibles.{' '}
                        <Link to="/admin/amenities" className="text-primary dark:text-primary-dark hover:underline">
                            Crear una amenidad
                        </Link>
                    </p>
                </div>
            );
        }

        const selectedAmenities = isEdit ? (editFormData.amenities || []) : (createFormData.amenities || []);

        return (
            <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-2">
                    Amenidades
                    <span className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant ml-2">
                        (Selecciona las que ofrece este espacio)
                    </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-surface-container-low dark:bg-surface-dark-container-low rounded-lg border border-outline-variant dark:border-outline-dark-variant max-h-48 overflow-y-auto">
                    {allAmenities.map(amenity => (
                        <label
                            key={amenity.id}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${selectedAmenities.includes(amenity.id)
                                ? 'bg-primary/10 dark:bg-primary-dark/10 border border-primary dark:border-primary-dark'
                                : 'hover:bg-surface-container-high dark:hover:bg-surface-dark-container-high border border-transparent'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedAmenities.includes(amenity.id)}
                                onChange={() => handleAmenityToggle(amenity.id, isEdit)}
                                className="w-4 h-4 accent-primary dark:accent-primary-dark"
                            />
                            {amenity.icon && (
                                <span className="material-symbols-outlined text-sm text-primary dark:text-primary-dark">
                                    {amenity.icon}
                                </span>
                            )}
                            <span className="text-body-sm text-on-surface dark:text-on-dark-surface truncate">
                                {amenity.name}
                            </span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                        {selectedAmenities.length} amenidades seleccionadas
                    </span>
                    <Link to="/admin/amenities" className="text-body-xs text-primary dark:text-primary-dark hover:underline">
                        Gestionar amenidades →
                    </Link>
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
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant text-center">Implementado</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSpaces.map((space, index) => (
                                <tr
                                    key={`${space.id}-${space.isAvailable}-${space.isActive}-${space.isFeatured}`}
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
                                    <td className="py-3 px-3">
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => handleToggleFeatured(space.id, space.isFeatured)}
                                                className={`flex flex-col items-center group transition-transform hover:scale-110 ${!space.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={!space.isActive ? 'No se puede cambiar destacado de un espacio inactivo' : (space.isFeatured ? 'Quitar destacado' : 'Marcar como destacado')}
                                                disabled={!space.isActive}
                                            >
                                                {space.isFeatured ? (
                                                    <span className="text-yellow-500 text-2xl">
                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                        </svg>
                                                    </span>
                                                ) : (
                                                    <span className={space.isActive ? 'text-gray-300 dark:text-gray-600 text-2xl' : 'text-gray-400 dark:text-gray-700 text-2xl'}>
                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                            <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
                                                        </svg>
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-on-surface-variant/60 hidden group-hover:block">
                                                    {space.isFeatured ? 'Destacado' : 'No destacado'}
                                                    {!space.isActive && ' (inactivo)'}
                                                </span>
                                            </button>

                                            <button
                                                onClick={() => handleToggleAvailability(space.id, space.isAvailable)}
                                                className={`flex flex-col items-center group transition-transform hover:scale-110 ${!space.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={!space.isActive ? 'No se puede cambiar disponibilidad de un espacio inactivo' : (space.isAvailable ? 'Marcar como no disponible' : 'Marcar como disponible')}
                                                disabled={!space.isActive}
                                            >
                                                {space.isAvailable && space.isActive ? (
                                                    <span className="text-emerald-500 text-2xl">
                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                        </svg>
                                                    </span>
                                                ) : (
                                                    <span className={space.isActive ? 'text-red-400 text-2xl' : 'text-gray-400 dark:text-gray-700 text-2xl'}>
                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                                        </svg>
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-on-surface-variant/60 hidden group-hover:block">
                                                    {space.isAvailable && space.isActive ? 'Disponible' : space.isActive ? 'No disponible' : 'Inactivo'}
                                                </span>
                                            </button>

                                            <button
                                                onClick={() => handleToggleActive(space.id, space.isActive)}
                                                className="flex flex-col items-center group transition-transform hover:scale-110"
                                                title={space.isActive ? 'Desactivar espacio (desmarcará destacado y disponible)' : 'Activar espacio'}
                                            >
                                                {space.isActive ? (
                                                    <span className="text-blue-500 text-2xl">
                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                        </svg>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-700 text-2xl">
                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-14v8l5.25 3.15L17 12.2l-3.5-2.1V6h-3.5z" />
                                                        </svg>
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-on-surface-variant/60 hidden group-hover:block">
                                                    {space.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="flex flex-wrap gap-1">
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
                                Crear Nuevo Espacio
                            </h3>
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

                            {/* ✅ CAMPO DE AMENIDADES - CREACIÓN */}
                            {renderAmenitySelector(false)}

                            {/* ✅ CAMPO DE IMÁGENES - CREACIÓN */}
                            {renderImageFields(createFormData.imageUrls, false)}

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

                            {/* ✅ CAMPO DE AMENIDADES - EDICIÓN */}
                            {renderAmenitySelector(true)}

                            {/* ✅ CAMPO DE IMÁGENES - EDICIÓN */}
                            {renderImageFields(editFormData.imageUrls, true)}

                            {/* ✅ CHECKBOXES: Disponible, Destacado y ACTIVO */}
                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={editFormData.isAvailable}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 accent-emerald-600"
                                        disabled={!editFormData.isActive}
                                    />
                                    <label className={`text-body-sm ${!editFormData.isActive ? 'text-on-surface-variant/50' : 'text-on-surface'}`}>
                                        Disponible
                                    </label>
                                    {!editFormData.isActive && (
                                        <span className="text-body-xs text-on-surface-variant/50">(inactivo)</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={editFormData.isFeatured}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 accent-yellow-500"
                                        disabled={!editFormData.isActive}
                                    />
                                    <label className={`text-body-sm ${!editFormData.isActive ? 'text-on-surface-variant/50' : 'text-on-surface'}`}>
                                        Destacado
                                    </label>
                                    {!editFormData.isActive && (
                                        <span className="text-body-xs text-on-surface-variant/50">(inactivo)</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={editFormData.isActive}
                                        onChange={handleEditChange}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <label className="text-body-sm text-on-surface">
                                        Activo
                                    </label>
                                </div>
                            </div>

                            {/* ✅ Mensaje informativo sobre la desactivación */}
                            {editFormData.isActive === false && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-body-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        El espacio está inactivo. Al activarlo, los campos "Disponible" y "Destacado" se mantendrán como están.
                                    </p>
                                </div>
                            )}

                            {/* ✅ Mensaje informativo sobre activación */}
                            {editFormData.isActive === true && editFormData.isAvailable === false && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-body-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        El espacio está activo pero no disponible. Puedes marcarlo como disponible en cualquier momento.
                                    </p>
                                </div>
                            )}

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
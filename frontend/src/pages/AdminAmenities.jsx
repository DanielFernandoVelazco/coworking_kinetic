// frontend/src/pages/AdminAmenities.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import amenitiesService from '../api/amenities.service';
import AmenityModal from '../components/admin/AmenityModal';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

const AdminAmenities = () => {
    const { user, isAuthenticated } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [amenities, setAmenities] = useState([]);
    const [filteredAmenities, setFilteredAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

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

    // Cargar amenidades
    const loadAmenities = useCallback(async () => {
        setLoading(true);
        try {
            const data = await amenitiesService.getAll();
            setAmenities(data || []);
            setFilteredAmenities(data || []);
        } catch (error) {
            console.error('Error loading amenities:', error);
            toast.error('Error al cargar las amenidades');
            setAmenities([]);
            setFilteredAmenities([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAmenities();
    }, [loadAmenities]);

    // Aplicar filtros
    useEffect(() => {
        if (amenities.length === 0) {
            setFilteredAmenities([]);
            setTotalItems(0);
            setTotalPages(1);
            return;
        }

        let filtered = [...amenities];

        // Búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(searchLower) ||
                (a.description && a.description.toLowerCase().includes(searchLower))
            );
        }

        // Filtro por estado
        if (filterStatus !== 'all') {
            filtered = filtered.filter(a =>
                filterStatus === 'active' ? a.isActive :
                    filterStatus === 'inactive' ? !a.isActive : true
            );
        }

        setFilteredAmenities(filtered);
        setTotalItems(filtered.length);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
        setCurrentPage(1);
    }, [amenities, searchTerm, filterStatus]);

    // Obtener amenidades paginadas
    const paginatedAmenities = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        return filteredAmenities.slice(startIndex, endIndex);
    }, [filteredAmenities, currentPage]);

    // Cambiar página
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setCurrentPage(1);
    };

    // Abrir modal de creación
    const handleCreateClick = () => {
        setEditingAmenity(null);
        setIsEditing(false);
        setShowModal(true);
    };

    // Abrir modal de edición
    const handleEditClick = (amenity) => {
        setEditingAmenity(amenity);
        setIsEditing(true);
        setShowModal(true);
    };

    // Guardar amenidad (crear o actualizar)
    const handleSaveAmenity = async (formData) => {
        setSaving(true);
        try {
            if (isEditing && editingAmenity) {
                await amenitiesService.update(editingAmenity.id, formData);
                toast.success('✅ Amenidad actualizada exitosamente');
            } else {
                await amenitiesService.create(formData);
                toast.success('✅ Amenidad creada exitosamente');
            }
            await loadAmenities();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving amenity:', error);
            throw error;
        } finally {
            setSaving(false);
        }
    };

    // Eliminar amenidad
    const handleDeleteAmenity = async () => {
        if (!showDeleteModal) return;

        setDeleting(true);
        try {
            await amenitiesService.delete(showDeleteModal);
            toast.success('✅ Amenidad eliminada exitosamente');
            setShowDeleteModal(null);
            await loadAmenities();
        } catch (error) {
            console.error('Error deleting amenity:', error);
            const message = error.response?.data?.message || 'Error al eliminar la amenidad';
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    // Toggle estado de amenidad
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await amenitiesService.toggleStatus(id);
            toast.success(`Amenidad ${currentStatus ? 'desactivada' : 'activada'}`);
            await loadAmenities();
        } catch (error) {
            console.error('Error toggling amenity status:', error);
            toast.error(error.response?.data?.message || 'Error al cambiar estado');
        }
    };

    // Calcular estadísticas
    const stats = useMemo(() => {
        return {
            total: amenities.length,
            active: amenities.filter(a => a.isActive).length,
            inactive: amenities.filter(a => !a.isActive).length
        };
    }, [amenities]);

    const getStatusBadge = (isActive) => {
        return isActive
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    };

    const getStatusText = (isActive) => {
        return isActive ? 'Activo' : 'Inactivo';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl">grid_view</span>
                        Amenidades
                    </h1>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        Gestiona las amenidades disponibles para los espacios
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
                        Crear Amenidad
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-primary dark:text-primary-dark">{stats.total}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Total</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-emerald-600">{stats.active}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Activas</div>
                </div>
                <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300">
                    <div className="font-headline-md text-red-600">{stats.inactive}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Inactivas</div>
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
                            placeholder="Buscar amenidad..."
                            className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                        />
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
                            <option value="active">Activas</option>
                            <option value="inactive">Inactivas</option>
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
                    Mostrando {paginatedAmenities.length} de {totalItems} amenidades
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto"></div>
                    <p className="text-on-surface-variant dark:text-on-dark-surface-variant mt-4">Cargando amenidades...</p>
                </div>
            ) : paginatedAmenities.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl border border-outline-variant dark:border-outline-dark-variant transition-colors duration-300">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant dark:text-on-dark-surface-variant mb-4 block">grid_view</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">No hay amenidades</h3>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        {searchTerm || filterStatus !== 'all'
                            ? 'No hay amenidades que coincidan con los filtros seleccionados'
                            : 'No hay amenidades registradas en el sistema'}
                    </p>
                    <button
                        onClick={handleCreateClick}
                        className="mt-4 px-6 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors"
                    >
                        Crear primera amenidad
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant dark:border-outline-dark-variant">
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Nombre</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Icono</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Descripción</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Espacios</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Estado</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Creada</th>
                                <th className="text-left py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAmenities.map((amenity, index) => (
                                <tr
                                    key={amenity.id}
                                    className={`border-b border-outline-variant dark:border-outline-dark-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors ${index % 2 === 0 ? 'bg-surface-container-lowest dark:bg-surface-dark-container-lowest' : ''}`}
                                >
                                    <td className="py-3 px-3">
                                        <div className="text-body-sm font-medium text-on-surface dark:text-on-dark-surface">
                                            {amenity.name}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        {amenity.icon ? (
                                            <span className="material-symbols-outlined text-2xl text-primary dark:text-primary-dark">
                                                {amenity.icon}
                                            </span>
                                        ) : (
                                            <span className="text-body-xs text-on-surface-variant/50">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant max-w-xs truncate">
                                        {amenity.description || '-'}
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface dark:text-on-dark-surface text-center">
                                        {amenity.spacesCount || 0}
                                    </td>
                                    <td className="py-3 px-3">
                                        <button
                                            onClick={() => handleToggleStatus(amenity.id, amenity.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${getStatusBadge(amenity.isActive)}`}
                                        >
                                            {getStatusText(amenity.isActive)}
                                        </button>
                                    </td>
                                    <td className="py-3 px-3 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                                        {formatDate(amenity.createdAt)}
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                onClick={() => handleEditClick(amenity)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteModal(amenity.id)}
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
                        Mostrando {Math.min(currentPage * PAGE_SIZE, totalItems)} de {totalItems} amenidades
                    </div>
                </div>
            )}

            {/* Modal de Creación/Edición */}
            <AmenityModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveAmenity}
                amenity={editingAmenity}
                isEditing={isEditing}
            />

            {/* Modal de Eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(null)}>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Eliminar Amenidad
                        </h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-4">
                            ¿Estás seguro de que quieres eliminar esta amenidad? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAmenity}
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

export default AdminAmenities;
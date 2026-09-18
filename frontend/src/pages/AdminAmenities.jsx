// frontend/src/pages/AdminAmenities.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import amenitiesService from '../api/amenities.service';
import AmenityModal from '../components/admin/AmenityModal';
import AdminHeader from '../components/admin/AdminHeader';
import AdminStatsCards from '../components/admin/AdminStatsCards';
import AdminPagination from '../components/admin/AdminPagination';
import AdminEmptyState from '../components/admin/AdminEmptyState';
import DeleteConfirmModal from '../components/admin/DeleteConfirmModal';
import AdminTable from '../components/admin/AdminTable';
import toast from 'react-hot-toast';
import { formatDateShort as formatDate } from '../utils/dateFormatter';

const PAGE_SIZE = 15;

const AdminAmenities = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [amenities, setAmenities] = useState([]);
    const [filteredAmenities, setFilteredAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);

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

    useEffect(() => {
        if (amenities.length === 0) {
            setFilteredAmenities([]);
            setTotalItems(0);
            setTotalPages(1);
            return;
        }

        let filtered = [...amenities];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    a.name.toLowerCase().includes(searchLower) ||
                    (a.description && a.description.toLowerCase().includes(searchLower))
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter((a) =>
                filterStatus === 'active' ? a.isActive : !a.isActive
            );
        }

        setFilteredAmenities(filtered);
        setTotalItems(filtered.length);
        setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
        setCurrentPage(1);
    }, [amenities, searchTerm, filterStatus]);

    const paginatedAmenities = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredAmenities.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredAmenities, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setCurrentPage(1);
    };

    const handleCreateClick = () => {
        setEditingAmenity(null);
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditClick = (amenity) => {
        setEditingAmenity(amenity);
        setIsEditing(true);
        setShowModal(true);
    };

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
            toast.error(error.response?.data?.message || 'Error al eliminar la amenidad');
        } finally {
            setDeleting(false);
        }
    };

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

    const stats = useMemo(
        () => [
            { label: 'Total', value: amenities.length },
            { label: 'Activas', value: amenities.filter((a) => a.isActive).length, color: 'text-emerald-600' },
            { label: 'Inactivas', value: amenities.filter((a) => !a.isActive).length, color: 'text-red-600' },
        ],
        [amenities]
    );

    const getStatusBadge = (isActive) =>
        isActive
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';

    if (!user?.isAdmin) return null;

    const columns = [
        { key: 'name', label: 'Nombre' },
        { key: 'icon', label: 'Icono' },
        { key: 'description', label: 'Descripción' },
        { key: 'spaces', label: 'Espacios' },
        { key: 'status', label: 'Estado' },
        { key: 'created', label: 'Creada' },
        { key: 'actions', label: 'Acciones' },
    ];

    const renderRow = (amenity) => (
        <>
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${getStatusBadge(
                        amenity.isActive
                    )}`}
                >
                    {amenity.isActive ? 'Activo' : 'Inactivo'}
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
        </>
    );

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 transition-colors duration-300">
            <AdminHeader
                icon="grid_view"
                title="Amenidades"
                subtitle="Gestiona las amenidades disponibles para los espacios"
                onClearFilters={clearFilters}
            >
                <button
                    onClick={handleCreateClick}
                    className="px-4 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Crear Amenidad
                </button>
            </AdminHeader>

            <AdminStatsCards items={stats} gridCols="grid-cols-3" />

            {/* Filters */}
            <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant mb-6 transition-colors duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="flex justify-between items-center mb-4 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                <span>
                    Mostrando {paginatedAmenities.length} de {totalItems} amenidades
                </span>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mx-auto"></div>
                    <p className="text-on-surface-variant dark:text-on-dark-surface-variant mt-4">
                        Cargando amenidades...
                    </p>
                </div>
            ) : paginatedAmenities.length === 0 ? (
                <AdminEmptyState
                    icon="grid_view"
                    title="No hay amenidades"
                    description={
                        searchTerm || filterStatus !== 'all'
                            ? 'No hay amenidades que coincidan con los filtros seleccionados'
                            : 'No hay amenidades registradas en el sistema'
                    }
                    action={
                        <button
                            onClick={handleCreateClick}
                            className="px-6 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors"
                        >
                            Crear primera amenidad
                        </button>
                    }
                />
            ) : (
                <AdminTable columns={columns} rows={paginatedAmenities} renderRow={renderRow} />
            )}

            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
                itemLabel="amenidades"
            />

            {/* Modal de Creación/Edición */}
            <AmenityModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveAmenity}
                amenity={editingAmenity}
                isEditing={isEditing}
            />

            {/* Modal de Eliminación */}
            <DeleteConfirmModal
                isOpen={!!showDeleteModal}
                onClose={() => setShowDeleteModal(null)}
                onConfirm={handleDeleteAmenity}
                title="Eliminar Amenidad"
                description="¿Estás seguro de que quieres eliminar esta amenidad? Esta acción no se puede deshacer."
                loading={deleting}
            />
        </div>
    );
};

export default AdminAmenities;
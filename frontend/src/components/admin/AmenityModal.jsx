// frontend/src/components/admin/AmenityModal.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AmenityModal = ({ isOpen, onClose, onSave, amenity, isEditing }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (amenity && isEditing) {
            setFormData({
                name: amenity.name || '',
                description: amenity.description || '',
                icon: amenity.icon || '',
                isActive: amenity.isActive !== undefined ? amenity.isActive : true
            });
        } else {
            setFormData({
                name: '',
                description: '',
                icon: '',
                isActive: true
            });
        }
    }, [amenity, isEditing, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('El nombre de la amenidad es obligatorio');
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving amenity:', error);
            toast.error(error.response?.data?.message || 'Error al guardar la amenidad');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark">
                            {isEditing ? 'edit' : 'add'}
                        </span>
                        {isEditing ? 'Editar Amenidad' : 'Crear Amenidad'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej: WiFi, Aire Acondicionado"
                                className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Descripción opcional de la amenidad..."
                                className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none resize-y"
                            />
                        </div>

                        <div>
                            <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                Icono (Material Icon)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleChange}
                                    placeholder="Ej: wifi, ac_unit, local_cafe"
                                    className="flex-1 bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                                />
                                {formData.icon && (
                                    <div className="p-2 bg-surface-container-low rounded-lg border border-outline-variant">
                                        <span className="material-symbols-outlined text-2xl text-primary">
                                            {formData.icon}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant mt-1">
                                <a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Ver iconos disponibles
                                </a>
                            </p>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 accent-emerald-600"
                            />
                            <label className="text-body-sm text-on-surface dark:text-on-dark-surface">
                                Activo
                            </label>
                            <span className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant ml-2">
                                (Las amenidades inactivas no aparecerán en el selector de espacios)
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-4 border-t border-outline-variant dark:border-outline-dark-variant">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary dark:bg-primary-dark text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    {isEditing ? 'Actualizar' : 'Crear'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AmenityModal;
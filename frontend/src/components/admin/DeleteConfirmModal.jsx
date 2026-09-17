// frontend/src/components/admin/DeleteConfirmModal.jsx
import React from 'react';

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Eliminar',
    description = '¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.',
    confirmText = 'Sí, Eliminar',
    loading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl max-w-md w-full p-6 shadow-xl transition-colors duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                    {title}
                </h3>
                <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-4">
                    {description}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Eliminando...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
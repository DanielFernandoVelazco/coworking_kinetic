// frontend/src/components/admin/AdminPagination.jsx
import React from 'react';

const AdminPagination = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    itemLabel = 'items',
}) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) pages.push(i);
        } else if (currentPage >= totalPages - 2) {
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t border-outline-variant dark:border-outline-dark-variant">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-on-surface dark:text-on-dark-surface"
                >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    Anterior
                </button>

                <div className="flex gap-1">
                    {getVisiblePages().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum
                                    ? 'bg-primary dark:bg-primary-dark text-white'
                                    : 'hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low text-on-surface dark:text-on-dark-surface'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-on-surface dark:text-on-dark-surface"
                >
                    Siguiente
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>

            <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                Mostrando {Math.min(currentPage * pageSize, totalItems)} de {totalItems} {itemLabel}
            </div>
        </div>
    );
};

export default AdminPagination;
// frontend/src/components/admin/AdminHeader.jsx
import React from 'react';

const AdminHeader = ({ icon, title, subtitle, onClearFilters, children }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl">
                        {icon}
                    </span>
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="flex gap-2">
                {onClearFilters && (
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors flex items-center gap-2 text-on-surface dark:text-on-dark-surface"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Limpiar Filtros
                    </button>
                )}
                {children}
            </div>
        </div>
    );
};

export default AdminHeader;
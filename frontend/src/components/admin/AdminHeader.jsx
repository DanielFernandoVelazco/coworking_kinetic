// frontend/src/components/admin/AdminHeader.jsx
import React from 'react';
import Button from '../ui/Button';

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
                    <Button variant="outline" onClick={onClearFilters} icon="refresh">
                        Limpiar Filtros
                    </Button>
                )}
                {children}
            </div>
        </div>
    );
};

export default AdminHeader;
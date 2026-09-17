// frontend/src/components/admin/AdminEmptyState.jsx
import React from 'react';

const AdminEmptyState = ({ icon = 'inbox', title, description, action }) => {
    return (
        <div className="text-center py-20 bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl border border-outline-variant dark:border-outline-dark-variant transition-colors duration-300">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant dark:text-on-dark-surface-variant mb-4 block">
                {icon}
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default AdminEmptyState;
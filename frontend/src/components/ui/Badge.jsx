// frontend/src/components/ui/Badge.jsx
import React from 'react';

const Badge = ({ className = '', icon, children }) => {
    return (
        <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${className}`}
        >
            {icon && (
                <span className="material-symbols-outlined text-sm">{icon}</span>
            )}
            {children}
        </span>
    );
};

export default Badge;
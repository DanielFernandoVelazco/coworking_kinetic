// frontend/src/components/admin/AdminStatsCards.jsx
import React from 'react';

/**
 * Grid de tarjetas de estadísticas.
 * @param {Array} items - [{ label, value, color }]
 * @param {string} gridCols - clases de grid (default: dinámico según cantidad)
 */
const AdminStatsCards = ({ items = [], gridCols }) => {
    if (!items.length) return null;

    const cols = gridCols || `grid-cols-2 md:grid-cols-${Math.min(items.length, 5)}`;

    return (
        <div className={`grid ${cols} gap-4 mb-6`}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-4 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center transition-colors duration-300"
                >
                    <div className={`font-headline-md ${item.color || 'text-primary dark:text-primary-dark'}`}>
                        {item.value}
                    </div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminStatsCards;
// frontend/src/components/admin/AdminTable.jsx
import React from 'react';

/**
 * Tabla genérica de admin.
 * @param {Array} columns - [{ key, label, align?, render? }]
 * @param {Array} rows - Array de datos
 * @param {function} renderRow - (row, index) => JSX de las celdas
 * @param {string} keyField - Campo a usar como key (default: 'id')
 */
const AdminTable = ({ columns = [], rows = [], renderRow, keyField = 'id' }) => {
    if (!rows.length) return null;

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-outline-variant dark:border-outline-dark-variant">
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={`py-3 px-3 font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                                    }`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr
                            key={row[keyField]}
                            className={`border-b border-outline-variant dark:border-outline-dark-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors ${index % 2 === 0
                                    ? 'bg-surface-container-lowest dark:bg-surface-dark-container-lowest'
                                    : ''
                                }`}
                        >
                            {renderRow(row, index)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTable;
// frontend/src/hooks/useFilters.js
import { useState, useCallback } from 'react';

/**
 * Hook para manejar un objeto de filtros.
 * @param {object} initialFilters - Filtros iniciales
 */
export const useFilters = (initialFilters = {}) => {
    const [filters, setFilters] = useState(initialFilters);

    const updateFilter = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    return {
        filters,
        updateFilter,
        resetFilters,
        setFilters,
    };
};

export default useFilters;
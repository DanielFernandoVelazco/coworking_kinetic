// frontend/src/hooks/usePagination.js
import { useState, useMemo, useCallback } from 'react';

/**
 * Hook para manejar la paginación de una lista en el cliente.
 * @param {Array} items - Lista completa de items
 * @param {number} pageSize - Cuántos items por página
 */
export const usePagination = (items = [], pageSize = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Página actual acotada
    const safePage = Math.min(currentPage, totalPages);

    const paginatedItems = useMemo(() => {
        const startIndex = (safePage - 1) * pageSize;
        return items.slice(startIndex, startIndex + pageSize);
    }, [items, safePage, pageSize]);

    const goToPage = useCallback((page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [totalPages]);

    const reset = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        currentPage: safePage,
        totalPages,
        totalItems,
        pageSize,
        paginatedItems,
        goToPage,
        reset,
    };
};

export default usePagination;
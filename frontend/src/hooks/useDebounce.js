// frontend/src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Retrasa el valor proporcionado hasta que deje de cambiar por `delay` ms.
 * Útil para inputs de búsqueda.
 * @param {any} value - Valor a debouncear
 * @param {number} delay - Milisegundos de espera (default: 300)
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
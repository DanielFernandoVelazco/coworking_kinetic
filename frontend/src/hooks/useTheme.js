// frontend/src/hooks/useTheme.js
import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

// ✅ Exportación nombrada
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// ✅ Exportación por defecto (opcional, pero consistente)
export default useTheme;
// frontend/src/hooks/useTheme.js
import { useTheme } from '../context/ThemeContext';

export const useTheme = () => {
    const context = useTheme();
    return context;
};

export default useTheme;
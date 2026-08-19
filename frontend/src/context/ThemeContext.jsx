// frontend/src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Leer tema guardado en localStorage o usar 'light' por defecto
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        // Verificar preferencia del sistema si no hay tema guardado
        if (!savedTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return prefersDark ? 'dark' : 'light';
        }
        return savedTheme;
    });

    const [mounted, setMounted] = useState(false);

    // Aplicar tema al DOM
    useEffect(() => {
        setMounted(true);
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    // Escuchar cambios en preferencia del sistema
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            // Solo cambiar si el usuario no ha seleccionado manualmente un tema
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setLight = () => setTheme('light');
    const setDark = () => setTheme('dark');

    // Evitar flicker durante el montaje
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            toggleTheme,
            setLight,
            setDark,
            isDark: theme === 'dark',
            isLight: theme === 'light'
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
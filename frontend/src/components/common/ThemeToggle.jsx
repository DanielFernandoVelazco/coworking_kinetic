// frontend/src/components/common/ThemeToggle.jsx
import React, { useState, useEffect } from 'react';
// ✅ IMPORTAR CORRECTAMENTE
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (isExpanded) {
            const timer = setTimeout(() => {
                setIsExpanded(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);

    const handleClick = () => {
        toggleTheme();
        setIsExpanded(true);

        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    };

    const getIcon = () => {
        if (isDark) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 transition-transform duration-500 hover:rotate-90"
                >
                    <path
                        fillRule="evenodd"
                        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.687.75.75 0 01.663.957 9.75 9.75 0 01-9.125 7.73A9.75 9.75 0 019.528 1.718z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        }
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 transition-transform duration-500 hover:rotate-90"
            >
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {isExpanded && (
                <div className="bg-surface-container-high dark:bg-surface-dark-container-high px-4 py-2 rounded-lg shadow-lg border border-outline-variant dark:border-outline-dark-variant animate-fadeInUp text-sm text-on-surface dark:text-on-dark-surface">
                    {isDark ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado'}
                </div>
            )}

            <button
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    relative w-14 h-14 rounded-full 
                    flex items-center justify-center
                    transition-all duration-300 ease-in-out
                    shadow-lg hover:shadow-xl
                    border-2 border-transparent
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    dark:focus:ring-offset-dark-surface
                    ${isDark
                        ? 'bg-[#1e1e1e] text-yellow-400 border-yellow-400/30 hover:border-yellow-400'
                        : 'bg-white text-primary border-primary/30 hover:border-primary'
                    }
                    ${isHovered ? 'scale-110' : 'scale-100'}
                `}
                aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
                <span className={`
                    absolute inset-0 rounded-full
                    transition-opacity duration-300
                    ${isDark
                        ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20'
                        : 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20'
                    }
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `} />

                <span className={`
                    relative z-10
                    ${isHovered ? 'rotate-12' : 'rotate-0'}
                `}>
                    {getIcon()}
                </span>

                <span className={`
                    absolute -top-1 -right-1 w-4 h-4 rounded-full
                    border-2 border-white dark:border-[#1e1e1e]
                    transition-colors duration-300
                    ${isDark ? 'bg-indigo-500' : 'bg-yellow-500'}
                `} />
            </button>

            <span className={`
                text-xs font-medium px-3 py-1 rounded-full
                bg-white dark:bg-[#1e1e1e]
                text-on-surface-variant dark:text-on-dark-surface-variant
                border border-outline-variant dark:border-outline-dark-variant
                transition-all duration-300
                ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
            `}>
                {isDark ? '🔆 Modo claro' : '🌙 Modo oscuro'}
            </span>
        </div>
    );
};

// Estilos de animación
const styles = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fadeInUp {
        animation: fadeInUp 0.3s ease-out;
    }
`;

if (!document.getElementById('theme-toggle-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'theme-toggle-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

export default ThemeToggle;
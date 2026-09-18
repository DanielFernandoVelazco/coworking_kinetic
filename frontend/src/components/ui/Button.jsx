// frontend/src/components/ui/Button.jsx
import React from 'react';

const VARIANTS = {
    primary:
        'bg-primary dark:bg-primary-dark text-white hover:bg-secondary transition-colors',
    secondary:
        'border border-outline-variant dark:border-outline-dark-variant text-on-surface dark:text-on-dark-surface hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors',
    outline:
        'border border-outline-variant dark:border-outline-dark-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors text-on-surface dark:text-on-dark-surface',
    danger:
        'bg-red-600 text-white hover:bg-red-700 transition-colors',
    ghost:
        'text-on-surface-variant dark:text-on-dark-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors',
};

const SIZES = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2',
    xl: 'px-6 py-3',
};

const Button = ({
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon = null,
    iconRight = null,
    className = '',
    children,
    ...props
}) => {
    const variantClasses = VARIANTS[variant] || VARIANTS.primary;
    const sizeClasses = SIZES[size] || SIZES.md;

    return (
        <button
            disabled={disabled || loading}
            className={`rounded-lg flex items-center justify-center gap-2 font-medium ${variantClasses} ${sizeClasses} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
                } ${className}`}
            {...props}
        >
            {loading ? (
                <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {children}
                </>
            ) : (
                <>
                    {icon && (
                        <span className="material-symbols-outlined text-sm">{icon}</span>
                    )}
                    {children}
                    {iconRight && (
                        <span className="material-symbols-outlined text-sm">{iconRight}</span>
                    )}
                </>
            )}
        </button>
    );
};

export default Button;
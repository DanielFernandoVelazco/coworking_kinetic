// frontend/src/components/ui/Modal.jsx
import React, { useEffect } from 'react';

const SIZE_CLASSES = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
};

const Modal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    size = 'lg',
    maxHeight = '90vh',
    closeOnOverlayClick = true,
    hideCloseButton = false,
    children,
    footer,
}) => {
    // Cerrar con ESC
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose?.();
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.lg;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeOnOverlayClick ? onClose : undefined}
        >
            <div
                className={`bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl w-full shadow-xl transition-colors duration-300 overflow-hidden flex flex-col`}
                style={{ maxWidth: undefined, maxHeight }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || !hideCloseButton) && (
                    <div className="flex justify-between items-center p-6 pb-4 border-b border-outline-variant dark:border-outline-dark-variant flex-shrink-0">
                        <div>
                            {title && (
                                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface flex items-center gap-2">
                                    {icon && (
                                        <span className="material-symbols-outlined text-primary dark:text-primary-dark">
                                            {icon}
                                        </span>
                                    )}
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {!hideCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow">
                    {children}
                </div>

                {/* Footer opcional */}
                {footer && (
                    <div className="p-6 pt-4 border-t border-outline-variant dark:border-outline-dark-variant flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
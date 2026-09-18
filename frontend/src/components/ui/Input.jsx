// frontend/src/components/ui/Input.jsx
import React, { forwardRef } from 'react';

const Input = forwardRef(
    (
        {
            label,
            error,
            helperText,
            variant = 'underline', // 'underline' | 'boxed'
            className = '',
            required = false,
            ...props
        },
        ref
    ) => {
        const variantClasses =
            variant === 'boxed'
                ? 'w-full bg-surface-container-low dark:bg-surface-dark-container-low border border-outline-variant dark:border-outline-dark-variant rounded-lg px-3 py-2 text-on-surface dark:text-on-dark-surface focus:border-primary dark:focus:border-primary-dark focus:outline-none transition-all'
                : 'w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none';

        return (
            <div className={className}>
                {label && (
                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input ref={ref} className={variantClasses} {...props} />
                {error && <p className="text-body-xs text-red-600 mt-1">{error}</p>}
                {helperText && !error && (
                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant mt-1">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
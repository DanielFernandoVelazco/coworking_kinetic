// frontend/src/components/ui/Select.jsx
import React, { forwardRef } from 'react';

const Select = forwardRef(
    ({ label, required = false, className = '', children, ...props }, ref) => {
        return (
            <div className={className}>
                {label && (
                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface transition-all focus:border-primary dark:focus:border-primary-dark focus:outline-none"
                    {...props}
                >
                    {children}
                </select>
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
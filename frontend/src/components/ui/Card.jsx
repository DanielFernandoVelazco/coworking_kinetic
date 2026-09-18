// frontend/src/components/ui/Card.jsx
import React from 'react';

const Card = ({ className = '', variant = 'default', children, ...props }) => {
    const variantClasses = {
        default:
            'bg-surface-container-lowest dark:bg-surface-dark-container-lowest border border-outline-variant dark:border-outline-dark-variant rounded-xl transition-colors duration-300',
        subtle:
            'bg-surface-container-low dark:bg-surface-dark-container-low border border-outline-variant dark:border-outline-dark-variant rounded-xl transition-colors duration-300',
        flat:
            'bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-xl transition-colors duration-300',
    };

    return (
        <div className={`${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </div>
    );
};

export default Card;
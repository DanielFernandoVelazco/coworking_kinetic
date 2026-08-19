// frontend/src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';

const Footer = () => {
    const { isDark } = useTheme();

    return (
        <footer className="bg-surface-container-low dark:bg-surface-dark-container-low w-full py-12 border-t border-outline-variant dark:border-outline-dark-variant">
            <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto space-y-4 md:space-y-0">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">
                        KINETIC WORKSPACE
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        © 2024 Kinetic Workspace. All rights reserved.
                    </span>
                </div>
                <div className="flex gap-8 flex-wrap justify-center">
                    <Link to="/about" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant hover:text-secondary dark:hover:text-secondary-dark transition-all duration-300 hover:underline decoration-2">
                        About
                    </Link>
                    <Link to="/privacy" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant hover:text-secondary dark:hover:text-secondary-dark transition-all duration-300 hover:underline decoration-2">
                        Privacy Policy
                    </Link>
                    <Link to="/terms" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant hover:text-secondary dark:hover:text-secondary-dark transition-all duration-300 hover:underline decoration-2">
                        Terms of Service
                    </Link>
                    <Link to="/help" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant hover:text-secondary dark:hover:text-secondary-dark transition-all duration-300 hover:underline decoration-2">
                        Help Center
                    </Link>
                    <Link to="/contact" className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant hover:text-secondary dark:hover:text-secondary-dark transition-all duration-300 hover:underline decoration-2">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-surface-container-low w-full py-12 border-t border-outline-variant">
            <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto space-y-4 md:space-y-0">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                        KINETIC WORKSPACE
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                        © 2024 Kinetic Workspace. All rights reserved.
                    </span>
                </div>
                <div className="flex gap-8">
                    <Link to="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-all duration-300 hover:underline decoration-2">
                        About
                    </Link>
                    <Link to="/privacy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-all duration-300 hover:underline decoration-2">
                        Privacy Policy
                    </Link>
                    <Link to="/terms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-all duration-300 hover:underline decoration-2">
                        Terms of Service
                    </Link>
                    <Link to="/help" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-all duration-300 hover:underline decoration-2">
                        Help Center
                    </Link>
                    <Link to="/contact" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-all duration-300 hover:underline decoration-2">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
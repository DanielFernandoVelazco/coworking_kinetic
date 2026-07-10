import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center">
                <h1 className="font-display-xl text-display-xl text-primary mb-4">404</h1>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Page Not Found</h2>
                <p className="text-on-surface-variant mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="btn-primary inline-block">
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
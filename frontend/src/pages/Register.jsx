import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant p-10">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create Account</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                    Join the Kinetic Workspace community
                </p>
                <div className="text-center py-8 text-on-surface-variant">
                    Registration form coming soon...
                </div>
                <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
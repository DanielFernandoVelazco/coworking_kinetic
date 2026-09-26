// frontend/src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-16 transition-colors duration-300">
            {/* Hero */}
            <div className="text-center mb-16">
                <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-3">
                    About Kinetic Workspace
                </h1>
                <p className="text-body-lg text-on-surface-variant dark:text-on-dark-surface-variant max-w-2xl mx-auto">
                    Redefining how professionals work across Sweden.
                </p>
            </div>

            {/* Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-4">
                        Our Mission
                    </h2>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-4 leading-relaxed">
                        Kinetic Workspace was founded with a simple belief: great work happens in great
                        environments. We provide premium, flexible workspaces designed to inspire
                        productivity, foster collaboration, and elevate the professional experience.
                    </p>
                    <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant leading-relaxed">
                        From private offices and creative studios to quiet focus pods, our curated spaces
                        are engineered for the modern professional.
                    </p>
                </div>
                <div className="rounded-xl overflow-hidden border border-outline-variant dark:border-outline-dark-variant h-80 bg-surface-container-low dark:bg-surface-dark-container-low">
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
                        alt="Kinetic Workspace"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Values */}
            <div className="mb-20">
                <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface text-center mb-10">
                    Our Values
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant">
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl mb-3 block">
                            verified
                        </span>
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Quality First
                        </h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                            Every space is rigorously vetted and equipped with premium amenities.
                        </p>
                    </div>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant">
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl mb-3 block">
                            diversity_3
                        </span>
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Community
                        </h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                            We build environments where connections thrive and ideas flourish.
                        </p>
                    </div>
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant">
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl mb-3 block">
                            bolt
                        </span>
                        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                            Simplicity
                        </h3>
                        <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                            Booking, payments, and access — all streamlined for you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 text-center">
                <div>
                    <div className="font-headline-lg text-primary dark:text-primary-dark">75+</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">
                        Premium Spaces
                    </div>
                </div>
                <div>
                    <div className="font-headline-lg text-primary dark:text-primary-dark">10</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">
                        Cities
                    </div>
                </div>
                <div>
                    <div className="font-headline-lg text-primary dark:text-primary-dark">5K+</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">
                        Members
                    </div>
                </div>
                <div>
                    <div className="font-headline-lg text-primary dark:text-primary-dark">4.8★</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant">
                        Average Rating
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="text-center">
                <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-4">
                    Ready to get started?
                </h2>
                <Link
                    to="/register"
                    className="inline-block px-8 py-4 bg-primary dark:bg-primary-dark text-white rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-primary transition-colors"
                >
                    Create Free Account
                </Link>
            </div>
        </div>
    );
};

export default About;
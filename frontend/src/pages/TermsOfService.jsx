// frontend/src/pages/TermsOfService.jsx
import React from 'react';

const TermsOfService = () => {
    const lastUpdated = 'February 2024';

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-10 py-16 transition-colors duration-300">
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-2">
                Terms of Service
            </h1>
            <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant mb-8">
                Last updated: {lastUpdated}
            </p>

            <div className="space-y-8 text-body-md text-on-surface-variant dark:text-on-dark-surface-variant leading-relaxed">
                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        1. Acceptance of Terms
                    </h2>
                    <p>
                        By accessing or using Kinetic Workspace, you agree to be bound by these Terms of
                        Service. If you do not agree, please do not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        2. Account Responsibilities
                    </h2>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>You must provide accurate and complete information</li>
                        <li>You are responsible for maintaining the confidentiality of your password</li>
                        <li>You must notify us immediately of any unauthorized access</li>
                        <li>You must be at least 18 years old to use our services</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        3. Booking and Cancellation
                    </h2>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Bookings are subject to availability</li>
                        <li>Pre-reservations expire after 30 minutes if unpaid</li>
                        <li>Cancellations must be made at least 24 hours before the start time</li>
                        <li>Refunds are processed according to our refund policy</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        4. Prohibited Conduct
                    </h2>
                    <p className="mb-3">You agree not to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Use our services for any unlawful purpose</li>
                        <li>Interfere with or disrupt our infrastructure</li>
                        <li>Attempt to gain unauthorized access to any systems</li>
                        <li>Resell or sublicense our services without permission</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        5. Limitation of Liability
                    </h2>
                    <p>
                        Kinetic Workspace is not liable for any indirect, incidental, or consequential
                        damages arising from your use of our services, to the maximum extent permitted by law.
                    </p>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        6. Changes to Terms
                    </h2>
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of our
                        services after changes constitutes acceptance of the new terms.
                    </p>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        7. Contact
                    </h2>
                    <p>
                        For questions about these Terms, contact{' '}
                        <a href="mailto:legal@kineticworkspace.com" className="text-primary dark:text-primary-dark hover:underline">
                            legal@kineticworkspace.com
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
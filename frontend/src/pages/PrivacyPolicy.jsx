// frontend/src/pages/PrivacyPolicy.jsx
import React from 'react';

const PrivacyPolicy = () => {
    const lastUpdated = 'February 2024';

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-10 py-16 transition-colors duration-300">
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-2">
                Privacy Policy
            </h1>
            <p className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant mb-8">
                Last updated: {lastUpdated}
            </p>

            <div className="space-y-8 text-body-md text-on-surface-variant dark:text-on-dark-surface-variant leading-relaxed">
                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        1. Introduction
                    </h2>
                    <p>
                        Kinetic Workspace AB ("we", "our", "us") is committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your
                        information when you use our platform.
                    </p>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        2. Information We Collect
                    </h2>
                    <p className="mb-3">We may collect the following types of information:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Personal identification: name, email, phone number</li>
                        <li>Professional data: company, job title</li>
                        <li>Booking history and preferences</li>
                        <li>Payment information (processed by third-party providers)</li>
                        <li>Usage data: IP address, browser type, device information</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        3. How We Use Your Information
                    </h2>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>To process bookings and payments</li>
                        <li>To provide customer support</li>
                        <li>To send confirmations and account notifications</li>
                        <li>To improve our services</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        4. Data Security
                    </h2>
                    <p>
                        We implement industry-standard security measures, including AES-256 encryption
                        for data at rest and TLS 1.3 for data in transit. Passwords are hashed using
                        bcrypt and never stored in plaintext.
                    </p>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        5. Your Rights (GDPR)
                    </h2>
                    <p className="mb-3">Under GDPR, you have the right to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your data</li>
                        <li>Object to processing</li>
                        <li>Request data portability</li>
                    </ul>
                </section>

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-3">
                        6. Contact Us
                    </h2>
                    <p>
                        For privacy-related inquiries, contact us at{' '}
                        <a href="mailto:privacy@kineticworkspace.com" className="text-primary dark:text-primary-dark hover:underline">
                            privacy@kineticworkspace.com
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
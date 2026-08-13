// frontend/src/components/profile/ProfileSecurity.jsx
import React from 'react';

const ProfileSecurity = () => {
    return (
        <div className="space-y-6">
            <h3 className="font-headline-md text-headline-md">Security & Privacy Policy</h3>

            <div className="space-y-6">
                {/* Data Protection */}
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">security</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">Data Protection</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                Your personal data is encrypted and stored securely. We use industry-standard encryption
                                protocols (AES-256) to protect your information. All data transmissions are secured with TLS 1.3.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Collection */}
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">database</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">Data Collection</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                We collect the following information to provide you with our services:
                            </p>
                            <ul className="list-disc list-inside text-body-sm text-on-surface-variant mt-2 space-y-1">
                                <li>Name, email, and contact information</li>
                                <li>Company and job title (optional)</li>
                                <li>Reservation history and preferences</li>
                                <li>Payment information (processed securely via third-party providers)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Data Usage */}
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">assignment</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">How We Use Your Data</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                Your data is used for:
                            </p>
                            <ul className="list-disc list-inside text-body-sm text-on-surface-variant mt-2 space-y-1">
                                <li>Processing your reservations and payments</li>
                                <li>Providing customer support</li>
                                <li>Sending booking confirmations and updates</li>
                                <li>Improving our services and user experience</li>
                                <li>Legal compliance and fraud prevention</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Data Sharing */}
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">share</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">Data Sharing</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                We do not sell or share your personal data with third parties except as necessary to:
                            </p>
                            <ul className="list-disc list-inside text-body-sm text-on-surface-variant mt-2 space-y-1">
                                <li>Process payments through our secure payment partners</li>
                                <li>Comply with legal obligations</li>
                                <li>Protect our rights and prevent fraud</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Your Rights */}
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">gavel</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">Your Rights</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                Under GDPR, you have the right to:
                            </p>
                            <ul className="list-disc list-inside text-body-sm text-on-surface-variant mt-2 space-y-1">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate information</li>
                                <li>Request deletion of your data</li>
                                <li>Object to processing of your data</li>
                                <li>Request data portability</li>
                            </ul>
                            <p className="text-body-sm text-on-surface-variant mt-2">
                                To exercise any of these rights, please contact us at <strong>privacy@kineticworkspace.com</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Measures */}
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">lock</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">Security Measures</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                We implement multiple layers of security:
                            </p>
                            <ul className="list-disc list-inside text-body-sm text-on-surface-variant mt-2 space-y-1">
                                <li>End-to-end encryption for all data</li>
                                <li>Two-factor authentication (coming soon)</li>
                                <li>Regular security audits and updates</li>
                                <li>Secure password storage with bcrypt hashing</li>
                                <li>Session management and automatic logout</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Update Date */}
                <div className="text-center text-body-xs text-on-surface-variant pt-4 border-t border-outline-variant">
                    Last updated: February 2024
                </div>
            </div>
        </div>
    );
};

export default ProfileSecurity;
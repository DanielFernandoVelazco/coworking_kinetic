// frontend/src/components/profile/ProfileContact.jsx
import React from 'react';

const ProfileContact = () => {
    return (
        <div className="space-y-6">
            <h3 className="font-headline-md text-headline-md">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Headquarters */}
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">business</span>
                        <h4 className="font-body-lg font-semibold text-on-surface">Headquarters</h4>
                    </div>
                    <div className="space-y-2 text-body-sm text-on-surface-variant">
                        <p>Kinetic Workspace AB</p>
                        <p>Sturegatan 22</p>
                        <p>114 36 Stockholm</p>
                        <p>Sweden</p>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">contact_page</span>
                        <h4 className="font-body-lg font-semibold text-on-surface">Contact Details</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-sm">email</span>
                            <div>
                                <p className="text-body-sm font-medium text-on-surface">Email</p>
                                <p className="text-body-sm text-on-surface-variant">support@kineticworkspace.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-sm">phone</span>
                            <div>
                                <p className="text-body-sm font-medium text-on-surface">Phone</p>
                                <p className="text-body-sm text-on-surface-variant">+46 8 123 4567</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                            <div>
                                <p className="text-body-sm font-medium text-on-surface">Business Hours</p>
                                <p className="text-body-sm text-on-surface-variant">Monday - Friday: 8:00 AM - 8:00 PM</p>
                                <p className="text-body-sm text-on-surface-variant">Saturday - Sunday: 10:00 AM - 6:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Locations */}
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">location_city</span>
                        <h4 className="font-body-lg font-semibold text-on-surface">Our Locations</h4>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-body-sm font-medium text-on-surface">Stockholm</p>
                            <p className="text-body-sm text-on-surface-variant">Sturegatan 22, 114 36</p>
                        </div>
                        <div>
                            <p className="text-body-sm font-medium text-on-surface">Gothenburg</p>
                            <p className="text-body-sm text-on-surface-variant">Kungsportsavenyn 15, 411 36</p>
                        </div>
                        <div>
                            <p className="text-body-sm font-medium text-on-surface">Malmö</p>
                            <p className="text-body-sm text-on-surface-variant">Stortorget 8, 211 34</p>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">share</span>
                        <h4 className="font-body-lg font-semibold text-on-surface">Connect With Us</h4>
                    </div>
                    <div className="space-y-3">
                        <a href="#" className="flex items-center gap-3 p-2 hover:bg-surface-container-lowest rounded-lg transition-colors">
                            <span className="text-primary text-2xl">📘</span>
                            <span className="text-body-sm text-on-surface">Facebook</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-2 hover:bg-surface-container-lowest rounded-lg transition-colors">
                            <span className="text-primary text-2xl">📱</span>
                            <span className="text-body-sm text-on-surface">Instagram</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-2 hover:bg-surface-container-lowest rounded-lg transition-colors">
                            <span className="text-primary text-2xl">🔗</span>
                            <span className="text-body-sm text-on-surface">LinkedIn</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-2 hover:bg-surface-container-lowest rounded-lg transition-colors">
                            <span className="text-primary text-2xl">📺</span>
                            <span className="text-body-sm text-on-surface">YouTube</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileContact;
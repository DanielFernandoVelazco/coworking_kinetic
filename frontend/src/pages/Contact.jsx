// frontend/src/pages/Contact.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            // TODO: conectar con backend real cuando exista el endpoint
            await new Promise((resolve) => setTimeout(resolve, 1200));
            toast.success('Message sent! We\'ll respond within 24 hours.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error('Error sending message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-16 transition-colors duration-300">
            {/* Hero */}
            <div className="text-center mb-12">
                <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-3">
                    Contact Us
                </h1>
                <p className="text-body-lg text-on-surface-variant dark:text-on-dark-surface-variant max-w-2xl mx-auto">
                    Have a question or need assistance? We're here to help.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2">
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant dark:border-outline-dark-variant">
                        <h2 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-6">
                            Send us a message
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface focus:border-primary dark:focus:border-primary-dark focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface focus:border-primary dark:focus:border-primary-dark focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface focus:border-primary dark:focus:border-primary-dark focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-dark-surface-variant block mb-1">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    className="w-full bg-surface-container-low dark:bg-surface-dark-container-low border-b border-outline-variant dark:border-outline-dark-variant px-0 py-2 text-on-surface dark:text-on-dark-surface focus:border-primary dark:focus:border-primary-dark focus:outline-none transition-all resize-y"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full md:w-auto px-6 py-3 bg-primary dark:bg-primary-dark text-white rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-6">
                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary dark:text-primary-dark text-3xl">
                                business
                            </span>
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface">
                                Headquarters
                            </h3>
                        </div>
                        <div className="space-y-2 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                            <p>Kinetic Workspace AB</p>
                            <p>Sturegatan 22</p>
                            <p>114 36 Stockholm</p>
                            <p>Sweden</p>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary dark:text-primary-dark text-3xl">
                                contact_page
                            </span>
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface">
                                Contact Details
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark text-sm mt-0.5">
                                    email
                                </span>
                                <div>
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                        Email
                                    </p>
                                    <a href="mailto:support@kineticworkspace.com" className="text-body-sm text-on-surface dark:text-on-dark-surface hover:text-primary dark:hover:text-primary-dark transition-colors">
                                        support@kineticworkspace.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark text-sm mt-0.5">
                                    phone
                                </span>
                                <div>
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                        Phone
                                    </p>
                                    <a href="tel:+4681234567" className="text-body-sm text-on-surface dark:text-on-dark-surface hover:text-primary dark:hover:text-primary-dark transition-colors">
                                        +46 8 123 4567
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary dark:text-primary-dark text-sm mt-0.5">
                                    schedule
                                </span>
                                <div>
                                    <p className="text-body-xs text-on-surface-variant dark:text-on-dark-surface-variant">
                                        Business Hours
                                    </p>
                                    <p className="text-body-sm text-on-surface dark:text-on-dark-surface">
                                        Mon-Fri: 8:00 - 20:00
                                    </p>
                                    <p className="text-body-sm text-on-surface dark:text-on-dark-surface">
                                        Sat-Sun: 10:00 - 18:00
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary dark:text-primary-dark text-3xl">
                                location_city
                            </span>
                            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface">
                                Locations
                            </h3>
                        </div>
                        <div className="space-y-3 text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                            <div>
                                <p className="font-medium text-on-surface dark:text-on-dark-surface">Stockholm</p>
                                <p>Sturegatan 22, 114 36</p>
                            </div>
                            <div>
                                <p className="font-medium text-on-surface dark:text-on-dark-surface">Gothenburg</p>
                                <p>Kungsportsavenyn 15, 411 36</p>
                            </div>
                            <div>
                                <p className="font-medium text-on-surface dark:text-on-dark-surface">Malmö</p>
                                <p>Stortorget 8, 211 34</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
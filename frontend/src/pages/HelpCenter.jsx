// frontend/src/pages/HelpCenter.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
    {
        category: 'Booking',
        items: [
            {
                q: 'How do I book a space?',
                a: 'Browse our catalog, select a space, choose your date and time, and confirm your booking. You\'ll receive a confirmation email instantly.'
            },
            {
                q: 'How do I cancel a booking?',
                a: 'Go to your reservations page, find the booking you want to cancel, and click the "Cancel" button. Cancellations must be made at least 24 hours before the start time.'
            },
            {
                q: 'Can I modify an existing booking?',
                a: 'Yes, you can modify upcoming bookings from your reservations page. Changes are subject to availability.'
            }
        ]
    },
    {
        category: 'Payment',
        items: [
            {
                q: 'What payment methods are accepted?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely.'
            },
            {
                q: 'When will I be charged?',
                a: 'Payments are processed immediately upon confirmation of your booking.'
            },
            {
                q: 'How do refunds work?',
                a: 'Refunds are issued to the original payment method within 5-7 business days after approval.'
            }
        ]
    },
    {
        category: 'Account',
        items: [
            {
                q: 'How do I reset my password?',
                a: 'On the login page, click "Forgot?" and follow the instructions sent to your email.'
            },
            {
                q: 'How do I update my profile?',
                a: 'Go to your profile page and click on "Settings" to update your personal information.'
            }
        ]
    }
];

const HelpCenter = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (key) => {
        setOpenIndex(openIndex === key ? null : key);
    };

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-10 py-16 transition-colors duration-300">
            {/* Hero */}
            <div className="text-center mb-12">
                <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface mb-3">
                    Help Center
                </h1>
                <p className="text-body-lg text-on-surface-variant dark:text-on-dark-surface-variant max-w-2xl mx-auto">
                    Find answers to common questions or contact our support team.
                </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Link
                    to="/profile"
                    className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                    <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl mb-2 block">
                        person
                    </span>
                    <div className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-1">
                        My Account
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        Manage your profile and settings
                    </div>
                </Link>

                <Link
                    to="/reservations"
                    className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                    <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl mb-2 block">
                        event
                    </span>
                    <div className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-1">
                        My Bookings
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        View and manage your reservations
                    </div>
                </Link>

                <Link
                    to="/contact"
                    className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest p-6 rounded-xl border border-outline-variant dark:border-outline-dark-variant text-center hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                    <span className="material-symbols-outlined text-primary dark:text-primary-dark text-4xl mb-2 block">
                        contact_support
                    </span>
                    <div className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-1">
                        Contact Support
                    </div>
                    <div className="text-body-sm text-on-surface-variant dark:text-on-dark-surface-variant">
                        Get in touch with our team
                    </div>
                </Link>
            </div>

            {/* FAQs */}
            <div className="max-w-3xl mx-auto">
                <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-dark-surface text-center mb-8">
                    Frequently Asked Questions
                </h2>

                {FAQS.map((group, gi) => (
                    <div key={gi} className="mb-8">
                        <h3 className="font-headline-md text-headline-md text-primary dark:text-primary-dark mb-4">
                            {group.category}
                        </h3>
                        <div className="space-y-2">
                            {group.items.map((faq, fi) => {
                                const key = `${gi}-${fi}`;
                                const isOpen = openIndex === key;
                                return (
                                    <div
                                        key={key}
                                        className="bg-surface-container-lowest dark:bg-surface-dark-container-lowest rounded-lg border border-outline-variant dark:border-outline-dark-variant overflow-hidden transition-colors"
                                    >
                                        <button
                                            onClick={() => toggle(key)}
                                            className="w-full flex justify-between items-center gap-4 p-4 text-left hover:bg-surface-container-low dark:hover:bg-surface-dark-container-low transition-colors"
                                        >
                                            <span className="font-body-md font-semibold text-on-surface dark:text-on-dark-surface">
                                                {faq.q}
                                            </span>
                                            <span className={`material-symbols-outlined text-primary dark:text-primary-dark transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="px-4 pb-4 text-body-md text-on-surface-variant dark:text-on-dark-surface-variant">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Still need help */}
            <div className="mt-16 text-center p-8 bg-surface-container-low dark:bg-surface-dark-container-low rounded-xl border border-outline-variant dark:border-outline-dark-variant">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-dark-surface mb-2">
                    Still need help?
                </h3>
                <p className="text-body-md text-on-surface-variant dark:text-on-dark-surface-variant mb-4">
                    Our support team is here to assist you.
                </p>
                <Link
                    to="/contact"
                    className="inline-block px-6 py-3 bg-primary dark:bg-primary-dark text-white rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-primary transition-colors"
                >
                    Contact Support
                </Link>
            </div>
        </div>
    );
};

export default HelpCenter;
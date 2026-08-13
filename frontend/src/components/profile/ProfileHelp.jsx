// frontend/src/components/profile/ProfileHelp.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ProfileHelp = () => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'general',
        message: '',
        priority: 'normal'
    });
    const [sending, setSending] = useState(false);

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'booking', label: 'Booking Issue' },
        { value: 'payment', label: 'Payment Problem' },
        { value: 'account', label: 'Account Issue' },
        { value: 'technical', label: 'Technical Problem' },
        { value: 'feedback', label: 'Feedback or Suggestion' }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            // Simular envío de email
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('Your message has been sent successfully! We will respond within 24 hours.');
            setFormData({
                subject: '',
                category: 'general',
                message: '',
                priority: 'normal'
            });
        } catch (error) {
            toast.error('Error sending your message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-8">
            <h3 className="font-headline-md text-headline-md">Help & Support</h3>

            {/* FAQ Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">help</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">How do I book a space?</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                Browse our catalog, select a space, choose your date and time, and confirm your booking.
                                You'll receive a confirmation email instantly.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">help</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">How do I cancel a booking?</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                Go to your reservations page, find the booking you want to cancel, and click the "Cancel"
                                button. You can cancel up to 24 hours before the start time.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">help</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">What payment methods are accepted?</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.
                                All payments are processed securely.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">help</span>
                        <div>
                            <h4 className="font-body-md font-semibold text-on-surface">How do I change my password?</h4>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                                Go to Settings in your profile, scroll down to the "Change Password" section,
                                enter your current password and new password, then click "Update Password".
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">contact_support</span>
                    <h4 className="font-body-lg font-semibold text-on-surface">Contact Support</h4>
                </div>
                <p className="text-body-sm text-on-surface-variant mb-4">
                    Having trouble? Send us a message and our support team will get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Subject
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            placeholder="Brief description of your issue"
                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Priority
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        >
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows="5"
                            placeholder="Describe your issue in detail..."
                            className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none resize-y"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sending}
                        className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                        {sending ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>

            {/* Quick Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                    <span className="material-symbols-outlined text-primary text-3xl block mb-2">email</span>
                    <p className="text-body-sm font-medium text-on-surface">Email Support</p>
                    <p className="text-body-sm text-on-surface-variant">support@kineticworkspace.com</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                    <span className="material-symbols-outlined text-primary text-3xl block mb-2">phone</span>
                    <p className="text-body-sm font-medium text-on-surface">Phone Support</p>
                    <p className="text-body-sm text-on-surface-variant">+46 8 123 4567</p>
                    <p className="text-body-xs text-on-surface-variant">Mon-Fri 8:00-20:00</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                    <span className="material-symbols-outlined text-primary text-3xl block mb-2">chat</span>
                    <p className="text-body-sm font-medium text-on-surface">Live Chat</p>
                    <p className="text-body-sm text-on-surface-variant">Available during business hours</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileHelp;
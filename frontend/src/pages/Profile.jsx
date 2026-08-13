// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileOverview from '../components/profile/ProfileOverview';
import ProfileSettings from '../components/profile/ProfileSettings';
import ProfileSecurity from '../components/profile/ProfileSecurity';
import ProfileContact from '../components/profile/ProfileContact';
import ProfileHelp from '../components/profile/ProfileHelp';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'dashboard' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
        { id: 'security', label: 'Security', icon: 'shield' },
        { id: 'contact', label: 'Contact', icon: 'contact_support' },
        { id: 'help', label: 'Help', icon: 'help' }
    ];

    return (
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">My Profile</h1>
                <p className="text-body-md text-on-surface-variant">Manage your account and view your reservation history</p>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-outline-variant mb-8">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-primary text-on-primary shadow-md'
                                    : 'hover:bg-surface-container-low text-on-surface-variant'
                                }`}
                        >
                            <span className="material-symbols-outlined text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
                {activeTab === 'overview' && <ProfileOverview />}
                {activeTab === 'settings' && <ProfileSettings />}
                {activeTab === 'security' && <ProfileSecurity />}
                {activeTab === 'contact' && <ProfileContact />}
                {activeTab === 'help' && <ProfileHelp />}
            </div>
        </div>
    );
};

export default Profile;
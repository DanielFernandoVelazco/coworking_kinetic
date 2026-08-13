// frontend/src/components/profile/ProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import usersService from '../../api/users.service';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        company: '',
        jobTitle: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await usersService.getProfile();
                setFormData({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    phoneNumber: profile.phoneNumber || '',
                    company: profile.company || '',
                    jobTitle: profile.jobTitle || ''
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Error al cargar el perfil');
            }
        };
        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await usersService.updateProfile(formData);
            toast.success('Perfil actualizado exitosamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar el perfil');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setSavingPassword(true);
        try {
            await usersService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Contraseña actualizada exitosamente');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || 'Error al cambiar la contraseña');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Personal Information */}
            <div>
                <h3 className="font-headline-md text-headline-md mb-4">Personal Information</h3>
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleProfileChange}
                                required
                                className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleProfileChange}
                                required
                                className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface opacity-60 cursor-not-allowed"
                        />
                        <p className="text-body-xs text-on-surface-variant mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleProfileChange}
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Company
                        </label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleProfileChange}
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Job Title
                        </label>
                        <input
                            type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleProfileChange}
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="pt-8 border-t border-outline-variant">
                <h3 className="font-headline-md text-headline-md mb-4">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={6}
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="px-6 py-2 bg-secondary text-on-primary rounded-lg hover:bg-secondary-dark transition-colors disabled:opacity-50"
                    >
                        {savingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
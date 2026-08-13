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
    const [showPasswordForm, setShowPasswordForm] = useState(false);

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
            setShowPasswordForm(false);
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || 'Error al cambiar la contraseña');
        } finally {
            setSavingPassword(false);
        }
    };

    const togglePasswordForm = () => {
        setShowPasswordForm(!showPasswordForm);
        if (!showPasswordForm) {
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Personal Information */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">person</span>
                    <h3 className="font-headline-md text-headline-md">Personal Information</h3>
                </div>
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
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="flex-1 bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface opacity-60 cursor-not-allowed"
                            />
                            <span className="text-body-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                                Verified
                            </span>
                        </div>
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
                            placeholder="+46 70 123 4567"
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
                            placeholder="Your Company"
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
                            placeholder="Software Engineer"
                            className="w-full bg-surface-container-low border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {savingProfile ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">save</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Change Password - Sección separada con botón dedicado */}
            <div className="pt-8 border-t border-outline-variant">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">lock</span>
                        <h3 className="font-headline-md text-headline-md">Change Password</h3>
                    </div>
                    <button
                        onClick={togglePasswordForm}
                        className="px-4 py-2 bg-secondary text-on-primary rounded-lg hover:bg-secondary-dark transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">
                            {showPasswordForm ? 'visibility_off' : 'visibility'}
                        </span>
                        {showPasswordForm ? 'Hide Form' : 'Change Password'}
                    </button>
                </div>

                {showPasswordForm && (
                    <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant animate-fadeIn">
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
                                    placeholder="Enter your current password"
                                    className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
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
                                    placeholder="Enter new password (min 6 characters)"
                                    className="w-full bg-surface-container-lowest border-b border-outline-variant px-0 py-2 text-on-surface transition-all focus:border-primary focus:outline-none"
                                />
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1 bg-surface-container-low rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{
                                                width: `${Math.min((passwordData.newPassword.length / 12) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-body-xs text-on-surface-variant">
                                        {passwordData.newPassword.length}/12+
                                    </span>
                                </div>
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
                                    placeholder="Confirm your new password"
                                    className={`w-full bg-surface-container-lowest border-b px-0 py-2 text-on-surface transition-all focus:outline-none ${passwordData.confirmPassword &&
                                            passwordData.newPassword !== passwordData.confirmPassword
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-outline-variant focus:border-primary'
                                        }`}
                                />
                                {passwordData.confirmPassword &&
                                    passwordData.newPassword !== passwordData.confirmPassword && (
                                        <p className="text-body-xs text-red-600 mt-1">
                                            Passwords do not match
                                        </p>
                                    )}
                                {passwordData.confirmPassword &&
                                    passwordData.newPassword === passwordData.confirmPassword && (
                                        <p className="text-body-xs text-emerald-600 mt-1">
                                            ✓ Passwords match
                                        </p>
                                    )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={savingPassword ||
                                        !passwordData.currentPassword ||
                                        !passwordData.newPassword ||
                                        passwordData.newPassword !== passwordData.confirmPassword}
                                    className="flex-1 px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {savingPassword ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Update Password
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={togglePasswordForm}
                                    className="px-6 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="text-body-xs text-on-surface-variant mt-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Password must be at least 6 characters long
                            </div>
                        </form>
                    </div>
                )}

                {/* Password Security Tips */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-start gap-2 p-3 bg-surface-container-low rounded-lg">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        <div>
                            <p className="text-body-xs font-medium text-on-surface">Use a strong password</p>
                            <p className="text-body-xs text-on-surface-variant">Mix uppercase, lowercase, numbers, and symbols</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-surface-container-low rounded-lg">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        <div>
                            <p className="text-body-xs font-medium text-on-surface">Don't reuse passwords</p>
                            <p className="text-body-xs text-on-surface-variant">Use a unique password for this account</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-surface-container-low rounded-lg">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        <div>
                            <p className="text-body-xs font-medium text-on-surface">Update regularly</p>
                            <p className="text-body-xs text-on-surface-variant">Change your password every 3-6 months</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
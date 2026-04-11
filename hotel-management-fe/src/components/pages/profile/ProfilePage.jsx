import { h } from 'preact';
import { useState } from 'preact/hooks';
import apiService from '../../../services/api';

const ProfilePage = ({ user }) => {
  const [formName, setFormName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      // Update name via /auth/updatedetails
      await apiService.updateProfile({ name: formName });

      // If a new password is provided, update it via /auth/updatepassword
      if (newPassword) {
        await apiService.updatePassword({
          currentPassword,
          newPassword,
        });
      }

      setSuccess('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-primary-800 opacity-70">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Avatar + user info */}
      <div className="card mb-6 flex flex-col sm:flex-row items-center gap-6 p-6">
        <div className="w-20 h-20 rounded-full bg-amber-600 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary-900">{user?.name}</h2>
          <p className="text-sm text-primary-800 opacity-70">{user?.email}</p>
          <span className="badge bg-amber-100 text-amber-800 border border-amber-200 mt-2 inline-block">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Staff'}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h3 className="text-base font-semibold text-primary-900 mb-4">Edit Profile</h3>
        <form onSubmit={handleSave}>
          {/* Name field */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-primary-800 mb-1">Name</label>
            <input
              type="text"
              value={formName}
              onInput={e => setFormName(e.target.value)}
              className="form-input w-full"
              placeholder="Your name"
            />
          </div>

          {/* Password change */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-primary-800 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onInput={e => setCurrentPassword(e.target.value)}
              className="form-input w-full"
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-primary-800 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onInput={e => setNewPassword(e.target.value)}
              className="form-input w-full"
              placeholder="New password (leave blank to keep current)"
              autoComplete="new-password"
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-primary-800 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onInput={e => setConfirmPassword(e.target.value)}
              className="form-input w-full"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>

          {/* Error / success messages */}
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {success && <p className="text-sm text-green-600 mb-3">{success}</p>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

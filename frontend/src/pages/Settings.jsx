import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { usersApi } from '../services/api';
import { User, Lock, Shield, Server, Check, Loader2 } from 'lucide-react';
import { getErrorMessage } from '../utils/helpers';

export default function Settings() {
  const { user, fetchMe } = useAuth();
  const { addToast } = useToastContext();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      addToast('Full name is required', 'warning');
      return;
    }

    setProfileLoading(true);
    try {
      await usersApi.update(user._id, {
        fullName: profileForm.fullName,
        phoneNumber: profileForm.phoneNumber,
      });
      await fetchMe();
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.password.length < 8) {
      addToast('New password must be at least 8 characters long', 'warning');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      addToast('Passwords do not match', 'warning');
      return;
    }

    setPasswordLoading(true);
    try {
      await usersApi.update(user._id, {
        password: passwordForm.password,
      });
      setPasswordForm({ password: '', confirmPassword: '' });
      addToast('Password changed successfully', 'success');
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Account Settings & Environment</h1>
          <p className="page-subtitle">Manage personal credentials, preferences, and system telemetry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="card p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-accent-600" />
            <h2 className="text-sm font-semibold text-slate-900">Personal Information</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="label">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input bg-slate-50 cursor-not-allowed text-slate-500 font-mono text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Email serves as your primary system identity and cannot be changed here.
              </p>
            </div>

            <div>
              <label className="label">Full Legal Name *</label>
              <input
                type="text"
                required
                className="input"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Contact Telephone</label>
              <input
                type="text"
                className="input"
                placeholder="+1-555-0100"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary w-full" disabled={profileLoading}>
                {profileLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Security Card */}
        <div className="card p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
            <Lock className="w-5 h-5 text-accent-600" />
            <h2 className="text-sm font-semibold text-slate-900">Security Credentials</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="label">New Secure Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="input"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Repeat password"
                className="input"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-[11px] text-slate-500">
              Passwords are salted and cryptographically hashed with <strong>bcryptjs</strong> (12
              rounds). Plaintext passwords are never saved.
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-secondary w-full" disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* System Telemetry & Info */}
      <div className="card p-6 shadow-sm bg-slate-50/50">
        <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-200">
          <Server className="w-4 h-4 text-slate-600" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            System & Deployment Specifications
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Role Tier</span>
            <span className="font-bold text-slate-800 uppercase tracking-wide">{user?.role}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Auth Strategy</span>
            <span className="font-medium text-slate-800">MongoStore Session</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Backend Runtime</span>
            <span className="font-medium text-slate-800">Node.js + Express (ESM)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Client Engine</span>
            <span className="font-medium text-slate-800">React + Vite + Tailwind</span>
          </div>
        </div>
      </div>
    </div>
  );
}

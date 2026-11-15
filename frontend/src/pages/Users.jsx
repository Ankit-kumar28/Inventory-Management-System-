import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { SearchInput } from '../components/common/SearchInput';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { PageLoader } from '../components/common/LoadingSpinner';
import { ROLES } from '../utils/constants';
import {
  Users as UsersIcon,
  Plus,
  Edit2,
  Power,
  Shield,
  Activity,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { formatDate, formatDateTime, getErrorMessage } from '../utils/helpers';

export default function Users() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToastContext();
  const { page, limit, goToPage, reset } = usePagination(15);

  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'

  // Users state
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Activity logs state
  const [logs, setLogs] = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [logsLoading, setLogsLoading] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: ROLES.STAFF,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ page, limit, search, role: roleFilter });
      setUsers(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, addToast]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await usersApi.getActivityLogs({ page: logPage, limit: 25 });
      setLogs(res.data.data);
      setLogTotal(res.data.pagination.total);
      setLogTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLogsLoading(false);
    }
  }, [logPage, addToast]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchLogs();
    }
  }, [activeTab, fetchUsers, fetchLogs]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: ROLES.STAFF,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      fullName: u.fullName,
      email: u.email,
      password: '',
      phoneNumber: u.phoneNumber || '',
      role: u.role,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      addToast('Name and valid email are required', 'warning');
      return;
    }
    if (!editingUser && (!formData.password || formData.password.length < 8)) {
      addToast('Password must be at least 8 characters long', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        const updatePayload = { ...formData };
        if (!updatePayload.password) delete updatePayload.password;
        await usersApi.update(editingUser._id, updatePayload);
        addToast('User details updated successfully', 'success');
      } else {
        await usersApi.create(formData);
        addToast('New user account provisioned successfully', 'success');
        reset();
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user._id === currentUser._id) {
      addToast('You cannot deactivate your own administrative account', 'warning');
      return;
    }

    try {
      const res = await usersApi.toggleStatus(user._id);
      addToast(res.data.message || 'Status updated', 'success');
      fetchUsers();
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management & Security</h1>
          <p className="page-subtitle">
            Manage user authorization, assign roles, and audit security events
          </p>
        </div>
        {activeTab === 'users' && (
          <button onClick={handleOpenAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            Provision New User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-accent-600 text-accent-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UsersIcon className="w-4 h-4" />
          Active Accounts ({total})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-accent-600 text-accent-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audit Trail & Security Logs
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <SearchInput
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  reset();
                }}
                placeholder="Search by name or email..."
                className="w-full sm:w-72"
              />

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  reset();
                }}
                className="input py-1.5 text-xs w-36"
              >
                <option value="">All Roles</option>
                <option value={ROLES.ADMIN}>Administrators</option>
                <option value={ROLES.STAFF}>Staff Members</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Registered Accounts: {total}
            </span>
          </div>

          {loading ? (
            <PageLoader text="Loading authorized users..." />
          ) : users.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="No users found"
              description="Create a user to grant staff or administrator privileges."
              action={
                <button onClick={handleOpenAdd} className="btn-primary mt-2">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              }
            />
          ) : (
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Identity</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Account Status</th>
                    <th>Enrolled</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf = u._id === currentUser._id;
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                              {u.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                {u.fullName}
                                {isSelf && (
                                  <span className="badge-blue text-[10px] py-0 px-1.5">You</span>
                                )}
                              </p>
                              <p className="text-slate-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={
                              u.role === ROLES.ADMIN
                                ? 'badge-blue font-semibold'
                                : 'badge-slate'
                            }
                          >
                            <Shield className="w-3 h-3 mr-1 inline" />
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-slate-600 text-xs">{u.phoneNumber || '—'}</td>
                        <td>
                          <span className={u.isActive ? 'badge-success' : 'badge-danger'}>
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="btn-ghost p-1.5 text-slate-500 hover:text-accent-600"
                              title="Edit User Profile"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isSelf}
                              className={`btn-ghost p-1.5 ${
                                u.isActive
                                  ? 'text-slate-500 hover:text-danger-600'
                                  : 'text-slate-500 hover:text-success-600'
                              } disabled:opacity-20`}
                              title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            total={total}
            limit={limit}
          />
        </div>
      ) : (
        /* Activity Logs View */
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              System Operations & Access Audit Trail
            </h3>
            <span className="text-xs text-slate-500">
              Total Logged Events: {logTotal}
            </span>
          </div>

          {logsLoading ? (
            <PageLoader text="Retrieving security audit trail..." />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No security events recorded"
              description="System activities like logins, mutations, and user updates will appear here."
            />
          ) : (
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Description</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="text-slate-500 text-xs font-mono">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td>
                        <span className="badge-slate font-mono text-[11px] font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="text-slate-600 text-xs">{log.entityType || '—'}</td>
                      <td className="text-slate-800 text-xs font-medium max-w-sm">
                        {log.description || '—'}
                      </td>
                      <td className="text-slate-600 text-xs">
                        {log.user ? (
                          <span>
                            {log.user.fullName}{' '}
                            <span className="text-slate-400">({log.user.email})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">System</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            page={logPage}
            totalPages={logTotalPages}
            onPageChange={setLogPage}
            total={logTotal}
            limit={25}
          />
        </div>
      )}

      {/* User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Modify User Profile' : 'Provision New System User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Jordan Miller"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                required
                className="input"
                placeholder="jordan@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                className="input"
                placeholder="+1-555-0155"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                {editingUser ? 'Reset Password (optional)' : 'Initial Password *'}
              </label>
              <input
                type="password"
                required={!editingUser}
                minLength={8}
                className="input"
                placeholder={editingUser ? 'Leave blank to keep current' : 'Min 8 characters'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="label">System Role *</label>
              <select
                required
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value={ROLES.STAFF}>Staff (Inventory Operations)</option>
                <option value={ROLES.ADMIN}>Administrator (Full Control)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : editingUser ? (
                'Save Changes'
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { suppliersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { SearchInput } from '../components/common/SearchInput';
import { Pagination } from '../components/common/Pagination';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { PageLoader } from '../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2, Truck, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { formatDate, getErrorMessage } from '../utils/helpers';

export default function Suppliers() {
  const { isAdmin } = useAuth();
  const { addToast } = useToastContext();
  const { page, limit, goToPage, reset } = usePagination(15);

  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    supplierName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, supplier: null, loading: false });

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await suppliersApi.getAll({ page, limit, search });
      setSuppliers(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, addToast]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      supplierName: '',
      contactPerson: '',
      email: '',
      phoneNumber: '',
      companyName: '',
      address: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      supplierName: sup.supplierName,
      contactPerson: sup.contactPerson || '',
      email: sup.email || '',
      phoneNumber: sup.phoneNumber || '',
      companyName: sup.companyName || '',
      address: sup.address || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      addToast('Supplier name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier._id, formData);
        addToast('Supplier updated successfully', 'success');
      } else {
        await suppliersApi.create(formData);
        addToast('Supplier registered successfully', 'success');
        reset();
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.supplier) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await suppliersApi.delete(deleteDialog.supplier._id);
      addToast('Supplier deactivated successfully', 'success');
      setDeleteDialog({ isOpen: false, supplier: null, loading: false });
      fetchSuppliers();
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Directory</h1>
          <p className="page-subtitle">Manage procurement vendors, contact info, and business terms</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              reset();
            }}
            placeholder="Search suppliers, contacts, or emails..."
            className="w-full sm:w-80"
          />
          <span className="text-xs text-slate-500 font-medium">
            Total Vendors: {total}
          </span>
        </div>

        {loading ? (
          <PageLoader text="Loading suppliers..." />
        ) : suppliers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No suppliers found"
            description="Add vendor records to facilitate stock-in receiving and order tracking."
            action={
              isAdmin && (
                <button onClick={handleOpenAdd} className="btn-primary mt-2">
                  <Plus className="w-4 h-4" />
                  Add First Supplier
                </button>
              )
            }
          />
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Vendor & Company</th>
                  <th>Primary Contact</th>
                  <th>Communication</th>
                  <th>Location</th>
                  <th>Status</th>
                  {isAdmin && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((sup) => (
                  <tr key={sup._id}>
                    <td>
                      <p className="font-semibold text-slate-900">{sup.supplierName}</p>
                      {sup.companyName && (
                        <p className="text-[11px] text-slate-500">{sup.companyName}</p>
                      )}
                    </td>
                    <td className="text-slate-700">{sup.contactPerson || '—'}</td>
                    <td>
                      <div className="space-y-0.5 text-xs text-slate-600">
                        {sup.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sup.email}</span>
                          </div>
                        )}
                        {sup.phoneNumber && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sup.phoneNumber}</span>
                          </div>
                        )}
                        {!sup.email && !sup.phoneNumber && '—'}
                      </div>
                    </td>
                    <td className="text-slate-600 text-xs max-w-xs truncate">
                      {sup.address ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{sup.address}</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className={sup.isActive ? 'badge-success' : 'badge-slate'}>
                        {sup.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(sup)}
                            className="btn-ghost p-1.5 text-slate-500 hover:text-accent-600"
                            title="Edit Supplier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                supplier: sup,
                                loading: false,
                              })
                            }
                            className="btn-ghost p-1.5 text-slate-500 hover:text-danger-600"
                            title="Deactivate Supplier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
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

      {/* Supplier Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Edit Vendor Details' : 'Register New Vendor'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Vendor Name *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Apex Wholesale"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Legal Company Name</label>
              <input
                type="text"
                className="input"
                placeholder="Apex Technologies LLC"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Contact Person</label>
              <input
                type="text"
                className="input"
                placeholder="Jane Doe"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="sales@apex.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                className="input"
                placeholder="+1-555-0199"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Physical Address</label>
            <textarea
              rows={2}
              className="input resize-none"
              placeholder="Suite, Street, City, State, ZIP..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
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
              ) : editingSupplier ? (
                'Save Changes'
              ) : (
                'Register Vendor'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, supplier: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Supplier"
        message={`Are you sure you want to deactivate "${deleteDialog.supplier?.supplierName}"? Historic transactions associated with this supplier will remain intact.`}
        confirmText="Deactivate"
        variant="danger"
        loading={deleteDialog.loading}
      />
    </div>
  );
}

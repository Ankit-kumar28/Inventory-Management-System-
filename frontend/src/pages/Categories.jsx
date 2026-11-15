import { useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { SearchInput } from '../components/common/SearchInput';
import { Pagination } from '../components/common/Pagination';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { PageLoader } from '../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2, Tags, Loader2 } from 'lucide-react';
import { formatDate, getErrorMessage } from '../utils/helpers';

export default function Categories() {
  const { isAdmin } = useAuth();
  const { addToast } = useToastContext();
  const { page, limit, goToPage, reset } = usePagination(15);

  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ categoryName: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, category: null, loading: false });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll({ page, limit, search });
      setCategories(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ categoryName: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName,
      description: category.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryName.trim()) {
      addToast('Category name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory._id, formData);
        addToast('Category updated successfully', 'success');
      } else {
        await categoriesApi.create(formData);
        addToast('Category created successfully', 'success');
        reset();
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await categoriesApi.delete(deleteDialog.category._id);
      addToast('Category deactivated successfully', 'success');
      setDeleteDialog({ isOpen: false, category: null, loading: false });
      fetchCategories();
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Organize and classify products across your catalog</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Category
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
            placeholder="Search categories..."
            className="w-full sm:w-72"
          />
          <span className="text-xs text-slate-500 font-medium">
            Total Classifications: {total}
          </span>
        </div>

        {loading ? (
          <PageLoader text="Loading categories..." />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No categories found"
            description="Start by adding a category to structure your product catalog."
            action={
              isAdmin && (
                <button onClick={handleOpenAdd} className="btn-primary mt-2">
                  <Plus className="w-4 h-4" />
                  Add First Category
                </button>
              )
            }
          />
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  {isAdmin && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td className="font-semibold text-slate-900">{cat.categoryName}</td>
                    <td className="text-slate-600 max-w-xs truncate">{cat.description || '—'}</td>
                    <td>
                      <span className={cat.isActive ? 'badge-success' : 'badge-slate'}>
                        {cat.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs">{formatDate(cat.createdAt)}</td>
                    {isAdmin && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="btn-ghost p-1.5 text-slate-500 hover:text-accent-600"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                category: cat,
                                loading: false,
                              })
                            }
                            className="btn-ghost p-1.5 text-slate-500 hover:text-danger-600"
                            title="Deactivate Category"
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

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category Name *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Industrial Tools"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              rows={3}
              className="input resize-none"
              placeholder="Brief details about what items belong to this category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              ) : editingCategory ? (
                'Save Changes'
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, category: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Category"
        message={`Are you sure you want to deactivate "${deleteDialog.category?.categoryName}"? Existing product references will be retained.`}
        confirmText="Deactivate"
        variant="danger"
        loading={deleteDialog.loading}
      />
    </div>
  );
}

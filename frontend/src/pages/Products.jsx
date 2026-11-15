import { useState, useEffect, useCallback } from 'react';
import { productsApi, categoriesApi, suppliersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { SearchInput } from '../components/common/SearchInput';
import { Pagination } from '../components/common/Pagination';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { PageLoader } from '../components/common/LoadingSpinner';
import { StockBadge } from '../components/common/StockBadge';
import { Plus, Edit2, Trash2, Package, Loader2, ArrowUpDown } from 'lucide-react';
import { formatCurrency, getErrorMessage } from '../utils/helpers';

export default function Products() {
  const { isAdmin } = useAuth();
  const { addToast } = useToastContext();
  const { page, limit, goToPage, reset } = usePagination(15);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Dropdown lists
  const [categoriesList, setCategoriesList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    description: '',
    category: '',
    supplier: '',
    purchasePrice: '',
    sellingPrice: '',
    minimumStockLevel: '0',
    unit: 'pcs',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    product: null,
    loading: false,
  });

  // Load categories and suppliers for dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catsRes, supsRes] = await Promise.all([
          categoriesApi.getAll({ limit: 100 }),
          suppliersApi.getAll({ limit: 100 }),
        ]);
        setCategoriesList(catsRes.data.data);
        setSuppliersList(supsRes.data.data);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll({
        page,
        limit,
        search,
        category: selectedCategory,
        supplier: selectedSupplier,
        stockStatus,
        sortBy,
        sortOrder,
      });
      setProducts(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    selectedCategory,
    selectedSupplier,
    stockStatus,
    sortBy,
    sortOrder,
    addToast,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      productName: '',
      sku: '',
      description: '',
      category: categoriesList[0]?._id || '',
      supplier: suppliersList[0]?._id || '',
      purchasePrice: '',
      sellingPrice: '',
      minimumStockLevel: '5',
      unit: 'pcs',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      productName: p.productName,
      sku: p.sku,
      description: p.description || '',
      category: p.category?._id || p.category || '',
      supplier: p.supplier?._id || p.supplier || '',
      purchasePrice: String(p.purchasePrice),
      sellingPrice: String(p.sellingPrice),
      minimumStockLevel: String(p.minimumStockLevel ?? 0),
      unit: p.unit || 'pcs',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.sku.trim()) {
      addToast('Product name and SKU are required', 'warning');
      return;
    }
    if (!formData.category || !formData.supplier) {
      addToast('Category and Supplier must be selected', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice || 0),
        sellingPrice: parseFloat(formData.sellingPrice || 0),
        minimumStockLevel: parseInt(formData.minimumStockLevel || 0),
      };

      if (editingProduct) {
        await productsApi.update(editingProduct._id, payload);
        addToast('Product updated successfully', 'success');
      } else {
        await productsApi.create(payload);
        addToast('Product created successfully', 'success');
        reset();
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const res = await productsApi.delete(deleteDialog.product._id);
      addToast(res.data.message || 'Product removed successfully', 'success');
      setDeleteDialog({ isOpen: false, product: null, loading: false });
      fetchProducts();
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Master records, pricing, classifications, and stock levels</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50/50">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              reset();
            }}
            placeholder="Search by SKU or name..."
            className="w-full"
          />

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              reset();
            }}
            className="input py-1.5 text-xs"
          >
            <option value="">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c._id} value={c._id}>
                {c.categoryName}
              </option>
            ))}
          </select>

          <select
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value);
              reset();
            }}
            className="input py-1.5 text-xs"
          >
            <option value="">All Suppliers</option>
            {suppliersList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.supplierName}
              </option>
            ))}
          </select>

          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              reset();
            }}
            className="input py-1.5 text-xs"
          >
            <option value="">All Stock Levels</option>
            <option value="low-stock">Low Stock Alerts</option>
            <option value="out-of-stock">Out of Stock Only</option>
          </select>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input py-1.5 text-xs flex-1"
            >
              <option value="productName">Sort: Name</option>
              <option value="quantity">Sort: Stock</option>
              <option value="sellingPrice">Sort: Price</option>
              <option value="createdAt">Sort: Created</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary p-2 shrink-0"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <PageLoader text="Loading products..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Adjust your search filters or add a new product to the catalog."
            action={
              isAdmin && (
                <button onClick={handleOpenAdd} className="btn-primary mt-2">
                  <Plus className="w-4 h-4" />
                  Add First Product
                </button>
              )
            }
          />
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th className="text-right">Unit Cost</th>
                  <th className="text-right">Selling Price</th>
                  <th>On-Hand</th>
                  <th>Status</th>
                  {isAdmin && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <p className="font-semibold text-slate-900">{p.productName}</p>
                      {p.description && (
                        <p className="text-[11px] text-slate-400 max-w-xs truncate">{p.description}</p>
                      )}
                    </td>
                    <td className="font-mono text-xs text-slate-600 font-semibold">{p.sku}</td>
                    <td className="text-slate-600 text-xs">{p.category?.categoryName || '—'}</td>
                    <td className="text-slate-600 text-xs">{p.supplier?.supplierName || '—'}</td>
                    <td className="text-right font-medium text-slate-700">
                      {formatCurrency(p.purchasePrice)}
                    </td>
                    <td className="text-right font-semibold text-slate-900">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="font-semibold text-slate-900">
                      {p.quantity} <span className="text-[11px] font-normal text-slate-400">{p.unit}</span>
                    </td>
                    <td>
                      <StockBadge
                        quantity={p.quantity}
                        minimumStockLevel={p.minimumStockLevel}
                      />
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="btn-ghost p-1.5 text-slate-500 hover:text-accent-600"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                product: p,
                                loading: false,
                              })
                            }
                            className="btn-ghost p-1.5 text-slate-500 hover:text-danger-600"
                            title="Delete / Archive Product"
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

      {/* Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Ergonomic Keyboard"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">SKU (Unique Code) *</label>
              <input
                type="text"
                required
                className="input uppercase font-mono"
                placeholder="ELEC-KB-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select
                required
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categoriesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Primary Supplier *</label>
              <select
                required
                className="input"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {suppliersList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Purchase Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="input"
                placeholder="45.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Selling Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="input"
                placeholder="89.99"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Min Stock Threshold</label>
              <input
                type="number"
                min="0"
                className="input"
                placeholder="5"
                value={formData.minimumStockLevel}
                onChange={(e) => setFormData({ ...formData, minimumStockLevel: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Unit of Measure</label>
              <input
                type="text"
                className="input"
                placeholder="pcs, boxes, kg"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="Technical specifications or model notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-[11px] text-slate-500">
            ℹ️ <strong>Stock quantities</strong> cannot be manually modified through product edits.
            All balance changes must be executed through official Stock-In or Stock-Out transactions
            to guarantee inventory auditability.
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
              ) : editingProduct ? (
                'Save Changes'
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, product: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Remove Product"
        message={`Are you sure you want to remove "${deleteDialog.product?.productName}"? If transaction history exists, the item will be securely archived to preserve inventory audit trails.`}
        confirmText="Remove"
        variant="danger"
        loading={deleteDialog.loading}
      />
    </div>
  );
}

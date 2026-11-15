import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionsApi, productsApi, suppliersApi } from '../services/api';
import { useToastContext } from '../context/ToastContext';
import { PageLoader } from '../components/common/LoadingSpinner';
import { ArrowDownToLine, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { formatCurrency, getErrorMessage } from '../utils/helpers';

export default function StockIn() {
  const navigate = useNavigate();
  const { addToast } = useToastContext();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '',
    quantity: '1',
    unitPrice: '',
    referenceNumber: '',
    notes: '',
  });

  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodRes, supRes] = await Promise.all([
          productsApi.getAll({ limit: 100 }),
          suppliersApi.getAll({ limit: 100 }),
        ]);
        setProducts(prodRes.data.data);
        setSuppliers(supRes.data.data);
      } catch (err) {
        addToast(getErrorMessage(err), 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [addToast]);

  const handleProductChange = (productId) => {
    const prod = products.find((p) => p._id === productId);
    setSelectedProduct(prod || null);
    setFormData((prev) => ({
      ...prev,
      productId,
      supplierId: prod?.supplier?._id || prod?.supplier || prev.supplierId,
      unitPrice: prod ? String(prod.purchasePrice) : prev.unitPrice,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId) {
      addToast('Please select a product', 'warning');
      return;
    }
    const qty = parseInt(formData.quantity, 10);
    if (!qty || qty < 1) {
      addToast('Received quantity must be at least 1', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await transactionsApi.stockIn({
        product: formData.productId,
        supplier: formData.supplierId || undefined,
        quantity: qty,
        unitPrice: parseFloat(formData.unitPrice || 0),
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
      });

      addToast('Stock receipt recorded successfully', 'success');
      setSuccessResult(res.data.data);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessResult(null);
    setSelectedProduct(null);
    setFormData({
      productId: '',
      supplierId: '',
      quantity: '1',
      unitPrice: '',
      referenceNumber: '',
      notes: '',
    });
  };

  if (loading) return <PageLoader text="Loading receipt catalog..." />;

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="card p-8 text-center shadow-lg border-success-200">
          <div className="w-14 h-14 rounded-full bg-success-50 text-success-600 flex items-center justify-center mx-auto mb-4 border border-success-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Stock Receipt Confirmed</h2>
          <p className="text-xs text-slate-500 mb-6">
            Inventory balance and permanent ledger transaction have been updated atomically.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2 mb-6 border border-slate-200 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Product:</span>
              <span className="font-semibold text-slate-800">
                {successResult.product?.productName} ({successResult.product?.sku})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantity Added:</span>
              <span className="font-semibold text-success-600">
                +{successResult.transaction?.quantity} {successResult.product?.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">New Available Balance:</span>
              <span className="font-bold text-slate-900">
                {successResult.product?.quantity} {successResult.product?.unit}
              </span>
            </div>
            {successResult.transaction?.referenceNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="font-mono text-slate-700">
                  {successResult.transaction?.referenceNumber}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={handleReset} className="btn-primary">
              Receive More Stock
            </button>
            <button onClick={() => navigate('/transactions')} className="btn-secondary">
              View Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-success-600" />
            Stock-In Receiving
          </h1>
          <p className="page-subtitle">
            Log procurement arrivals, purchase orders, and inventory additions
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Selection */}
          <div>
            <label className="label">Select Received Product *</label>
            <select
              required
              className="input text-sm"
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              <option value="">-- Choose item from catalog --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} ({p.sku}) — Current Stock: {p.quantity} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Specs Preview */}
          {selectedProduct && (
            <div className="p-3.5 bg-accent-50/60 border border-accent-200/80 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-500">Current In-Stock:</span>{' '}
                <span className="font-bold text-slate-900">
                  {selectedProduct.quantity} {selectedProduct.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Standard Cost:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedProduct.purchasePrice)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Category:</span>{' '}
                <span className="font-medium text-slate-800">
                  {selectedProduct.category?.categoryName || '—'}
                </span>
              </div>
            </div>
          )}

          {/* Supplier Selection */}
          <div>
            <label className="label">Supplier / Vendor Source</label>
            <select
              className="input text-sm"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            >
              <option value="">-- Select supplier (optional) --</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.supplierName} {s.companyName ? `(${s.companyName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity Received *</label>
              <input
                type="number"
                min="1"
                required
                className="input"
                placeholder="10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
              {selectedProduct && (
                <p className="text-[11px] text-slate-500 mt-1">
                  New total will be:{' '}
                  <strong>
                    {selectedProduct.quantity + parseInt(formData.quantity || 0, 10)}{' '}
                    {selectedProduct.unit}
                  </strong>
                </p>
              )}
            </div>

            <div>
              <label className="label">Purchase Price Per Unit ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Invoice / PO Reference Number</label>
              <input
                type="text"
                className="input"
                placeholder="PO-2026-0891"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Internal Notes</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Batch #4 inspected and verified"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording Receipt...
                </>
              ) : (
                'Confirm Stock-In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

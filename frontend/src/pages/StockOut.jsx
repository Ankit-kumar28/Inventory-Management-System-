import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionsApi, productsApi } from '../services/api';
import { useToastContext } from '../context/ToastContext';
import { PageLoader } from '../components/common/LoadingSpinner';
import { STOCK_REASONS } from '../utils/constants';
import { ArrowUpFromLine, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { formatCurrency, getErrorMessage } from '../utils/helpers';

export default function StockOut() {
  const navigate = useNavigate();
  const { addToast } = useToastContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    reason: 'Sale',
    referenceNumber: '',
    notes: '',
  });

  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.getAll({ limit: 100 });
        setProducts(res.data.data);
      } catch (err) {
        addToast(getErrorMessage(err), 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [addToast]);

  const handleProductChange = (productId) => {
    const prod = products.find((p) => p._id === productId);
    setSelectedProduct(prod || null);
    setFormData((prev) => ({
      ...prev,
      productId,
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
      addToast('Issued quantity must be at least 1', 'warning');
      return;
    }

    if (selectedProduct && qty > selectedProduct.quantity) {
      addToast(
        `Quantity requested (${qty}) exceeds available on-hand stock (${selectedProduct.quantity})`,
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await transactionsApi.stockOut({
        product: formData.productId,
        quantity: qty,
        reason: formData.reason,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
      });

      addToast('Stock issue recorded successfully', 'success');
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
      quantity: '1',
      reason: 'Sale',
      referenceNumber: '',
      notes: '',
    });
  };

  if (loading) return <PageLoader text="Loading inventory catalog..." />;

  if (successResult) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="card p-8 text-center shadow-lg border-danger-200">
          <div className="w-14 h-14 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center mx-auto mb-4 border border-danger-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Stock Issue Dispatched</h2>
          <p className="text-xs text-slate-500 mb-6">
            Inventory reduction and transaction audit entry have been committed atomically.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2 mb-6 border border-slate-200 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Product:</span>
              <span className="font-semibold text-slate-800">
                {successResult.product?.productName} ({successResult.product?.sku})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantity Issued:</span>
              <span className="font-semibold text-danger-600">
                -{successResult.transaction?.quantity} {successResult.product?.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reason:</span>
              <span className="font-medium text-slate-800">
                {successResult.transaction?.reason}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining Balance:</span>
              <span className="font-bold text-slate-900">
                {successResult.product?.quantity} {successResult.product?.unit}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={handleReset} className="btn-primary">
              Issue Another Item
            </button>
            <button onClick={() => navigate('/transactions')} className="btn-secondary">
              View Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  const requestedQty = parseInt(formData.quantity || '0', 10);
  const isInsufficient = selectedProduct && requestedQty > selectedProduct.quantity;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ArrowUpFromLine className="w-5 h-5 text-danger-600" />
            Stock-Out Issuing
          </h1>
          <p className="page-subtitle">
            Record sales fulfillment, internal consumption, damage write-offs, and transfers
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
            <label className="label">Select Issued Product *</label>
            <select
              required
              className="input text-sm"
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              <option value="">-- Choose item from catalog --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id} disabled={p.quantity === 0}>
                  {p.productName} ({p.sku}) — Available: {p.quantity} {p.unit}{' '}
                  {p.quantity === 0 ? '(OUT OF STOCK)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Specs Preview */}
          {selectedProduct && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-500">Available Stock:</span>{' '}
                <span
                  className={`font-bold text-sm ${
                    selectedProduct.quantity === 0 ? 'text-danger-600' : 'text-slate-900'
                  }`}
                >
                  {selectedProduct.quantity} {selectedProduct.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Retail Price:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedProduct.sellingPrice)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Threshold:</span>{' '}
                <span className="font-medium text-slate-700">
                  {selectedProduct.minimumStockLevel ?? 0} {selectedProduct.unit}
                </span>
              </div>
            </div>
          )}

          {/* Quantity & Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity to Issue *</label>
              <input
                type="number"
                min="1"
                max={selectedProduct ? selectedProduct.quantity : undefined}
                required
                className={`input ${isInsufficient ? 'input-error' : ''}`}
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
              {isInsufficient && (
                <p className="flex items-center gap-1 text-[11px] text-danger-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Cannot exceed available stock ({selectedProduct.quantity})
                </p>
              )}
            </div>

            <div>
              <label className="label">Reason for Issue *</label>
              <select
                required
                className="input text-sm"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              >
                {STOCK_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Order / Dispatch Reference #</label>
              <input
                type="text"
                className="input"
                placeholder="SO-2026-4401"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Operational Notes</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Dispatched to client location A"
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
            <button
              type="submit"
              className="btn-danger"
              disabled={submitting || isInsufficient || (selectedProduct && selectedProduct.quantity === 0)}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Issue...
                </>
              ) : (
                'Confirm Stock-Out'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

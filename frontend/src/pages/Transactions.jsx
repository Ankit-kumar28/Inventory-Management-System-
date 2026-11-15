import { useState, useEffect, useCallback } from 'react';
import { transactionsApi } from '../services/api';
import { useToastContext } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { SearchInput } from '../components/common/SearchInput';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { PageLoader } from '../components/common/LoadingSpinner';
import { ArrowLeftRight, Eye, FileText, Calendar, Filter } from 'lucide-react';
import { formatCurrency, formatDateTime, formatDate, getErrorMessage } from '../utils/helpers';

export default function Transactions() {
  const { addToast } = useToastContext();
  const { page, limit, goToPage, reset } = usePagination(20);

  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // Detail Modal
  const [selectedTxn, setSelectedTxn] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.getAll({
        page,
        limit,
        type: typeFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search,
      });
      setTransactions(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, typeFilter, startDate, endDate, search, addToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const clearFilters = () => {
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    setSearch('');
    reset();
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaction Ledger</h1>
          <p className="page-subtitle">
            Immutable audit trail of all warehouse receipts, issues, and stock movements
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50/50">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              reset();
            }}
            placeholder="Search reference #..."
            className="w-full"
          />

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              reset();
            }}
            className="input py-1.5 text-xs"
          >
            <option value="">All Movement Types</option>
            <option value="stock-in">Stock In (Receipts)</option>
            <option value="stock-out">Stock Out (Dispatches)</option>
          </select>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                reset();
              }}
              className="input py-1.5 text-xs"
              placeholder="From Date"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                reset();
              }}
              className="input py-1.5 text-xs"
              placeholder="To Date"
            />
          </div>

          <div className="flex items-center gap-2">
            {(typeFilter || startDate || endDate || search) && (
              <button onClick={clearFilters} className="btn-secondary btn-sm w-full">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <PageLoader text="Loading ledger entries..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions found"
            description="Adjust your date or type filters to see recorded movement records."
          />
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Units</th>
                  <th>Unit Cost</th>
                  <th>Reason / Supplier</th>
                  <th>Reference #</th>
                  <th>Authorized By</th>
                  <th className="text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td className="text-slate-500 text-xs font-mono">
                      {formatDateTime(t.createdAt)}
                    </td>
                    <td>
                      <span
                        className={
                          t.transactionType === 'stock-in' ? 'badge-success' : 'badge-danger'
                        }
                      >
                        {t.transactionType}
                      </span>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-900">{t.product?.productName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{t.product?.sku}</p>
                    </td>
                    <td className="font-bold text-slate-900">
                      {t.transactionType === 'stock-in' ? '+' : '-'}
                      {t.quantity} <span className="font-normal text-slate-400">{t.product?.unit}</span>
                    </td>
                    <td className="text-slate-600 text-xs">
                      {t.unitPrice > 0 ? formatCurrency(t.unitPrice) : '—'}
                    </td>
                    <td className="text-slate-600 text-xs">
                      {t.transactionType === 'stock-in'
                        ? t.supplier?.supplierName || '—'
                        : t.reason || '—'}
                    </td>
                    <td className="font-mono text-xs text-slate-700">
                      {t.referenceNumber || '—'}
                    </td>
                    <td className="text-slate-600 text-xs">
                      {t.createdBy?.fullName || '—'}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedTxn(t)}
                        className="btn-ghost p-1 text-slate-500 hover:text-accent-600"
                        title="View Ledger Entry"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
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

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        title="Ledger Transaction Certificate"
        size="md"
      >
        {selectedTxn && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Movement Type
                </span>
                <span
                  className={
                    selectedTxn.transactionType === 'stock-in' ? 'badge-success' : 'badge-danger'
                  }
                >
                  {selectedTxn.transactionType.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Timestamp
                </span>
                <span className="font-mono text-slate-700">
                  {formatDateTime(selectedTxn.createdAt)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div>
                <span className="text-slate-500 block">Product</span>
                <strong className="text-slate-900 text-sm">{selectedTxn.product?.productName}</strong>
                <span className="block font-mono text-slate-400">{selectedTxn.product?.sku}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Quantity Moved</span>
                <strong className="text-slate-900 text-sm">
                  {selectedTxn.quantity} {selectedTxn.product?.unit}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">Reference Number</span>
                <span className="font-mono text-slate-800">
                  {selectedTxn.referenceNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">
                  {selectedTxn.transactionType === 'stock-in' ? 'Vendor / Supplier' : 'Reason'}
                </span>
                <span className="text-slate-800">
                  {selectedTxn.transactionType === 'stock-in'
                    ? selectedTxn.supplier?.supplierName || 'N/A'
                    : selectedTxn.reason || 'N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">Unit Cost Recorded</span>
                <span className="text-slate-800 font-semibold">
                  {formatCurrency(selectedTxn.unitPrice)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Recorded By</span>
                <span className="text-slate-800">
                  {selectedTxn.createdBy?.fullName} ({selectedTxn.createdBy?.email})
                </span>
              </div>
            </div>

            {selectedTxn.notes && (
              <div>
                <span className="text-slate-500 block mb-0.5">Notes</span>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedTxn.notes}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedTxn(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { reportsApi, categoriesApi, suppliersApi } from '../services/api';
import { useToastContext } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/common/Pagination';
import { PageLoader } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate, downloadCsv, getErrorMessage } from '../utils/helpers';

export default function Reports() {
  const { addToast } = useToastContext();
  const { page, limit, goToPage, reset } = usePagination(20);

  const [activeReport, setActiveReport] = useState('inventory');
  // 'inventory', 'stock-in', 'stock-out', 'low-stock', 'valuation'

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [grandTotalValue, setGrandTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

  const [categoriesList, setCategoriesList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catsRes, supsRes] = await Promise.all([
          categoriesApi.getAll({ limit: 100 }),
          suppliersApi.getAll({ limit: 100 }),
        ]);
        setCategoriesList(catsRes.data.data);
        setSuppliersList(supsRes.data.data);
      } catch (err) {
        console.error('Options error:', err);
      }
    };
    fetchOptions();
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      const params = {
        page,
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: selectedCategory || undefined,
        supplier: selectedSupplier || undefined,
      };

      switch (activeReport) {
        case 'inventory':
          res = await reportsApi.getInventory(params);
          setData(res.data.data);
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
          break;
        case 'stock-in':
          res = await reportsApi.getStockIn(params);
          setData(res.data.data);
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
          break;
        case 'stock-out':
          res = await reportsApi.getStockOut(params);
          setData(res.data.data);
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
          break;
        case 'low-stock':
          res = await reportsApi.getLowStock();
          setData(res.data.data.products);
          setTotal(res.data.data.count);
          setTotalPages(1);
          break;
        case 'valuation':
          res = await reportsApi.getValuation(params);
          setData(res.data.data);
          setTotal(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
          setGrandTotalValue(res.data.pagination.grandTotalValue || 0);
          break;
        default:
          break;
      }
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [
    activeReport,
    page,
    limit,
    startDate,
    endDate,
    selectedCategory,
    selectedSupplier,
    addToast,
  ]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: selectedCategory || undefined,
        supplier: selectedSupplier || undefined,
      };

      const endpointMap = {
        inventory: '/reports/inventory',
        'stock-in': '/reports/stock-in',
        'stock-out': '/reports/stock-out',
        'low-stock': '/reports/low-stock',
        valuation: '/reports/valuation',
      };

      const endpoint = endpointMap[activeReport];
      const res = await reportsApi.exportCsv(endpoint, params);
      downloadCsv(res.data, `${activeReport}-report-${new Date().toISOString().slice(0, 10)}.csv`);
      addToast('CSV export downloaded successfully', 'success');
    } catch (err) {
      addToast('Failed to generate CSV export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'inventory', label: 'Inventory Snapshot', icon: Layers },
    { id: 'stock-in', label: 'Stock Receipts', icon: ArrowDownToLine },
    { id: 'stock-out', label: 'Stock Dispatches', icon: ArrowUpFromLine },
    { id: 'low-stock', label: 'Low Stock Report', icon: AlertTriangle },
    { id: 'valuation', label: 'Valuation Audit', icon: DollarSign },
  ];

  return (
    <div className="space-y-5 print:p-0">
      <div className="page-header print:hidden">
        <div>
          <h1 className="page-title">Executive Reports & Valuation</h1>
          <p className="page-subtitle">
            Comprehensive audit reports, ledger exports, and inventory valuation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary">
            <Printer className="w-4 h-4" />
            Print Layout
          </button>
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading || data.length === 0}
            className="btn-primary"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 print:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveReport(tab.id);
                reset();
              }}
              className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'border-accent-600 text-accent-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters (where applicable) */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50 print:hidden">
        {['stock-in', 'stock-out'].includes(activeReport) && (
          <>
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  reset();
                }}
                className="input py-1 text-xs"
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  reset();
                }}
                className="input py-1 text-xs"
              />
            </div>
          </>
        )}

        {['inventory', 'valuation'].includes(activeReport) && (
          <>
            <div>
              <label className="label">Filter Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  reset();
                }}
                className="input py-1 text-xs"
              >
                <option value="">All Categories</option>
                {categoriesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Filter Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => {
                  setSelectedSupplier(e.target.value);
                  reset();
                }}
                className="input py-1 text-xs"
              >
                <option value="">All Suppliers</option>
                {suppliersList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex items-end">
          {(startDate || endDate || selectedCategory || selectedSupplier) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSelectedCategory('');
                setSelectedSupplier('');
                reset();
              }}
              className="btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Valuation Callout Box */}
      {activeReport === 'valuation' && (
        <div className="card p-5 bg-navy-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-accent-300 font-bold uppercase tracking-wider block">
              Cumulative Inventory Asset Value
            </span>
            <p className="text-2xl font-bold mt-0.5">{formatCurrency(grandTotalValue)}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Methodology: <em>Weighted Purchase Unit Cost × In-Stock Units</em>. Accurately reflects
              capital tied in physical assets.
            </p>
          </div>
          <span className="badge-blue bg-accent-500/20 text-accent-200 border-accent-400/30">
            Valuation Method: Cost Basis
          </span>
        </div>
      )}

      {/* Report Table View */}
      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader text="Compiling financial report..." />
        ) : data.length === 0 ? (
          <EmptyState
            icon={FileBarChart}
            title="No records found for this report period"
            description="Try modifying your date parameters or category filters."
          />
        ) : (
          <div className="table-wrapper rounded-none border-0">
            {/* Inventory Snapshot Table */}
            {activeReport === 'inventory' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Supplier</th>
                    <th className="text-right">Unit Cost</th>
                    <th className="text-right">Selling Price</th>
                    <th className="text-right">Stock Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((r) => (
                    <tr key={r._id}>
                      <td className="font-semibold text-slate-900">{r.productName}</td>
                      <td className="font-mono text-xs text-slate-500">{r.sku}</td>
                      <td className="text-slate-600 text-xs">{r.category?.categoryName || '—'}</td>
                      <td className="text-slate-600 text-xs">{r.supplier?.supplierName || '—'}</td>
                      <td className="text-right">{formatCurrency(r.purchasePrice)}</td>
                      <td className="text-right font-medium">{formatCurrency(r.sellingPrice)}</td>
                      <td className="text-right font-bold">
                        {r.quantity} {r.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Stock Receipts & Dispatches Table */}
            {['stock-in', 'stock-out'].includes(activeReport) && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Units</th>
                    <th>Cost/Unit</th>
                    <th>{activeReport === 'stock-in' ? 'Supplier' : 'Reason'}</th>
                    <th>Reference</th>
                    <th>Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((r) => (
                    <tr key={r._id}>
                      <td className="text-slate-500 text-xs font-mono">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="font-semibold text-slate-900">{r.product?.productName}</td>
                      <td className="font-mono text-xs text-slate-500">{r.product?.sku}</td>
                      <td className="font-bold text-slate-900">
                        {r.quantity} {r.product?.unit}
                      </td>
                      <td className="text-slate-600 text-xs">
                        {r.unitPrice > 0 ? formatCurrency(r.unitPrice) : '—'}
                      </td>
                      <td className="text-slate-600 text-xs">
                        {activeReport === 'stock-in'
                          ? r.supplier?.supplierName || '—'
                          : r.reason || '—'}
                      </td>
                      <td className="font-mono text-xs text-slate-700">
                        {r.referenceNumber || '—'}
                      </td>
                      <td className="text-slate-600 text-xs">{r.createdBy?.fullName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Low Stock Table */}
            {activeReport === 'low-stock' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Supplier</th>
                    <th className="text-right">Current Stock</th>
                    <th className="text-right">Threshold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((r) => (
                    <tr key={r._id}>
                      <td className="font-semibold text-slate-900">{r.productName}</td>
                      <td className="font-mono text-xs text-slate-500">{r.sku}</td>
                      <td className="text-slate-600 text-xs">{r.category?.categoryName || '—'}</td>
                      <td className="text-slate-600 text-xs">{r.supplier?.supplierName || '—'}</td>
                      <td className="text-right font-bold text-danger-700">
                        {r.quantity} {r.unit}
                      </td>
                      <td className="text-right text-slate-500">
                        {r.minimumStockLevel} {r.unit}
                      </td>
                      <td>
                        {r.quantity === 0 ? (
                          <span className="badge-danger">Out of Stock</span>
                        ) : (
                          <span className="badge-warning">Low Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Valuation Table */}
            {activeReport === 'valuation' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th className="text-right">On-Hand Quantity</th>
                    <th className="text-right">Purchase Cost</th>
                    <th className="text-right">Extended Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((r) => (
                    <tr key={r._id}>
                      <td className="font-semibold text-slate-900">{r.productName}</td>
                      <td className="font-mono text-xs text-slate-500">{r.sku}</td>
                      <td className="text-slate-600 text-xs">{r.category?.categoryName || '—'}</td>
                      <td className="text-right font-bold">
                        {r.quantity} {r.unit}
                      </td>
                      <td className="text-right">{formatCurrency(r.purchasePrice)}</td>
                      <td className="text-right font-bold text-slate-900">
                        {formatCurrency(r.totalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeReport !== 'low-stock' && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            total={total}
            limit={limit}
          />
        )}
      </div>
    </div>
  );
}

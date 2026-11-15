import { useState, useEffect, useCallback } from 'react';
import { inventoryApi, categoriesApi, suppliersApi } from '../services/api';
import { useToastContext } from '../context/ToastContext';
import { usePagination } from '../hooks/usePagination';
import { SearchInput } from '../components/common/SearchInput';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { PageLoader } from '../components/common/LoadingSpinner';
import { StockBadge } from '../components/common/StockBadge';
import { Link } from 'react-router-dom';
import {
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, getErrorMessage } from '../utils/helpers';

export default function Inventory() {
  const { addToast } = useToastContext();
  const { page, limit, goToPage, reset } = usePagination(15);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'low-stock', 'out-of-stock'

  // Summary counts
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  const [categoriesList, setCategoriesList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catsRes, supsRes, lowRes, outRes] = await Promise.all([
          categoriesApi.getAll({ limit: 100 }),
          suppliersApi.getAll({ limit: 100 }),
          inventoryApi.getLowStock(),
          inventoryApi.getOutOfStock(),
        ]);
        setCategoriesList(catsRes.data.data);
        setSuppliersList(supsRes.data.data);
        setLowStockCount(lowRes.data.data.count);
        setOutOfStockCount(outRes.data.data.count);
      } catch (err) {
        console.error('Failed to load inventory metadata:', err);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const stockStatus = activeTab === 'all' ? '' : activeTab;
      const res = await inventoryApi.getAll({
        page,
        limit,
        search,
        category: selectedCategory,
        supplier: selectedSupplier,
        stockStatus,
      });
      setProducts(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      addToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedCategory, selectedSupplier, activeTab, addToast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse & Stock Inventory</h1>
          <p className="page-subtitle">Continuous tracking of physical on-hand units and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/stock-in" className="btn-secondary">
            <ArrowDownToLine className="w-4 h-4 text-success-600" />
            Stock In
          </Link>
          <Link to="/stock-out" className="btn-secondary">
            <ArrowUpFromLine className="w-4 h-4 text-danger-600" />
            Stock Out
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('all');
            reset();
          }}
          className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-accent-600 text-accent-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          All Inventory ({total})
        </button>

        <button
          onClick={() => {
            setActiveTab('low-stock');
            reset();
          }}
          className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'low-stock'
              ? 'border-warning-500 text-warning-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
          Low Stock Alerts ({lowStockCount})
        </button>

        <button
          onClick={() => {
            setActiveTab('out-of-stock');
            reset();
          }}
          className={`pb-3 px-3 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'out-of-stock'
              ? 'border-danger-500 text-danger-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-danger-500" />
          Out of Stock ({outOfStockCount})
        </button>
      </div>

      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              reset();
            }}
            placeholder="Search by SKU or item name..."
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
            <option value="">Filter by Category</option>
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
            <option value="">Filter by Supplier</option>
            {suppliersList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.supplierName}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <PageLoader text="Inspecting stock records..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Warehouse}
            title="No inventory records found"
            description="No items match your selected filter criteria."
          />
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Product & Identifier</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th className="text-right">Unit Value</th>
                  <th className="text-right">Available Qty</th>
                  <th className="text-right">Min Level</th>
                  <th className="text-right">Total Valuation</th>
                  <th>Inventory State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const val = (p.purchasePrice || 0) * (p.quantity || 0);
                  return (
                    <tr key={p._id}>
                      <td>
                        <p className="font-semibold text-slate-900">{p.productName}</p>
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">
                          {p.sku}
                        </span>
                      </td>
                      <td className="text-slate-600 text-xs">{p.category?.categoryName || '—'}</td>
                      <td className="text-slate-600 text-xs">{p.supplier?.supplierName || '—'}</td>
                      <td className="text-right font-medium text-slate-700">
                        {formatCurrency(p.purchasePrice)}
                      </td>
                      <td className="text-right font-bold text-slate-900">
                        {p.quantity} <span className="text-[11px] font-normal text-slate-400">{p.unit}</span>
                      </td>
                      <td className="text-right text-slate-500 text-xs">
                        {p.minimumStockLevel ?? 0} {p.unit}
                      </td>
                      <td className="text-right font-semibold text-slate-900">
                        {formatCurrency(val)}
                      </td>
                      <td>
                        <StockBadge
                          quantity={p.quantity}
                          minimumStockLevel={p.minimumStockLevel}
                        />
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
    </div>
  );
}

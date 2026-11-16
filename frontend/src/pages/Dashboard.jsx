import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  IndianRupee,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
  FileBarChart,
  Layers,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { PageLoader } from '../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatDate } from '../utils/helpers';

// Refined Linear/Stripe style Metric Card
function MetricCard({ label, value, sub, status, icon: Icon }) {
  const statusConfig = {
    normal: { dot: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50 border-emerald-200/80' },
    warning: { dot: 'bg-amber-500', text: 'text-amber-700 bg-amber-50 border-amber-200/80' },
    danger: { dot: 'bg-rose-500', text: 'text-rose-700 bg-rose-50 border-rose-200/80' },
    neutral: { dot: 'bg-slate-400', text: 'text-slate-600 bg-slate-50 border-slate-200' },
  };

  const currentStatus = statusConfig[status] || statusConfig.neutral;

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-lg p-4 transition-all duration-150 shadow-2xs hover:shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            {label}
          </span>
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          {value ?? '—'}
        </div>
      </div>
      {sub && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">{sub}</span>
          {status && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${currentStatus.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
              {status.toUpperCase()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Recharts Tooltip for elegant dark SaaS style
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs px-3 py-2 rounded-md shadow-xl border border-slate-800">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-400 capitalize">
              <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: item.color }} />
              {item.name}:
            </span>
            <span className="font-mono font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, txnRes, overviewRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentTransactions(8),
          dashboardApi.getStockOverview(),
        ]);
        setStats(statsRes.data.data);
        setRecentTxns(txnRes.data.data.transactions);
        setOverview(overviewRes.data.data);
      } catch (err) {
        setError('Failed to load dashboard metrics. Check database connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <PageLoader text="Loading dashboard metrics..." />;
  if (error) return <div className="card p-6 text-center text-sm text-danger-600">{error}</div>;

  const movementDataMap = {};
  (overview?.movementData || []).forEach(({ _id, total }) => {
    if (!movementDataMap[_id.date]) {
      movementDataMap[_id.date] = { date: _id.date, 'stock-in': 0, 'stock-out': 0 };
    }
    movementDataMap[_id.date][_id.type] = total;
  });
  const movementChartData = Object.values(movementDataMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const availabilityRate = stats?.totalProducts > 0
    ? Math.round(((stats.totalProducts - (stats.outOfStockProducts || 0)) / stats.totalProducts) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Enterprise Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-channel inventory health, valuation, and movements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/stock-in"
            className="btn btn-secondary text-xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stock In</span>
          </Link>
          <Link
            to="/stock-out"
            className="btn btn-secondary text-xs"
          >
            <Minus className="w-3.5 h-3.5 text-rose-600" />
            <span>Stock Out</span>
          </Link>
          <Link
            to="/reports"
            className="btn btn-primary text-xs"
          >
            <FileBarChart className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Inventory Value"
          value={formatCurrency(stats?.totalInventoryValue || 0)}
          sub="At purchase price"
          status="normal"
          icon={IndianRupee}
        />
        <MetricCard
          label="Total Stock Units"
          value={stats?.totalStockUnits?.toLocaleString() || '0'}
          sub="On-hand physically"
          status="normal"
          icon={Boxes}
        />
        <MetricCard
          label="Total Catalog SKUs"
          value={stats?.totalProducts || 0}
          sub="Active master records"
          status="neutral"
          icon={Package}
        />
        <MetricCard
          label="SKU Fulfillment Rate"
          value={`${availabilityRate}%`}
          sub="In-stock availability"
          status={availabilityRate >= 90 ? 'normal' : 'warning'}
          icon={TrendingUp}
        />
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Low Stock Items"
          value={stats?.lowStockProducts || 0}
          sub="At or below minimum threshold"
          status={stats?.lowStockProducts > 0 ? 'warning' : 'normal'}
          icon={AlertTriangle}
        />
        <MetricCard
          label="Out of Stock SKUs"
          value={stats?.outOfStockProducts || 0}
          sub="Zero quantity available"
          status={stats?.outOfStockProducts > 0 ? 'danger' : 'normal'}
          icon={XCircle}
        />
        <MetricCard
          label="Suppliers & Categories"
          value={`${stats?.totalSuppliers || 0} / ${stats?.totalCategories || 0}`}
          sub="Supply partners & item groups"
          status="neutral"
          icon={Building2}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                7-Day Inward / Outward Velocity
              </h3>
              <p className="text-[11px] text-slate-400">Daily physical quantity delta</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                Inward
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                Outward
              </span>
            </div>
          </div>
          {movementChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={movementChartData} barSize={12}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="stock-in" name="Stock In" fill="#059669" radius={[3, 3, 0, 0]} />
                <Bar dataKey="stock-out" name="Stock Out" fill="#E11D48" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              No transactions recorded in the last 7 days
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Top Inventory SKUs By Volume
              </h3>
              <p className="text-[11px] text-slate-400">Highest quantity on-hand items</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              UNITS
            </span>
          </div>
          {overview?.topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={overview.topProducts} layout="vertical" barSize={10}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={110}
                  tick={{ fontSize: 11, fill: '#334155' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="quantity" name="Units" fill="#3B82F6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">No inventory data available</div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent Inventory Audit Trail
            </h3>
            <p className="text-[11px] text-slate-400">Latest recorded transactions</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            View all audit records →
          </Link>
        </div>
        {recentTxns.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No transactions recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Operator</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTxns.map((t) => {
                  const isIn = t.transactionType === 'stock-in';
                  return (
                    <tr key={t._id}>
                      <td>
                        <span className="font-semibold text-slate-900 block">
                          {t.product?.productName || '—'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {t.product?.sku}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            isIn
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isIn ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          )}
                          {isIn ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td className="font-mono font-bold text-slate-900">
                        {isIn ? `+${t.quantity}` : `-${t.quantity}`}
                      </td>
                      <td className="text-slate-600 text-xs">{t.createdBy?.fullName || '—'}</td>
                      <td className="text-slate-400 text-xs font-mono">{formatDate(t.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

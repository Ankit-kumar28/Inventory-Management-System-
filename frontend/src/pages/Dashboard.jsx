import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import {
  Package,
  Tags,
  Truck,
  Boxes,
  AlertTriangle,
  XCircle,
  IndianRupee,
  TrendingUp,
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

function StatCard({ label, value, icon: Icon, color = 'accent', sub }) {
  const colorStyles = {
    accent: 'text-accent-600 bg-accent-50 border border-accent-100',
    success: 'text-success-600 bg-success-50 border border-success-100',
    warning: 'text-warning-600 bg-warning-50 border border-warning-100',
    danger: 'text-danger-600 bg-danger-50 border border-danger-100',
    slate: 'text-slate-600 bg-slate-100 border border-slate-200',
  };

  return (
    <div className="stat-card flex items-start gap-4">
      <div className={`p-2.5 rounded-lg shrink-0 ${colorStyles[color] || colorStyles.slate}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-1 truncate">{value ?? '—'}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time inventory levels, valuation, and movements</p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats?.totalProducts}
          icon={Package}
          color="accent"
        />
        <StatCard
          label="Total Stock Units"
          value={stats?.totalStockUnits?.toLocaleString()}
          icon={Boxes}
          color="success"
        />
        <StatCard
          label="Total Inventory Value"
          value={formatCurrency(stats?.totalInventoryValue || 0)}
          icon={IndianRupee}
          color="success"
          sub="At unit purchase price"
        />
        <StatCard
          label="Suppliers & Categories"
          value={`${stats?.totalSuppliers || 0} / ${stats?.totalCategories || 0}`}
          icon={Truck}
          color="slate"
          sub="Partners & Classifications"
        />
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Low Stock Alerts"
          value={stats?.lowStockProducts}
          icon={AlertTriangle}
          color="warning"
          sub="At or below minimum threshold"
        />
        <StatCard
          label="Out of Stock"
          value={stats?.outOfStockProducts}
          icon={XCircle}
          color="danger"
          sub="Immediate reorder needed"
        />
        <StatCard
          label="In-Stock Health"
          value={`${
            stats?.totalProducts > 0
              ? Math.round(
                  ((stats.totalProducts - (stats.outOfStockProducts || 0)) / stats.totalProducts) *
                    100
                )
              : 100
          }%`}
          icon={TrendingUp}
          color="accent"
          sub="SKU availability rate"
        />
        <StatCard
          label="Active Categories"
          value={stats?.totalCategories}
          icon={Tags}
          color="slate"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              7-Day Movement Analysis
            </h3>
            <span className="text-[11px] text-slate-400">Inbound vs Outbound</span>
          </div>
          {movementChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={movementChartData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="stock-in" name="Stock In" fill="#16A34A" radius={[2, 2, 0, 0]} />
                <Bar dataKey="stock-out" name="Stock Out" fill="#DC2626" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              No transactions recorded in the last 7 days
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Top Products by On-Hand Stock
            </h3>
            <span className="text-[11px] text-slate-400">Highest volume items</span>
          </div>
          {overview?.topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={overview.topProducts} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={110}
                  tick={{ fontSize: 10, fill: '#334155' }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="quantity" name="Units" fill="#2563EB" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">No inventory data available</div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Recent Audit & Stock Operations
          </h3>
          <span className="text-[11px] text-slate-400">Latest 8 events</span>
        </div>
        {recentTxns.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No transactions recorded yet</div>
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Units</th>
                  <th>Recorded By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTxns.map((t) => (
                  <tr key={t._id}>
                    <td className="font-medium text-slate-900">
                      {t.product?.productName || '—'}
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {t.product?.sku}
                      </span>
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
                    <td className="font-semibold text-slate-900">{t.quantity}</td>
                    <td className="text-slate-600">{t.createdBy?.fullName || '—'}</td>
                    <td className="text-slate-500 text-xs">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

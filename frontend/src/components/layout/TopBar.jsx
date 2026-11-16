import { Menu, Activity, ShieldCheck, Database } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const routeNames = {
  '/dashboard': 'Dashboard Overview',
  '/products': 'Product Catalog',
  '/categories': 'Category Management',
  '/suppliers': 'Supplier Directory',
  '/inventory': 'Real-Time Inventory',
  '/stock-in': 'Inward Movement (Stock-In)',
  '/stock-out': 'Outward Movement (Stock-Out)',
  '/transactions': 'Transaction Audit Trail',
  '/reports': 'Analytics & Reports',
  '/users': 'User Management',
  '/settings': 'System Settings',
};

export function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const currentTitle = routeNames[location.pathname] || 'Inventory Workspace';

  return (
    <header className="h-13 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="btn-ghost p-1.5 lg:hidden text-slate-500 hover:text-slate-700"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Workspace</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-800 tracking-tight">{currentTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* System Health Dot */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-tight font-mono text-[10px]">DB CONNECTED</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
            <p className="text-[10px] text-slate-500 font-mono capitalize">
              {user?.role} Access
            </p>
          </div>
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

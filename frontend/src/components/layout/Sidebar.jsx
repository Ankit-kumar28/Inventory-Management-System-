import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  FileBarChart,
  Users,
  Settings,
  LogOut,
  X,
  Boxes,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const mainSections = [
  {
    title: 'GENERAL',
    items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: Tags },
      { to: '/suppliers', label: 'Suppliers', icon: Truck },
    ],
  },
  {
    title: 'STOCK OPERATIONS',
    items: [
      { to: '/inventory', label: 'Inventory Control', icon: Warehouse },
      { to: '/stock-in', label: 'Stock Inward', icon: ArrowDownToLine },
      { to: '/stock-out', label: 'Stock Outward', icon: ArrowUpFromLine },
      { to: '/transactions', label: 'Audit Trail', icon: ArrowLeftRight },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { to: '/reports', label: 'Analytics & Reports', icon: FileBarChart },
    ],
  },
];

export function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#090D16] border-r border-[#1B2234] flex flex-col z-40 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1B2234]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-[13px] tracking-tight">
                  Inventory OS
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise Warehouse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/60"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {mainSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <p className="px-2.5 text-[10px] font-semibold text-slate-300 tracking-wider uppercase mb-1">
                {section.title}
              </p>
              {section.items.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-slate-800 to-slate-800/80 text-white shadow-xs border-l-2 border-indigo-500'
                        : 'text-slate-200 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-100'
                        }`}
                      />
                      <span className="truncate">{label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}

          {isAdmin && (
            <div className="space-y-0.5 pt-1">
              <p className="px-2.5 text-[10px] font-semibold text-slate-300 tracking-wider uppercase mb-1 flex items-center justify-between">
                <span>ADMINISTRATION</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </p>
              <NavLink
                to="/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-800 to-slate-800/80 text-white shadow-xs border-l-2 border-indigo-500'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/40'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-slate-100" />
                  <span className="truncate">User Directory</span>
                </div>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer Profile & Controls */}
        <div className="border-t border-[#1B2234] p-3 space-y-2 bg-[#060910]">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-200 hover:text-white hover:bg-slate-800/40'
              }`
            }
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>Preferences</span>
          </NavLink>

          <div className="pt-2 border-t border-[#1B2234]/80 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-semibold">
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-100 truncate leading-snug">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[10px] font-mono text-slate-400 capitalize flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

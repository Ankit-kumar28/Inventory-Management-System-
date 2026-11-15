import { NavLink, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/stock-in', label: 'Stock In', icon: ArrowDownToLine },
  { to: '/stock-out', label: 'Stock Out', icon: ArrowUpFromLine },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
];

export function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-navy-900 flex flex-col z-40 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center text-white shadow-sm">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight tracking-tight">
                Inventory Pro
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Enterprise MERN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Administration
                </p>
              </div>
              <NavLink
                to="/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                }
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>User Management</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Bottom Profile and Settings */}
        <div className="border-t border-slate-800 p-3 space-y-1 bg-navy-950/40">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </NavLink>

          <div className="pt-2 border-t border-slate-800/80 px-2 mt-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-accent-600/30 border border-accent-500/40 flex items-center justify-center shrink-0">
                <span className="text-accent-300 text-xs font-bold">
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded text-xs font-medium text-danger-400 hover:text-danger-300 hover:bg-danger-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

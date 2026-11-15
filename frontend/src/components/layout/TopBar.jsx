import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function TopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="btn-ghost p-1.5 lg:hidden text-slate-500 hover:text-slate-700"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
          Organization Workspace
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
          <p className="text-[10px] text-slate-500 capitalize">{user?.role} Access</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs">
          {user?.fullName?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}

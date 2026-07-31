import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiClock, FiFileText, FiBook, FiBookOpen, FiUsers, FiLogOut, FiMenu, FiX, FiBarChart2 } from 'react-icons/fi';
import { APP_NAME, PORTAL_MODULES } from '../utils/constants';
import { canAccessModule, normalizeRole, ROLE_LABELS } from '../utils/roles';
import { useAuth } from '../context/AuthContext';
import { redirectToPublicSite } from '../utils/dashboardAccess';
import { getInitials } from '../utils/formatters';

const ICON_MAP = {
  clock: FiClock,
  fileText: FiFileText,
  book: FiBook,
  bookOpen: FiBookOpen,
  users: FiUsers,
  barChart: FiBarChart2,
};

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = normalizeRole(user?.role);
  const visibleModules = PORTAL_MODULES.filter((m) => canAccessModule(role, m.key));
  const name = user?.full_name || user?.name || user?.email || 'User';

  const handleLogout = async () => {
    await logout();
    redirectToPublicSite();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface dark:bg-gray-950">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-gray-400 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="border-b border-gray-800 p-5">
          <p className="text-sm font-bold text-white">{APP_NAME}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Student / Parent portal</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {visibleModules.map((item) => {
            const Icon = ICON_MAP[item.icon] || FiBook;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <Icon className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-800 p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white uppercase">
              {getInitials(name)}
            </div>
            <div className="min-w-0 truncate">
              <p className="truncate text-xs font-semibold text-white">{name}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">{ROLE_LABELS[role] || role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800/60 hover:text-white"
          >
            <FiLogOut /> Log out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-600">
            <FiMenu />
          </button>
          <button type="button" onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-2 lg:hidden">
            <FiX />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

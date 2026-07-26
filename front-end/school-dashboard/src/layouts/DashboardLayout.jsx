import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiUsers, FiUserCheck, FiBook, FiCalendar, FiClock, FiFileText,
  FiDollarSign, FiBookOpen, FiTruck, FiPackage, FiBriefcase, FiMessageSquare,
  FiFolder, FiBarChart2, FiSettings, FiMenu, FiX, FiLogOut,
} from 'react-icons/fi';
import { APP_NAME, MODULES } from '../utils/constants';
import { canShowModuleInNav, normalizeRole } from '../utils/roles';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import NotificationBell from '../components/ui/NotificationBell';
import { getInitials } from '../utils/formatters';
import { ROLE_LABELS } from '../utils/roles';

const ICON_MAP = {
  grid: FiGrid,
  users: FiUsers,
  userCheck: FiUserCheck,
  book: FiBook,
  calendar: FiCalendar,
  clock: FiClock,
  fileText: FiFileText,
  dollar: FiDollarSign,
  bookOpen: FiBookOpen,
  truck: FiTruck,
  package: FiPackage,
  briefcase: FiBriefcase,
  message: FiMessageSquare,
  folder: FiFolder,
  barChart: FiBarChart2,
  settings: FiSettings,
};

function getBreadcrumbs(pathname) {
  const module = [...MODULES]
    .sort((a, b) => b.path.length - a.path.length)
    .find((m) => m.path === pathname || (m.path !== '/' && pathname.startsWith(m.path)));
  if (!module || module.path === '/') return [{ label: 'Overview' }];
  return [{ label: 'Overview', path: '/' }, { label: module.label }];
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = normalizeRole(user?.role);
  const visibleModules = MODULES.filter((m) => canShowModuleInNav(role, m.key));

  const name = user?.full_name || user?.name || user?.email || 'Admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface dark:bg-gray-950">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-gray-400 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">B</div>
            <span className="text-sm font-bold tracking-wide text-white">{APP_NAME}</span>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {visibleModules.map((item) => {
            const Icon = ICON_MAP[item.icon] || FiGrid;
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-primary text-white shadow-glow' : 'hover:bg-gray-800/60 hover:text-white'
                }`}
              >
                <Icon className="shrink-0 text-base" />
                <span className="truncate">{item.label}</span>
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
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 transition-colors hover:bg-gray-800/60 hover:text-white"
          >
            <FiLogOut className="shrink-0" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu />
            </button>
            <Breadcrumbs items={getBreadcrumbs(location.pathname)} />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

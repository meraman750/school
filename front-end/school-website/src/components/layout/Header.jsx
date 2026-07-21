import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi'
import { FaGraduationCap } from 'react-icons/fa'
import { NAV_LINKS, SCHOOL_NAME, DASHBOARD_LOGIN_URL } from '../../utils/constants'
import { useTheme } from '../../contexts/ThemeContext'
import Button from '../ui/Button'
import SearchModal from '../ui/SearchModal'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-primary dark:text-primary-light'
        : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light'
    }`

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{SCHOOL_NAME}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Addis Ababa, Ethiopia</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.path} to={link.path} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Search"
              >
                <FiSearch className="text-xl" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
              </button>

              <a href={DASHBOARD_LOGIN_URL} className="hidden sm:block">
                <Button size="sm" variant="outline">Dashboard</Button>
              </a>

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Menu"
              >
                {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950"
            >
              <nav className="container-wide mx-auto px-4 py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <a href={DASHBOARD_LOGIN_URL} className="mt-2">
                  <Button className="w-full" variant="outline" size="sm">Dashboard Login</Button>
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

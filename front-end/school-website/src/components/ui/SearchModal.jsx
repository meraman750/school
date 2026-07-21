import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX } from 'react-icons/fi'
import { SEARCH_INDEX, FALLBACK_BLOG, FALLBACK_EVENTS } from '../../utils/constants'
import { useBlog, useEvents } from '../../hooks/useWebsiteData'

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const { data: blog = [] } = useBlog()
  const { data: events = [] } = useEvents()

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) setQuery('')
  }, [isOpen])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()

    const pageResults = SEARCH_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q),
    ).map((item) => ({ ...item, type: 'page' }))

    const blogResults = (blog || FALLBACK_BLOG)
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.excerpt?.toLowerCase().includes(q),
      )
      .map((item) => ({
        title: item.title,
        path: '/news-events',
        type: 'blog',
        subtitle: item.category,
      }))

    const eventResults = (events || FALLBACK_EVENTS)
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q),
      )
      .map((item) => ({
        title: item.title,
        path: '/news-events',
        type: 'event',
        subtitle: item.date,
      }))

    return [...pageResults, ...blogResults, ...eventResults].slice(0, 10)
  }, [query, blog, events])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <FiSearch className="text-gray-400 text-xl shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search pages, news, events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none text-lg"
              />
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim() && results.length === 0 && (
                <p className="text-center text-gray-500 py-8">No results found for &ldquo;{query}&rdquo;</p>
              )}
              {results.map((result, i) => (
                <Link
                  key={`${result.type}-${result.title}-${i}`}
                  to={result.path}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-primary font-medium capitalize shrink-0">{result.type}</span>
                </Link>
              ))}
              {!query.trim() && (
                <p className="text-center text-gray-400 py-8 text-sm">Start typing to search...</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

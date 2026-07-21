import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaDownload, FaFilePdf, FaFileAlt } from 'react-icons/fa'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useDownloads } from '../hooks/useWebsiteData'
import { FALLBACK_DOWNLOADS } from '../utils/constants'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const CATEGORIES = [
  { id: 'all', label: 'All Downloads' },
  { id: 'forms', label: 'Application Forms' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'fees', label: 'Fee Structure' },
  { id: 'handbook', label: 'Handbook' },
]

export default function Downloads() {
  const [category, setCategory] = useState('all')
  const { data: downloads, isLoading } = useDownloads()
  const items = downloads?.length ? downloads : FALLBACK_DOWNLOADS

  const filtered = category === 'all' ? items : items.filter((d) => d.category === category)

  return (
    <>
      <PageHero
        title="Downloads"
        subtitle="Access application forms, academic calendars, fee structures, and other important documents."
        badge="Resources"
      />

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((item, i) => (
                <motion.div key={item.id || i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                  <Card hover>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                        {item.file_type === 'PDF' ? (
                          <FaFilePdf className="text-red-500 text-2xl" />
                        ) : (
                          <FaFileAlt className="text-primary text-2xl" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge color="gray" className="mb-2 capitalize">{item.category?.replace('_', ' ')}</Badge>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 mb-3">{item.file_type} • {item.size}</p>
                        <a href={item.file_url || '#'} download target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <FaDownload /> Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-gray-500 py-12">No downloads available in this category.</p>
          )}
        </div>
      </section>
    </>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaImage } from 'react-icons/fa'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useGallery } from '../hooks/useWebsiteData'
import { FALLBACK_GALLERY } from '../utils/constants'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Videos' },
  { id: 'school_life', label: 'School Life' },
  { id: 'campus', label: 'Campus' },
  { id: 'events', label: 'Events' },
]

const GRADIENTS = [
  'from-primary/30 to-purple-400/30',
  'from-secondary/30 to-orange-300/30',
  'from-blue-400/30 to-cyan-300/30',
  'from-green-400/30 to-emerald-300/30',
  'from-pink-400/30 to-rose-300/30',
  'from-indigo-400/30 to-violet-300/30',
]

export default function Gallery() {
  const [filter, setFilter] = useState('all')
  const { data: gallery, isLoading } = useGallery()
  const items = gallery?.length ? gallery : FALLBACK_GALLERY

  const filtered = items.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'images') return item.type === 'image'
    if (filter === 'videos') return item.type === 'video'
    return item.category === filter
  })

  return (
    <>
      <PageHero
        title="Gallery"
        subtitle="Explore life at Biruk Academy through photos and videos of our vibrant school community."
        badge="Media"
      />

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.id
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => (
                <motion.div key={item.id || i} {...fadeUp} transition={{ delay: (i % 6) * 0.05 }}>
                  <Card hover padding={false} className="overflow-hidden group cursor-pointer">
                    <div className={`aspect-[4/3] bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center relative`}>
                      {item.url ? (
                        item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="text-center">
                          {item.type === 'video' ? (
                            <FaPlay className="text-4xl text-primary/60 mx-auto" />
                          ) : (
                            <FaImage className="text-4xl text-primary/60 mx-auto" />
                          )}
                        </div>
                      )}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                            <FaPlay className="text-primary ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.title}</h3>
                        <Badge color="gray" className="shrink-0 capitalize text-[10px]">
                          {(item.category || 'general').replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-gray-500 py-12">No items found for this filter.</p>
          )}
        </div>
      </section>
    </>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiMapPin } from 'react-icons/fi'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useBlog, useEvents } from '../hooks/useWebsiteData'
import { FALLBACK_BLOG, FALLBACK_EVENTS } from '../utils/constants'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const TABS = [
  { id: 'blog', label: 'Blog' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'events', label: 'Upcoming Events' },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NewsEvents() {
  const [activeTab, setActiveTab] = useState('blog')
  const { data: blog, isLoading: blogLoading } = useBlog()
  const { data: events, isLoading: eventsLoading } = useEvents()

  const blogPosts = blog?.length ? blog : FALLBACK_BLOG
  const announcements = blogPosts.filter((p) => p.category === 'Announcement')
  const newsPosts = blogPosts.filter((p) => p.category !== 'Announcement')
  const eventList = events?.length ? events : FALLBACK_EVENTS

  const isLoading = blogLoading || eventsLoading

  return (
    <>
      <PageHero
        title="News & Events"
        subtitle="Stay connected with the latest happenings at Biruk Academy Primary School."
        badge="Updates"
      />

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              {activeTab === 'blog' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(newsPosts.length ? newsPosts : blogPosts).map((post, i) => (
                    <motion.div key={post.id || i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                      <Card hover className="h-full flex flex-col">
                        <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4 flex items-center justify-center">
                          <span className="text-4xl">📰</span>
                        </div>
                        <Badge color="gray" className="mb-2 w-fit">{post.category || 'News'}</Badge>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{post.excerpt}</p>
                        <p className="text-xs text-gray-400 mt-4">{formatDate(post.date)}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="max-w-3xl mx-auto space-y-4">
                  {(announcements.length ? announcements : blogPosts.slice(0, 2)).map((item, i) => (
                    <motion.div key={item.id || i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                      <Card hover>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0 text-xl">
                            📢
                          </div>
                          <div>
                            <Badge color="secondary" className="mb-2">Announcement</Badge>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.excerpt}</p>
                            <p className="text-xs text-gray-400 mt-2">{formatDate(item.date)}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {eventList.map((event, i) => (
                    <motion.div key={event.id || i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                      <Card hover>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs text-primary font-bold uppercase">
                              {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }) : 'TBD'}
                            </span>
                            <span className="text-xl font-bold text-primary">
                              {event.date ? new Date(event.date).getDate() : '—'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><FiCalendar /> {formatDate(event.date)}</span>
                              {event.location && (
                                <span className="flex items-center gap-1"><FiMapPin /> {event.location}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

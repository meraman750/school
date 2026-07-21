import { useSearchParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { FiSearch } from 'react-icons/fi'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { SEARCH_INDEX, FALLBACK_BLOG, FALLBACK_EVENTS } from '../utils/constants'
import { useBlog, useEvents } from '../hooks/useWebsiteData'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { data: blog = [] } = useBlog()
  const { data: events = [] } = useEvents()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()

    const pages = SEARCH_INDEX.filter(
      (item) => item.title.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q),
    ).map((item) => ({ ...item, type: 'page' }))

    const blogResults = (blog.length ? blog : FALLBACK_BLOG)
      .filter((item) => item.title?.toLowerCase().includes(q) || item.excerpt?.toLowerCase().includes(q))
      .map((item) => ({ title: item.title, path: '/news-events', type: 'blog', subtitle: item.category }))

    const eventResults = (events.length ? events : FALLBACK_EVENTS)
      .filter((item) => item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q))
      .map((item) => ({ title: item.title, path: '/news-events', type: 'event', subtitle: item.date }))

    return [...pages, ...blogResults, ...eventResults]
  }, [query, blog, events])

  return (
    <>
      <PageHero
        title="Search Results"
        subtitle={query ? `Showing results for "${query}"` : 'Enter a search term using the search icon in the header.'}
        badge="Search"
      />
      <section className="section-padding">
        <div className="container-wide mx-auto max-w-3xl">
          {!query.trim() ? (
            <Card className="text-center py-12">
              <FiSearch className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Use the search button in the navigation bar to find pages, news, and events.</p>
            </Card>
          ) : results.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-500">No results found for &ldquo;{query}&rdquo;</p>
            </Card>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
              {results.map((result, i) => (
                <Link key={`${result.type}-${result.title}-${i}`} to={result.path}>
                  <Card hover className="mb-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{result.title}</h3>
                        {result.subtitle && <p className="text-sm text-gray-500">{result.subtitle}</p>}
                      </div>
                      <Badge className="capitalize shrink-0">{result.type}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

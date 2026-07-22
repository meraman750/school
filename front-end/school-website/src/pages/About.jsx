import { motion } from 'framer-motion'
import { FaHistory, FaBullseye, FaEye, FaUserTie } from 'react-icons/fa'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import {
  FALLBACK_SCHOOL_INFO,
  FALLBACK_CORE_VALUES,
  FALLBACK_LEADERSHIP,
  FALLBACK_FACILITIES,
} from '../utils/constants'
import { useSchoolInfo } from '../hooks/useWebsiteData'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function About() {
  const { data: schoolInfo } = useSchoolInfo()
  const info = { ...FALLBACK_SCHOOL_INFO, ...schoolInfo }

  return (
    <>
      <PageHero
        title="About Biruk Academy"
        subtitle="Discover our story, values, and the people who make our school a home for learning in Addis Ababa."
        badge="Our Story"
      />

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="flex items-center gap-3 mb-4">
                <FaHistory className="text-primary text-2xl" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our History</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Founded in {info.founded || '2008'}, Biruk Academy Primary School began with a vision to provide
                accessible, quality education to families in Addis Ababa. What started as a small community school
                has grown into one of the city&apos;s most respected primary institutions.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Over {new Date().getFullYear() - parseInt(info.founded || '2008')} years, we have educated thousands
                of students, many of whom have gone on to excel in secondary schools and universities across Ethiopia
                and abroad.
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl font-bold text-primary">{info.founded}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Year Established</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-wide mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeUp}>
              <Card className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FaBullseye className="text-primary text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{info.mission}</p>
              </Card>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <Card className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <FaEye className="text-secondary-dark text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{info.vision}</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Core Values</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What We Stand For</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {FALLBACK_CORE_VALUES.map((value, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                <Card hover className="text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {value.title[0]}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Leadership</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meet Our Team</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FALLBACK_LEADERSHIP.map((leader, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <Card hover className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center mx-auto mb-4">
                    <FaUserTie className="text-white text-2xl" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{leader.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{leader.role}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{leader.bio}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Facilities</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">World-Class Campus</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FALLBACK_FACILITIES.map((facility, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{facility}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

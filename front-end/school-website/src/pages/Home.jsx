import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaChalkboardTeacher,
  FaBuilding,
  FaHeart,
  FaShieldAlt,
  FaGlobeAfrica,
  FaUsers,
  FaBullseye,
  FaEye,
} from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import {
  SCHOOL_NAME,
  SCHOOL_TAGLINE,
  DASHBOARD_ENTRY_PATH,
  FALLBACK_STATS,
  FALLBACK_WHY_CHOOSE_US,
  FALLBACK_CORE_VALUES,
  FALLBACK_SCHOOL_INFO,
} from '../utils/constants'
import { useSchoolInfo } from '../hooks/useWebsiteData'

const ADMIN_TAP_COUNT = 5
const ADMIN_TAP_WINDOW_MS = 2500

const iconMap = {
  FaChalkboardTeacher,
  FaBuilding,
  FaHeart,
  FaShieldAlt,
  FaGlobeAfrica,
  FaUsers,
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function Home() {
  const { data: schoolInfo } = useSchoolInfo()
  const info = { ...FALLBACK_SCHOOL_INFO, ...schoolInfo }
  const navigate = useNavigate()
  const adminTapCount = useRef(0)
  const adminTapTimer = useRef(null)

  const handleAdminEntryTap = () => {
    adminTapCount.current += 1
    if (adminTapTimer.current) clearTimeout(adminTapTimer.current)
    if (adminTapCount.current >= ADMIN_TAP_COUNT) {
      adminTapCount.current = 0
      navigate(DASHBOARD_ENTRY_PATH)
      return
    }
    adminTapTimer.current = setTimeout(() => {
      adminTapCount.current = 0
    }, ADMIN_TAP_WINDOW_MS)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-indigo-800 text-white min-h-[85vh] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Badge
                color="secondary"
                className="mb-6 cursor-default select-none bg-white/20 text-white"
                onClick={handleAdminEntryTap}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleAdminEntryTap()
                }}
                role="presentation"
              >
                Welcome to {SCHOOL_NAME}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-secondary">Biruk Academy </span>Nurturing Tomorrow&apos;s Leaders
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
                {info.description || SCHOOL_TAGLINE}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/admissions">
                  <Button size="lg" variant="secondary">Apply Now <FiArrowRight /></Button>
                </Link>
                <a href="#about">
                  <Button size="lg" variant="white">Learn More</Button>
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="w-full aspect-square max-w-md mx-auto rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <FaGraduationCapLarge />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="about" className="section-padding scroll-mt-24">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4">About Us</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              A Legacy of Excellence in Ethiopian Education
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Founded in {info.founded || '2008'}, Biruk Academy has been shaping young minds in Addis Ababa.
              We blend Ethiopian cultural heritage with modern teaching methods to create well-rounded learners.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.div {...fadeUp}>
              <Card className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FaBullseye className="text-primary text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
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
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{info.vision}</p>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {FALLBACK_CORE_VALUES.map((value, i) => (
              <motion.div key={value.title} {...fadeUp} transition={{ delay: i * 0.06 }}>
                <Card hover className="text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {value.title[0]}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{value.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-wide mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <Badge className="mb-4">Principal&apos;s Message</Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {info.principal_name || 'Dr. Selam Bekele'}
              </h2>
              <p className="text-primary font-medium mb-4">Principal</p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                &ldquo;{info.principal_message}&rdquo;
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-primary/30 flex items-center justify-center">
                  <FaChalkboardTeacher className="text-5xl text-primary" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary text-white">
        <div className="container-wide mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {FALLBACK_STATS.map((stat, i) => (
              <motion.div key={stat.label} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-4xl lg:text-5xl font-bold text-secondary mb-2">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">The Biruk Academy Difference</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FALLBACK_WHY_CHOOSE_US.map((item, i) => {
              const Icon = iconMap[item.icon] || FaHeart
              return (
                <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.08 }}>
                  <Card hover>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="text-primary text-xl" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-r from-primary to-purple-700 text-white">
        <div className="container-wide mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Give your child the gift of quality education rooted in Ethiopian values and global excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/admissions">
                <Button size="lg" variant="secondary">Start Application</Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="white">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

function FaGraduationCapLarge() {
  return (
    <svg viewBox="0 0 120 120" className="w-48 h-48 text-white/80" fill="currentColor">
      <path d="M60 15L5 40l55 25 55-25L60 15zm0 35L25 35l35 16 35-16-35-16zm-45 25v20c0 8 20 15 45 15s45-7 45-15V75l-45 20-45-20z" />
    </svg>
  )
}

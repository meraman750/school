import { motion } from 'framer-motion'

export default function PageHero({ title, subtitle, badge }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          {badge && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-4 backdrop-blur-sm">
              {badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg text-white/80 leading-relaxed max-w-2xl">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </section>
  )
}

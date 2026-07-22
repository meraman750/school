import { motion } from 'framer-motion'
import { FaBook, FaLaptop, FaUsers, FaLightbulb, FaPuzzlePiece, FaGlobe } from 'react-icons/fa'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { FALLBACK_PROGRAMS } from '../utils/constants'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const GRADE_LEVELS = [
  { grade: 'KG 1 – KG 3', ages: '4–6 years', focus: 'Play-based learning, social skills, early literacy' },
  { grade: 'Grades 1 – 4', ages: '7–10 years', focus: 'Foundation in Amharic, English, Math, Science' },
  { grade: 'Grades 5 – 8', ages: '11–14 years', focus: 'Advanced subjects, critical thinking, exam prep' },
]

const CURRICULUM = [
  { subject: 'Language', description: 'Reading, writing, and Communication skills global literature' },
  { subject: 'Mathematics', description: 'Problem-solving from basics to algebra' },
  { subject: 'Science', description: 'Hands-on experiments and natural sciences' },
  { subject: 'Social Studies', description: 'Ethiopian history, geography, and civics' },
  { subject: 'ICT & Computer', description: 'Digital literacy and coding basics' },
  { subject: 'Physical Education', description: 'Sports, fitness, and teamwork' },
]

const TEACHING_APPROACH = [
  { title: 'Student-Centered Learning', description: 'Lessons designed around each child\'s pace and interests.', icon: FaUsers },
  { title: 'Interactive Classrooms', description: 'Modern boards, group activities, and collaborative projects.', icon: FaLaptop },
  { title: 'Continuous Assessment', description: 'Regular feedback to track progress and identify needs.', icon: FaBook },
]

const LEARNING_METHODS = [
  { title: 'Project-Based Learning', description: 'Real-world projects that connect theory to practice.', icon: FaPuzzlePiece },
  { title: 'Inquiry-Based Science', description: 'Students explore questions through experiments.', icon: FaLightbulb },
  { title: 'Multilingual Education', description: 'Amharic and English with cultural integration.', icon: FaGlobe },
]

export default function Academics() {
  return (
    <>
      <PageHero
        title="Academics"
        subtitle="A comprehensive curriculum designed to nurture intellectual curiosity and academic excellence."
        badge="Education"
      />

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Programs</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Academic Programs</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {FALLBACK_PROGRAMS.map((program, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <Card hover>
                  <Badge className="mb-3">{program.grades}</Badge>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{program.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{program.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Grade Levels</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Age-Appropriate Learning</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {GRADE_LEVELS.map((level, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <Card hover className="text-center h-full">
                  <h3 className="text-xl font-bold text-primary mb-1">{level.grade}</h3>
                  <p className="text-sm text-gray-500 mb-4">{level.ages}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{level.focus}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Curriculum</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Subjects We Offer</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURRICULUM.map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }}>
                <Card hover className="h-full">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.subject}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Teaching Approach</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How We Teach</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TEACHING_APPROACH.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                  <Card hover className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-primary text-2xl" />
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

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Learning Methods</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Innovative Pedagogy</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {LEARNING_METHODS.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                  <Card hover>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                        <Icon className="text-secondary-dark text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

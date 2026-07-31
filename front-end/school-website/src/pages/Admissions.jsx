import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaFileAlt, FaChevronDown } from 'react-icons/fa'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonText } from '../components/ui/Skeleton'
import { useFaqs } from '../hooks/useWebsiteData'
import { FALLBACK_FAQS } from '../utils/constants'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const REQUIREMENTS = [
  'Child must meet age requirements for the intended grade level',
  'Completed application form with accurate information',
  'Original birth certificate or authenticated copy',
  'Previous school records and transfer certificate (if applicable)',
  'Four recent passport-size photographs',
  'Parent/guardian national ID or passport copy',
  'Medical examination report from a licensed physician',
]

const PROCESS = [
  { step: 1, title: 'Submit Application', description: 'Complete the online or paper application form with required documents.' },
  { step: 2, title: 'Assessment', description: 'Student attends an age-appropriate entrance assessment and interview.' },
  { step: 3, title: 'Review', description: 'Admissions committee reviews application and assessment results.' },
  { step: 4, title: 'Acceptance', description: 'Successful applicants receive an offer letter and enrollment package.' },
  { step: 5, title: 'Enrollment', description: 'Pay registration fee and complete enrollment to secure a place.' },
]

const TUITION = [
  { item: 'Registration Fee', amount: 'ETB 5,000', note: 'One-time, non-refundable' },
  { item: 'KG 1 – KG 3 (Annual)', amount: 'ETB 45,000', note: 'Payable in installments' },
  { item: 'Grades 1 – 4 (Annual)', amount: 'ETB 52,000', note: 'Payable in installments' },
  { item: 'Grades 5 – 8 (Annual)', amount: 'ETB 58,000', note: 'Payable in installments' },
  { item: 'Grades 9 – 12 (Annual)', amount: 'ETB 65,000', note: 'Payable in installments' },
  { item: 'Transportation (Optional)', amount: 'ETB 12,000/yr', note: 'Zone-based pricing' },
]

const DOCUMENTS = [
  'Application Form (download from Downloads page)',
  'Birth Certificate',
  'Previous School Report Card',
  'Transfer Certificate',
  'Passport Photos (4)',
  'Parent/Guardian ID Copy',
  'Medical Report',
]

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.question}</span>
        <FaChevronDown className={`text-primary shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Admissions() {
  const { data: faqs, isLoading } = useFaqs()
  const faqList = faqs?.length ? faqs : FALLBACK_FAQS
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <PageHero
        title="Admissions"
        subtitle="Join the Biruk Academy family. We welcome applications from families who share our commitment to excellence."
        badge="Enroll Today"
      />

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div {...fadeUp}>
              <Badge className="mb-4">Requirements</Badge>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admission Requirements</h2>
              <ul className="space-y-3">
                {REQUIREMENTS.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <FaCheckCircle className="text-primary mt-0.5 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <Badge className="mb-4">Documents</Badge>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Required Documents</h2>
              <div className="grid grid-cols-1 gap-3">
                {DOCUMENTS.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    <FaFileAlt className="text-primary shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
                  </div>
                ))}
              </div>
              <Link to="/downloads" className="inline-block mt-4">
                <Button variant="outline" size="sm">Download Forms</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Process</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How to Apply</h2>
          </motion.div>
          <div className="grid md:grid-cols-5 gap-4">
            {PROCESS.map((step, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <Card className="text-center h-full relative">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-3 font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Tuition</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Fee Structure 2024–2025</h2>
          </motion.div>
          <div className="max-w-2xl mx-auto">
            <Card padding={false} className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary/5 dark:bg-primary/10">
                    <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Item</th>
                    <th className="text-right p-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {TUITION.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{row.item}</p>
                        <p className="text-xs text-gray-500">{row.note}</p>
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-primary">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-wide mx-auto max-w-3xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">FAQs</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </motion.div>
          {isLoading ? (
            <SkeletonText lines={5} />
          ) : (
            <div className="space-y-3">
              {faqList.map((faq, i) => (
                <FaqItem
                  key={faq.id || i}
                  faq={faq}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* <section className="section-padding">
        <div className="container-wide mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Apply?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Download the application form or contact our admissions office.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/downloads"><Button>Download Application</Button></Link>
              <Link to="/contact"><Button variant="outline">Contact Admissions</Button></Link>
            </div>
          </motion.div>
        </div>
      </section> */}
    </>
  )
}

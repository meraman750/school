import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import { SCHOOL_NAME } from '../utils/constants'

export default function Terms() {
  return (
    <>
      <PageHero title="Terms of Service" subtitle={`Terms and conditions for using the ${SCHOOL_NAME} website.`} badge="Legal" />
      <section className="section-padding">
        <div className="container-wide mx-auto max-w-3xl">
          <Card className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-gray-500 mb-8">Last updated: July 1, 2026</p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              By accessing and using the {SCHOOL_NAME} website, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use our website.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Use of Website</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              This website is provided for informational purposes about our school, programs, admissions, and
              services. You agree to use the website only for lawful purposes and in accordance with these terms.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property
              of {SCHOOL_NAME} and is protected by Ethiopian and international copyright laws.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. User Submissions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Information submitted through contact forms, applications, and newsletter subscriptions must be
              accurate and truthful. We reserve the right to reject any submission that contains false or misleading information.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              While we strive to keep information accurate and up to date, we make no warranties about the
              completeness or accuracy of website content. Tuition fees and program details are subject to change.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {SCHOOL_NAME} shall not be liable for any indirect, incidental, or consequential damages arising
              from your use of this website.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">7. Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              These terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes
              shall be resolved in the courts of Addis Ababa.
            </p>
          </Card>
        </div>
      </section>
    </>
  )
}

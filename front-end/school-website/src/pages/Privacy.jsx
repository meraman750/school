import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import { SCHOOL_NAME } from '../utils/constants'

export default function Privacy() {
  return (
    <>
      <PageHero title="Privacy Policy" subtitle={`How ${SCHOOL_NAME} collects, uses, and protects your information.`} badge="Legal" />
      <section className="section-padding">
        <div className="container-wide mx-auto max-w-3xl">
          <Card className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-gray-500 mb-8">Last updated: January 1, 2025</p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              We collect information you provide directly, including name, email address, phone number, and messages
              submitted through our contact forms, newsletter subscriptions, and job applications. We may also collect
              usage data when you visit our website.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Your information is used to respond to inquiries, process admissions and employment applications,
              send school newsletters and updates, improve our website and services, and comply with legal obligations
              under Ethiopian law.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              We do not sell or rent your personal information. We may share data with trusted service providers
              who assist in operating our website and school administration, subject to confidentiality agreements.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              You may request access to, correction of, or deletion of your personal data by contacting us at
              info@birukacademy.edu.et. You may unsubscribe from our newsletter at any time.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">6. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              For privacy-related questions, contact us at info@birukacademy.edu.et or +251 11 123 4567,
              Bole Sub-City, Addis Ababa, Ethiopia.
            </p>
          </Card>
        </div>
      </section>
    </>
  )
}

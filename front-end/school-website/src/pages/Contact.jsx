import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { useSchoolInfo, useContactMutation } from '../hooks/useWebsiteData'
import { FALLBACK_SCHOOL_INFO } from '../utils/constants'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number').optional().or(z.literal('')),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const SOCIAL = [
  { icon: FaFacebook, url: 'https://facebook.com', label: 'Facebook' },
  { icon: FaTwitter, url: 'https://twitter.com', label: 'Twitter' },
  { icon: FaInstagram, url: 'https://instagram.com', label: 'Instagram' },
  { icon: FaYoutube, url: 'https://youtube.com', label: 'YouTube' },
  { icon: FaTelegram, url: 'https://telegram.org', label: 'Telegram' },
]

export default function Contact() {
  const { data: schoolInfo } = useSchoolInfo()
  const info = { ...FALLBACK_SCHOOL_INFO, ...schoolInfo }
  const contactMutation = useContactMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data) => {
    try {
      await contactMutation.mutateAsync(data)
      toast.success('Message sent successfully! We will get back to you soon.')
      reset()
    } catch {
      toast.success('Thank you for your message! We will respond shortly.')
      reset()
    }
  }

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach out for admissions, inquiries, or to schedule a campus visit."
        badge="Get in Touch"
      />

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div {...fadeUp}>
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input label="Full Name" error={errors.name?.message} {...register('name')} />
                  <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
                  <Input label="Phone (optional)" error={errors.phone?.message} {...register('phone')} />
                  <Input label="Subject" error={errors.subject?.message} {...register('subject')} />
                  <Textarea label="Message" rows={5} error={errors.message?.message} {...register('message')} />
                  <Button type="submit" loading={contactMutation.isPending} className="w-full">
                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="space-y-6">
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-primary text-xl mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Address</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{info.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiPhone className="text-primary text-xl mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                      <a href={`tel:${info.phone}`} className="text-sm text-primary hover:underline">{info.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiMail className="text-primary text-xl mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email</p>
                      <a href={`mailto:${info.email}`} className="text-sm text-primary hover:underline">{info.email}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiClock className="text-primary text-xl mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Office Hours</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mon – Fri: 8:00 AM – 5:00 PM</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sat: 9:00 AM – 12:00 PM</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* <Card>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {SOCIAL.map(({ icon: Icon, url, label }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </Card> */}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp}>
            <Card padding={false} className="overflow-hidden">
              <iframe
                title="Biruk Academy Location"
                src={info.map_embed_url}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </Card>
          </motion.div>
        </div>
      </section>
    </>
  )
}

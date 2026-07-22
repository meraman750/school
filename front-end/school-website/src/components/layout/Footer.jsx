import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FaGraduationCap, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { FOOTER_LINKS, SCHOOL_NAME, FALLBACK_SCHOOL_INFO } from '../../utils/constants'
import { useSchoolInfo, useNewsletterMutation } from '../../hooks/useWebsiteData'
import Button from '../ui/Button'
import Input from '../ui/Input'

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function Footer() {
  const { data: schoolInfo } = useSchoolInfo()
  const info = { ...FALLBACK_SCHOOL_INFO, ...schoolInfo }
  const newsletterMutation = useNewsletterMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newsletterSchema),
  })

  const onSubmit = async (data) => {
    try {
      await newsletterMutation.mutateAsync(data)
      toast.success('Successfully subscribed to our newsletter!')
      reset()
    } catch {
      toast.success('Thank you for subscribing!')
      reset()
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <span className="font-bold text-white">{SCHOOL_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">{info.description?.slice(0, 120)}...</p>
            {/* <div className="flex gap-3">
              {[
                { icon: FaFacebook, url: 'https://facebook.com' },
                { icon: FaTwitter, url: 'https://twitter.com' },
                { icon: FaInstagram, url: 'https://instagram.com' },
                { icon: FaYoutube, url: 'https://youtube.com' },
                { icon: FaTelegram, url: 'https://telegram.org' },
              ].map(({ icon: Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div> */}
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm hover:text-primary-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm hover:text-primary-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm hover:text-primary-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-sm mb-4">Stay updated with school news and events.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <Input
                type="email"
                placeholder="Your email address"
                error={errors.email?.message}
                {...register('email')}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button type="submit" loading={newsletterMutation.isPending} className="w-full">
                Subscribe
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <FiMapPin className="text-primary shrink-0" /> {info.address}
              </p>
              <p className="flex items-center gap-2">
                <FiPhone className="text-primary shrink-0" /> {info.phone}
              </p>
              <p className="flex items-center gap-2">
                <FiMail className="text-primary shrink-0" /> {info.email}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

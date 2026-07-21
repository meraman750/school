import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiBriefcase, FiClock } from 'react-icons/fi'
import PageHero from '../components/layout/PageHero'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useJobs } from '../hooks/useWebsiteData'
import { FALLBACK_JOBS } from '../utils/constants'

const applicationSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  position: z.string().min(1, 'Select a position'),
  experience: z.string().min(1, 'Experience is required'),
  cover_letter: z.string().min(20, 'Cover letter must be at least 20 characters'),
})

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

function formatDate(dateStr) {
  if (!dateStr) return 'Open'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Careers() {
  const { data: jobs, isLoading } = useJobs()
  const jobList = jobs?.length ? jobs : FALLBACK_JOBS
  const [selectedJob, setSelectedJob] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applicationSchema),
  })

  const onSubmit = async () => {
    toast.success('Application submitted successfully! We will review and contact you.')
    reset()
    setSelectedJob(null)
  }

  const applyForJob = (job) => {
    setSelectedJob(job)
    setValue('position', job.title)
    window.scrollTo({ top: document.getElementById('application-form')?.offsetTop - 100, behavior: 'smooth' })
  }

  return (
    <>
      <PageHero
        title="Careers"
        subtitle="Join our team of dedicated educators and staff shaping the future of Ethiopian education."
        badge="We're Hiring"
      />

      <section className="section-padding">
        <div className="container-wide mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <Badge className="mb-4">Open Positions</Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Current Job Openings</h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {jobList.map((job, i) => (
                <motion.div key={job.id || i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                  <Card hover className="h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <FiBriefcase className="text-primary text-xl" />
                    </div>
                    <Badge className="mb-2 w-fit">{job.department}</Badge>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><FiClock /> {job.type}</span>
                      <span>Deadline: {formatDate(job.deadline)}</span>
                    </div>
                    <Button size="sm" onClick={() => applyForJob(job)}>Apply Now</Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div {...fadeUp} id="application-form">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Online Application</h2>
              {selectedJob && (
                <p className="text-sm text-primary mb-6">Applying for: <strong>{selectedJob.title}</strong></p>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
                <Input label="Full Name" error={errors.full_name?.message} {...register('full_name')} />
                <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
                <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
                <Input label="Position" error={errors.position?.message} {...register('position')} />
                <div className="md:col-span-2">
                  <Input label="Years of Experience" error={errors.experience?.message} {...register('experience')} />
                </div>
                <div className="md:col-span-2">
                  <Textarea label="Cover Letter" rows={6} error={errors.cover_letter?.message} {...register('cover_letter')} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full md:w-auto">Submit Application</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>
    </>
  )
}

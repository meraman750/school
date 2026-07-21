import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const websiteApi = {
  getSchoolInfo: () => api.get('/website/school-info/'),
  getBlog: () => api.get('/website/blog/'),
  getEvents: () => api.get('/website/events/'),
  getGallery: () => api.get('/website/gallery/'),
  getJobs: () => api.get('/website/jobs/'),
  getDownloads: () => api.get('/website/downloads/'),
  getFaqs: () => api.get('/website/faqs/'),
  submitContact: (data) => api.post('/website/contact/', data),
  subscribeNewsletter: (data) => api.post('/website/newsletter/', data),
}

export default api

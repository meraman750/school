export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const DASHBOARD_LOGIN_URL =
  import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3001/dashboard/login'

export const SCHOOL_NAME = 'Biruk Academy Primary School'
export const SCHOOL_TAGLINE = 'Nurturing Excellence in Addis Ababa'
export const SCHOOL_LOCATION = 'Addis Ababa, Ethiopia'

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Academics', path: '/academics' },
  { label: 'Admissions', path: '/admissions' },
  { label: 'News & Events', path: '/news-events' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
]

export const FOOTER_LINKS = {
  explore: [
    { label: 'About Us', path: '/about' },
    { label: 'Academics', path: '/academics' },
    { label: 'Admissions', path: '/admissions' },
    { label: 'Gallery', path: '/gallery' },
  ],
  resources: [
    { label: 'Downloads', path: '/downloads' },
    { label: 'Careers', path: '/careers' },
    { label: 'News & Events', path: '/news-events' },
    { label: 'Contact', path: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
  ],
}

export const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://facebook.com', icon: 'FaFacebook' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'FaTwitter' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'FaInstagram' },
  { name: 'YouTube', url: 'https://youtube.com', icon: 'FaYoutube' },
  { name: 'Telegram', url: 'https://telegram.org', icon: 'FaTelegram' },
]

export const FALLBACK_SCHOOL_INFO = {
  name: SCHOOL_NAME,
  tagline: SCHOOL_TAGLINE,
  description:
    'Biruk Academy Primary School is a premier educational institution in Addis Ababa, Ethiopia, dedicated to nurturing young minds through holistic education, Ethiopian values, and global standards of excellence.',
  address: 'Bole Sub-City, Woreda 03, Addis Ababa, Ethiopia',
  phone: '+251 11 123 4567',
  email: 'info@birukacademy.edu.et',
  founded: '2008',
  students: '850+',
  teachers: '45+',
  principal_name: 'Dr. Selam Bekele',
  principal_message:
    'At Biruk Academy, we believe every child carries unique gifts waiting to be discovered. Our mission is to create a safe, inspiring environment where Ethiopian heritage meets modern learning — preparing students not just for exams, but for life.',
  mission:
    'To provide quality primary education that develops confident, compassionate, and capable learners rooted in Ethiopian culture and prepared for a global future.',
  vision:
    'To be Addis Ababa\'s most trusted primary school, recognized for academic excellence, character development, and community impact.',
  map_embed_url:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.60912474377!2d38.6963!3d8.9806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85e74e77e269%3A0x5e5e5e5e5e5e5e5e!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1234567890',
}

export const FALLBACK_ACHIEVEMENTS = [
  { title: 'National Excellence Award', year: '2024', description: 'Recognized for outstanding primary education in Ethiopia.' },
  { title: '100% Grade 8 Pass Rate', year: '2023', description: 'All graduating students passed regional examinations.' },
  { title: 'Green School Certification', year: '2022', description: 'Awarded for environmental sustainability initiatives.' },
  { title: 'STEM Innovation Hub', year: '2021', description: 'Established modern science and technology laboratory.' },
]

export const FALLBACK_STATS = [
  { label: 'Students Enrolled', value: '850+' },
  { label: 'Qualified Teachers', value: '45+' },
  { label: 'Years of Excellence', value: '16+' },
  { label: 'Extracurricular Clubs', value: '12' },
]

export const FALLBACK_WHY_CHOOSE_US = [
  { title: 'Experienced Faculty', description: 'Dedicated educators with advanced degrees and passion for teaching.', icon: 'FaChalkboardTeacher' },
  { title: 'Modern Facilities', description: 'Smart classrooms, library, science lab, and sports complex.', icon: 'FaBuilding' },
  { title: 'Holistic Development', description: 'Academics balanced with arts, sports, and character building.', icon: 'FaHeart' },
  { title: 'Safe Environment', description: 'Secure campus with caring staff and student wellbeing programs.', icon: 'FaShieldAlt' },
  { title: 'Ethiopian Heritage', description: 'Cultural programs celebrating Amharic language and Ethiopian history.', icon: 'FaGlobeAfrica' },
  { title: 'Parent Partnership', description: 'Regular communication and involvement in your child\'s journey.', icon: 'FaUsers' },
]

export const FALLBACK_CORE_VALUES = [
  { title: 'Integrity', description: 'Honesty and ethical behavior in all we do.' },
  { title: 'Excellence', description: 'Striving for the highest standards in learning.' },
  { title: 'Respect', description: 'Valuing diversity, culture, and every individual.' },
  { title: 'Innovation', description: 'Embracing creative thinking and new ideas.' },
  { title: 'Community', description: 'Building strong ties with families and society.' },
]

export const FALLBACK_LEADERSHIP = [
  { name: 'Dr. Selam Bekele', role: 'Principal', bio: '20+ years in education leadership across Ethiopia.' },
  { name: 'Ato Dawit Tesfaye', role: 'Vice Principal', bio: 'Specialist in curriculum development and teacher training.' },
  { name: 'W/ro Hanna Girma', role: 'Head of Academics', bio: 'Expert in primary education and student assessment.' },
  { name: 'Ato Michael Assefa', role: 'Student Affairs Director', bio: 'Passionate about student wellbeing and extracurricular programs.' },
]

export const FALLBACK_FACILITIES = [
  'Modern Smart Classrooms',
  'Well-Stocked Library',
  'Science & Computer Lab',
  'Sports Field & Gymnasium',
  'Art & Music Studio',
  'Cafeteria & Health Clinic',
  'Secure Playground',
  'Transportation Service',
]

export const FALLBACK_PROGRAMS = [
  { name: 'Early Childhood (KG)', grades: 'KG 1 – KG 3', description: 'Play-based learning building foundational literacy and numeracy.' },
  { name: 'Lower Primary', grades: 'Grades 1 – 4', description: 'Core subjects with emphasis on Amharic, English, and mathematics.' },
  { name: 'Upper Primary', grades: 'Grades 5 – 8', description: 'Advanced curriculum preparing students for secondary education.' },
  { name: 'After-School Programs', grades: 'All Grades', description: 'Tutoring, clubs, sports, and cultural activities.' },
]

export const FALLBACK_BLOG = [
  { id: 1, title: 'Annual Science Fair Highlights Innovation', excerpt: 'Students showcased creative projects at our 2024 Science Fair.', date: '2024-11-15', category: 'News', image: null },
  { id: 2, title: 'New Library Opens for Young Readers', excerpt: 'Our expanded library now houses over 5,000 books for all ages.', date: '2024-10-20', category: 'Announcement', image: null },
  { id: 3, title: 'Sports Day 2024: A Day of Team Spirit', excerpt: 'Students competed in athletics, football, and traditional games.', date: '2024-09-28', category: 'Events', image: null },
]

export const FALLBACK_EVENTS = [
  { id: 1, title: 'Parent-Teacher Conference', date: '2025-02-15', location: 'Main Hall', description: 'Meet teachers and discuss your child\'s progress.' },
  { id: 2, title: 'Ethiopian New Year Celebration', date: '2025-09-11', location: 'School Campus', description: 'Cultural performances and traditional festivities.' },
  { id: 3, title: 'Grade 8 Graduation Ceremony', date: '2025-07-05', location: 'Auditorium', description: 'Celebrating our graduating class of 2025.' },
]

export const FALLBACK_GALLERY = [
  { id: 1, title: 'Morning Assembly', category: 'school_life', type: 'image', url: null },
  { id: 2, title: 'Science Lab Session', category: 'campus', type: 'image', url: null },
  { id: 3, title: 'Sports Day', category: 'school_life', type: 'image', url: null },
  { id: 4, title: 'Art Exhibition', category: 'campus', type: 'image', url: null },
  { id: 5, title: 'Graduation Ceremony', category: 'events', type: 'video', url: null },
  { id: 6, title: 'Library Reading Corner', category: 'campus', type: 'image', url: null },
]

export const FALLBACK_DOWNLOADS = [
  { id: 1, title: 'Admission Application Form', category: 'forms', file_type: 'PDF', file_url: '#', size: '245 KB' },
  { id: 2, title: 'Academic Calendar 2024-2025', category: 'calendar', file_type: 'PDF', file_url: '#', size: '180 KB' },
  { id: 3, title: 'Fee Structure 2024-2025', category: 'fees', file_type: 'PDF', file_url: '#', size: '120 KB' },
  { id: 4, title: 'Student Handbook', category: 'handbook', file_type: 'PDF', file_url: '#', size: '1.2 MB' },
]

export const FALLBACK_JOBS = [
  { id: 1, title: 'Primary School Teacher (Mathematics)', department: 'Academics', type: 'Full-time', deadline: '2025-03-01', description: 'Seeking qualified teacher with B.Ed and 3+ years experience.' },
  { id: 2, title: 'School Counselor', department: 'Student Affairs', type: 'Full-time', deadline: '2025-02-28', description: 'Support student wellbeing and guidance programs.' },
  { id: 3, title: 'IT Support Specialist', department: 'Administration', type: 'Part-time', deadline: '2025-03-15', description: 'Maintain computer lab and digital learning tools.' },
]

export const FALLBACK_FAQS = [
  { id: 1, question: 'What age can my child enroll?', answer: 'Children must be at least 4 years old for KG 1 enrollment. Age requirements vary by grade level.' },
  { id: 2, question: 'What documents are required for admission?', answer: 'Birth certificate, previous school records, passport photos, and parent/guardian ID are required.' },
  { id: 3, question: 'Does the school provide transportation?', answer: 'Yes, we offer safe bus service covering major areas of Addis Ababa.' },
  { id: 4, question: 'What languages are taught?', answer: 'Amharic and English are primary languages of instruction, with optional French.' },
  { id: 5, question: 'Are scholarships available?', answer: 'Merit-based and need-based scholarships are available for qualifying students.' },
]

export const FALLBACK_STUDENT_HIGHLIGHTS = [
  { name: 'Meron A.', grade: 'Grade 8', achievement: 'Regional Math Olympiad Gold Medalist' },
  { name: 'Yonas T.', grade: 'Grade 7', achievement: 'National Essay Competition Winner' },
  { name: 'Sara M.', grade: 'Grade 6', achievement: 'Young Scientist of the Year Award' },
]

export const SEARCH_INDEX = [
  { title: 'About Us', path: '/about', keywords: 'history mission vision leadership facilities' },
  { title: 'Academics', path: '/academics', keywords: 'programs curriculum grades teaching' },
  { title: 'Admissions', path: '/admissions', keywords: 'enroll apply tuition requirements' },
  { title: 'Contact', path: '/contact', keywords: 'address phone email location map' },
  { title: 'Downloads', path: '/downloads', keywords: 'forms calendar fees handbook' },
  { title: 'Careers', path: '/careers', keywords: 'jobs employment apply work' },
  { title: 'Gallery', path: '/gallery', keywords: 'photos videos campus school life' },
  { title: 'News & Events', path: '/news-events', keywords: 'blog announcements events news' },
]

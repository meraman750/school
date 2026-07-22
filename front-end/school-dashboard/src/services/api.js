import axios from 'axios';
import { API_BASE_URL, TOKEN_KEYS } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

export const tokenStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEYS.ACCESS),
  getRefresh: () => localStorage.getItem(TOKEN_KEYS.REFRESH),
  getUser: () => {
    const raw = localStorage.getItem(TOKEN_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  setTokens: ({ access, refresh, user }) => {
    if (access) localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    if (refresh) localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
    if (user) localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.USER);
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refresh = tokenStorage.getRefresh();
    if (!refresh) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
      tokenStorage.setTokens({ access: data.access, refresh: data.refresh || refresh });
      processQueue(null, data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStorage.clear();
      window.location.href = '/dashboard/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const authApi = {
  login: (credentials) => api.post('auth/login/', credentials).then((r) => r.data),
  refresh: (refresh) => api.post('auth/refresh/', { refresh }).then((r) => r.data),
  logout: (refresh) => api.post('auth/logout/', { refresh }).then((r) => r.data),
  forgotPassword: (email) => api.post('auth/forgot-password/', { email }).then((r) => r.data),
  resetPassword: (payload) => api.post('auth/reset-password/', payload).then((r) => r.data),
};

function createResourceService(basePath) {
  return {
    list: (params) => api.get(`${basePath}/`, { params }).then((r) => r.data),
    get: (id) => api.get(`${basePath}/${id}/`).then((r) => r.data),
    create: (data) => api.post(`${basePath}/`, data).then((r) => r.data),
    update: (id, data) => api.patch(`${basePath}/${id}/`, data).then((r) => r.data),
    delete: (id) => api.delete(`${basePath}/${id}/`).then((r) => r.data),
  };
}

export const studentsApi = {
  ...createResourceService('students/students'),
  getProfile: (id) => api.get(`students/students/${id}/profile/`).then((r) => r.data),
  getSubjectsByGrade: (gradeLevel) =>
    api.get('students/students/subjects-by-grade/', { params: { grade_level: gradeLevel } }).then((r) => r.data),
};

export const studentGradeReportsApi = createResourceService('students/grade-reports');
export const studentEnrollmentApi = createResourceService('students/enrollment-records');
export const studentNotesApi = createResourceService('students/notes');
export const teachersApi = createResourceService('teachers/teachers');
export const libraryApi = createResourceService('library/books');
export const communicationApi = createResourceService('communication/announcements');
export const transportApi = createResourceService('transport/routes');
export const inventoryApi = createResourceService('inventory/assets');
export const hrApi = createResourceService('hr/employees');
export const documentsApi = createResourceService('documents/documents');
export const settingsApi = createResourceService('settings/school-profile');

export const dashboardApi = {
  getStats: () => api.get('dashboard/stats/').then((r) => r.data),
};

export const academicsSubApi = {
  years: createResourceService('academics/academic-years'),
  classes: createResourceService('academics/classes'),
  subjects: createResourceService('academics/subjects'),
  assignments: createResourceService('academics/assignments'),
  exams: createResourceService('academics/examinations'),
  grades: createResourceService('academics/grades'),
};

export const exportReport = async (type, params = {}) => {
  const response = await api.get(`reports/${type}/`, {
    params: { format: 'csv', ...params },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${type}-export.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;

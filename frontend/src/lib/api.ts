import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put('/auth/profile', data),
};

export const resumeAPI = {
  upload: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
  },
  getAll: () => api.get('/resumes'),
  getOne: (id: string) => api.get(`/resumes/${id}`),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  analyze: (id: string) => api.post(`/resumes/${id}/analyze`),
  skillGap: (id: string, targetRole: string) =>
    api.post(`/resumes/${id}/skill-gap`, { targetRole }),
  optimize: (id: string) => api.post(`/resumes/${id}/optimize`),
  interview: (id: string, difficulty: string) =>
    api.post(`/resumes/${id}/interview`, { difficulty }),
  jobMatch: (id: string) => api.post(`/resumes/${id}/job-match`),
  coverLetter: (id: string, jobTitle: string, company: string) =>
    api.post(`/resumes/${id}/cover-letter`, { jobTitle, company }),
  linkedinAnalyze: (profileText: string) =>
    api.post('/resumes/linkedin/analyze', { profileText }),
  dashboardStats: () => api.get('/resumes/dashboard/stats'),
};

export const reportAPI = {
  getAll: () => api.get('/reports'),
  generate: (resumeId: string, type: string) =>
    api.post('/reports/generate', { resumeId, type }),
  exportPDF: (id: string) =>
    api.get(`/reports/${id}/export/pdf`, { responseType: 'blob' }),
  exportExcel: (id: string) =>
    api.get(`/reports/${id}/export/excel`, { responseType: 'blob' }),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: (page = 1) => api.get(`/admin/users?page=${page}`),
  updateUser: (id: string, data: { role?: string; plan?: string }) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  logs: (page = 1) => api.get(`/admin/logs?page=${page}`),
  analytics: () => api.get('/admin/analytics'),
};

export const publicAPI = {
  stats: () => api.get('/stats/public'),
};

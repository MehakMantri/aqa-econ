import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  register: (data: {name: string, email: string, password: string}) => api.post('/api/auth/register', data).then(r => r.data),
  login: (data: {email: string, password: string}) => api.post('/api/auth/login', data).then(r => r.data),

  startSession: () => api.post('/api/sessions/start', {}).then(r => r.data),
  answer: (payload: {session_id: number, question_id: number, selected: string}) => api.post('/api/sessions/answer', payload).then(r => r.data),
  finish: (session_id: number) => api.post('/api/sessions/finish', { session_id }).then(r => r.data),
  nextQuestion: (session_id: number) => api.get('/api/questions/next', { params: { session_id } }).then(r => r.data),

  dashboard: () => api.get('/api/dashboard').then(r => r.data),
}

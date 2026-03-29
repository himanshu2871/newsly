import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/api/auth/register', data);
export const login = (data) => API.post('/api/auth/login', data);
export const getMe = () => API.get('/api/auth/me');

// News
export const getLatestNews = () => API.get('/api/news/latest');
export const getNewsByTopic = (topic, page = 1) => API.get(`/api/news?topic=${topic}&page=${page}`);
export const searchNews = (q, page = 1) => API.get(`/api/news/search?q=${q}&page=${page}`);
export const getIndiaNews = (page = 1) => API.get(`/api/news/india?page=${page}`);
export const getTopics = () => API.get('/api/news/topics');

// Summary
export const summarizeArticle = (data) => API.post('/api/summary', data);

// Bookmarks
export const getBookmarks = () => API.get('/api/bookmarks');
export const saveBookmark = (data) => API.post('/api/bookmarks', data);
export const deleteBookmark = (id) => API.delete(`/api/bookmarks/${id}`);
export const checkBookmark = (url) => API.get(`/api/bookmarks/check?url=${encodeURIComponent(url)}`);

export const getPreferences = () => API.get('/api/preferences');
export const updatePreferences = (topics) => API.put('/api/preferences', { topics });

// History
export const getTodayInHistory = () => API.get('/api/history/today');

// Daily News Brief
export const getDailyBrief = () => API.get('/api/dailynews/brief');

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:5000/api',
});

// Before every request, automatically attach the JWT token if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('errbud_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Helper: normalize MongoDB's _id to id so the rest of the frontend doesn't break
export function normalize<T extends Record<string, any>>(doc: T): T {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return { id: _id ?? rest.id, ...rest } as T;
}

export default api;

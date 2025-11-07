import axios from 'axios';

export const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    // For Axios v1 with AxiosHeaders, prefer set if available
    // @ts-ignore
    if (typeof config.headers.set === 'function') {
      // @ts-ignore
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number; pages: number };

export type User = { id: string; email: string; username: string };
export type Post = { id: string; title: string; body: string; author: User; createdAt: string; updatedAt: string };
export type Comment = { id: string; content: string; author: User; createdAt: string };

import axios from "axios";
import type { Book } from "../types/book";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const api = axios.create({ baseURL: API_BASE });

// Log server error body for easier debugging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // print helpful debug info
    console.error("API error:", {
      message: err.message,
      status: err?.response?.status,
      responseData: err?.response?.data,
      config: { url: err?.config?.url, method: err?.config?.method, data: err?.config?.data },
    });
    return Promise.reject(err);
  }
);

export async function checkApi() {
  try {
    const res = await api.get<Book[]>("/books");
    return { ok: true, status: res.status, count: Array.isArray(res.data) ? res.data.length : undefined, data: res.data };
  } catch (err: any) {
    return { ok: false, status: err?.response?.status, responseData: err?.response?.data, message: err?.message };
  }
}

export async function getBooks(): Promise<Book[]> {
  const res = await api.get<Book[]>("/books");
  return res.data;
}

export async function createBook(payload: Partial<Book>): Promise<Book> {
  // send payload as-is (author now allowed as string, categories as string[])
  const res = await api.post<Book>("/books", payload);
  return res.data;
}

export async function updateBook(id: string, payload: Partial<Book>): Promise<Book> {
  const res = await api.put<Book>(`/books/${id}`, payload);
  return res.data;
}

export async function deleteBook(id: string): Promise<void> {
  await api.delete(`/books/${id}`);
}

export default api;

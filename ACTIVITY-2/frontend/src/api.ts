import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // ✅ Your NestJS backend URL
});

// Automatically attach token to all authenticated requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;

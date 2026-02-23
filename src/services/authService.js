// services/authService.js
// Single source of truth for all auth-related HTTP calls.
// Components and pages import from here — never call fetch/axios directly.
// This makes it trivial to swap the base URL or add request interceptors later.

import axios from "axios";

// Axios instance pre-configured with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api",
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ────────────────────────────────────────────────────
// Automatically attaches the JWT to every outgoing request if one is stored.
// This means you never have to manually add the Authorization header in components.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ───────────────────────────────────────────────────
// Handles token expiry globally — redirects to login when a 401 is received.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Soft redirect — avoids React Router dependency in this service layer
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Auth API methods
// ---------------------------------------------------------------------------

/**
 * Register a new user.
 * @param {string} email
 * @param {string} password
 */
export const signupUser = async (email, password, firstName, lastName) => {
  const { data } = await api.post("/auth/signup", { email, password, firstName, lastName });
  return data;
};

/**
 * Login existing user.
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { success, token, user }
};

/**
 * Logout — notifies backend (for future blacklist support) and returns.
 * Actual token removal is done by AuthContext after this call.
 */
export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

/**
 * Fetch protected dashboard data.
 * The Authorization header is added automatically by the request interceptor.
 */
export const getDashboardData = async () => {
  const { data } = await api.get("/dashboard");
  return data; // { success, user }
};

export default api;
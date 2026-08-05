"use client";

import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const loginPathByRole = (role) => role === "landlord" ? "/login/landlord" : "/login/tenant";

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = (error?.config && error.config.url) ? error.config.url : "";
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window === "undefined") return Promise.reject(error);
      // Let login/register handle their own error messages.
      if (!url.includes("/auth/login") && !url.includes("/auth/register") && !url.includes("/auth/logout")) {
        // Avoid infinite redirect loop when already on a login page (e.g. getMe() 401).
        const path = window.location.pathname;
        if (!path.startsWith("/login")) {
          localStorage.removeItem("token");
          let role = null;
          try { role = JSON.parse(localStorage.getItem("user") || "{}").role; } catch { /* ignore */ }
          localStorage.removeItem("user");
          window.location.href = loginPathByRole(role);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

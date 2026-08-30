"use client";

import { createContext, useContext, useState, useEffect } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    // Restore session via cookie (JWT + cookies). Force-refresh session validity (e.g. after another device logs in).
    authApi.getMe()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch(() => { localStorage.removeItem("user"); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (data) => {
    try {
      const res = await authApi.login(data);
      const result = res.data;

      if (!result?.user) {
        throw new Error("Invalid response from server: no user data");
      }

      // Token chỉ tồn tại trong cookie HttpOnly do backend set (không đọc được từ JS).
      // Ở đây chỉ cache thông tin user để render nhanh trước khi /auth/me trả về.
      const userData = result.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;

    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const u = res.data.user;
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    return u;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (e) {
      console.error("Logout error:", e.message);
    }
    localStorage.removeItem("user");
    setUser(null);
  };

  const adoptUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, adoptUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

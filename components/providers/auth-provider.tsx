"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  getToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const safeAuth = auth as unknown as Auth;
    const unsubscribe = onAuthStateChanged(safeAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth as unknown as Auth);
      // Clear all local and session storage
      localStorage.clear();
      sessionStorage.clear();
      // Force a full page reload to clear all React state, query cache, and redirect to landing page
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback redirect
      window.location.href = "/";
    }
  };

  const getToken = async () => {
    if (!auth || !auth.currentUser) return null;
    return await auth.currentUser.getIdToken(true); // force refresh optional
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

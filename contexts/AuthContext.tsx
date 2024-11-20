// contexts/AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  loading: boolean; // Added loading state
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  loading: false, // Default to not loading
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/auth/me");
        if (response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        // Optionally redirect to login
        // router.push("/auth/login");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUser();
  }, []);

  // Added useEffect to update isAuthenticated based on user state
  useEffect(() => {
    setIsAuthenticated(user !== null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  userRole: string | null;
  setToken: (token: string | null) => void;
  setUserRole: (role: string | null) => void;
  isCustomer: () => boolean;
  requireCustomer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize values from localStorage
    setToken(localStorage.getItem("accessToken"));
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  const isCustomer = () => {
    return userRole === "CUSTOMER";
  };

  const requireCustomer = () => {
    if (!isCustomer()) {
      router.push("/unauthorized");
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      userRole,
      setToken,
      setUserRole,
      isCustomer,
      requireCustomer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

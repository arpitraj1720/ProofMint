import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  User,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  loginUser,
  loginWithGoogle,
  registerUser,
  getMe,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  loginGoogle: (params: string | { idToken?: string; credential?: string; accessToken?: string }) => Promise<void>;
  register: (username: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        clearAuthToken();
        setUser(null);
        setToken(null);
      }
    } catch {
      clearAuthToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleLogin = async (identifier: string, pass: string) => {
    const res = await loginUser(identifier, pass);
    if (res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const handleGoogleLogin = async (params: string | { idToken?: string; credential?: string; accessToken?: string }) => {
    const res = await loginWithGoogle(params);
    if (res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const handleRegister = async (username: string, email: string, pass: string) => {
    const res = await registerUser(username, email, pass);
    if (res.token) {
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login: handleLogin,
        loginGoogle: handleGoogleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

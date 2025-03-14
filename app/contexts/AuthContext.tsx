'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从本地存储加载用户信息
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        
        if (storedToken && storedUserId) {
          setToken(storedToken);
          setUser({ id: storedUserId, email: '' });
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // 登录函数
  const login = (newToken: string, userId: string) => {
    setToken(newToken);
    setUser({ id: userId, email: '' });
    
    // 保存到本地存储
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', userId);
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setToken(null);
    
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  // 是否已认证
  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 自定义Hook，用于在组件中使用认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
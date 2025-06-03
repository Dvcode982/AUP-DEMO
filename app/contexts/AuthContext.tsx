'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  role?: string; // 用户角色如"学生"、"教师"等
  grade?: string; // 年级信息如"2024级"
  department?: string; // 系别信息
  bio?: string; // 个人简介
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string | number, userData?: Partial<User>) => void;
  updateUserProfile: (userData: Partial<User>) => void;
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
        const storedUserData = localStorage.getItem('userData');
        
        if (storedToken && storedUserId) {
          setToken(storedToken);
          
          // 尝试加载更详细的用户信息
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              setUser({ 
                id: storedUserId, 
                email: userData.email || '',
                username: userData.username,
                avatar: userData.avatar,
                role: userData.role,
                grade: userData.grade,
                department: userData.department,
                bio: userData.bio
              });
            } catch {
              // 如果解析失败，回退到基本信息
              setUser({ id: storedUserId, email: '' });
            }
          } else {
            setUser({ id: storedUserId, email: '' });
          }
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // 监听 storage 事件，以便在其他标签页或组件清除 token 时同步状态
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue === null) {
        // token 被清除，同步清除用户状态
        setUser(null);
        setToken(null);
      } else if (e.key === 'token' && e.newValue) {
        // token 被更新，重新加载用户信息
        const storedUserId = localStorage.getItem('userId');
        const storedUserData = localStorage.getItem('userData');
        
        if (storedUserId) {
          setToken(e.newValue);
          
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              setUser({ 
                id: storedUserId, 
                email: userData.email || '',
                username: userData.username,
                avatar: userData.avatar,
                role: userData.role,
                grade: userData.grade,
                department: userData.department,
                bio: userData.bio
              });
            } catch {
              setUser({ id: storedUserId, email: '' });
            }
          }
        }
      }
    };

    // 监听同一域名下其他标签页的 storage 变化
    window.addEventListener('storage', handleStorageChange);

    // 监听当前标签页的 localStorage 清除（用于处理 fetchAPI 中的 401 错误）
    const checkAuthStatus = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken && token) {
        // token 被清除但 state 中还有，需要同步
        setUser(null);
        setToken(null);
      }
    };

    // 定期检查 localStorage 状态
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  // 登录函数
  const login = (newToken: string, userId: string | number, userData?: Partial<User>) => {
    const newUser = { 
      id: String(userId), 
      email: userData?.email || '',
      username: userData?.username || '用户' + String(userId).slice(0, 4),
      avatar: userData?.avatar,
      role: userData?.role || '学生',
      grade: userData?.grade || '2024级',
      department: userData?.department,
      bio: userData?.bio
    };
    
    setToken(newToken);
    setUser(newUser);
    
    // 保存到本地存储
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('userData', JSON.stringify(newUser));
  };

  // 更新用户资料
  const updateUserProfile = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setToken(null);
    
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
  };

  // 是否已认证
  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    updateUserProfile,
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
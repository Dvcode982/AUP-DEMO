const API_BASE_URL = 'http://localhost:5000';

/**
 * 发送API请求的基础函数
 */
export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 设置默认headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // 从本地存储获取token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // 如果有token，添加到headers
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    // 处理401未授权错误
    if (response.status === 401) {
      // 如果在客户端，清除token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // 可以选择重定向到登录页面
        // window.location.href = '/login';
      }
    }
    
    // 解析响应
    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }
    
    // 处理非200状态码
    if (!response.ok) {
      throw new Error(data?.error || response.statusText);
    }
    
    return data;
  } catch (error) {
    // 处理网络错误
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * 用户相关API
 */
export const authAPI = {
  // 用户登录
  login: async (email: string, password: string) => {
    return fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  // 用户注册
  register: async (email: string, password: string, confirmPassword: string) => {
    return fetchAPI('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirmPassword }),
    });
  },
  
  // 获取当前用户信息
  getCurrentUser: async () => {
    return fetchAPI('/user/profile');
  },
};

/**
 * 帖子相关API
 */
export const postsAPI = {
  // 获取帖子列表
  getPosts: async () => {
    return fetchAPI('/posts');
  },
  
  // 创建新帖子
  createPost: async (postData: any) => {
    return fetchAPI('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },
  
  // 获取帖子详情
  getPostById: async (id: string) => {
    return fetchAPI(`/posts/${id}`);
  },
};

/**
 * 失物招领相关API
 */
export const lostAndFoundAPI = {
  // 获取失物招领列表
  getLostAndFoundItems: async () => {
    return fetchAPI('/lost-and-found');
  },
  
  // 创建失物招领
  createLostAndFoundItem: async (itemData: any) => {
    return fetchAPI('/lost-and-found', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },
}; 
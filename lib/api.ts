const API_BASE_URL = 'http://localhost:5000';

// 创建一个自定义事件，用于通知认证状态变化
const AUTH_EVENT = 'auth-status-changed';

/**
 * 发送API请求的基础函数
 */
export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 设置默认headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // 从本地存储获取token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // 如果有token，添加到headers
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    console.log('Using token:', token);
  } else {
    console.log('No token found in localStorage');
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
        localStorage.removeItem('userData');
        
        // 触发自定义事件，通知认证状态变化
        window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { authenticated: false } }));
        
        // 延迟一点时间再重定向，确保状态更新
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
      throw new Error('Authentication token required');
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
 * 认证相关API
 */
export const authAPI = {
  // 用户注册
  register: async (email: string, password: string, confirmPassword: string) => {
    return fetchAPI('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirmPassword }),
    });
  },
  
  // 用户登录
  login: async (email: string, password: string) => {
    return fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

/**
 * 用户相关API
 */
export const usersAPI = {
  // 获取所有用户列表
  getAllUsers: async () => {
    return fetchAPI('/api/users');
  },
  
  // 获取单个用户信息
  getUserById: async (userId: string) => {
    return fetchAPI(`/api/users/${userId}`);
  },

  // 通过邮箱搜索用户
  searchUserByEmail: async (email: string) => {
    return fetchAPI(`/api/users/search?email=${encodeURIComponent(email)}`);
  },
  
  // 获取当前用户完整资料
  getCurrentUserProfile: async () => {
    return fetchAPI('/api/user/profile');
  },
  
  // 更新当前用户资料
  updateUserProfile: async (profileData: {
    username?: string;
    bio?: string;
    department?: string;
    grade?: string;
    role?: string;
    avatar?: string;
  }) => {
    return fetchAPI('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

/**
 * 消息相关API
 */
export const messagesAPI = {
  getConversations: async () => {
    return fetchAPI('/api/messages/conversations');
  },
  
  getMessages: async (chatId: string) => {
    console.log('Fetching messages for chat:', chatId);
    const response = await fetchAPI(`/api/messages/${chatId}`);
    console.log('Received messages:', response);
    return response;
  },
  
  sendMessage: async (receiverId: string, content: string, type: 'text' | 'image' = 'text') => {
    console.log('Sending message:', { receiverId, content, type });
    return fetchAPI('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, type }),
    });
  },

  uploadImage: async (chatId: string, formData: FormData) => {
    const file = formData.get('image') as File;
    if (!file) throw new Error('No image file provided');

    try {
      console.log('Reading image file...');
      // 添加图片大小检查
      if (file.size > 10 * 1024 * 1024) { // 10MB 限制
        throw new Error('Image too large, please select a file under 10MB');
      }

      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      return { url: base64Image };
    } catch (error) {
      console.error('Image process failed:', error);
      throw error;
    }
  },

  markAsRead: async (messageId: string) => {
    return fetchAPI(`/api/messages/${messageId}/read`, {
      method: 'POST',
    });
  },
};

/**
 * 帖子相关API
 */
export const postsAPI = {
  // 获取帖子列表
  getPosts: async (search?: string, category?: string, tag?: string) => {
    let queryParams = '';
    const params = [];
    
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    
    if (category) {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    
    if (tag) {
      params.push(`tag=${encodeURIComponent(tag)}`);
    }
    
    if (params.length > 0) {
      queryParams = `?${params.join('&')}`;
    }
    
    return fetchAPI(`/api/posts${queryParams}`);
  },
  
  // 创建新帖子
  createPost: async (postData: any) => {
    return fetchAPI('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },
  
  // 获取帖子详情
  getPostById: async (id: string) => {
    return fetchAPI(`/api/posts/${id}`);
  },

  // 获取帖子评论
  getPostComments: async (postId: string) => {
    return fetchAPI(`/api/posts/${postId}/comments`);
  },

  // 添加评论
  addComment: async (postId: string, content: string) => {
    return fetchAPI(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // 点赞/取消点赞帖子
  likePost: async (postId: string) => {
    return fetchAPI(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  // 检查用户是否点赞过帖子
  checkLiked: async (postId: string) => {
    return fetchAPI(`/api/posts/${postId}/liked`);
  },

  // 分享帖子
  sharePost: async (postId: string) => {
    return fetchAPI(`/api/posts/${postId}/share`, {
      method: 'POST',
    });
  },
};

/**
 * 失物招领相关API
 */
export const lostAndFoundAPI = {
  // 获取失物招领列表
  getLostAndFoundItems: async (search?: string) => {
    const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchAPI(`/api/lost-and-found${queryParams}`);
  },
  
  // 创建失物招领
  createLostAndFoundItem: async (itemData: any) => {
    return fetchAPI('/api/lost-and-found', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },
  
  // 获取失物招领详情
  getLostAndFoundItemById: async (id: string) => {
    return fetchAPI(`/api/lost-and-found/${id}`);
  },

  // 获取失物招领评论
  getLostAndFoundComments: async (itemId: string) => {
    return fetchAPI(`/api/lost-and-found/${itemId}/comments`);
  },

  // 添加评论
  addLostAndFoundComment: async (itemId: string, content: string) => {
    return fetchAPI(`/api/lost-and-found/${itemId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // 标记物品已找到/已归还
  markAsReturned: async (itemId: string) => {
    return fetchAPI(`/api/lost-and-found/${itemId}/return`, {
      method: 'PUT',
    });
  },

  // 分享失物招领
  sharePost: async (itemId: string) => {
    return fetchAPI(`/api/lost-and-found/${itemId}/share`, {
      method: 'POST',
    });
  },
};

/**
 * 主题聚合相关API
 */
export const topicAggregationAPI = {
  // 获取主题推荐
  getTopicRecommendations: async () => {
    return fetchAPI('/api/topic-recommendations');
  },
  
  // 获取智能聚合的帖子
  getAggregatedPosts: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const queryString = params.toString();
    return fetchAPI(`/api/aggregated-posts${queryString ? `?${queryString}` : ''}`);
  },
  
  // 获取主题下的热门标签
  getTopicPopularTags: async (topic: string, limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    return fetchAPI(`/api/topics/${encodeURIComponent(topic)}/popular-tags${queryString ? `?${queryString}` : ''}`);
  },
  
  // 记录用户交互行为
  trackInteraction: async (data: {
    postId?: string;
    topic?: string;
    tag?: string;
    actionType: 'view' | 'like' | 'comment' | 'share' | 'create';
  }) => {
    return fetchAPI('/api/track-interaction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
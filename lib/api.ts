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
        
        // 重定向到登录页面
        window.location.href = '/login';
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
    
    const currentUserId = localStorage.getItem('userId');
    
    if (chatId.startsWith('post-')) {
      const postId = chatId.replace('post-', '');
      try {
        // 从数据库获取该帖子的所有评论
        const comments = await fetchAPI(`/api/posts/${postId}/comments`);
        console.log('Fetched post comments:', comments);

        // 用 userId 判断归属
        return {
          messages: comments.map((comment: any) => ({
            id: String(comment.id),
            content: comment.content || '',
            type: comment.type || 'text',
            sender: String(comment.userId) === String(currentUserId) ? 'user' : 'other',
            userId: String(comment.userId),
            timestamp: comment.time || comment.created_at || new Date().toISOString(),
            username: comment.author?.split?.('@')[0] || 'Unknown User',
            commentId: comment.id,
            postId: postId
          })),
          postInfo: {
            id: postId
          }
        };
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        throw error;
      }
    }
    
    // 私聊消息
    const response = await fetchAPI(`/api/messages/${chatId}`);
    console.log('Received messages:', response);
    return response;
  },
  
  sendMessage: async (receiverId: string, content: string, type: 'text' | 'image' = 'text') => {
    console.log('Sending message:', { receiverId, content, type });
    
    const currentUserId = localStorage.getItem('userId');

    if (receiverId.startsWith('post-')) {
      const postId = receiverId.replace('post-', '');
      try {
        // 发送评论到数据库
        const response = await fetchAPI(`/api/posts/${postId}/comments`, {
          method: 'POST',
          body: JSON.stringify({
            content,
            type,
            userId: currentUserId,
            postId: postId,
            created_at: new Date().toISOString()
          }),
        });

        console.log('Comment saved:', response);

        // 确保返回完整的评论数据
        return {
          id: String(response.id),
          content,
          type,
          sender: 'user',
          userId: currentUserId,
          created_at: response.created_at || new Date().toISOString(),
          postId: postId,
          commentId: response.id
        };
      } catch (error) {
        console.error('Error saving comment:', error);
        throw error;
      }
    }

    // 私聊消息
    return fetchAPI('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, type }),
    });
  },

  uploadImage: async (chatId: string, formData: FormData, onProgress?: (progress: number) => void) => {
    const file = formData.get('image') as File;
    if (!file) throw new Error('No image file provided');

    try {
      console.log('Reading image file...');
      // 添加图片大小检查
      if (file.size > 10 * 1024 * 1024) { // 10MB 限制
        throw new Error('图片太大，请选择小于10MB的文件');
      }

      // 图片压缩函数
      const compressImage = (file: File, quality: number = 0.8): Promise<string> => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            // 计算压缩后的尺寸
            let { width, height } = img;
            const maxWidth = 1920;
            const maxHeight = 1080;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // 绘制压缩后的图片
            ctx?.drawImage(img, 0, 0, width, height);
            
            // 转换为Base64
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
          };
          
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      };

      // 模拟上传进度
      if (onProgress) {
        onProgress(20);
      }

      const base64Image = await compressImage(file, 0.8);
      
      if (onProgress) {
        onProgress(60);
      }

      // 检查压缩后的大小
      const compressedSize = (base64Image.length * 3) / 4; // 估算字节大小
      if (compressedSize > 5 * 1024 * 1024) { // 5MB 限制压缩后图片
        // 如果还是太大，进一步压缩
        const furtherCompressed = await compressImage(file, 0.6);
        if (onProgress) {
          onProgress(80);
        }
        
        if (onProgress) {
          onProgress(100);
        }
        return { url: furtherCompressed, compressed: true };
      }

      if (onProgress) {
        onProgress(100);
      }

      return { url: base64Image, compressed: base64Image.length < file.size };
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

<<<<<<< HEAD
  markConversationAsRead: async (userId: string) => {
    return fetchAPI(`/api/messages/conversations/${userId}/read`, {
      method: 'POST',
    });
  },

  // 获取消息统计信息
  getMessageStats: async (timeRange: 'today' | 'week' | 'month' = 'week') => {
    return fetchAPI(`/api/messages/stats?timeRange=${timeRange}`);
  },

  // 获取消息时间线
  getMessageTimeline: async (userId: string, limit: number = 50, offset: number = 0) => {
    return fetchAPI(`/api/messages/timeline/${userId}?limit=${limit}&offset=${offset}`);
  },

  // 按时间范围搜索消息
  searchMessagesByTime: async (userId: string, startDate: string, endDate: string) => {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    return fetchAPI(`/api/messages/${userId}/search?${params.toString()}`);
=======
  sendComment: async (postId: string, content: string) => {
    const cleanPostId = postId.replace('post-', '');
    try {
      const comment = await fetchAPI(`/api/posts/${cleanPostId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
      return {
        id: String(comment.id),
        content,
        type: 'text',
        sender: 'user',
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      console.error('Failed to save comment:', error);
      throw error;
    }
  },

  getComments: async (postId: string) => {
    try {
      const cleanPostId = postId.replace('post-', '');
      const data = await fetchAPI(`/api/posts/${cleanPostId}/comments`);
      
      // 处理评论数据
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
>>>>>>> 803e0c25696cfdebff4345d0de587bf1f5b817ed
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
  getLostAndFoundItems: async (search?: string, type?: 'lost' | 'found') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    
    const queryString = params.toString();
    return fetchAPI(`/api/lost-and-found${queryString ? `?${queryString}` : ''}`);
  },
  
  // 获取失物招领统计信息
  getLostAndFoundStats: async () => {
    return fetchAPI('/api/lost-and-found/stats');
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

  // 取消已归还状态
  cancelReturned: async (itemId: string) => {
    return fetchAPI(`/api/lost-and-found/${itemId}/cancel-return`, {
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
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
};

/**
 * 消息相关API
 */
export const messagesAPI = {
  getConversations: async () => {
    return fetchAPI('/api/messages/conversations');
  },
  
  getMessages: async (chatId: string) => {
    const currentUserId = localStorage.getItem('userId');

    if (chatId.startsWith('post-')) {
      const postId = chatId.replace('post-', '');
      try {
        // 从数据库获取该帖子的所有评论
        const comments = await fetchAPI(`/api/posts/${postId}/comments`);
        console.log('Fetched post comments:', comments);

        // 确保评论数据格式正确
        return {
          messages: comments.map((comment: any) => ({
            id: String(comment.id),
            content: comment.content || '',
            type: comment.type || 'text',
            sender: comment.userId === currentUserId ? 'user' : 'other',
            userId: comment.userId,
            timestamp: comment.created_at || new Date().toISOString(),
            username: comment.username || 'Unknown User',
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
    return {
      messages: response.messages.map((msg: any) => ({
        id: String(msg.id),
        content: msg.content,
        type: msg.type || 'text',
        sender: msg.senderId === currentUserId ? 'user' : 'other',
        timestamp: msg.timestamp,
        username: msg.senderName // 发送者名字
      })),
      partnerName: response.partnerName, // 对话者名字
      partnerAvatar: response.partnerAvatar
    };
  },
  
  sendMessage: async (chatId: string, content: string, type: 'text' | 'image' = 'text') => {
    const currentUserId = localStorage.getItem('userId');

    if (chatId.startsWith('post-')) {
      const postId = chatId.replace('post-', '');
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
    const response = await fetchAPI('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId: chatId, content, type }),
    });

    return {
      ...response,
      sender: 'user'
    };
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

  sendComment: async (postId: string, content: string, type: 'text' | 'image' = 'text') => {
    const cleanPostId = postId.replace('post-', '');
    const currentUserId = localStorage.getItem('userId');

    try {
      // 发送评论并保存到数据库
      const comment = await fetchAPI(`/api/posts/${cleanPostId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          type,
          userId: currentUserId,
          created_at: new Date().toISOString()
        })
      });

      // 返回统一格式的评论数据
      return {
        id: String(comment.id),
        content,
        type,
        sender: 'user',
        userId: currentUserId,
        timestamp: comment.created_at || new Date().toISOString(),
        commentId: comment.id,
        postId: cleanPostId
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
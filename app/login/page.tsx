'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authAPI.login(email, password);
      
      // 使用认证上下文登录
      login(data.token, data.userId);
      
      // 如果选择了"记住我"，则设置较长的过期时间
      if (rememberMe) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        document.cookie = `rememberedUser=${email}; expires=${expirationDate.toUTCString()}; path=/`;
      }

      // 导航到首页
      router.push('/');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-end items-center bg-black overflow-hidden">
      {/* 背景层 - 完全保持原始结构 */}
      <div className="absolute inset-0 z-0">
        {/* 顶部背景 */}
        <div className="absolute top-0 left-0 w-full h-[75%] z-0">
          <Image 
            src="/images/bg_top.svg" 
            alt="top background" 
            layout="fill"      
            objectFit="cover"  
            priority
            loading="eager"
            quality={100} 
          />
        </div>

        {/* 中间半透明层 */}
        <div className="absolute top-[45%] left-0 w-full h-[35%] z-10 opacity-100">
          <Image 
            src="/images/bg_mid.svg" 
            alt="middle overlay" 
            layout="fill"
            objectFit="cover"
            priority
            loading="eager"
            quality={100}
          />
        </div>

        {/* 底部背景 */}
        <div className="absolute bottom-0 left-0 w-full h-[50%] z-0 opacity-100">
          <Image 
            src="/images/bg_but.svg" 
            alt="bottom background" 
            layout="fill"
            objectFit="cover"
            priority
            loading="eager"
            quality={100}
          />
        </div>
      </div>

      
      <div className="absolute top-10 text-white text-3xl font-bold z-20 opacity-70">
        爱邮坪 AUP
      </div>

      {/* 登录框 - 严格保持原始结构 */}
      <div className="relative w-[490px] bg-black/0 backdrop-blur-md p-8 rounded-lg overflow-hidden shadow-xl mb-0 z-20">
        <div className="absolute inset-0 w-full h-full z-0 opacity-75">
          <Image 
            src="/images/bg_wind.png" 
            alt="window background"
            layout="fill"
            objectFit="cover"
            priority
            loading="eager"
            quality={100}
          />
        </div>

        {/* 登录表单 - 完全原始代码 */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-3 px-20 py-3 overflow-auto mt-auto">
          {error && (
            <div className="text-red-500 text-sm bg-red-100/10 p-2 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="text-white text-base mt-auto">用户名:</label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 text-xs border border-gray-500 rounded-md bg-gray-900 text-white placeholder-gray-400 mt-auto"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-white text-base mt-auto">密码:</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 text-xs border border-gray-500 rounded-md bg-gray-900 text-white placeholder-gray-400 mt-auto"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mt-auto">
            <input 
              type="checkbox" 
              className="mr-2 mt-auto"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="text-white text-xs mt-auto">记住密码</label>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md font-bold text-sm transition mt-auto disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '提交'}
          </button>

          <div className="mt-auto text-center py-1 text-xs">
            <Link href="/register" className="font-medium text-indigo-500 hover:text-indigo-500">还没有账户？点击这里注册</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
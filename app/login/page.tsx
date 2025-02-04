import Image from 'next/image';
import Link from 'next/link';

export default function Login() {
  return (
    <div className="relative min-h-screen flex flex-col justify-end items-center bg-black overflow-hidden">
      {/* 背景层 */}
      <div className="absolute inset-0 z-0">
        {/* 顶部背景 */}
        <div className="absolute top-0 left-0 w-full h-[75%] z-0">
          <Image src="/images/bg_top.svg" alt="top background" layout="fill" objectFit="cover" />
        </div>

        {/* 中间半透明层 */}
        <div className="absolute top-[45%] left-0 w-full h-[35%] z-10 opacity-100">
          <Image src="/images/bg_mid.svg" alt="middle overlay" layout="fill" objectFit="cover" />
        </div>

        {/* 底部背景 */}
        <div className="absolute bottom-0 left-0 w-full h-[50%] z-0 opacity-100">
          <Image src="/images/bg_but.svg" alt="bottom background" layout="fill" objectFit="cover" />
        </div>
      </div>

      {/* 标题 */}
      <div className="absolute top-10 text-white text-3xl font-bold z-20 opacity-70">
        爱邮坪 AUP
      </div>

      {/* 登录框 */}
      <div className="relative w-[490px] bg-black/0 backdrop-blur-md p-8 rounded-lg overflow-hidden shadow-xl mb-0 z-20">
        {/* 窗口背景图，确保完全覆盖 */}
        <div className="absolute inset-0 w-full h-full z-0 opacity-75">
          <Image 
            src="/images/bg_wind.png" 
            alt="window background" 
            layout="fill" 
            objectFit="cover" 
          />
        </div>

        {/* 登录表单 */}
        <form className="relative z-10 space-y-3 px-20 py-3 overflow-auto mt-auto">
          <div>
            <label className="text-white text-base mt-auto">用户名:</label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 text-xs border border-gray-500 rounded-md bg-gray-900 text-white placeholder-gray-400 mt-auto"
              placeholder="请输入用户名"
            />
          </div>

          <div>
            <label className="text-white text-base mt-auto">密码:</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 text-xs border border-gray-500 rounded-md bg-gray-900 text-white placeholder-gray-400 mt-auto"
              placeholder="请输入密码"
            />
          </div>

          <div className="flex items-center mt-auto">
            <input type="checkbox" className="mr-2 mt-auto" />
            <label className="text-white text-xs mt-auto">记住密码</label>
          </div>

          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md font-bold text-sm transition mt-auto">
            提交
          </button>

          {/* "还没有账户？点击这里注册" 靠近底部 */}
          <div className="mt-auto text-center py-1 text-xs">
            <Link href="/register" className="font-medium text-indigo-500 hover:text-indigo-500">还没有账户？点击这里注册</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

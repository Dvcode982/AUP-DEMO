'use client'
import Sidebar from "../components/Sidebar"
import React, { useState } from 'react';

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [language, setLanguage] = useState('en');
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('medium');
    // 新增状态
    const [profileVisibility, setProfileVisibility] = useState('public');
    const [onlineStatus, setOnlineStatus] = useState(true);
    const [messagePermission, setMessagePermission] = useState('all');
    const [signatures, setSignatures] = useState(true);
    const [autoSave, setAutoSave] = useState(true);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 h-screen flex flex-col opacity-90 dark:opacity-80">
                <div className="p-8 flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* 通知设置 */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">通知设置</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300">论坛通知</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications}
                                            onChange={() => setNotifications(!notifications)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300">邮件通知</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={emailNotifications}
                                            onChange={() => setEmailNotifications(!emailNotifications)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* 语言设置 */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">语言设置</h2>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-blue-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                            >
                                <option value="zh">中文</option>
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                            </select>
                        </section>

                        {/* 样式设置 */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">样式设置</h2>
                            <div className="space-y-4">
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300">主题</label>
                                    <select 
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full p-2 border rounded-lg bg-blue-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="light">默认主题</option>
                                        <option value="dark">EVA-明日香</option>
                                        <option value="system">二次元-秋</option>
                                    </select>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300">字体大小</label>
                                    <select 
                                        value={fontSize}
                                        onChange={(e) => setFontSize(e.target.value)}
                                        className="w-full p-2 border rounded-lg bg-blue-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="small">小</option>
                                        <option value="medium">中</option>
                                        <option value="large">大</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 隐私设置 */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">隐私设置</h2>
                            <div className="space-y-4">
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300">个人资料可见性</label>
                                    <select 
                                        value={profileVisibility}
                                        onChange={(e) => setProfileVisibility(e.target.value)}
                                        className="w-full p-2 border rounded-lg bg-blue-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="public">所有人可见</option>
                                        <option value="friends">仅好友可见</option>
                                        <option value="private">仅自己可见</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300">在线状态显示</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={onlineStatus}
                                            onChange={() => setOnlineStatus(!onlineStatus)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* 消息设置 */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">消息设置</h2>
                            <div className="flex flex-col space-y-2">
                                <label className="text-gray-700 dark:text-gray-300">私信权限</label>
                                <select 
                                    value={messagePermission}
                                    onChange={(e) => setMessagePermission(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-blue-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="all">所有人</option>
                                    <option value="friends">仅好友</option>
                                    <option value="none">禁止私信</option>
                                </select>
                            </div>
                        </section>

                        {/* 发帖设置 */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">发帖设置</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300">显示签名档</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={signatures}
                                            onChange={() => setSignatures(!signatures)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300">自动保存草稿</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={autoSave}
                                            onChange={() => setAutoSave(!autoSave)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
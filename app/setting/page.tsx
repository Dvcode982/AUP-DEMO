'use client'
import Sidebar from "../components/Sidebar"
import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from 'next-themes'
import { useBackground } from '../contexts/BackgroundContext'

export default function Settings() {
    const { language, setLanguage, t } = useLanguage()
    const { theme, setTheme } = useTheme()
    const { isCustomBackground, toggleBackground } = useBackground()
    const [notifications, setNotifications] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [fontSize, setFontSize] = useState(() => {
        // 初始化时从 localStorage 读取字体大小设置
        if (typeof window !== 'undefined') {
            const savedFontSize = localStorage.getItem('fontSize')
            if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
                return savedFontSize
            }
        }
        return 'medium'
    })
    const [profileVisibility, setProfileVisibility] = useState('public')
    const [onlineStatus, setOnlineStatus] = useState(true)
    const [messagePermission, setMessagePermission] = useState('all')
    const [signatures, setSignatures] = useState(true)
    const [autoSave, setAutoSave] = useState(true)

    // 应用字体大小设置
    useEffect(() => {
        const root = document.documentElement;
        switch (fontSize) {
            case 'small':
                root.style.fontSize = '14px';
                break;
            case 'medium':
                root.style.fontSize = '16px';
                break;
            case 'large':
                root.style.fontSize = '18px';
                break;
        }
        // 保存到 localStorage
        localStorage.setItem('fontSize', fontSize)
    }, [fontSize]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            
            <div className="p-8 flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* 通知设置 */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('settings.notification')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{t('settings.notification.forum')}</span>
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
                                <span className="text-gray-700 dark:text-gray-300">{t('settings.notification.email')}</span>
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

                    {/* 字体大小设置 */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('settings.fontSize')}</h2>
                        <div className="flex flex-col space-y-2">
                            <select 
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="small">{t('settings.fontSize.small')}</option>
                                <option value="medium">{t('settings.fontSize.medium')}</option>
                                <option value="large">{t('settings.fontSize.large')}</option>
                            </select>
                        </div>
                    </section>

                    {/* 语言设置 */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('settings.language')}</h2>
                        <select 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'zh' | 'en' | 'ja')}
                            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="zh">{t('settings.language.zh')}</option>
                            <option value="en">{t('settings.language.en')}</option>
                            <option value="ja">{t('settings.language.ja')}</option>
                        </select>
                    </section>

                    {/* 主题设置 */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('settings.theme')}</h2>
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <select 
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="light">{t('settings.theme.light')}</option>
                                    <option value="dark">{t('settings.theme.dark')}</option>
                                    <option value="system">{t('settings.theme.system')}</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{t('settings.background')}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isCustomBackground}
                                        onChange={toggleBackground}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* 隐私设置 */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('settings.privacy')}</h2>
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <label className="text-gray-700 dark:text-gray-300">{t('settings.privacy.profile')}</label>
                                <select 
                                    value={profileVisibility}
                                    onChange={(e) => setProfileVisibility(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="public">{t('settings.privacy.profile.public')}</option>
                                    <option value="friends">{t('settings.privacy.profile.friends')}</option>
                                    <option value="private">{t('settings.privacy.profile.private')}</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{t('settings.privacy.online')}</span>
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
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('settings.messages')}</h2>
                        <div className="flex flex-col space-y-2">
                            <label className="text-gray-700 dark:text-gray-300">{t('settings.messages.permission')}</label>
                            <select 
                                value={messagePermission}
                                onChange={(e) => setMessagePermission(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="all">{t('settings.messages.permission.all')}</option>
                                <option value="friends">{t('settings.messages.permission.friends')}</option>
                                <option value="none">{t('settings.messages.permission.none')}</option>
                            </select>
                        </div>
                    </section>

                    {/* 发帖设置 */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('settings.posting')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{t('settings.posting.signature')}</span>
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
                                <span className="text-gray-700 dark:text-gray-300">{t('settings.posting.autosave')}</span>
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
        </div>
    )
}
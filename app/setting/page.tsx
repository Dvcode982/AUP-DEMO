'use client'
import Sidebar from "../components/Sidebar"
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

export default function Settings() {
    const { language, setLanguage } = useLanguage();
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState(() => {
        // 从本地存储中获取保存的字体大小，如果没有则默认为'medium'
        if (typeof window !== 'undefined') {
            return localStorage.getItem('fontSize') || 'medium';
        }
        return 'medium';
    });
    const { t } = useTranslation();

    // 监听字体大小变化并应用样式
    useEffect(() => {
        const root = document.documentElement;
        switch (fontSize) {
            case 'small':
                root.style.setProperty('--font-size-base', '14px');
                break;
            case 'medium':
                root.style.setProperty('--font-size-base', '16px');
                break;
            case 'large':
                root.style.setProperty('--font-size-base', '18px');
                break;
        }
        // 将字体大小保存到本地存储
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 h-screen flex flex-col opacity-90 dark:opacity-80">
                <div className="p-8 flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* 语言设置 */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('languageSettings')}</h2>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'zh' | 'en' | 'ja')}
                                className="w-full p-2 border rounded-lg bg-blue-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                            >
                                <option value="zh">中文</option>
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                            </select>
                        </section>

                        {/* 样式设置 */}
                        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                            <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('styleSettings')}</h2>
                            <div className="space-y-4">
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300">{t('theme')}</label>
                                    <select 
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full p-2 border rounded-lg bg-blue-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="light">{t('defaultTheme')}</option>
                                        <option value="dark">{t('evaTheme')}</option>
                                        <option value="system">{t('animeTheme')}</option>
                                    </select>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 dark:text-gray-300">{t('fontSize')}</label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => setFontSize('small')}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                fontSize === 'small'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {t('small')}
                                        </button>
                                        <button
                                            onClick={() => setFontSize('medium')}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                fontSize === 'medium'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {t('medium')}
                                        </button>
                                        <button
                                            onClick={() => setFontSize('large')}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                fontSize === 'large'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {t('large')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
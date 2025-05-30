'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// 定义支持的语言类型
export type Language = 'zh' | 'en' | 'ja'

// 定义语言上下文类型
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 语言包
const translations = {
  zh: {
    // 通用
    'common.loading': '加载中...',
    'common.error': '出错了',
    'common.success': '成功',
    'common.confirm': '确认',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.search': '搜索',
    'common.submit': '提交',
    'common.back': '返回',
    
    // 导航
    'nav.home': '论坛',
    'nav.topic': '主题板块',
    'nav.lostAndFound': '失物找寻',
    'nav.messages': '坪友列表',
    'nav.settings': '设置',
    'nav.feedback': '反馈',
    'nav.login': '登录',
    'nav.logout': '退出登录',
    
    // 设置
    'settings.title': '设置',
    'settings.language': '语言',
    'settings.theme': '主题',
    'settings.background': '背景',
    'settings.notification': '通知',
    'settings.privacy': '隐私',
    'settings.about': '关于',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.ja': '日本语',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.system': '跟随系统',
    'settings.background.on': '开启背景',
    'settings.background.off': '关闭背景',
    
    // 反馈
    'feedback.title': '反馈',
    'feedback.type': '反馈类型',
    'feedback.type.suggestion': '功能建议',
    'feedback.type.bug': '问题报告',
    'feedback.type.other': '其他',
    'feedback.content': '反馈内容',
    'feedback.content.placeholder': '请详细描述您的反馈...',
    'feedback.submit': '提交反馈',
    
    // 主题板块
    'topic.search': '搜索主题...',
    'topic.all': '全部主题',
    'topic.recommended': '为您推荐',
    'topic.clickToEnter': '点击进入讨论',
    
    // 帖子
    'post.like': '点赞',
    'post.comment': '评论',
    'post.share': '分享',
    'post.report': '举报',
    'post.delete': '删除',
    'post.edit': '编辑',
    'post.reply': '回复',
    'post.writeComment': '写评论...',
    'post.noComments': '暂无评论',
    'post.noPosts': '暂无帖子',
    'post.loading': '加载中...',
    'post.error': '加载失败',
    'post.retry': '重试',
    
    // 错误信息
    'error.network': '网络错误，请检查网络连接',
    'error.server': '服务器错误，请稍后重试',
    'error.unauthorized': '请先登录',
    'error.forbidden': '没有权限',
    'error.notFound': '未找到',
    'error.unknown': '未知错误',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.submit': 'Submit',
    'common.back': 'Back',
    
    // Navigation
    'nav.home': 'Forum',
    'nav.topic': 'Topics',
    'nav.lostAndFound': 'Lost & Found',
    'nav.messages': 'Messages',
    'nav.settings': 'Settings',
    'nav.feedback': 'Feedback',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.background': 'Background',
    'settings.notification': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.about': 'About',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.ja': '日本語',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.background.on': 'Enable Background',
    'settings.background.off': 'Disable Background',
    
    // Feedback
    'feedback.title': 'Feedback',
    'feedback.type': 'Feedback Type',
    'feedback.type.suggestion': 'Feature Suggestion',
    'feedback.type.bug': 'Bug Report',
    'feedback.type.other': 'Other',
    'feedback.content': 'Feedback Content',
    'feedback.content.placeholder': 'Please describe your feedback in detail...',
    'feedback.submit': 'Submit Feedback',
    
    // Topics
    'topic.search': 'Search topics...',
    'topic.all': 'All Topics',
    'topic.recommended': 'Recommended',
    'topic.clickToEnter': 'Click to enter discussion',
    
    // Posts
    'post.like': 'Like',
    'post.comment': 'Comment',
    'post.share': 'Share',
    'post.report': 'Report',
    'post.delete': 'Delete',
    'post.edit': 'Edit',
    'post.reply': 'Reply',
    'post.writeComment': 'Write a comment...',
    'post.noComments': 'No comments yet',
    'post.noPosts': 'No posts yet',
    'post.loading': 'Loading...',
    'post.error': 'Failed to load',
    'post.retry': 'Retry',
    
    // Error Messages
    'error.network': 'Network error, please check your connection',
    'error.server': 'Server error, please try again later',
    'error.unauthorized': 'Please login first',
    'error.forbidden': 'Access denied',
    'error.notFound': 'Not found',
    'error.unknown': 'Unknown error',
  },
  ja: {
    // 共通
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.confirm': '確認',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.search': '検索',
    'common.submit': '送信',
    'common.back': '戻る',
    
    // ナビゲーション
    'nav.home': 'フォーラム',
    'nav.topic': 'トピック',
    'nav.lostAndFound': '落とし物',
    'nav.messages': 'メッセージ',
    'nav.settings': '設定',
    'nav.feedback': 'フィードバック',
    'nav.login': 'ログイン',
    'nav.logout': 'ログアウト',
    
    // 設定
    'settings.title': '設定',
    'settings.language': '言語',
    'settings.theme': 'テーマ',
    'settings.background': '背景',
    'settings.notification': '通知',
    'settings.privacy': 'プライバシー',
    'settings.about': '概要',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.ja': '日本語',
    'settings.theme.light': 'ライト',
    'settings.theme.dark': 'ダーク',
    'settings.theme.system': 'システム',
    'settings.background.on': '背景を有効',
    'settings.background.off': '背景を無効',
    
    // フィードバック
    'feedback.title': 'フィードバック',
    'feedback.type': 'フィードバックタイプ',
    'feedback.type.suggestion': '機能提案',
    'feedback.type.bug': 'バグ報告',
    'feedback.type.other': 'その他',
    'feedback.content': 'フィードバック内容',
    'feedback.content.placeholder': 'フィードバックの詳細を入力してください...',
    'feedback.submit': 'フィードバックを送信',
    
    // トピック
    'topic.search': 'トピックを検索...',
    'topic.all': 'すべてのトピック',
    'topic.recommended': 'おすすめ',
    'topic.clickToEnter': 'クリックして討論に入る',
    
    // 投稿
    'post.like': 'いいね',
    'post.comment': 'コメント',
    'post.share': '共有',
    'post.report': '報告',
    'post.delete': '削除',
    'post.edit': '編集',
    'post.reply': '返信',
    'post.writeComment': 'コメントを書く...',
    'post.noComments': 'コメントはまだありません',
    'post.noPosts': '投稿はまだありません',
    'post.loading': '読み込み中...',
    'post.error': '読み込みに失敗しました',
    'post.retry': '再試行',
    
    // エラーメッセージ
    'error.network': 'ネットワークエラー、接続を確認してください',
    'error.server': 'サーバーエラー、後でもう一度お試しください',
    'error.unauthorized': 'ログインしてください',
    'error.forbidden': 'アクセスが拒否されました',
    'error.notFound': '見つかりません',
    'error.unknown': '不明なエラー',
  }
}

// 语言提供者组件
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')
  const [mounted, setMounted] = useState(false)

  // 初始化时从 localStorage 读取语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['zh', 'en', 'ja'].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
    setMounted(true)
  }, [])

  // 切换语言时保存到 localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  // 翻译函数
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  if (!mounted) {
    return null
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 自定义 hook 用于在组件中使用语言上下文
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// 定义支持的语言类型
export type Language = 'zh' | 'en' | 'ja'

// 定义语言上下文类型
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: { [key: string]: string | number }) => string
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
    'common.status': '状态',
    
    // 导航
    'nav.home': '论坛',
    'nav.topic': '主题板块',
    'nav.lostAndFound': '失物找寻',
    'nav.messages': '坪友列表',
    'nav.settings': '设置',
    'nav.feedback': '反馈',
    'nav.login': '登录',
    'nav.logout': '退出登录',
    'nav.createPost': '创建新帖子',
    
    // 视图模式
    'viewMode.all': '全部帖子',
    'viewMode.aggregated': '为您推荐',
    
    // 设置
    'settings.title': '设置',
    'settings.language': '语言',
    'settings.theme': '主题',
    'settings.background': '背景',
    'settings.notification': '通知',
    'settings.notification.forum': '论坛通知',
    'settings.notification.email': '邮件通知',
    'settings.privacy': '隐私',
    'settings.privacy.profile': '个人资料可见性',
    'settings.privacy.profile.public': '公开',
    'settings.privacy.profile.friends': '仅好友',
    'settings.privacy.profile.private': '私密',
    'settings.privacy.online': '在线状态',
    'settings.fontSize': '字体大小',
    'settings.fontSize.small': '小',
    'settings.fontSize.medium': '中',
    'settings.fontSize.large': '大',
    'settings.messages': '消息',
    'settings.messages.permission': '消息权限',
    'settings.messages.permission.all': '所有人',
    'settings.messages.permission.friends': '仅好友',
    'settings.messages.permission.none': '不允许',
    'settings.posting': '发帖',
    'settings.posting.signature': '签名',
    'settings.posting.autosave': '自动保存',
    'settings.about': '关于',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.ja': '日本语',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.system': '跟随系统',
    'settings.background.on': '开启背景',
    'settings.background.off': '关闭背景',
    'settings.background.toggle': '切换背景',
    
    // 反馈
    'feedback.title': '反馈',
    'feedback.type': '反馈类型',
    'feedback.type.suggestion': '功能建议',
    'feedback.type.bug': '问题报告',
    'feedback.type.other': '其他',
    'feedback.content': '反馈内容',
    'feedback.content.placeholder': '请详细描述您的反馈...',
    'feedback.submit': '提交反馈',
    
    // 搜索
    'search.lostAndFoundPlaceholder': '搜索失物招领...',
    'search.postsPlaceholder': '搜索帖子...',
    
    // 消息相关
    'messages.searchPlaceholder': '搜索消息或用户...',
    'messages.inputPlaceholder': '输入消息...',
    
    // 主题板块
    'topic.search': '搜索主题...',
    'topic.all': '全部主题',
    'topic.recommended': '为您推荐',
    'topic.clickToEnter': '点击进入讨论',
    'topic.主题分类': '主题分类',
    'topic.资源分享': '资源分享',
    'topic.竞赛交流': '竞赛交流',
    'topic.学术交流': '学术交流',
    'topic.校园生活': '校园生活',
    'topic.校园杂谈': '校园杂谈',
    'topic.技术交流': '技术交流',
    'topic.表白墙': '表白墙',
    'topic.就业兼职': '就业兼职',
    'topic.searchPlaceholder': '搜索主题...',
    'topic.filterTagsButton': '筛选标签',
    'topic.selectTagToFilter': '选择标签进行筛选',
    'topic.clearFilterButton': '清除筛选',
    'topic.noPostsInTopic': '这个主题还没有任何帖子',
    'topic.noPostsWithTag': '没有包含标签 {tag} 的帖子',
    'topic.currentFilter': '当前筛选: {tag}',
    'topic.resultsFound': '找到 {count} 个结果',
    
    // 推荐与热门标签
    'recommendations.forYou': '为您推荐',
    'recommendations.loginToView': '登录后查看个性化推荐',
    'recommendations.topicsTitle': '推荐主题',
    'recommendations.tagsTitle': '热门标签',
    'recommendations.noContent': '继续浏览和互动，我们将为您推荐感兴趣的内容',
    
    // 学术交流标签
    'topic.#计导坛': '#计导坛',
    'topic.#数分坛': '#数分坛',
    'topic.#英语坛': '#英语坛',
    'topic.#线代坛': '#线代坛',
    'topic.#网导坛': '#网导坛',
    'topic.#信通坛': '#信通坛',
    'topic.#心导坛': '#心导坛',
    'topic.#数学坛': '#数学坛',
    'topic.#物理坛': '#物理坛',
    'topic.#生物学坛': '#生物学坛',
    'topic.#地质学坛': '#地质学坛',
    'topic.#气象学坛': '#气象学坛',
    'topic.#经济学坛': '#经济学坛',
    'topic.#政治学坛': '#政治学坛',
    'topic.#社会学坛': '#社会学坛',
    'topic.#量子力学坛': '#量子力学坛',
    'topic.#机械工程坛': '#机械工程坛',
    'topic.#土木工程坛': '#土木工程坛',
    'topic.#电气工程坛': '#电气工程坛',
    
    // 资源分享标签
    'topic.#电子书籍': '#电子书籍',
    'topic.#视频资源': '#视频资源',
    'topic.#学习资料': '#学习资料',
    'topic.#考试题库': '#考试题库',
    'topic.#课件分享': '#课件分享',
    'topic.#软件工具': '#软件工具',
    'topic.#学习笔记': '#学习笔记',
    'topic.#实验资料': '#实验资料',
    
    // 竞赛交流标签
    'topic.#数学建模': '#数学建模',
    'topic.#程序设计': '#程序设计',
    'topic.#创新创业': '#创新创业',
    'topic.#学科竞赛': '#学科竞赛',
    'topic.#挑战杯': '#挑战杯',
    'topic.#创青春': '#创青春',
    'topic.#互联网+': '#互联网+',
    
    // 校园生活标签
    'topic.#美食推荐': '#美食推荐',
    'topic.#社团活动': '#社团活动',
    'topic.#校园风景': '#校园风景',
    'topic.#运动健身': '#运动健身',
    'topic.#宿舍生活': '#宿舍生活',
    'topic.#校园趣事': '#校园趣事',
    'topic.#学生会': '#学生会',
    'topic.#文艺活动': '#文艺活动',
    
    // 校园杂谈标签
    'topic.#校园新闻': '#校园新闻',
    'topic.#活动通知': '#活动通知',
    'topic.#失物招领': '#失物招领',
    'topic.#二手交易': '#二手交易',
    'topic.#闲聊灌水': '#闲聊灌水',
    'topic.#情感交流': '#情感交流',
    'topic.#校园趣闻': '#校园趣闻',
    
    // 技术交流标签
    'topic.#编程开发': '#编程开发',
    'topic.#人工智能': '#人工智能',
    'topic.#网络技术': '#网络技术',
    'topic.#硬件维修': '#硬件维修',
    'topic.#数据分析': '#数据分析',
    'topic.#云计算': '#云计算',
    'topic.#区块链': '#区块链',
    'topic.#物联网': '#物联网',
    
    // 表白墙标签
    'topic.#表白专区': '#表白专区',
    'topic.#脱单攻略': '#脱单攻略',
    'topic.#情感故事': '#情感故事',
    'topic.#暗恋专栏': '#暗恋专栏',
    'topic.#恋爱相談': '#恋爱相談',
    'topic.#心动瞬间': '#心动瞬间',
    
    // 就业兼职标签
    'topic.#实习信息': '#实习信息',
    'topic.#校招信息': '#校招信息',
    'topic.#求职经验': '#求职经验',
    'topic.#简历指导': '#简历指导',
    'topic.#面试技巧': '#面试技巧',
    'topic.#职业规划': '#职业规划',
    'topic.#兼职信息': '#兼职信息',
    
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
    'post.noPostsRecommended': '暂无推荐内容，多浏览一些帖子吧！',
    'post.image': '图片',
    'post.role.student': '学生',
    'post.role.teacher': '教师',
    'post.role.admin': '管理员',
    'post.role.alumnus': '校友',
    'post.shareSuccess': '链接已复制到剪贴板',
    'post.shareFailed': '分享失败，请稍后再试',
    'post.returned': '已归还',
    'post.notReturned': '未归还',
    'post.author': '作者',
    'post.relatedPosts': '相关推荐',
    'post.comingSoon': '敬请期待',
    'post.status.lostAndFound': '失物招领中',
    'lostAndFound.backToList': '返回失物招领列表',
    'post.status.notFound': '未找到/未归还',
    'lostAndFound.writeComment': '写下你的评论...',
    'lostAndFound.submitComment': '提交评论',
    'lostAndFound.submittingComment': '提交中...',
    'lostAndFoundCard.commentCount': '评论',
    'lostAndFoundCard.shareCount': '分享',
    
    // 错误信息
    'error.network': '网络错误，请检查网络连接',
    'error.server': '服务器错误，请稍后重试',
    'error.unauthorized': '请先登录',
    'error.forbidden': '没有权限',
    'error.unknown': '未知错误',
    
    // 浮动动作按钮 (FAB)
    'fab.createLostAndFound': '发布失物招领',
    'fab.createPost': '发布新帖子',
    
    // 创建帖子页面/组件
    'createPost.title': '创建新帖子',
    'createPost.addTagButton': '添加标签',
    'createPost.publishButton': '发布帖子',
    'createPost.success': '帖子发布成功！',
    'createPost.failure': '发布失败，请重试',
    'createPost.selectCategoryPlaceholder': '选择主题分类',
    'createPost.textInputPlaceholder': '分享你的想法...',
    'createPost.mediaUploadButton': '上传图片或视频',
    
    // 个人主页
    'profile.title': '我的个人资料',
    'profile.editButton': '编辑资料',
    'profile.emailLabel': '邮箱',
    'profile.gradeLabel': '年级',
    'profile.departmentLabel': '院系',
    'profile.aboutMeTitle': '关于我',
    'profile.usernameLabel': '用户名',
    'profile.usernamePlaceholder': '您的昵称',
    'profile.emailLabelImmutable': '邮箱（不可修改）',
    'profile.departmentPlaceholder': '您所在的院系',
    'profile.gradePlaceholder': '您的年级',
    'profile.rolePlaceholder': '您的角色',
    'profile.bioLabel': '个人简介',
    'profile.bioPlaceholder': '关于您自己的简单介绍',
    'profile.saveButton': '保存修改',
    'profile.cancelButton': '取消',
    
    // Toast messages
    'toast.fetchProfileFailure': '获取用户资料失败',
    'toast.updateProfileSuccess': '资料更新成功',
    'toast.updateProfileFailure': '更新资料失败，请稍后重试',
    
    // Lost and Found
    'lostAndFound.createTitle': '创建失物招领',
    'lostAndFound.publishInfoTitle': '发布失物招领信息',
    'lostAndFound.descriptionLabel': '描述',
    'lostAndFound.publishButton': '发布信息',
    'lostAndFound.descriptionPlaceholder': '请详细描述物品特征、丢失/拾获地点和时间等信息...',
    'lostAndFound.publishingButton': '发布中...',
    // Added for Lost and Found tags
    'tags.lostAndFound': {
      en: 'Lost and Found',
      zh: '失物招领',
      ja: '遺失物',
    },
    'tags.genericTag': {
      en: '{tag}',
      zh: '{tag}',
      ja: '{tag}',
    },
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
    'common.status': 'Status',
    
    // Navigation
    'nav.home': 'Forum',
    'nav.topic': 'Topics',
    'nav.lostAndFound': 'Lost & Found',
    'nav.messages': 'Messages',
    'nav.settings': 'Settings',
    'nav.feedback': 'Feedback',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.createPost': 'Create New Post',
    
    // View Mode
    'viewMode.all': 'All Posts',
    'viewMode.aggregated': 'Recommended for You',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.background': 'Background',
    'settings.notification': 'Notifications',
    'settings.notification.forum': 'Forum Notifications',
    'settings.notification.email': 'Email Notifications',
    'settings.privacy': 'Privacy',
    'settings.privacy.profile': 'Profile Visibility',
    'settings.privacy.profile.public': 'Public',
    'settings.privacy.profile.friends': 'Friends Only',
    'settings.privacy.profile.private': 'Private',
    'settings.privacy.online': 'Online Status',
    'settings.fontSize': 'Font Size',
    'settings.fontSize.small': 'Small',
    'settings.fontSize.medium': 'Medium',
    'settings.fontSize.large': 'Large',
    'settings.messages': 'Messages',
    'settings.messages.permission': 'Message Permissions',
    'settings.messages.permission.all': 'Everyone',
    'settings.messages.permission.friends': 'Friends Only',
    'settings.messages.permission.none': 'No One',
    'settings.posting': 'Posting',
    'settings.posting.signature': 'Signature',
    'settings.posting.autosave': 'Auto Save',
    'settings.about': 'About',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.ja': '日本語',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.background.on': 'Enable Background',
    'settings.background.off': 'Disable Background',
    'settings.background.toggle': 'Toggle Background',
    
    // Feedback
    'feedback.title': 'Feedback',
    'feedback.type': 'Feedback Type',
    'feedback.type.suggestion': 'Feature Suggestion',
    'feedback.type.bug': 'Bug Report',
    'feedback.type.other': 'Other',
    'feedback.content': 'Feedback Content',
    'feedback.content.placeholder': 'Please describe your feedback in detail...',
    'feedback.submit': 'Submit Feedback',
    
    // Search
    'search.lostAndFoundPlaceholder': 'Search lost and found...',
    'search.postsPlaceholder': 'Search posts...',
    
    // Messages
    'messages.searchPlaceholder': 'Search messages or users...',
    'messages.inputPlaceholder': 'Enter message...',
    
    // Topics
    'topic.search': 'Search topics...',
    'topic.all': 'All Topics',
    'topic.recommended': 'Recommended',
    'topic.clickToEnter': 'Click to enter discussion',
    'topic.主题分类': 'Topic Category',
    'topic.资源分享': 'Resource Sharing',
    'topic.竞赛交流': 'Competition Exchange',
    'topic.学术交流': 'Academic Exchange',
    'topic.校园生活': 'Campus Life',
    'topic.校园杂谈': 'Campus Chit-chat',
    'topic.技术交流': 'Technology Exchange',
    'topic.表白墙': 'Confession Wall',
    'topic.就业兼职': 'Jobs & Part-time',
    'topic.searchPlaceholder': 'Search topics...',
    'topic.filterTagsButton': 'Filter Tags',
    'topic.selectTagToFilter': 'Select tags to filter',
    'topic.clearFilterButton': 'Clear filter',
    'topic.noPostsInTopic': 'There are no posts in this topic yet',
    'topic.noPostsWithTag': 'No posts found with tag {tag}',
    'topic.currentFilter': 'Current filter: {tag}',
    'topic.resultsFound': 'Found {count} results',
    
    // Recommendations & Popular Tags
    'recommendations.forYou': 'Recommended for You',
    'recommendations.loginToView': 'Login to view personalized recommendations',
    'recommendations.topicsTitle': 'Recommended Topics',
    'recommendations.tagsTitle': 'Popular Tags',
    'recommendations.noContent': 'Continue browsing and interacting to see personalized recommendations',
    
    // Academic Exchange Tags
    'topic.#计导坛': '#Intro to Comp Forum',
    'topic.#数分坛': '#Math Analysis Forum',
    'topic.#英语坛': '#English Forum',
    'topic.#线代坛': '#Linear Algebra Forum',
    'topic.#网导坛': '#Network Guide Forum',
    'topic.#信通坛': '#Info & Comm Forum',
    'topic.#心导坛': '#Psychology Forum',
    'topic.#数学坛': '#Mathematics Forum',
    'topic.#物理坛': '#Physics Forum',
    'topic.#生物学坛': '#Biology Forum',
    'topic.#地质学坛': '#Geology Forum',
    'topic.#气象学坛': '#Meteorology Forum',
    'topic.#经济学坛': '#Economics Forum',
    'topic.#政治学坛': '#Political Science Forum',
    'topic.#社会学坛': '#Sociology Forum',
    'topic.#量子力学坛': '#Quantum Mechanics Forum',
    'topic.#机械工程坛': '#Mechanical Engineering Forum',
    'topic.#土木工程坛': '#Civil Engineering Forum',
    'topic.#电气工程坛': '#Electrical Engineering Forum',
    
    // Resource Sharing Tags
    'topic.#电子书籍': '#E-Books',
    'topic.#视频资源': '#Video Resources',
    'topic.#学习资料': '#Study Materials',
    'topic.#考试题库': '#Exam Question Bank',
    'topic.#课件分享': '#Courseware Sharing',
    'topic.#软件工具': '#Software Tools',
    'topic.#学习笔记': '#Study Notes',
    'topic.#实验资料': '#Experiment Data',
    
    // Competition Exchange Tags
    'topic.#数学建模': '#Math Modeling',
    'topic.#程序设计': '#Programming Contest',
    'topic.#创新创业': '#Innovation & Entrepreneurship',
    'topic.#学科竞赛': '#Subject Competition',
    'topic.#挑战杯': '#Challenge Cup',
    'topic.#创青春': '#Create Youth',
    'topic.#互联网+': '#Internet+',
    
    // Campus Life Tags
    'topic.#美食推荐': '#Food Recommendations',
    'topic.#社团活动': '#Club Activities',
    'topic.#校园风景': '#Campus Scenery',
    'topic.#运动健身': '#Sports & Fitness',
    'topic.#宿舍生活': '#Dorm Life',
    'topic.#校园趣事': '#Campus Fun Facts',
    'topic.#学生会': '#Student Union',
    'topic.#文艺活动': '#Arts & Culture Events',
    
    // Campus Chit-chat Tags
    'topic.#校园新闻': '#Campus News',
    'topic.#活动通知': '#Event Notifications',
    'topic.#失物招领': '#Lost & Found',
    'topic.#二手交易': '#Second-hand Trading',
    'topic.#闲聊灌水': '#Casual Chat',
    'topic.#情感交流': '#Emotional Exchange',
    'topic.#校园趣闻': '#Campus Anecdotes',
    
    // Technology Exchange Tags
    'topic.#编程开发': '#Programming & Development',
    'topic.#人工智能': '#Artificial Intelligence',
    'topic.#网络技术': '#Network Technology',
    'topic.#硬件维修': '#Hardware Repair',
    'topic.#数据分析': '#Data Analysis',
    'topic.#云计算': '#Cloud Computing',
    'topic.#区块链': '#Blockchain',
    'topic.#物联网': '#IoT',
    
    // Confession Wall Tags
    'topic.#表白专区': '#Confession Zone',
    'topic.#脱单攻略': '#Dating Tips',
    'topic.#情感故事': '#Emotional Stories',
    'topic.#暗恋专栏': '#Crush Corner',
    'topic.#恋爱相談': '#Relationship Advice',
    'topic.#心动瞬间': '#Heartfelt Moments',
    
    // Jobs & Part-time Tags
    'topic.#实习信息': '#Internship Info',
    'topic.#校招信息': '#Campus Recruitment Info',
    'topic.#求职经验': '#Job Hunting Experience',
    'topic.#简历指导': '#Resume Guide',
    'topic.#面试技巧': '#Interview Skills',
    'topic.#职业规划': '#Career Planning',
    'topic.#兼职信息': '#Part-time Job Info',
    
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
    'post.noPostsRecommended': 'No recommendations yet, browse more posts!',
    'post.image': 'Image',
    'post.role.student': 'Student',
    'post.role.teacher': 'Teacher',
    'post.role.admin': 'Admin',
    'post.role.alumnus': 'Alumnus',
    'post.shareSuccess': 'Link copied to clipboard',
    'post.shareFailed': 'Failed to share, please try again later',
    'post.returned': 'Returned',
    'post.notReturned': 'Not Returned',
    'post.author': 'Author',
    'post.relatedPosts': 'Related Posts',
    'post.comingSoon': 'Coming Soon',
    'post.status.lostAndFound': 'Lost and Found in progress',
    'lostAndFound.backToList': 'Back to Lost and Found List',
    'post.status.notFound': 'Not Found/Not Returned',
    'lostAndFound.writeComment': 'Write your comment...',
    'lostAndFound.submitComment': 'Submit Comment',
    'lostAndFound.submittingComment': 'Submitting...',
    'lostAndFoundCard.commentCount': 'Comments',
    'lostAndFoundCard.shareCount': 'Shares',
    
    // Error Messages
    'error.network': 'Network error, please check your connection',
    'error.server': 'Server error, please try again later',
    'error.unauthorized': 'Please login first',
    'error.forbidden': 'Access denied',
    'error.notFound': 'Not found',
    'error.unknown': 'Unknown error',
    
    // Floating Action Button (FAB)
    'fab.createLostAndFound': 'Post Lost and Found',
    'fab.createPost': 'Create New Post',
    
    // Create Post Page/Component
    'createPost.title': 'Create New Post',
    'createPost.addTagButton': 'Add Tag',
    'createPost.publishButton': 'Publish Post',
    'createPost.success': 'Post published successfully!',
    'createPost.failure': 'Failed to publish post, please try again.',
    'createPost.selectCategoryPlaceholder': 'Select Category',
    'createPost.textInputPlaceholder': 'Share your thoughts...',
    'createPost.mediaUploadButton': 'Upload Image or Video',
    
    // Personal Profile
    'profile.title': 'My Profile',
    'profile.editButton': 'Edit Profile',
    'profile.emailLabel': 'Email',
    'profile.gradeLabel': 'Grade',
    'profile.departmentLabel': 'Department',
    'profile.aboutMeTitle': 'About Me',
    'profile.usernameLabel': 'Username',
    'profile.usernamePlaceholder': 'Your nickname',
    'profile.emailLabelImmutable': 'Email (cannot be changed)',
    'profile.departmentPlaceholder': 'Your department',
    'profile.gradePlaceholder': 'Your grade',
    'profile.rolePlaceholder': 'Your role',
    'profile.bioLabel': 'Bio',
    'profile.bioPlaceholder': 'A brief introduction about yourself',
    'profile.saveButton': 'Save Changes',
    'profile.cancelButton': 'Cancel',
    
    // Toast messages
    'toast.fetchProfileFailure': 'Failed to fetch user profile',
    'toast.updateProfileSuccess': 'Profile updated successfully',
    'toast.updateProfileFailure': 'Failed to update profile, please try again later',
    
    // Lost and Found
    'lostAndFound.createTitle': 'Create Lost and Found',
    'lostAndFound.publishInfoTitle': 'Publish Lost and Found Information',
    'lostAndFound.descriptionLabel': 'Description',
    'lostAndFound.publishButton': 'Publish Info',
    'lostAndFound.descriptionPlaceholder': 'Please describe item features, location and time of loss/finding, etc...',
    'lostAndFound.publishingButton': 'Publishing...',
    // Added for Lost and Found tags
    'tags.lostAndFound': {
      en: 'Lost and Found',
      zh: '失物招领',
      ja: '遺失物',
    },
    'tags.genericTag': {
      en: '{tag}',
      zh: '{tag}',
      ja: '{tag}',
    },
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
    'common.status': '状態',
    
    // ナビゲーション
    'nav.home': 'フォーラム',
    'nav.topic': 'トピック',
    'nav.lostAndFound': '落とし物',
    'nav.messages': 'メッセージ',
    'nav.settings': '設定',
    'nav.feedback': 'フィードバック',
    'nav.login': 'ログイン',
    'nav.logout': 'ログアウト',
    'nav.createPost': '新規投稿作成',
    
    // 表示モード
    'viewMode.all': 'すべての投稿',
    'viewMode.aggregated': 'おすすめ',
    
    // 設定
    'settings.title': '設定',
    'settings.language': '言語',
    'settings.theme': 'テーマ',
    'settings.background': '背景',
    'settings.notification': '通知',
    'settings.notification.forum': 'フォーラム通知',
    'settings.notification.email': 'メール通知',
    'settings.privacy': 'プライバシー',
    'settings.privacy.profile': 'プロフィール表示',
    'settings.privacy.profile.public': '公開',
    'settings.privacy.profile.friends': '友達のみ',
    'settings.privacy.profile.private': '非公開',
    'settings.privacy.online': 'オンライン状態',
    'settings.fontSize': 'フォントサイズ',
    'settings.fontSize.small': '小',
    'settings.fontSize.medium': '中',
    'settings.fontSize.large': '大',
    'settings.messages': 'メッセージ',
    'settings.messages.permission': 'メッセージ権限',
    'settings.messages.permission.all': '全員',
    'settings.messages.permission.friends': '友達のみ',
    'settings.messages.permission.none': '許可しない',
    'settings.posting': '投稿',
    'settings.posting.signature': '署名',
    'settings.posting.autosave': '自動保存',
    'settings.about': '概要',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.ja': '日本語',
    'settings.theme.light': 'ライト',
    'settings.theme.dark': 'ダーク',
    'settings.theme.system': 'システム',
    'settings.background.on': '背景を有効',
    'settings.background.off': '背景を無効',
    'settings.background.toggle': '背景を切り替え',
    
    // フィードバック
    'feedback.title': 'フィードバック',
    'feedback.type': 'フィードバックタイプ',
    'feedback.type.suggestion': '機能提案',
    'feedback.type.bug': 'バグ報告',
    'feedback.type.other': 'その他',
    'feedback.content': 'フィードバック内容',
    'feedback.content.placeholder': 'フィードバックの詳細を入力してください...',
    'feedback.submit': 'フィードバックを送信',
    
    // 検索
    'search.lostAndFoundPlaceholder': '落とし物情報検索...',
    'search.postsPlaceholder': '投稿検索...',
    
    // メッセージ関連
    'messages.searchPlaceholder': 'メッセージまたはユーザーを検索...',
    'messages.inputPlaceholder': 'メッセージを入力...',
    
    // トピック
    'topic.search': 'トピックを検索...',
    'topic.all': 'すべてのトピック',
    'topic.recommended': 'おすすめ',
    'topic.clickToEnter': 'クリックして討論に入る',
    'topic.主题分类': 'トピックカテゴリ',
    'topic.资源分享': 'リソース共有',
    'topic.竞赛交流': '競技交流',
    'topic.学术交流': '学術交流',
    'topic.校园生活': 'キャンパスライフ',
    'topic.校园雑談': 'キャンパス雑談',
    'topic.技术交流': '技術交流',
    'topic.表白ウォール': '告白ウォール',
    'topic.就业兼职': '仕事＆アルバイト',
    'topic.searchPlaceholder': 'トピックを検索...',
    'topic.filterTagsButton': 'タグで絞り込み',
    'topic.selectTagToFilter': '絞り込みたいタグを選択',
    'topic.clearFilterButton': '絞り込みをクリア',
    'topic.noPostsInTopic': 'このトピックにはまだ投稿がありません',
    'topic.noPostsWithTag': 'タグ {tag} を含む投稿は見つかりませんでした',
    'topic.currentFilter': '現在の絞り込み: {tag}',
    'topic.resultsFound': '{count} 件の結果が見つかりました',
    
    // おすすめと人気タグ
    'recommendations.forYou': 'おすすめ',
    'recommendations.loginToView': 'ログインしてあなたへのおすすめを表示',
    'recommendations.topicsTitle': 'おすすめトピック',
    'recommendations.tagsTitle': '人気タグ',
    'recommendations.noContent': '閲覧や操作を続けると、関心のあるコンテンツが表示されます',
    
    // 学術交流タグ
    'topic.#计算机入门掲示板': '#計算機入門掲示板',
    'topic.#数学分析掲示板': '#数学分析掲示板',
    'topic.#英語掲示板': '#英語掲示板',
    'topic.#线性代数掲示板': '#線形代数掲示板',
    'topic.#网络导航掲示板': '#ネットワークガイド掲示板',
    'topic.#信息通信掲示板': '#情報通信掲示板',
    'topic.#心理学掲示板': '#心理学掲示板',
    'topic.#数学掲示板': '#数学掲示板',
    'topic.#物理学掲示板': '#物理学掲示板',
    'topic.#生物学掲示板': '#生物学掲示板',
    'topic.#地质学掲示板': '#地質学掲示板',
    'topic.#气象学掲示板': '#気象学掲示板',
    'topic.#经济学掲示板': '#経済学掲示板',
    'topic.#政治学掲示板': '#政治学掲示板',
    'topic.#社会学掲示板': '#社会学掲示板',
    'topic.#量子力学掲示板': '#量子力学掲示板',
    'topic.#机械工程掲示板': '#機械工学掲示板',
    'topic.#土木工程掲示板': '#土木工学掲示板',
    'topic.#电气工程掲示板': '#電気工学掲示板',
    
    // リソース共有タグ
    'topic.#电子书籍': '#電子書籍',
    'topic.#视频资源': '#動画リソース',
    'topic.#学习资料': '#学習資料',
    'topic.#考试题库': '#試験問題集',
    'topic.#课件分享': '#授業資料共有',
    'topic.#软件工具': '#ソフトウェアツール',
    'topic.#学习笔记': '#学習ノート',
    'topic.#实验资料': '#実験資料',
    
    // 競技交流タグ
    'topic.#数学建模': '#数理モデル',
    'topic.#程序设计': '#プログラミングコンテスト',
    'topic.#创新创业': '#イノベーションと起業',
    'topic.#学科竞赛': '#学科競技',
    'topic.#挑战杯': '#チャレンジカップ',
    'topic.#创青春': '#青春創造',
    'topic.#互联网+': '#インターネット+',
    
    // キャンパスライフタグ
    'topic.#美食推荐': '#グルメおすすめ',
    'topic.#社团活动': '#サークル活動',
    'topic.#校园风景': '#キャンパス風景',
    'topic.#运动健身': '#スポーツとフィットネス',
    'topic.#宿舍生活': '#寮生活',
    'topic.#校园趣事': '#キャンパス面白話',
    'topic.#学生会': '#学生会',
    'topic.#文艺活动': '#文化芸術活動',
    
    // キャンパス雑談タグ
    'topic.#校园新闻': '#キャンパスニュース',
    'topic.#活动通知': '#イベント通知',
    'topic.#失物招领': '#落とし物情報',
    'topic.#二手交易': '#中古取引',
    'topic.#闲聊灌水': '#雑談',
    'topic.#情感交流': '#感情交流',
    'topic.#校园趣闻': '#キャンパス珍談',
    
    // 技術交流タグ
    'topic.#编程开发': '#プログラミング開発',
    'topic.#人工智能': '#人工知能',
    'topic.#网络技术': '#ネットワーク技術',
    'topic.#硬件维修': '#ハードウェア修理',
    'topic.#数据分析': '#データ分析',
    'topic.#云计算': '#クラウドコンピューティング',
    'topic.#区块链': '#ブロックチェーン',
    'topic.#物联网': '#IoT',
    
    // 告白ウォールタグ
    'topic.#表白专区': '#告白エリア',
    'topic.#脱单攻略': '#恋人ゲット攻略',
    'topic.#情感故事': '#恋愛物語',
    'topic.#暗恋专栏': '#片思いコラム',
    'topic.#恋爱相談': '#恋愛相談',
    'topic.#心动瞬间': '#胸キュン瞬間',
    
    // 仕事＆アルバイトタグ
    'topic.#实习信息': '#インターンシップ情報',
    'topic.#校招信息': '#新卒採用情報',
    'topic.#求职经验': '#就職活動体験談',
    'topic.#简历指导': '#履歴書指導',
    'topic.#面试技巧': '#面接テクニック',
    'topic.#职业规划': '#キャリアプランニング',
    'topic.#兼职信息': '#アルバイト情報',
    
    // Posts
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
    'post.noPostsRecommended': 'まだおすすめの投稿はありません。もっと投稿を見てみましょう！',
    'post.image': '画像',
    'post.role.student': '学生',
    'post.role.teacher': '教師',
    'post.role.admin': '管理者',
    'post.role.alumnus': '校友',
    'post.shareSuccess': 'リンクをクリップボードにコピーしました',
    'post.shareFailed': '共有できませんでした。後でもう一度お試しください',
    'post.returned': 'Returned',
    'post.notReturned': 'Not Returned',
    'post.author': '作者',
    'post.relatedPosts': '関連する投稿',
    'post.comingSoon': '今後の予定',
    'post.status.lostAndFound': '遺失物捜索中',
    'lostAndFound.backToList': '落とし物リストに戻る',
    'post.status.notFound': '未発見/未返還',
    'lostAndFound.writeComment': 'コメントを書く...',
    'lostAndFound.submitComment': 'コメントを送信',
    'lostAndFound.submittingComment': '送信中...',
    'lostAndFoundCard.commentCount': 'コメント',
    'lostAndFoundCard.shareCount': '共有',
    
    // エラーメッセージ
    'error.network': 'ネットワークエラー、接続を確認してください',
    'error.server': 'サーバーエラー、後でもう一度お試しください',
    'error.unauthorized': 'ログインしてください',
    'error.forbidden': 'アクセスが拒否されました',
    'error.notFound': '見つかりません',
    'error.unknown': '不明なエラー',
    
    // フローティングアクションボタン (FAB)
    'fab.createLostAndFound': '落とし物情報投稿',
    'fab.createPost': '新規投稿作成',
    
    // 投稿作成ページ/コンポーネント
    'createPost.title': '新規投稿作成',
    'createPost.addTagButton': 'タグを追加',
    'createPost.publishButton': '投稿する',
    'createPost.success': '投稿成功しました！',
    'createPost.failure': '投稿に失敗しました。もう一度お試しください。',
    'createPost.selectCategoryPlaceholder': 'トピックを選択',
    'createPost.textInputPlaceholder': 'あなたの考えを共有してください...',
    'createPost.mediaUploadButton': '画像または動画をアップロード',
    
    // 個人プロフィール
    'profile.title': 'マイプロフィール',
    'profile.editButton': 'プロフィール編集',
    'profile.emailLabel': 'メールアドレス',
    'profile.gradeLabel': '学年',
    'profile.departmentLabel': '学部・学科',
    'profile.aboutMeTitle': '自己紹介',
    'profile.usernameLabel': 'ユーザー名',
    'profile.usernamePlaceholder': 'ニックネーム',
    'profile.emailLabelImmutable': 'メールアドレス（変更不可）',
    'profile.departmentPlaceholder': '学部・学科を入力してください',
    'profile.gradePlaceholder': '学年を入力してください',
    'profile.rolePlaceholder': '役割を入力してください',
    'profile.bioLabel': '自己紹介',
    'profile.bioPlaceholder': '簡単な自己紹介を入力してください',
    'profile.saveButton': '変更を保存',
    'profile.cancelButton': 'キャンセル',
    
    // トーストメッセージ
    'toast.fetchProfileFailure': 'ユーザープロフィールの取得に失敗しました',
    'toast.updateProfileSuccess': 'プロフィールが更新されました',
    'toast.updateProfileFailure': 'プロフィールの更新に失敗しました。後でもう一度お試しください',
    
    // Lost and Found
    'lostAndFound.createTitle': '落とし物情報作成',
    'lostAndFound.publishInfoTitle': '落とし物情報投稿',
    'lostAndFound.descriptionLabel': '説明',
    'lostAndFound.publishButton': '情報投稿',
    'lostAndFound.descriptionPlaceholder': '物品の特徴、紛失・拾得場所・時間などを詳しく入力してください...',
    'lostAndFound.publishingButton': '投稿中...',
    // Added for Lost and Found tags
    'tags.lostAndFound': {
      en: 'Lost and Found',
      zh: '失物招领',
      ja: '遺失物',
    },
    'tags.genericTag': {
      en: '{tag}',
      zh: '{tag}',
      ja: '{tag}',
    },
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
  const t = (key: string, params?: { [key: string]: string | number }): string => {
    const translation = translations[language]?.[key as keyof typeof translations[typeof language]] || key;

    if (params) {
      return Object.keys(params).reduce((acc, paramKey) => {
        const placeholder = `{${paramKey}}`;
        const value = params[paramKey];
        return acc.replace(new RegExp(placeholder, 'g'), String(value));
      }, translation as string);
    }
    return translation as string;
  }

  if (!mounted) {
    return null
  }

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
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
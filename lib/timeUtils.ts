/**
 * 时间工具函数
 */

// 获取相对时间描述
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  } else {
    return formatDate(targetDate);
  }
}

// 格式化日期 (YYYY-MM-DD)
export function formatDate(date: Date | string | number): string {
  const targetDate = new Date(date);
  return targetDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 格式化时间 (HH:MM)
export function formatTime(date: Date | string | number): string {
  const targetDate = new Date(date);
  return targetDate.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// 格式化完整时间 (YYYY-MM-DD HH:MM)
export function formatDateTime(date: Date | string | number): string {
  const targetDate = new Date(date);
  return targetDate.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// 判断是否为今天
export function isToday(date: Date | string | number): boolean {
  const today = new Date();
  const targetDate = new Date(date);
  
  return today.toDateString() === targetDate.toDateString();
}

// 判断是否为昨天
export function isYesterday(date: Date | string | number): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = new Date(date);
  
  return yesterday.toDateString() === targetDate.toDateString();
}

// 判断是否为本周
export function isThisWeek(date: Date | string | number): boolean {
  const now = new Date();
  const targetDate = new Date(date);
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return targetDate >= weekStart && targetDate <= weekEnd;
}

// 获取智能时间显示
export function getSmartTimeDisplay(date: Date | string | number): string {
  const targetDate = new Date(date);
  
  if (isToday(targetDate)) {
    return formatTime(targetDate);
  } else if (isYesterday(targetDate)) {
    return `昨天 ${formatTime(targetDate)}`;
  } else if (isThisWeek(targetDate)) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekdays[targetDate.getDay()]} ${formatTime(targetDate)}`;
  } else {
    return formatDateTime(targetDate);
  }
}

// 获取消息分组时间标签
export function getMessageGroupLabel(date: Date | string | number): string {
  const targetDate = new Date(date);
  
  if (isToday(targetDate)) {
    return '今天';
  } else if (isYesterday(targetDate)) {
    return '昨天';
  } else if (isThisWeek(targetDate)) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[targetDate.getDay()];
  } else {
    return formatDate(targetDate);
  }
}

// 判断两个时间是否应该分组显示
export function shouldGroupMessages(
  currentDate: Date | string | number,
  previousDate: Date | string | number | null,
  groupInterval: number = 5 * 60 * 1000 // 默认5分钟
): boolean {
  if (!previousDate) return true;
  
  const current = new Date(currentDate);
  const previous = new Date(previousDate);
  
  // 如果是不同的日期，需要分组
  if (current.toDateString() !== previous.toDateString()) {
    return true;
  }
  
  // 如果时间间隔超过指定间隔，需要分组
  return (current.getTime() - previous.getTime()) > groupInterval;
}

// 格式化持续时间
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}天${hours % 24}小时`;
  } else if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

// 解析时间范围查询
export function parseTimeRange(range: string): { start: Date; end: Date } | null {
  const now = new Date();
  
  switch (range) {
    case 'today':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      };
    
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return {
        start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
      };
    
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return {
        start: weekStart,
        end: now
      };
    
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: monthStart,
        end: now
      };
    
    default:
      return null;
  }
} 
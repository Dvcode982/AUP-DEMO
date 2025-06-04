"use client"
import React, { useRef, useState } from "react"
import { MessageCircle, X, Bot, ExternalLink } from "lucide-react"

const defaultWelcome = "你好，我是AI助理，有什么可以帮您？"

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: "assistant", content: defaultWelcome }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const dragRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  // 拖动事件
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setOffset({
      x: e.clientX - drag.x,
      y: e.clientY - drag.y
    })
    document.body.style.userSelect = "none"
  }
  const onMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setDrag({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      })
    }
  }
  const onMouseUp = () => {
    setDragging(false)
    document.body.style.userSelect = "auto"
  }
  // 监听拖动
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    } else {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [dragging])

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim()) return
    const newMsgs = [...messages, { role: "user", content: input }]
    setMessages(newMsgs)
    setLoading(true)
    const currentInput = input
    setInput("")
    
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ question: currentInput })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: '服务器响应格式错误' }))
        throw new Error(errorData.detail || errorData.error || `请求失败 (${res.status})`)
      }
      
      const data = await res.json()
      if (data.error) {
        throw new Error(data.detail || data.error)
      }
      
      setMessages([...newMsgs, { role: "assistant", content: data.answer }])
      
      // 检查是否有搜索建议，自动触发智能推荐
      if (data.searchSuggestion) {
        console.log('收到搜索建议:', data.searchSuggestion)
        
        // 发送自定义事件给主页面
        window.dispatchEvent(new CustomEvent('aiSmartRecommend', {
          detail: { keyword: data.searchSuggestion.keyword }
        }))
        
        // 显示跳转提示，包含统计信息
        const stats = data.searchSuggestion.stats
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: stats 
              ? `🎯 已为您切换到智能推荐模式！找到 ${stats.total} 个"${stats.keyword}"相关帖子，正在为您展示最相关的内容...`
              : `🎯 已为您切换到智能推荐模式，正在搜索"${data.searchSuggestion.keyword}"相关内容...`
          }])
        }, 500)
      }
      
    } catch (error: any) {
      console.error('AI 对话失败:', error)
      const errorMessage = error.message || 'AI服务异常，请稍后再试。'
      setMessages([...newMsgs, { 
        role: "assistant", 
        content: `抱歉，${errorMessage}\n\n如果问题持续存在，请稍后再试或联系管理员。` 
      }])
    } finally {
      setLoading(false)
    }
  }

  // 重置会话
  const resetSession = () => {
    setMessages([{ role: "assistant", content: defaultWelcome }])
    fetch("/api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true })
    })
  }

  return (
    <>
      {/* 悬浮可拖动按钮 */}
      <div
        ref={dragRef}
        style={{ position: "fixed", bottom: 100 - drag.y, right: 24 - drag.x, zIndex: 1000, cursor: "grab" }}
        onMouseDown={onMouseDown}
        className="select-none"
      >
        <div
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
          onClick={() => setOpen(true)}
        >
          <Bot className="w-7 h-7 text-white" />
        </div>
      </div>
      {/* 右侧弹出聊天栏 */}
      {open && (
        <div className="fixed top-0 right-0 w-96 max-w-full h-full bg-white dark:bg-gray-900 shadow-2xl z-[2000] flex flex-col animate-in slide-in-from-right-10">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-300">
              <Bot className="w-6 h-6" /> AI助理
            </div>
            <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-4 py-2 rounded-xl max-w-[80%] break-words ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-400">AI正在思考...</div>}
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-900">
            <input
              className="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="请输入您的问题..."
              disabled={loading}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-400 transition"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >发送</button>
            <button
              className="ml-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              onClick={resetSession}
              disabled={loading}
            >重置</button>
          </div>
        </div>
      )}
    </>
  )
} 
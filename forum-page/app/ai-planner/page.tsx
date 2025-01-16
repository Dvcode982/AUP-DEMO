'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { Send, ChevronRight, ChevronLeft } from 'lucide-react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface PlanItem {
  date: Date;
  content: string;
}

export default function AiPlanner() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [plan, setPlan] = useState<PlanItem[]>([])
  const [showPlan, setShowPlan] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    // Simulating fetching plan data
    const dummyPlan: PlanItem[] = [
      { date: new Date(2023, 6, 1), content: "学习React基础" },
      { date: new Date(2023, 6, 3), content: "复习JavaScript" },
      { date: new Date(2023, 6, 5), content: "学习Next.js" },
      { date: new Date(2023, 6, 7), content: "练习TypeScript" },
    ]
    setPlan(dummyPlan)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }])
      // 这里应该调用AI API来获取响应
      setMessages(prev => [...prev, { role: 'assistant', content: '这是AI的回复。在实际应用中，这里应该是从API获取的响应。' }])
      setInput('')
      // 模拟AI更新计划
      setPlan(prev => [...prev, { date: new Date(), content: input }])
    }
  }

  const handleDateClick = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value)
      const planElement = document.getElementById(`plan-${value.toDateString()}`)
      if (planElement) {
        planElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="flex h-screen gradient-bg">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden flex">
        <div className="flex-1 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">我的AI规划师</h1>
          <div className="card p-4 h-[calc(100vh-200px)] flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {message.content}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的问题..."
                className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="btn-primary rounded-r-lg rounded-l-none">
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
        <div className={`w-80 bg-white shadow-sm transition-all duration-300 ease-in-out ${showPlan ? 'translate-x-0' : 'translate-x-full'}`}>
          <button
            onClick={() => setShowPlan(!showPlan)}
            className="absolute top-1/2 -left-6 bg-blue-500 text-white p-2 rounded-l-lg shadow-sm hover:bg-blue-600 transition-colors duration-200"
          >
            {showPlan ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className="p-4 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">我的计划</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">学习计划</h3>
              {plan.map((item, index) => (
                <div key={index} id={`plan-${item.date.toDateString()}`} className="card p-3 mb-2">
                  <p className="text-sm text-gray-500">{item.date.toLocaleDateString()}</p>
                  <p className="text-gray-800">{item.content}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">日历</h3>
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                className="rounded-lg shadow-sm"
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    if (date.toDateString() === new Date().toDateString()) {
                      return 'bg-blue-500 text-white rounded-full';
                    }
                    if (plan.some(item => item.date.toDateString() === date.toDateString())) {
                      return 'bg-green-200 rounded-full';
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


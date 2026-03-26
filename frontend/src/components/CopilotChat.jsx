import React, { useState, useRef, useEffect } from 'react'
import { chatCopilot } from '../services/api'

export default function CopilotChat() {
  const [messages, setMessages] = useState([])
  const [query, setQuery] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    if (e) e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const userMsg = { role: 'user', text: trimmed }
    setMessages((m) => [...m, userMsg])
    setQuery('')
    setSending(true)

    try {
      const res = await chatCopilot(trimmed)
      const answer = res?.answer ?? JSON.stringify(res)
      setMessages((m) => [...m, { role: 'assistant', text: answer }])
    } catch (err) {
      const errText = (err?.detail || err?.message || String(err))
      setMessages((m) => [...m, { role: 'assistant', text: `Error: ${errText}` }])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] border rounded-lg overflow-hidden">
      <div className="flex-1 p-4 overflow-auto bg-gray-50">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500">Ask the copilot about a stock or strategy.</div>
        )}
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 border'}`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={send} className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question... (Enter to send, Shift+Enter for newline)"
            className="flex-1 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={1}
          />
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}

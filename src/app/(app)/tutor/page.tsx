'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const TOPICS = [
  'General', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Literature', 'Computer Science', 'Economics',
]

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: "Hi! I'm StudyGenie AI, your personal tutor. I'm here to guide your learning — not just give answers. What would you like to explore today?",
  timestamp: new Date(),
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="glass rounded-2xl rounded-tl-none px-4 py-3 border border-border">
        <div className="flex gap-1.5 items-center h-4">
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [topic, setTopic] = useState('General')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleNewConversation() {
    setMessages([INITIAL_MESSAGE])
  }

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const apiMessages = [...messages, userMsg]
        .filter((m) => m.id !== 'init')
        .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content }))

      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          studyContext: topic !== 'General' ? `Topic: ${topic}` : undefined,
        }),
      })

      const data = await res.json()
      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response ?? 'I had trouble responding. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass shrink-0">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleNewConversation} className="ml-auto gap-2">
          <Plus className="w-3.5 h-3.5" />
          New conversation
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto" aria-live="polite" aria-label="Chat messages" aria-relevant="additions">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3 mb-4', msg.role === 'user' && 'flex-row-reverse')}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border',
                  msg.role === 'assistant'
                    ? 'bg-primary/20 border-primary/30'
                    : 'bg-secondary border-border'
                )}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-4 h-4 text-primary" />
                    : <User className="w-4 h-4 text-foreground" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed border',
                  msg.role === 'assistant'
                    ? 'glass border-border rounded-tl-none'
                    : 'bg-primary text-primary-foreground border-primary rounded-tr-none'
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn(
                    'text-xs mt-1',
                    msg.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border glass px-4 py-3 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
            className="flex-1 min-h-[44px] max-h-36 resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-11 w-11 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { SendHorizontal, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LogoMark } from '@/components/brand'
import { useStudyData } from '@/contexts/study-data-context'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const TOPICS = [
  'General', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Literature', 'Computer Science', 'Economics',
]

const STARTERS = [
  'Explain this like I’m new to the topic',
  'Quiz me with three quick questions',
  'What’s the difference between mitosis and meiosis?',
  'Help me make a mnemonic',
]

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    'Ask about anything you’re studying. I’ll walk you through it step by step and check your understanding as we go, rather than just handing over answers.',
  timestamp: new Date(0),
}

function TypingIndicator() {
  return (
    <div className="mb-5 flex items-start gap-3">
      <LogoMark className="size-7" />
      <div className="rounded-lg rounded-tl-sm border border-border bg-card px-4 py-3">
        <span className="sr-only">Tutor is typing</span>
        <div className="flex h-4 items-center gap-1.5" aria-hidden="true">
          <span className="typing-dot size-1.5 rounded-full bg-muted-foreground" />
          <span className="typing-dot size-1.5 rounded-full bg-muted-foreground" />
          <span className="typing-dot size-1.5 rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

export default function TutorPage() {
  const { logActivity } = useStudyData()
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [topic, setTopic] = useState('General')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sessionLogged = useRef(false)
  const sending = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  function handleNewConversation() {
    setMessages([INITIAL_MESSAGE])
    sessionLogged.current = false
    textareaRef.current?.focus()
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || sending.current) return
    sending.current = true

    if (!sessionLogged.current) {
      sessionLogged.current = true
      logActivity('tutor', `Tutor chat${topic !== 'General' ? ` on ${topic}` : ''}`)
    }

    const userMsg: ChatMessage = { id: uuidv4(), role: 'user', content: trimmed, timestamp: new Date() }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const apiMessages = history
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
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: data.response ?? 'I couldn’t put an answer together. Try rephrasing the question.',
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'That message didn’t go through. Check your connection and send it again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      sending.current = false
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const showStarters = messages.length === 1 && !loading

  return (
    <div className="flex h-[calc(100dvh-60px)] flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-2.5 sm:px-6">
        <label htmlFor="tutor-topic" className="hidden text-sm text-muted-foreground sm:block">
          Subject
        </label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger id="tutor-topic" className="w-44" aria-label="Subject">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={handleNewConversation} className="ml-auto">
          <Plus aria-hidden="true" />
          New chat
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <div role="log" aria-live="polite" aria-label="Conversation" aria-relevant="additions">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} className={cn('mb-5 flex items-start gap-3', isUser && 'flex-row-reverse')}>
                  {!isUser && <LogoMark className="size-7" />}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-4 py-3 text-[15px] leading-relaxed sm:max-w-[75%]',
                      isUser
                        ? 'rounded-tr-sm bg-primary text-primary-foreground'
                        : 'rounded-tl-sm border border-border bg-card text-foreground'
                    )}
                  >
                    <span className="sr-only">{isUser ? 'You said: ' : 'Tutor said: '}</span>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.id !== 'init' && (
                      <p
                        className={cn(
                          'tabular mt-1.5 text-xs',
                          isUser ? 'text-primary-foreground/75' : 'text-muted-foreground'
                        )}
                      >
                        <time dateTime={msg.timestamp.toISOString()}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {loading && <TypingIndicator />}

          {showStarters && (
            <div className="ml-10 mt-1">
              <p className="mb-2 text-xs text-muted-foreground">Try one of these</p>
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="min-h-9 cursor-pointer rounded-md border border-border-strong bg-card px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <form
          className="mx-auto flex max-w-3xl items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <label htmlFor="tutor-input" className="sr-only">Message the tutor</label>
          <Textarea
            id="tutor-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            aria-describedby="tutor-hint"
            className="max-h-36 min-h-11 flex-1 resize-none"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            aria-busy={loading}
            aria-label={loading ? 'Waiting for reply' : 'Send message'}
            className="size-11 shrink-0"
          >
            {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <SendHorizontal aria-hidden="true" />}
          </Button>
        </form>
        <p id="tutor-hint" className="mx-auto mt-1.5 hidden max-w-3xl text-xs text-muted-foreground sm:block">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  )
}

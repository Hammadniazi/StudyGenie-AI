import { NextRequest, NextResponse } from 'next/server'
import { generateFlashcards } from '@/services/ai/gemini'

export async function POST(req: NextRequest) {
  try {
    const { content, count = 10 } = await req.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
    }

    const cardCount = Math.min(Math.max(Number(count) || 10, 1), 30)

    if (content.length > 40000) {
      return NextResponse.json({ error: 'Content is too long.' }, { status: 400 })
    }

    const flashcards = await generateFlashcards(content, cardCount)

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error('[/api/flashcards/generate]', error)
    return NextResponse.json({ error: 'Failed to generate flashcards.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { generateQuiz } from '@/services/ai/gemini'

export async function POST(req: NextRequest) {
  try {
    const { content, difficulty = 'medium', count = 10 } = await req.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
    }

    const validDifficulties = ['easy', 'medium', 'hard']
    const safeDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'medium'
    const questionCount = Math.min(Math.max(Number(count) || 10, 1), 20)

    if (content.length > 40000) {
      return NextResponse.json({ error: 'Content is too long.' }, { status: 400 })
    }

    const questions = await generateQuiz(content, safeDifficulty, questionCount)

    return NextResponse.json(questions)
  } catch (error) {
    console.error('[/api/quiz/generate]', error)
    return NextResponse.json({ error: 'Failed to generate quiz.' }, { status: 500 })
  }
}

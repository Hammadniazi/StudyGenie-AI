import { NextRequest, NextResponse } from 'next/server'
import { getTutorResponse } from '@/services/ai/gemini'

export async function POST(req: NextRequest) {
  try {
    const { messages, studyContext } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 })
    }

    if (messages.length > 50) {
      return NextResponse.json({ error: 'Conversation is too long. Please start a new session.' }, { status: 400 })
    }

    const validMessages = messages.filter(
      (m: unknown) =>
        typeof m === 'object' &&
        m !== null &&
        'role' in m &&
        'content' in m &&
        (m as { role: string }).role !== undefined &&
        (m as { content: string }).content !== undefined
    )

    const response = await getTutorResponse(validMessages, studyContext)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[/api/tutor]', error)
    return NextResponse.json({ error: 'Failed to get tutor response.' }, { status: 500 })
  }
}

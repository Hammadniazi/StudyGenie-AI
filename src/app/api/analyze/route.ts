import { NextRequest, NextResponse } from 'next/server'
import { generateSummary } from '@/services/ai/gemini'

export async function POST(req: NextRequest) {
  try {
    const { content, title, subject } = await req.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
    }

    if (content.length > 50000) {
      return NextResponse.json({ error: 'Content is too long. Please limit to 50,000 characters.' }, { status: 400 })
    }

    const contextualContent = `
${title ? `Title: ${title}\n` : ''}${subject ? `Subject: ${subject}\n` : ''}
Content:
${content}
    `.trim()

    const summary = await generateSummary(contextualContent)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[/api/analyze]', error)
    return NextResponse.json({ error: 'Failed to analyze content. Please try again.' }, { status: 500 })
  }
}

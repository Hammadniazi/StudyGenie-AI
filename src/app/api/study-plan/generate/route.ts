import { NextRequest, NextResponse } from 'next/server'
import { generateStudyPlan } from '@/services/ai/gemini'

export async function POST(req: NextRequest) {
  try {
    const { subject, examDate, dailyHours, topics = [] } = await req.json()

    if (!subject || !examDate) {
      return NextResponse.json({ error: 'Subject and exam date are required.' }, { status: 400 })
    }

    const examDateObj = new Date(examDate)
    if (isNaN(examDateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid exam date.' }, { status: 400 })
    }

    if (examDateObj < new Date()) {
      return NextResponse.json({ error: 'Exam date must be in the future.' }, { status: 400 })
    }

    const safeDailyHours = Math.min(Math.max(Number(dailyHours) || 2, 0.5), 12)
    const safeTopics = Array.isArray(topics) ? topics.slice(0, 20).map(String) : []

    const plan = await generateStudyPlan(subject, examDate, safeDailyHours, safeTopics)

    return NextResponse.json(plan)
  } catch (error) {
    console.error('[/api/study-plan/generate]', error)
    return NextResponse.json({ error: 'Failed to generate study plan.' }, { status: 500 })
  }
}

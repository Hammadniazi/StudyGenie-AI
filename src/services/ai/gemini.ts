import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  return genAI.getGenerativeModel({ model: modelName })
}

export async function generateContent(prompt: string): Promise<string> {
  const model = getGeminiModel()
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function generateSummary(content: string) {
  const prompt = `You are an expert academic summarizer. Analyze the following study material and provide a comprehensive analysis in valid JSON format.

Study Material:
${content}

Respond with ONLY a JSON object (no markdown, no code blocks) with this exact structure:
{
  "executive_summary": "A comprehensive paragraph summarizing the main ideas and concepts",
  "learning_objectives": ["After studying this material, you will be able to...", "..."],
  "key_definitions": [{"term": "term name", "definition": "clear definition"}],
  "important_facts": ["Important fact 1", "Important fact 2"],
  "quick_revision": "A concise revision sheet covering all key points in bullet format"
}`

  const text = await generateContent(prompt)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function generateFlashcards(content: string, count = 10) {
  const prompt = `You are an expert educator. Create ${count} high-quality flashcards from the following study material.

Study Material:
${content}

Respond with ONLY a JSON array (no markdown, no code blocks) with this exact structure:
[
  {
    "question": "Clear, specific question",
    "answer": "Comprehensive answer",
    "difficulty": "easy|medium|hard",
    "topic_tag": "specific topic name"
  }
]

Make questions diverse: factual, conceptual, application-based.`

  const text = await generateContent(prompt)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function generateQuiz(content: string, difficulty: string, count = 10) {
  const prompt = `You are an expert exam creator. Generate a ${difficulty} difficulty quiz with ${count} questions from the following study material.

Study Material:
${content}

Respond with ONLY a JSON array (no markdown, no code blocks) with this exact structure:
[
  {
    "question": "Clear question",
    "type": "multiple_choice|true_false|short_answer",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "The correct answer",
    "explanation": "Why this is correct",
    "topic_tag": "topic name"
  }
]

For true_false: options should be ["True", "False"]
For short_answer: options should be null or omitted
Mix question types. Focus on ${difficulty} level understanding.`

  const text = await generateContent(prompt)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function generateStudyPlan(subject: string, examDate: string, dailyHours: number, topics: string[]) {
  const daysUntilExam = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const prompt = `You are an expert study coach. Create a detailed study plan.

Subject: ${subject}
Exam Date: ${examDate}
Days Until Exam: ${daysUntilExam}
Daily Study Hours: ${dailyHours}
Topics to Cover: ${topics.join(', ') || 'All standard topics for this subject'}

Respond with ONLY a JSON object (no markdown, no code blocks) with this exact structure:
{
  "daily_plan": [
    {
      "date": "2024-01-01",
      "tasks": [
        {
          "id": "unique-id",
          "title": "Task title",
          "type": "study|revision|quiz|flashcards",
          "duration_minutes": 60,
          "topic": "specific topic",
          "completed": false
        }
      ]
    }
  ],
  "weekly_plan": [
    {
      "week_number": 1,
      "focus_topics": ["topic1", "topic2"],
      "tasks": [...]
    }
  ]
}

Create plans for the next 7 days in daily_plan and 4 weeks in weekly_plan.
Use spaced repetition principles. Prioritize weaker areas.`

  const text = await generateContent(prompt)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function analyzeWeakAreas(quizResults: Array<{ topic: string; correct: boolean }>) {
  const topicStats: Record<string, { correct: number; total: number }> = {}

  quizResults.forEach(result => {
    if (!topicStats[result.topic]) {
      topicStats[result.topic] = { correct: 0, total: 0 }
    }
    topicStats[result.topic].total++
    if (result.correct) topicStats[result.topic].correct++
  })

  const weakTopics = Object.entries(topicStats)
    .filter(([, stats]) => stats.correct / stats.total < 0.6)
    .map(([topic]) => topic)

  return weakTopics
}

export async function getTutorResponse(
  messages: Array<{ role: string; content: string }>,
  studyContext?: string
): Promise<string> {
  const model = getGeminiModel()

  const systemPrompt = `You are StudyGenie AI, an expert tutor and learning companion.

Your teaching philosophy:
- Teach rather than just answer — guide students to discover knowledge
- Adapt explanations to the student's apparent level
- Use simple language first, then add complexity
- Break complex ideas into digestible steps
- Encourage critical thinking with follow-up questions
- Give concrete examples and analogies
- Be supportive, patient, and encouraging
- Use Socratic questioning to develop understanding
- Focus on deep understanding, not memorization
- If a student seems stuck, give hints rather than full answers

${studyContext ? `Study Context / Material:\n${studyContext}\n` : ''}

Remember: You are a personal tutor, not a search engine. Guide, don't just inform.`

  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I will act as a supportive tutor, guiding students through concepts with questions, examples, and encouragement rather than just providing answers. How can I help you learn today?' }],
      },
      ...messages.slice(0, -1).map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }],
      })),
    ],
  })

  const lastMessage = messages[messages.length - 1]
  const result = await chat.sendMessage(lastMessage.content)
  return result.response.text()
}

export async function generateInsights(stats: {
  topicMastery: Array<{ topic: string; mastery_percentage: number }>
  quizAccuracy: number
  studyStreak: number
  weakAreas: string[]
}): Promise<string[]> {
  const prompt = `You are an AI learning analytics expert. Generate 3 personalized insights for a student.

Student Data:
- Study Streak: ${stats.studyStreak} days
- Quiz Accuracy: ${stats.quizAccuracy}%
- Weak Areas: ${stats.weakAreas.join(', ')}
- Topic Mastery: ${stats.topicMastery.map(t => `${t.topic}: ${t.mastery_percentage}%`).join(', ')}

Respond with ONLY a JSON array of 3 insight strings (no markdown, no code blocks):
["Insight 1", "Insight 2", "Insight 3"]

Make insights specific, actionable, and encouraging. Reference actual topics and numbers.`

  const text = await generateContent(prompt)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

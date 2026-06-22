import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Dynamically import pdf-parse to avoid edge runtime issues
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(buffer)

    const text = data.text?.trim()
    if (!text) {
      return NextResponse.json({ error: 'Could not extract text from PDF. The PDF may be scanned/image-based.' }, { status: 422 })
    }

    return NextResponse.json({ text, pages: data.numpages })
  } catch (error) {
    console.error('[/api/parse-pdf]', error)
    return NextResponse.json({ error: 'Failed to parse PDF.' }, { status: 500 })
  }
}

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
    const data = new Uint8Array(bytes)

    // pdf-parse v2 class-based API.
    // serverExternalPackages in next.config.ts prevents Next.js from bundling
    // this package (and its native deps: pdfjs-dist, @napi-rs/canvas).
    let PDFParse: typeof import('pdf-parse').PDFParse
    try {
      ;({ PDFParse } = await import('pdf-parse'))
    } catch (importErr) {
      console.error('[/api/parse-pdf] Failed to import pdf-parse:', importErr)
      return NextResponse.json({ error: 'PDF parser unavailable. Please paste your text manually.' }, { status: 503 })
    }

    const parser = new PDFParse({ data })
    const result = await parser.getText()
    await parser.destroy()

    const text = result.pages.map((p: { text: string }) => p.text).join('\n').trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The PDF may be scanned/image-based.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text, pages: result.total })
  } catch (error) {
    console.error('[/api/parse-pdf] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse PDF.' },
      { status: 500 }
    )
  }
}

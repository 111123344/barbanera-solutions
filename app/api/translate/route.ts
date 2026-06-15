import { NextRequest } from 'next/server'

const LANG_PAIRS: Record<string, string[]> = {
  en: ['ar', 'fr'],
  ar: ['en', 'fr'],
  fr: ['en', 'ar'],
}

async function translateText(text: string, from: string, to: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url)
  const data = await res.json()
  // data[0] is an array of segments: [[translated, original], ...]
  const translation = (data[0] as Array<[string]>)
    .map(segment => segment[0])
    .join('')
    .trim()
  return translation || text
}

export async function POST(request: NextRequest) {
  const { text, sourceLang } = await request.json() as { text: string; sourceLang: string }

  const trimmed = text?.trim()
  if (!trimmed) {
    return Response.json({ en: '', ar: '', fr: '' })
  }

  const targets = LANG_PAIRS[sourceLang] ?? ['ar', 'fr']
  const results: Record<string, string> = { [sourceLang]: trimmed }

  await Promise.all(
    targets.map(async (target) => {
      try {
        results[target] = await translateText(trimmed, sourceLang, target)
      } catch {
        results[target] = trimmed
      }
    })
  )

  return Response.json(results)
}

import { NextRequest } from 'next/server'

const LANG_PAIRS: Record<string, string[]> = {
  en: ['ar', 'fr'],
  ar: ['en', 'fr'],
  fr: ['en', 'ar'],
}

async function translateText(text: string, from: string, to: string): Promise<string> {
  const email = process.env.MYMEMORY_EMAIL ?? ''
  const emailParam = email ? `&de=${encodeURIComponent(email)}` : ''
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}${emailParam}`
  const res = await fetch(url, { next: { revalidate: 0 } })
  const data = await res.json()
  return data.responseData?.translatedText ?? text
}

export async function POST(request: NextRequest) {
  const { text, sourceLang } = await request.json() as { text: string; sourceLang: string }

  if (!text?.trim()) {
    return Response.json({ en: '', ar: '', fr: '' })
  }

  const targets = LANG_PAIRS[sourceLang] ?? ['ar', 'fr']
  const results: Record<string, string> = { [sourceLang]: text }

  await Promise.all(
    targets.map(async (target) => {
      try {
        results[target] = await translateText(text, sourceLang, target)
      } catch {
        results[target] = text
      }
    })
  )

  return Response.json(results)
}

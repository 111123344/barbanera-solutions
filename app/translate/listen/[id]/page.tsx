'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Volume2, VolumeX } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Translations = { en: string; ar: string; fr: string }
type Chunk = Translations & { seq: number }

const LANGS = [
  { code: 'en', label: 'English', voiceLang: 'en-US', dir: 'ltr' as const },
  { code: 'ar', label: 'العربية', voiceLang: 'ar-SA', dir: 'rtl' as const },
  { code: 'fr', label: 'Français', voiceLang: 'fr-FR', dir: 'ltr' as const },
]

const STORAGE_KEY = 'tarjim_language'

const WAITING: Record<string, string> = {
  en: 'Waiting for the speaker…',
  ar: 'في انتظار المتحدث…',
  fr: 'En attente du conférencier…',
}

export default function ListenPage() {
  const params = useParams()
  const sessionId = params.id as string

  const [lang, setLang] = useState<string>(() => {
    if (typeof window === 'undefined') return 'en'
    return localStorage.getItem(STORAGE_KEY) ?? 'en'
  })
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [connected, setConnected] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  // Refs so broadcast handler always sees the latest values without re-subscribing
  const langRef = useRef(lang)
  const audioEnabledRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { langRef.current = lang }, [lang])
  useEffect(() => { audioEnabledRef.current = audioEnabled }, [audioEnabled])

  function changeLang(code: string) {
    setLang(code)
    localStorage.setItem(STORAGE_KEY, code)
  }

  function speakText(text: string, langCode: string) {
    if (!audioEnabledRef.current || !text || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = LANGS.find(l => l.code === langCode)?.voiceLang ?? 'en-US'
    window.speechSynthesis.speak(utter)
  }

  // Subscribe once per sessionId — lang changes do NOT trigger reconnection
  useEffect(() => {
    if (!supabase) {
      setConnected(false)
      return
    }

    const ch = supabase.channel(`session:${sessionId}`)

    ch.on('broadcast', { event: 'text' }, ({ payload }: { payload: Chunk }) => {
      if (!payload) return
      setChunks(prev => {
        // Insert sorted by seq, deduplicate, keep last 200
        const exists = prev.some(c => c.seq === payload.seq)
        if (exists) return prev
        return [...prev, payload]
          .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
          .slice(-200)
      })
      speakText(payload[langRef.current as keyof Translations] ?? '', langRef.current)
    })

    ch.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED')
    })

    return () => { ch.unsubscribe() }
  }, [sessionId]) // ← only sessionId, NOT lang

  // Auto-scroll to bottom whenever new chunk arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chunks])

  const selectedLang = LANGS.find(l => l.code === lang) ?? LANGS[0]

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* Top bar — always LTR */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Language selector */}
          <div className="flex gap-1.5">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => changeLang(l.code)}
                className={`rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
                  lang === l.code
                    ? 'bg-[#c9a84c] text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled(v => !v)}
            className={`rounded-full p-2 transition-colors ${
              audioEnabled
                ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
            }`}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>

        {/* Connection dot */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-xs text-zinc-500">
            {connected ? 'Live' : supabase ? 'Connecting…' : 'Setup required'}
          </span>
        </div>
      </div>

      {/* Text area */}
      <div
        className="flex-1 overflow-y-auto px-6 py-8 max-w-lg mx-auto w-full"
        dir={selectedLang.dir}
      >
        {chunks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-3 w-3 rounded-full bg-zinc-700 mb-6 animate-pulse" />
            <p className="text-zinc-400 text-lg font-medium">{WAITING[lang]}</p>
          </div>
        ) : (
          <p className="text-white text-2xl leading-[1.9] font-normal tracking-wide">
            {chunks.map((chunk, i) => {
              const text = chunk[lang as keyof Translations] ?? ''
              const isNew = i >= chunks.length - 2
              return (
                <span key={chunk.seq ?? i} className={isNew ? 'text-white' : 'text-zinc-400'}>
                  {text}{' '}
                </span>
              )
            })}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

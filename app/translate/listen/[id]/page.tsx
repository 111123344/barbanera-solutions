'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Volume2, VolumeX } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Translations = { en: string; ar: string; fr: string }
type Message = Translations & { id: number }

const LANGS = [
  { code: 'en', label: 'English', voiceLang: 'en-US', dir: 'ltr' as const },
  { code: 'ar', label: 'العربية', voiceLang: 'ar-SA', dir: 'rtl' as const },
  { code: 'fr', label: 'Français', voiceLang: 'fr-FR', dir: 'ltr' as const },
]

const STORAGE_KEY = 'tarjim_language'

export default function ListenPage() {
  const params = useParams()
  const sessionId = params.id as string

  const [lang, setLang] = useState<string>(() => {
    if (typeof window === 'undefined') return 'en'
    return localStorage.getItem(STORAGE_KEY) ?? 'en'
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [connected, setConnected] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const counterRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  function changeLang(code: string) {
    setLang(code)
    localStorage.setItem(STORAGE_KEY, code)
  }

  function speakText(text: string, langCode: string) {
    if (!audioEnabled || !text || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = LANGS.find(l => l.code === langCode)?.voiceLang ?? 'en-US'
    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }

  // Supabase real-time subscription
  useEffect(() => {
    if (!supabase) {
      setConnected(false)
      return
    }

    const ch = supabase.channel(`session:${sessionId}`, {
      config: { presence: { key: `listener-${Math.random().toString(36).slice(2)}` } },
    })

    ch.on('broadcast', { event: 'text' }, ({ payload }: { payload: Translations }) => {
      const msg: Message = { ...payload, id: ++counterRef.current }
      setMessages(prev => [...prev.slice(-49), msg])
      speakText(payload[lang as keyof Translations], lang)
    })

    ch.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED')
    })

    ch.track({})

    return () => { ch.unsubscribe() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, lang])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedLang = LANGS.find(l => l.code === lang) ?? LANGS[0]
  const noMessages = messages.length === 0

  return (
    <div className="min-h-screen bg-black flex flex-col" dir={selectedLang.dir}>

      {/* Top bar */}
      <div
        className="sticky top-0 z-10 bg-black/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3"
        dir="ltr"
      >
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
            title={audioEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>

        {/* Connection status */}
        <div className="flex items-center justify-center gap-1.5 mt-2" dir="ltr">
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-xs text-zinc-500">
            {connected ? 'Live' : supabase ? 'Connecting…' : 'Setup required'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        {noMessages ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-5xl mb-4">
              {lang === 'ar' ? '🎙️' : lang === 'fr' ? '🎙️' : '🎙️'}
            </div>
            <p className="text-zinc-400 text-base font-medium">
              {lang === 'ar'
                ? 'في انتظار المتحدث…'
                : lang === 'fr'
                ? 'En attente du conférencier…'
                : 'Waiting for the speaker…'}
            </p>
            <p className="text-zinc-600 text-sm mt-2">
              {lang === 'ar'
                ? 'ستظهر الترجمة هنا تلقائياً'
                : lang === 'fr'
                ? 'La traduction apparaîtra ici automatiquement'
                : 'Translation will appear here automatically'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => {
              const text = msg[lang as keyof Translations]
              const isLatest = i === messages.length - 1
              return (
                <p
                  key={msg.id}
                  className={`leading-relaxed transition-opacity ${
                    isLatest
                      ? 'text-white text-xl font-medium'
                      : 'text-zinc-500 text-base'
                  }`}
                >
                  {text}
                </p>
              )
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom hint */}
      {!supabase && (
        <div className="px-4 pb-4" dir="ltr">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400 text-center max-w-lg mx-auto">
            Supabase env vars not set — real-time sync is disabled.
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Mic, MicOff, Copy, Check, Users } from 'lucide-react'
import QRCode from 'react-qr-code'
import { supabase } from '@/lib/supabase'

type Translations = { en: string; ar: string; fr: string }

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: { results: SpeechRecognitionResultList; resultIndex: number }) => void) | null
  onerror: ((event: Event & { error?: string }) => void) | null
  onend: (() => void) | null
}

const LANGS = [
  { code: 'en', label: 'English', speechCode: 'en-US' },
  { code: 'ar', label: 'العربية', speechCode: 'ar-SA' },
  { code: 'fr', label: 'Français', speechCode: 'fr-FR' },
]

export default function SpeakerPage() {
  const params = useParams()
  const sessionId = params.id as string

  const [sourceLang, setSourceLang] = useState('en')
  const [recording, setRecording] = useState(false)
  const [copied, setCopied] = useState(false)
  const [listenerCount, setListenerCount] = useState(0)
  const [preview, setPreview] = useState<Translations[]>([])
  const [interimText, setInterimText] = useState('')

  const recogRef = useRef<SpeechRecognition | null>(null)
  const isActiveRef = useRef(false)
  const sourceLangRef = useRef(sourceLang)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)
  const seqRef = useRef(0)
  // Sequential queue: each translation waits for the previous to finish, preserving order
  const queueRef = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => { sourceLangRef.current = sourceLang }, [sourceLang])

  const listenUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/translate/listen/${sessionId}`
    : ''

  // Supabase channel
  useEffect(() => {
    if (!supabase) return
    const ch = supabase.channel(`session:${sessionId}`, {
      config: { presence: { key: 'speaker' } },
    })
    ch.on('presence', { event: 'sync' }, () => {
      setListenerCount(Object.keys(ch.presenceState()).length)
    })
    ch.subscribe()
    channelRef.current = ch
    return () => { ch.unsubscribe() }
  }, [sessionId])

  function enqueueTranslation(text: string, lang: string) {
    const seq = ++seqRef.current
    queueRef.current = queueRef.current.then(async () => {
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sourceLang: lang }),
        })
        const t: Translations = await res.json()
        setPreview(prev => [...prev.slice(-9), t])
        channelRef.current?.send({
          type: 'broadcast',
          event: 'text',
          payload: { ...t, seq },
        })
      } catch {
        // silent — don't break the queue on error
      }
    })
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Speech recognition requires Chrome or Edge.')
      return
    }

    const lang = sourceLangRef.current
    const recog = new SR()
    recog.continuous = true
    recog.interimResults = true
    recog.lang = LANGS.find(l => l.code === lang)?.speechCode ?? 'en-US'

    recog.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) {
          const text = r[0].transcript.trim()
          if (text) {
            enqueueTranslation(text, sourceLangRef.current)
            setInterimText('')
          }
        } else {
          interim += r[0].transcript
        }
      }
      setInterimText(interim)
    }

    recog.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isActiveRef.current = false
        setRecording(false)
      }
      // other errors (network, aborted) let onend handle restart
    }

    recog.onend = () => {
      if (isActiveRef.current && recogRef.current === recog) {
        try { recog.start() } catch { /* already starting */ }
      }
    }

    isActiveRef.current = true
    recog.start()
    recogRef.current = recog
    setRecording(true)
  }

  function stopRecording() {
    isActiveRef.current = false
    recogRef.current?.stop()
    recogRef.current = null
    setRecording(false)
    setInterimText('')
  }

  function copyLink() {
    navigator.clipboard.writeText(listenUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayLangs = LANGS.filter(l => l.code !== sourceLang)

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Speaker View</p>
            <h1 className="text-xl font-black text-white">Live Session</h1>
          </div>
          {supabase && (
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-sm text-zinc-300 font-semibold">{listenerCount}</span>
            </div>
          )}
        </div>

        {/* Source language */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">I am speaking in</p>
          <div className="flex gap-2">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => { setSourceLang(l.code); stopRecording() }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                  sourceLang === l.code
                    ? 'bg-[#c9a84c] text-black'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mic button */}
        <div className="flex flex-col items-center py-4">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`rounded-full w-24 h-24 flex items-center justify-center transition-all shadow-xl ${
              recording
                ? 'bg-red-500 shadow-red-500/30 animate-pulse'
                : 'bg-[#c9a84c] shadow-[#c9a84c]/20 hover:bg-[#e8c97a]'
            }`}
          >
            {recording
              ? <MicOff className="h-10 w-10 text-white" />
              : <Mic className="h-10 w-10 text-black" />}
          </button>
          <p className="mt-3 text-sm text-zinc-400">
            {recording ? 'Tap to stop' : 'Tap to start speaking'}
          </p>
          {interimText && (
            <p className="mt-2 text-xs text-zinc-500 italic max-w-xs text-center">
              &ldquo;{interimText}&rdquo;
            </p>
          )}
        </div>

        {/* Live preview — same layout as listener */}
        {preview.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Listener Preview</p>
            {displayLangs.map(l => (
              <div
                key={l.code}
                className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 max-h-36 overflow-y-auto"
                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
              >
                <p className="text-xs text-[#c9a84c] font-semibold mb-2">{l.label}</p>
                <p className="text-white text-sm leading-relaxed">
                  {preview.map(t => t[l.code as keyof Translations]).filter(Boolean).join(' ')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* QR code */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4 text-center">
            Listeners — scan to join
          </p>
          {listenUrl && (
            <div className="flex justify-center mb-4 bg-white rounded-xl p-3">
              <QRCode value={listenUrl} size={180} />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={sessionId}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-300 font-mono truncate"
            />
            <button
              onClick={copyLink}
              className="rounded-xl bg-zinc-700 hover:bg-zinc-600 px-3 py-2.5 transition-colors flex items-center gap-1.5 text-sm font-semibold text-white"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  abort(): void
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
  const [interimText, setInterimText] = useState('')
  const [sentCount, setSentCount] = useState(0)

  // All mutable state lives in refs so closures never go stale
  const isActiveRef = useRef(false)
  const sourceLangRef = useRef(sourceLang)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null)
  const seqRef = useRef(0)
  const lastTextRef = useRef('')
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { sourceLangRef.current = sourceLang }, [sourceLang])

  const listenUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/translate/listen/${sessionId}`
    : ''

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

  // Fire-and-forget: translations run in parallel, ordered by seq on listener side
  const sendTranslation = useCallback((text: string, lang: string) => {
    const seq = ++seqRef.current
    setSentCount(n => n + 1)
    ;(async () => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 8000)
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sourceLang: lang }),
          signal: controller.signal,
        })
        clearTimeout(timer)
        if (!res.ok) return
        const t: Translations = await res.json()
        channelRef.current?.send({ type: 'broadcast', event: 'text', payload: { ...t, seq } })
      } catch { /* timeout or network error — skip this chunk, don't block */ }
    })()
  }, [])

  // Creates a fresh SpeechRecognition instance every time — most reliable restart strategy
  const startSession = useCallback(() => {
    if (!isActiveRef.current) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const recog = new SR()
    recog.continuous = true
    recog.interimResults = true
    recog.lang = LANGS.find(l => l.code === sourceLangRef.current)?.speechCode ?? 'en-US'

    recog.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) {
          const text = r[0].transcript.trim()
          // Skip: empty, 1-word fragments, or exact duplicate of last sent
          if (text && text.split(/\s+/).length >= 2 && text !== lastTextRef.current) {
            lastTextRef.current = text
            sendTranslation(text, sourceLangRef.current)
            setInterimText('')
          }
        } else {
          interim += r[0].transcript
        }
      }
      if (interim) setInterimText(interim)
    }

    recog.onerror = (e) => {
      // Only hard-stop on permission errors — everything else lets onend restart
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isActiveRef.current = false
        setRecording(false)
        setInterimText('')
      }
    }

    recog.onend = () => {
      // Always restart after a short pause using a FRESH instance
      if (isActiveRef.current) {
        restartTimerRef.current = setTimeout(startSession, 300)
      }
    }

    try {
      recog.start()
    } catch {
      // Browser busy — retry after a moment
      if (isActiveRef.current) {
        restartTimerRef.current = setTimeout(startSession, 600)
      }
    }
  }, [sendTranslation])

  function startRecording() {
    if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
      alert('Speech recognition requires Chrome or Edge on desktop.')
      return
    }
    isActiveRef.current = true
    setRecording(true)
    startSession()
  }

  function stopRecording() {
    isActiveRef.current = false
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    setRecording(false)
    setInterimText('')
  }

  function copyLink() {
    navigator.clipboard.writeText(listenUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black">Live Session</h1>
          <div className="flex items-center gap-2">
            {recording && (
              <span className="text-xs text-zinc-500">{sentCount} sent</span>
            )}
            {supabase && (
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-sm font-semibold">{listenerCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Language */}
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

        {/* Mic */}
        <div className="flex flex-col items-center py-6">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`rounded-full w-28 h-28 flex items-center justify-center transition-all shadow-2xl ${
              recording
                ? 'bg-red-500 shadow-red-500/40 scale-105'
                : 'bg-[#c9a84c] shadow-[#c9a84c]/20 hover:bg-[#e8c97a] active:scale-95'
            }`}
          >
            {recording
              ? <MicOff className="h-12 w-12 text-white" />
              : <Mic className="h-12 w-12 text-black" />}
          </button>
          <p className="mt-4 text-sm font-medium text-zinc-400">
            {recording
              ? <span className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live — tap to stop</span>
              : 'Tap to start speaking'}
          </p>
          <div className="mt-3 min-h-[36px] max-w-xs text-center">
            {interimText && (
              <p className="text-sm text-zinc-500 italic">{interimText}</p>
            )}
          </div>
        </div>

        {/* QR */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4 text-center">
            Listeners scan to join
          </p>
          {listenUrl && (
            <div className="flex justify-center mb-4 bg-white rounded-xl p-4">
              <QRCode value={listenUrl} size={164} />
            </div>
          )}
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-sm font-semibold transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy listener link'}
          </button>
        </div>

      </div>
    </div>
  )
}

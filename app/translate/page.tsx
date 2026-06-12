'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Scan, ArrowRight, Languages } from 'lucide-react'

export default function TranslateLanding() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')

  function startSession() {
    const id = crypto.randomUUID()
    router.push(`/translate/speaker/${id}`)
  }

  function joinSession(e: React.FormEvent) {
    e.preventDefault()
    const id = joinCode.trim()
    if (id) router.push(`/translate/listen/${id}`)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-4 py-1.5 mb-6">
          <Languages className="h-4 w-4 text-[#c9a84c]" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a84c]">
            Live Translation
          </span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
          Every language,<br />
          <span className="text-[#c9a84c]">live in your hand.</span>
        </h1>
        <p className="text-zinc-400 text-base max-w-sm mx-auto">
          Speaker talks — everyone reads the translation on their phone instantly.
          Arabic · English · French.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Start session */}
        <button
          onClick={startSession}
          className="w-full flex items-center justify-between rounded-2xl bg-[#c9a84c] px-6 py-5 text-black font-bold text-left hover:bg-[#e8c97a] transition-colors shadow-xl shadow-[#c9a84c]/20"
        >
          <div>
            <p className="text-lg font-black">Start Session</p>
            <p className="text-sm font-medium opacity-70">You are the speaker</p>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>

        {/* Join via code */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-white font-bold mb-1 flex items-center gap-2">
            <Scan className="h-4 w-4 text-zinc-400" />
            Join as Listener
          </p>
          <p className="text-zinc-500 text-sm mb-4">
            Scan the QR code shown by the speaker, or enter the session code.
          </p>
          <form onSubmit={joinSession} className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Paste session code…"
              className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c9a84c]/60"
            />
            <button
              type="submit"
              className="rounded-xl bg-zinc-700 hover:bg-zinc-600 px-4 py-3 text-white transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-zinc-600 text-center max-w-xs">
        No app download needed. Works in any browser. Language preference is saved to your device.
      </p>
    </div>
  )
}

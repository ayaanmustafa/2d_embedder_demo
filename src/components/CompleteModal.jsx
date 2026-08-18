import React from 'react'

export default function CompleteModal({ open }) {
  if (!open) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <div
        className={`flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 shadow-2xl shadow-black/50 ${
          open ? 'animate-pulse' : ''
        }`}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-zinc-300">Submitting sketch…</p>
      </div>
    </div>
  )
}
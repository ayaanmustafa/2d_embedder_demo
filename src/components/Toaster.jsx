import React from 'react'

const styles = {
  success: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  error: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
  info: 'border-zinc-700 bg-zinc-800/90 text-zinc-200',
}

export default function Toaster({ toasts }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 text-center text-sm font-medium backdrop-blur transition ${styles[t.type] || styles.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
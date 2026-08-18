import React from 'react'

export default function ControlPanel({
  input,
  setInput,
  onAdd,
  pathLength,
  ready,
  disabled,
  onUndo,
  onReset,
  onComplete,
  onSubmit,
  isComplete,
  smooth,
  onToggleSmooth,
  sketchName,
  setSketchName,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (disabled) {
        onComplete()
      } else if (ready) {
        onAdd(input)
      }
    }
  }

  return (
    <div className="shrink-0 space-y-3 pb-2 pt-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!ready}
          placeholder={
            !ready
              ? 'Loading word map…'
              : disabled
                ? 'Sketch complete — press Enter or Reset to start over'
                : pathLength === 0
                  ? 'Type a word to begin…'
                  : 'Type the next word…'
          }
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-[15px] text-zinc-100 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => (disabled ? onComplete() : ready ? onAdd(input) : undefined)}
          disabled={!ready}
          className="shrink-0 rounded-xl bg-violet-600 px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-violet-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disabled ? 'Finish' : 'Add'}
        </button>
      </div>

      <div className="flex items-center justify-end px-1">
        <button
          type="button"
          onClick={onToggleSmooth}
          className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-800"
        >
          {smooth ? 'Straight' : 'Smooth'}
        </button>
      </div>

      {isComplete && (
        <div className="flex items-center gap-2 px-1">
          <input
            type="text"
            value={sketchName}
            onChange={(e) => setSketchName(e.target.value)}
            placeholder="Name"
            maxLength={60}
            autoCapitalize="off"
            className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 outline-none transition focus:border-emerald-500 placeholder:text-zinc-600"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={pathLength === 0}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={pathLength === 0}
          className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isComplete}
          className="flex-[1.5] rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
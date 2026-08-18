import React, { useCallback, useEffect, useRef, useState } from 'react'
import SketchCanvas from './components/SketchCanvas'
import ControlPanel from './components/ControlPanel'
import Toaster from './components/Toaster'
import CompleteModal from './components/CompleteModal'
import { submitSketch } from './lib/submit'

const DICT_URL = `${import.meta.env.BASE_URL}word_map_40k.json`
const COMMON_URL = `${import.meta.env.BASE_URL}common_map.json`

const buildMap = (data) => {
  const m = new Map()
  for (const word in data) m.set(word.toLowerCase(), data[word])
  return m
}

export default function App() {
  const [dictionary, setDictionary] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [path, setPath] = useState([])
  const [input, setInput] = useState('')
  const [sketchName, setSketchName] = useState('')
  const [smooth, setSmooth] = useState(true)
  const [toasts, setToasts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const svgRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const common = await fetch(COMMON_URL).then((r) => r.json())
        if (cancelled) return
        setDictionary(buildMap(common))
        const full = await fetch(DICT_URL).then((r) => r.json())
        if (cancelled) return
        setDictionary(buildMap(full))
      } catch {
        if (!cancelled) setLoadError(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 2600)
  }, [])

  const isComplete = path.length > 1 && path[path.length - 1].word === path[0].word

  const addWord = useCallback(
    (raw) => {
      const word = raw.trim()
      if (!word) return
      const coords = dictionary ? dictionary.get(word.toLowerCase()) : undefined
      if (!coords) {
        toast('Word not found. Try another.', 'error')
        setInput('')
        return
      }
      setPath((p) => [...p, { word: word.toLowerCase(), x: coords[0], y: coords[1] }])
      setInput('')
    },
    [dictionary, toast],
  )

  const handleSubmit = useCallback(() => {
    if (!isComplete || !svgRef.current) return
    const n = sketchName.trim()
    if (!n) {
      toast('Please add a name first.', 'error')
      return
    }
    setShowModal(true)
    submitSketch(svgRef.current, path, sketchName)
      .then((ok) => {
        setShowModal(false)
        toast(ok ? 'Sketch uploaded successfully!' : 'Upload failed. Please try again.', ok ? 'success' : 'error')
      })
      .catch(() => {
        setShowModal(false)
        toast('Upload failed. Please try again.', 'error')
      })
  }, [isComplete, path, sketchName, toast])

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-zinc-400">Failed to load the word map. Please refresh.</p>
      </div>
    )
  }

  const ready = Boolean(dictionary)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950">
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Word Sketcher</h1>
          <p className="text-xs text-zinc-500">Chain words to draw a semantic sketch</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !ready
              ? 'bg-zinc-800 text-zinc-400'
              : isComplete
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {!ready ? 'Loading map…' : isComplete ? 'Complete' : `${path.length} node${path.length === 1 ? '' : 's'}`}
        </span>
      </header>

      <main className="flex min-h-0 flex-1 flex-col px-4">
        <div className="relative flex min-h-0 flex-1">
          <SketchCanvas ref={svgRef} path={path} isComplete={isComplete} smooth={smooth} />
          {!ready && !loadError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-zinc-800" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-violet-500 border-t-transparent [animation-duration:0.8s]" />
              </div>
              <p className="text-sm text-zinc-500">Loading semantic space…</p>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500/60"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <ControlPanel
          input={input}
          setInput={setInput}
          onAdd={addWord}
          pathLength={path.length}
          ready={ready}
          disabled={isComplete}
          onUndo={() => setPath((p) => p.slice(0, -1))}
          onReset={() => setPath([])}
          onComplete={() => setPath([])}
          onSubmit={handleSubmit}
          isComplete={isComplete}
          smooth={smooth}
          onToggleSmooth={() => setSmooth((s) => !s)}
          sketchName={sketchName}
          setSketchName={setSketchName}
        />
      </main>

      <Toaster toasts={toasts} />
      <CompleteModal open={showModal} />
      <footer className="pb-4 pt-2 text-center text-[11px] text-zinc-600">
        Type words, watch them connect in semantic space
      </footer>
    </div>
  )
}
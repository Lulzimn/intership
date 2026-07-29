import { EMOTION_TAGS, TAG_COLORS } from '../../lib/constants'

export function TagSelector({ selected, onChange }) {
  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Emotion tags</p>
      <div className="flex flex-wrap gap-2">
        {EMOTION_TAGS.map((tag) => {
          const active = selected.includes(tag)
          const colors = TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-700 ring-slate-200'

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`rounded-full px-3 py-1.5 text-sm capitalize ring-1 transition ${
                active
                  ? `${colors} ring-2 ring-offset-1 ring-indigo-400`
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
              }`}
              aria-pressed={active}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}

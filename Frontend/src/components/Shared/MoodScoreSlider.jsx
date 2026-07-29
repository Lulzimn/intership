import { moodEmoji, moodLabel } from '../../lib/constants'

export function MoodScoreSlider({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Mood score</p>
          <p className="text-3xl font-semibold text-slate-900">
            {value}
            <span className="text-lg font-normal text-slate-400">/10</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-4xl" aria-hidden>
            {moodEmoji(value)}
          </span>
          <p className="text-sm text-slate-500">{moodLabel(value)}</p>
        </div>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-linear-to-r from-rose-300 via-amber-300 to-emerald-400 accent-indigo-600"
        aria-label="Mood score from 1 to 10"
      />

      <div className="flex justify-between text-xs text-slate-400">
        <span>1 — Very low</span>
        <span>10 — Great</span>
      </div>
    </div>
  )
}

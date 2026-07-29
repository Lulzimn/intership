import { useEffect, useState } from 'react'
import { saveMood } from '../../api/moods'
import { todayISO } from '../../lib/constants'
import { MoodScoreSlider } from './MoodScoreSlider'
import { TagSelector } from './TagSelector'

export function MoodForm({ initial, onSaved, patientId = null }) {
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [moodScore, setMoodScore] = useState(initial?.moodScore ?? 7)
  const [tags, setTags] = useState(initial?.tags ?? [])
  const [note, setNote] = useState(initial?.note ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (initial) {
      setDate(initial.date)
      setMoodScore(initial.moodScore)
      setTags(initial.tags)
      setNote(initial.note)
    }
  }, [initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await saveMood({ date, patientId, moodScore, tags, note: note.trim() })
      setSuccess(true)
      onSaved()
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-indigo-100/50 backdrop-blur"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Log your mood</h2>
          <p className="text-sm text-slate-500">Track how you feel today</p>
        </div>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          aria-label="Entry date"
        />
      </div>

      <div className="space-y-6">
        <MoodScoreSlider value={moodScore} onChange={setMoodScore} />
        <TagSelector selected={tags} onChange={setTags} />

        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-slate-700">
            Short note <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder='e.g. "Had a stressful meeting."'
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <p className="text-right text-xs text-slate-400">{note.length}/280</p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Mood saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving…' : initial ? 'Update entry' : 'Save mood'}
      </button>
    </form>
  )
}

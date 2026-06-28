import { deleteMood } from '../../api/moods'
import { formatDate, moodEmoji, TAG_COLORS } from '../../lib/constants'

export function MoodHistory({ entries, onSelect, onDeleted, patientId = null }) {
  const handleDelete = async (date) => {
    if (!confirm('Delete this mood entry?')) return
    try {
      await deleteMood(date, patientId)
      onDeleted()
    } catch {
      alert('Could not delete entry')
    }
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-200/70 bg-white/65 p-8 text-center backdrop-blur-sm">
        <p className="text-slate-600">No mood entries yet.</p>
        <p className="mt-1 text-sm text-slate-500">Log your first mood above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Recent entries</h2>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-indigo-100/70 bg-white/85 p-4 shadow-sm shadow-indigo-100/40 transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className="flex flex-1 items-start gap-3 text-left"
              >
                <span className="text-2xl" aria-hidden>
                  {moodEmoji(entry.moodScore)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {entry.moodScore}/10
                    </span>
                    <span className="text-sm text-slate-400">·</span>
                    <span className="text-sm text-slate-500">{formatDate(entry.date)}</span>
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-2 py-0.5 text-xs capitalize ring-1 ${
                            TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.note && (
                    <p className="mt-2 text-sm text-slate-600 italic">"{entry.note}"</p>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(entry.date)}
                className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Delete entry for ${entry.date}`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

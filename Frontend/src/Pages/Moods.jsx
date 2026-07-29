import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMoods } from '../api/moods'
import { MoodForm } from '../components/Shared/MoodForm'
import { MoodHistory } from '../components/Shared/MoodHistory'
import { useAuth } from '../context/AuthContext'
import { todayISO } from '../lib/constants'
import photo2 from '../assets/Foto2.png'

function Moods() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  const loadEntries = useCallback(async () => {
    try {
      setError(null)
      const patientId = user?.role === 'patient' ? user.id : undefined
      const data = await fetchMoods({ patientId })
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.role])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const handleSaved = () => {
    setEditing(null)
    loadEntries()
  }

  const handleSelect = (entry) => {
    setEditing({
      date: entry.date,
      moodScore: entry.moodScore,
      tags: entry.tags,
      note: entry.note,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewEntry = () => {
    setEditing(null)
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-right bg-no-repeat"
        style={{ backgroundImage: `url(${photo2})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r  via-slate-300/34 to-indigo-900/28"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl">
        {user?.role === 'patient' && (
          <Link
            to="/dashboard"
            className="absolute left-0 top-0 z-10 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur hover:bg-white"
          >
            Back to Dashboard
          </Link>
        )}

        <header className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Daily check-in
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Mood Tracker
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-700">
            Log your mood, pick emotion tags, and add a short note — one entry per day.
          </p>
        </header>

        {error && (
          <p className="mb-6 rounded-xl border border-rose-200/70 bg-rose-50/85 px-4 py-3 text-center text-sm text-rose-700 backdrop-blur-sm">
            {error}. Make sure the backend is running on port 3001.
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            {editing && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-2 text-sm text-indigo-800">
                <span>Editing entry for {editing.date}</span>
                <button
                  type="button"
                  onClick={handleNewEntry}
                  className="font-medium underline hover:no-underline"
                >
                  New entry
                </button>
              </div>
            )}
            <MoodForm
              key={editing?.date ?? todayISO()}
              initial={editing ?? undefined}
              patientId={user?.role === 'patient' ? user.id : null}
              onSaved={handleSaved}
            />
          </div>

          <div className="rounded-2xl border border-indigo-100/70 bg-white/55 p-4 shadow-xl shadow-indigo-100/60 backdrop-blur-md sm:p-6">
            {loading ? (
              <p className="text-center text-slate-600">Loading entries…</p>
            ) : (
              <MoodHistory
                entries={entries}
                onSelect={handleSelect}
                onDeleted={loadEntries}
                patientId={user?.role === 'patient' ? user.id : null}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Moods
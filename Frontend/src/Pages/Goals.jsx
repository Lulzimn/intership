import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Droplets, Flame, MoonStar, PlusCircle, Wind } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/AuthContext'
import { completeTherapyGoal, createTherapyGoal, fetchMyContacts, fetchTherapyGoals } from '../api/therapy'

const GOAL_TYPES = {
  breathing: {
    label: 'Breathing exercise',
    icon: Wind,
    accent: 'from-cyan-500 to-sky-500',
    background: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200/70',
    description: 'Slow down and reset with guided breathing cycles.',
  },
  meditation: {
    label: 'Meditation goal',
    icon: MoonStar,
    accent: 'from-violet-500 to-indigo-500',
    background: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200/70',
    description: 'Build a steady mindfulness practice you can keep showing up for.',
  },
  sleep: {
    label: 'Sleep goal',
    icon: Flame,
    accent: 'from-amber-500 to-orange-500',
    background: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/70',
    description: 'Protect your evening routine and keep your bedtime predictable.',
  },
  hydration: {
    label: 'Hydration reminder',
    icon: Droplets,
    accent: 'from-sky-500 to-blue-500',
    background: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200/70',
    description: 'Stay ahead of thirst with simple reminders throughout the day.',
  },
}

const initialForm = {
  goalType: 'breathing',
  title: '',
  description: '',
  reminderTime: '',
}

function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [contacts, setContacts] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completingId, setCompletingId] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)

  const activeGoalTypes = useMemo(() => Object.entries(GOAL_TYPES), [])
  const isTherapist = user?.role === 'therapist'
  const selectedPatientName = useMemo(
    () => contacts.find((contact) => contact.id === selectedPatientId)?.fullName ?? '',
    [contacts, selectedPatientId]
  )

  useEffect(() => {
    async function loadContacts() {
      if (!isTherapist) {
        return
      }

      setError('')
      try {
        const rows = await fetchMyContacts()
        setContacts(rows)
        setSelectedPatientId(rows[0]?.id ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load patients')
        setContacts([])
        setSelectedPatientId(null)
      }
    }

    loadContacts()
  }, [isTherapist])

  useEffect(() => {
    async function loadGoals() {
      if (isTherapist && !selectedPatientId) {
        setGoals([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const rows = await fetchTherapyGoals({ patientId: isTherapist ? selectedPatientId : undefined })
        setGoals(rows)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load goals')
      } finally {
        setLoading(false)
      }
    }

    loadGoals()
  }, [isTherapist, selectedPatientId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Give your goal a title before saving.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await createTherapyGoal({
        goalType: form.goalType,
        title: form.title.trim(),
        description: form.description.trim(),
        reminderTime: form.reminderTime,
        ...(isTherapist && Number.isInteger(selectedPatientId) ? { patientId: selectedPatientId } : {}),
      })
      setForm(initialForm)
      const rows = await fetchTherapyGoals({ patientId: isTherapist ? selectedPatientId : undefined })
      setGoals(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create goal')
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async (goalId) => {
    setCompletingId(goalId)
    setError('')

    try {
      const updatedGoal = await completeTherapyGoal(goalId)
      setGoals((currentGoals) => currentGoals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the streak')
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0))]" aria-hidden />

      <div className="relative mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Therapy goals</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Breathing, meditation, sleep, and hydration in one place.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Create a habit, mark it complete when you finish, and keep your streak visible so progress feels concrete.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
          >
            Back to dashboard
          </Link>
        </div>

        {isTherapist && (
          <Card className="border-white/70 bg-white/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Organize goals per patient</p>
                <p className="text-sm text-slate-600">Select a patient and create a separate plan for that person.</p>
                {selectedPatientName && (
                  <p className="mt-1 text-sm font-medium text-sky-700">Current patient: {selectedPatientName}</p>
                )}
              </div>

              <select
                value={selectedPatientId ?? ''}
                onChange={(event) => setSelectedPatientId(Number(event.target.value))}
                className="h-11 w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                disabled={contacts.length === 0}
              >
                {contacts.length === 0 ? (
                  <option value="">No linked patients</option>
                ) : (
                  contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName}
                    </option>
                  ))
                )}
              </select>
            </CardContent>
          </Card>
        )}

        {error && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="border-white/70 bg-white/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100/80 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                <PlusCircle className="size-5 text-sky-600" />
                {isTherapist ? 'New patient goal' : 'New goal'}
              </CardTitle>
              <CardDescription>
                {isTherapist
                  ? 'Create a custom therapy goal for the selected patient.'
                  : 'Pick a habit type, describe the target, and add a reminder time if you want one.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="goalType">
                    Goal type
                  </label>
                  <select
                    id="goalType"
                    value={form.goalType}
                    onChange={(event) => setForm((current) => ({ ...current, goalType: event.target.value }))}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  >
                    {activeGoalTypes.map(([value, meta]) => (
                      <option key={value} value={value}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="title">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="10-minute guided breathing"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="description">
                    Notes
                  </label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="What does success look like for this goal?"
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="reminderTime">
                    Reminder time
                  </label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={form.reminderTime}
                    onChange={(event) => setForm((current) => ({ ...current, reminderTime: event.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saving || (isTherapist && !selectedPatientId)}>
                  {saving ? 'Creating...' : 'Create goal'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {loading ? (
              <Card className="border-white/70 bg-white/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <CardContent className="p-6 text-center text-slate-600">Loading goals...</CardContent>
              </Card>
            ) : goals.length === 0 ? (
              <Card className="border-dashed border-slate-300/80 bg-white/60 shadow-[0_16px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                <CardContent className="space-y-3 p-8 text-center">
                  <p className="text-lg font-medium text-slate-900">No goals yet</p>
                  <p className="text-sm text-slate-600">
                    {isTherapist
                      ? 'Create the first therapy goal for this patient.'
                      : 'Start with a small breathing exercise or hydration reminder. The streak tracker will appear here once you add one.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                {goals.map((goal) => {
                  const meta = GOAL_TYPES[goal.goalType]
                  const Icon = meta.icon

                  return (
                    <Card
                      key={goal.id}
                      className={`border ${meta.border} bg-white/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl`}
                    >
                      <CardHeader className="border-b border-slate-100/80 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex size-12 items-center justify-center rounded-2xl bg-linear-to-br ${meta.accent} text-white shadow-lg shadow-slate-200`}>
                              <Icon className="size-6" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-slate-950">{goal.title}</CardTitle>
                              <CardDescription>{meta.label}</CardDescription>
                            </div>
                          </div>

                          <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                            {goal.currentStreak} day streak
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-5">
                        {isTherapist && (
                          <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            Patient: {goal.ownerFullName || selectedPatientName || 'Unknown'}
                          </p>
                        )}

                        <p className="text-sm leading-6 text-slate-600">
                          {goal.description || meta.description}
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className={`rounded-2xl ${meta.background} px-4 py-3`}>
                            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${meta.text}`}>
                              Longest streak
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-slate-950">{goal.longestStreak}</p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Total completions
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-slate-950">{goal.completionCount}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                          <span>
                            {goal.reminderTime ? `Reminder at ${goal.reminderTime}` : 'No reminder time set'}
                          </span>
                          {goal.completedToday ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                              <CheckCircle2 className="size-4" />
                              Done today
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                              Ready to complete
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          className="w-full"
                          disabled={goal.completedToday || completingId === goal.id || isTherapist}
                          onClick={() => handleComplete(goal.id)}
                        >
                          {isTherapist
                            ? 'Patient marks completion'
                            : goal.completedToday
                            ? 'Completed for today'
                            : completingId === goal.id
                              ? 'Updating...'
                              : 'Mark complete'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Goals

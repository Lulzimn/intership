export const EMOTION_TAGS = [
  'anxious',
  'tired',
  'happy',
  'calm',
  'stressed',
  'energetic',
  'sad',
  'grateful',
  'focused',
  'overwhelmed',
  'peaceful',
  'motivated',
]

export const TAG_COLORS = {
  anxious: 'bg-amber-100 text-amber-800 ring-amber-200',
  tired: 'bg-slate-100 text-slate-700 ring-slate-200',
  happy: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  calm: 'bg-sky-100 text-sky-800 ring-sky-200',
  stressed: 'bg-orange-100 text-orange-800 ring-orange-200',
  energetic: 'bg-lime-100 text-lime-800 ring-lime-200',
  sad: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  grateful: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  focused: 'bg-violet-100 text-violet-800 ring-violet-200',
  overwhelmed: 'bg-rose-100 text-rose-800 ring-rose-200',
  peaceful: 'bg-teal-100 text-teal-800 ring-teal-200',
  motivated: 'bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200',
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

export function moodEmoji(score) {
  if (score <= 2) return '😞'
  if (score <= 4) return '😕'
  if (score <= 6) return '😐'
  if (score <= 8) return '🙂'
  return '😊'
}

export function moodLabel(score) {
  if (score <= 2) return 'Very low'
  if (score <= 4) return 'Low'
  if (score <= 6) return 'Okay'
  if (score <= 8) return 'Good'
  return 'Great'
}

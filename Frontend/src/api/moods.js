import { apiFetch } from './client'

export function fetchMoods({ limit = 30, patientId } = {}) {
  const query = new URLSearchParams({ limit: String(limit) })
  if (Number.isInteger(patientId)) {
    query.set('patientId', String(patientId))
  }
  return apiFetch(`/moods?${query.toString()}`)
}

export async function fetchMoodByDate(date, patientId) {
  const query = new URLSearchParams()
  if (Number.isInteger(patientId)) {
    query.set('patientId', String(patientId))
  }

  try {
    return await apiFetch(`/moods/${date}${query.toString() ? `?${query.toString()}` : ''}`)
  } catch (error) {
    if (error instanceof Error && error.message === 'No mood entry for this date') {
      return null
    }
    throw error
  }
}

export function saveMood(data) {
  return apiFetch('/moods', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteMood(date, patientId) {
  const query = new URLSearchParams()
  if (Number.isInteger(patientId)) {
    query.set('patientId', String(patientId))
  }
  return apiFetch(`/moods/${date}${query.toString() ? `?${query.toString()}` : ''}`, {
    method: 'DELETE',
  })
}

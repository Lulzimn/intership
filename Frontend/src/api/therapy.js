import { apiFetch } from './client'

export function fetchMyContacts() {
  return apiFetch('/therapy/my/contacts')
}

export function fetchTherapyGoals({ patientId } = {}) {
  const query = new URLSearchParams()
  if (Number.isInteger(patientId)) {
    query.set('patientId', String(patientId))
  }

  return apiFetch(`/therapy/goals${query.toString() ? `?${query.toString()}` : ''}`)
}

export function createTherapyGoal(data) {
  return apiFetch('/therapy/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function completeTherapyGoal(goalId) {
  return apiFetch(`/therapy/goals/${goalId}/complete`, {
    method: 'POST',
  })
}

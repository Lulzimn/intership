import { apiFetch } from './client'

export function register(payload) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchMe() {
  return apiFetch('/auth/me')
}

export function fetchTherapists() {
  return apiFetch('/auth/therapists')
}

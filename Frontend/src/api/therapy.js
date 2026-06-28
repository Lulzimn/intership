import { apiFetch } from './client'

export function fetchMyContacts() {
  return apiFetch('/therapy/my/contacts')
}

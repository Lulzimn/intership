import { apiFetch } from './client'

export function fetchConversation(userA, userB, limit = 100) {
  return apiFetch(`/messages/conversation?userA=${userA}&userB=${userB}&limit=${limit}`)
}

export function sendMessage(payload) {
  return apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function markMessageRead(messageId) {
  return apiFetch(`/messages/${messageId}/read`, {
    method: 'PATCH',
  })
}

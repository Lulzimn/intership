import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchConversation, markMessageRead, sendMessage } from '../api/messages'
import { fetchMyContacts } from '../api/therapy'
import { useAuth } from '../context/AuthContext'
import foto4 from '../assets/Foto4.png'

function Chat() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [selectedContactId, setSelectedContactId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const selectedContact = useMemo(
    () => contacts.find((item) => item.id === selectedContactId) || null,
    [contacts, selectedContactId]
  )

  useEffect(() => {
    async function loadContacts() {
      setLoading(true)
      setError('')

      try {
        const items = await fetchMyContacts()
        setContacts(items)
        if (items.length > 0) {
          setSelectedContactId(items[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load contacts')
      } finally {
        setLoading(false)
      }
    }

    loadContacts()
  }, [])

  useEffect(() => {
    async function loadConversation() {
      if (!selectedContactId || !user?.id) {
        setMessages([])
        return
      }

      setError('')

      try {
        const rows = await fetchConversation(user.id, selectedContactId)
        setMessages(rows)

        for (const message of rows) {
          if (!message.readAt && message.receiverId === user.id) {
            await markMessageRead(message.id)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load conversation')
      }
    }

    loadConversation()
  }, [selectedContactId, user?.id])

  const handleSend = async (event) => {
    event.preventDefault()
    if (!selectedContactId || !body.trim() || !user?.id) {
      return
    }

    setSending(true)
    setError('')

    try {
      await sendMessage({
        senderId: user.id,
        receiverId: selectedContactId,
        body: body.trim(),
      })
      setBody('')
      const rows = await fetchConversation(user.id, selectedContactId)
      setMessages(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6"
      style={{ backgroundImage: `url(${foto4})` }}
    >
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" aria-hidden />

      <div className="relative mx-auto max-w-6xl rounded-2xl border border-white/40 bg-white/45 p-4 shadow-sm backdrop-blur-md sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Therapy Chat</h1>
          <Link to="/dashboard" className="text-sm font-medium text-indigo-700">
            Back to dashboard
          </Link>
        </div>

        {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        {loading ? (
          <p className="text-slate-600">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <p className="text-slate-600">No linked contact found yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[260px_1fr]">
            <aside className="space-y-2 rounded-xl border border-white/50 bg-white/35 p-3 backdrop-blur-sm">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedContactId === contact.id
                      ? 'bg-indigo-50 text-indigo-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-medium">{contact.fullName}</p>
                  <p className="text-xs text-slate-500">{contact.email}</p>
                </button>
              ))}
            </aside>

            <section className="flex min-h-[520px] flex-col rounded-xl border border-white/50 bg-white/30 p-3 backdrop-blur-sm">
              <div className="mb-3 border-b border-slate-100 pb-3">
                <p className="font-medium text-slate-900">{selectedContact?.fullName}</p>
                <p className="text-xs text-slate-500">{selectedContact?.email}</p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
                {messages.map((message) => {
                  const mine = message.senderId === user.id
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                          mine ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border border-slate-200'
                        }`}
                      >
                        <p>{message.body}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {new Date(message.sentAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <form onSubmit={handleSend} className="mt-3 flex gap-2">
                <input
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Type a message"
                  className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={sending || !selectedContactId}
                  className="rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white disabled:opacity-60"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import foto3 from '../assets/Foto3.png'
import { fetchMoods } from '../api/moods'
import { formatDate } from '../lib/constants'
import { fetchMyContacts } from '../api/therapy'

export const Dashboard = () => {
  const { user, signOut } = useAuth()
  const [latestMood, setLatestMood] = useState(null)
  const [loadingMood, setLoadingMood] = useState(false)
  const [therapistPatients, setTherapistPatients] = useState([])
  const [loadingPatients, setLoadingPatients] = useState(false)

  useEffect(() => {
    async function loadLatestMood() {
      if (!user || user.role !== 'patient') {
        setLatestMood(null)
        return
      }

      setLoadingMood(true)
      try {
        const rows = await fetchMoods({ limit: 1, patientId: user.id })
        setLatestMood(rows[0] ?? null)
      } catch {
        setLatestMood(null)
      } finally {
        setLoadingMood(false)
      }
    }

    loadLatestMood()
  }, [user])

  useEffect(() => {
    async function loadTherapistPatients() {
      if (!user || user.role !== 'therapist') {
        setTherapistPatients([])
        return
      }

      setLoadingPatients(true)

      try {
        const contacts = await fetchMyContacts()

        const enriched = await Promise.all(
          contacts.map(async (patient) => {
            try {
              const rows = await fetchMoods({ limit: 1, patientId: patient.id })
              return {
                ...patient,
                latestMood: rows[0] ?? null,
              }
            } catch {
              return {
                ...patient,
                latestMood: null,
              }
            }
          })
        )

        setTherapistPatients(enriched)
      } catch {
        setTherapistPatients([])
      } finally {
        setLoadingPatients(false)
      }
    }

    loadTherapistPatients()
  }, [user])

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4 py-10 sm:px-6"
      style={{ backgroundImage: `url(${foto3})` }}
    >
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" aria-hidden />

      <div className="relative mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <p className="text-sm uppercase tracking-wide text-slate-500">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Welcome, {user?.fullName}</h1>
          <p className="mt-2 text-slate-600">Role: {user?.role}</p>
          <p className="text-slate-600">Email: {user?.email}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {user?.role === 'therapist' ? (
            <div className="rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-900">Patients Overview</h2>
              <p className="mt-1 text-sm text-slate-600">
                Total patients: <span className="font-semibold">{therapistPatients.length}</span>
              </p>

              <div className="mt-3 space-y-2">
                {loadingPatients ? (
                  <p className="text-sm text-slate-600">Loading patients...</p>
                ) : therapistPatients.length === 0 ? (
                  <p className="text-sm text-slate-600">No linked patients yet.</p>
                ) : (
                  therapistPatients.map((patient) => (
                    <div key={patient.id} className="rounded-lg bg-white/60 px-3 py-2 text-sm text-slate-700">
                      <p className="font-medium text-slate-800">{patient.fullName}</p>
                      {patient.latestMood ? (
                        <>
                          <p>
                            Last mood: <span className="font-semibold">{patient.latestMood.moodScore}/10</span> on{' '}
                            <span className="font-medium">{formatDate(patient.latestMood.date)}</span>
                          </p>
                          {patient.latestMood.tags?.length > 0 && (
                            <p className="mt-1 text-xs text-slate-600">
                              Feelings: {patient.latestMood.tags.join(', ')}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-slate-600">No mood registered yet.</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <Link to="/moods" className="rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">Mood Tracker</h2>
              <p className="mt-1 text-sm text-slate-600">Log and review daily mood entries.</p>

              {user?.role === 'patient' && (
                <div className="mt-3 rounded-lg bg-white/60 px-3 py-2 text-sm text-slate-700">
                  {loadingMood ? (
                    <p>Loading latest mood...</p>
                  ) : latestMood ? (
                    <>
                      <p>
                        Last entry: <span className="font-semibold">{latestMood.moodScore}/10</span> on{' '}
                        <span className="font-medium">{formatDate(latestMood.date)}</span>
                      </p>
                      {latestMood.tags?.length > 0 && (
                        <p className="mt-1 text-xs text-slate-600">
                          Feelings: {latestMood.tags.join(', ')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>No moods registered yet.</p>
                  )}
                </div>
              )}
            </Link>
          )}

          <Link to="/chat" className="rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">Therapy Chat</h2>
            <p className="mt-1 text-sm text-slate-600">Send secure messages to your linked contact.</p>
          </Link>
        </div>

        <Button type="button" variant="outline" onClick={signOut}>
          Logout
        </Button>
      </div>
    </div>
  )
}

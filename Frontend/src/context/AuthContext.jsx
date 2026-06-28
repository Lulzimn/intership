import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMe, login, register } from '../api/auth'
import { clearStoredToken, getStoredToken, setStoredToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getStoredToken()

    if (!token) {
      setLoading(false)
      return
    }

    fetchMe()
      .then((profile) => setUser(profile))
      .catch(() => {
        clearStoredToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async signIn(credentials) {
        const result = await login(credentials)
        setStoredToken(result.token)
        setUser(result.user)
        return result.user
      },
      async signUp(payload) {
        const result = await register(payload)
        setStoredToken(result.token)
        setUser(result.user)
        return result.user
      },
      signOut() {
        clearStoredToken()
        setUser(null)
      },
    }),
    [loading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

import Layout from '@/components/Shared/Layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

import React from 'react'

export const LoginPage = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const target = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn({ email, password })
      navigate(target, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex h-screen items-center justify-center px-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-4 rounded-2xl bg-white/85 p-6 shadow-xl backdrop-blur"
        >
          <h1 className="text-3xl font-bold">Login</h1>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-rose-700">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <p className="text-sm text-slate-600">
            No account? <Link to="/signup" className="font-medium text-indigo-700">Create one</Link>
          </p>
        </form>
      </div>
    </Layout>
  )
}

export default LoginPage
  
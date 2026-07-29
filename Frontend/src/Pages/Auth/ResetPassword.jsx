import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Shared/Layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { resetPassword } from '@/api/auth'

export const ResetPassword = () => {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await resetPassword({ email, newPassword })
      setSuccess('Password updated successfully. You can now sign in.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset password failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-4 rounded-2xl bg-white/85 p-6 shadow-xl backdrop-blur"
        >
          <h1 className="text-3xl font-bold">Reset Password</h1>

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-rose-700">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating...' : 'Reset password'}
          </Button>

          <p className="text-sm text-slate-600">
            Back to{' '}
            <Link to="/login" className="font-medium text-indigo-700">
              Login
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  )
}

export default ResetPassword

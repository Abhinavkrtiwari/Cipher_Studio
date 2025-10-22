'use client'

import { useState } from 'react'
import { useProjectStore } from '@/store/projectStore'

export default function Login() {
  const { login, register } = useProjectStore()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password')
      return
    }

    setLoading(true)
    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please provide a name for registration')
          setLoading(false)
          return
        }
        const ok = await register(email.trim(), name.trim(), password)
        if (!ok) setError('Registration failed — email might already be used')
      } else {
        const ok = await login(email.trim(), password)
        if (!ok) setError('Invalid credentials')
      }
    } catch (err) {
      setError('Auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 bg-card border border-border rounded-md">
        <h2 className="text-xl font-semibold mb-2">{isRegister ? 'Create an account' : 'Sign in to CipherStudio'}</h2>
        <p className="text-sm text-muted-foreground mb-4">{isRegister ? 'Create account to save your projects' : 'Sign in to continue to your workspace'}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-sm block mb-1">Name</label>
              <input className="w-full px-3 py-2 border border-border rounded-md bg-background" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div>
            <label className="text-sm block mb-1">Email</label>
            <input type="email" className="w-full px-3 py-2 border border-border rounded-md bg-background" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="text-sm block mb-1">Password</label>
            <input type="password" className="w-full px-3 py-2 border border-border rounded-md bg-background" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50" disabled={loading}>
              {loading ? (isRegister ? 'Creating...' : 'Signing in...') : (isRegister ? 'Create account' : 'Sign in')}
            </button>
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError('') }} className="text-sm text-muted-foreground underline">
              {isRegister ? 'Have an account? Sign in' : 'Create an account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

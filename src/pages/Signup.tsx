import React, { useState } from 'react'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

type Props = {
  onSignup: (email: string) => void
  goLogin: () => void
}

export default function Signup({ onSignup, goLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Enter email and password')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      onSignup(email)
    } catch (err: any) {
      setError(err?.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-content">
      <h3>Create Admin Account</h3>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          Confirm Password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {error && <div style={{ color: '#b91c1c', marginBottom: '0.5rem' }}>{error}</div>}
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
        </div>
      </form>
      <div style={{ marginTop: '0.75rem' }}>
        <button onClick={goLogin}>Already have an account? Login</button>
      </div>
    </div>
  )
}

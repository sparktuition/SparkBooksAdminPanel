import React, { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import './Login.css'

type Props = {
  onLogin: (email: string) => void
  goSignup: () => void
}

export default function Login({ onLogin, goSignup }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Enter email and password')
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      onLogin(email)
      return
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-content">
      <h3>Admin Login</h3>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div style={{ color: '#b91c1c', marginBottom: '0.5rem' }}>{error}</div>}
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </div>
      </form>
      <div style={{ marginTop: '0.75rem' }}>
        <button onClick={goSignup}>Create an admin account</button>
      </div>
    </div>
  )
}

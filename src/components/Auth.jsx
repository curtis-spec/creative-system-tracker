import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    const authAction =
      mode === 'signup'
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password })

    const { error } = await authAction

    if (error) {
      setMessage(error.message)
    } else if (mode === 'signup') {
      setMessage('Account created. Check your email if confirmation is enabled.')
    }

    setSubmitting(false)
  }

  async function handleMagicLink() {
    setSubmitting(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    setMessage(error ? error.message : 'Magic link sent. Check your email.')
    setSubmitting(false)
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <p className="eyebrow">Creative System Tracker</p>
        <h1>Sign in to track intern progress</h1>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength="6"
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <div className="auth-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Create an account' : 'Use existing account'}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={handleMagicLink}
            disabled={!email || submitting}
          >
            Send magic link
          </button>
        </div>
        {message && <p className="form-message">{message}</p>}
      </section>
    </main>
  )
}

export default Auth

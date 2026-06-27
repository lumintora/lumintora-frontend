import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button } from '../components/UI'
import Logo from '../components/Logo'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import '../components/UI.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box animate-fade">
        <div className="auth-logo"><Logo size={30} /></div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
        <div className="auth-tagline">Sign in to continue your learning path.</div>

        <form className="auth-form" onSubmit={submit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={Mail}
            placeholder="you@domain.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={Lock}
            placeholder="••••••••"
            required
          />
          {error && <div style={{ fontSize: 13, color: 'var(--accent-danger)', background: 'rgba(248,113,113,0.08)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
          <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Sign in <ArrowRight size={15} />
          </Button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}

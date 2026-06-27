import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button } from '../components/UI'
import Logo from '../components/Logo'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import '../components/UI.css'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(email, name, password)
      navigate('/start')
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
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
        <div className="auth-tagline">Start your adaptive learning journey — free.</div>

        <form className="auth-form" onSubmit={submit}>
          <Input
            label="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            icon={User}
            placeholder="Your name"
            required
          />
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
            placeholder="Min. 6 characters"
            required
          />
          {error && <div style={{ fontSize: 13, color: 'var(--accent-danger)', background: 'rgba(248,113,113,0.08)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
          <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Create account <ArrowRight size={15} />
          </Button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 16 }}>
          Free forever. No credit card required.
        </p>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

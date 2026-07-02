import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOnline } from '../hooks/useOnline'
import { api } from '../lib/api'
import Nav, { Sidebar } from '../components/Nav'
import StreakHeatmap from '../components/StreakHeatmap'
import { Button, StatCard, Spinner } from '../components/UI'
import {
  Zap, Flame, Trophy, CalendarDays, Mail, Phone, Globe, MapPin,
  Twitter, Github, Linkedin, Pencil, X, Check, Calendar, Link2, AtSign, Share2,
} from 'lucide-react'
import '../components/UI.css'

// Turn stored handles/values into real, clickable URLs.
const linkFor = {
  website: (v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`),
  twitter: (v) => `https://x.com/${v.replace(/^@/, '')}`,
  github: (v) => `https://github.com/${v.replace(/^@/, '')}`,
  linkedin: (v) => (/^https?:\/\//i.test(v) ? v : `https://www.linkedin.com/in/${v.replace(/^@/, '')}`),
}

const SOCIALS = [
  { key: 'twitter', icon: Twitter, label: 'X (Twitter)', placeholder: 'username', prefix: '@' },
  { key: 'github', icon: Github, label: 'GitHub', placeholder: 'username', prefix: '@' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'in/username or full URL' },
]

function joinedLabel(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d)) return null
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const online = useOnline()
  const [activity, setActivity] = useState(null)
  const [loadingAct, setLoadingAct] = useState(true)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const handle = user.username ? `@${user.username}` : user.name
    const text = `${handle} on Lumintora\nhttps://www.lumintora.in`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useEffect(() => {
    api.activity().then(setActivity).catch(() => setActivity(null)).finally(() => setLoadingAct(false))
  }, [])

  if (!user) return null

  const initial = (user.name?.[0] || 'U').toUpperCase()
  const joined = joinedLabel(user.created_at)

  const contacts = [
    user.email && { icon: Mail, label: user.email, href: `mailto:${user.email}` },
    user.phone && { icon: Phone, label: user.phone, href: `tel:${user.phone}` },
    user.location && { icon: MapPin, label: user.location },
    user.website && { icon: Globe, label: user.website.replace(/^https?:\/\//, ''), href: linkFor.website(user.website) },
  ].filter(Boolean)

  const socialLinks = SOCIALS
    .filter((s) => user[s.key])
    .map((s) => ({ ...s, href: linkFor[s.key](user[s.key]), value: user[s.key] }))

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          {/* ── Header ───────────────────────────────────────────── */}
          <section className="profile-hero">
            <div className="profile-hero-banner" />
            <div className="profile-hero-body">
              <div
                className="avatar profile-avatar"
                style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : undefined}
                title={online ? 'Online' : 'Offline'}
              >
                {!user.avatar_url && initial}
                <span className={`presence-dot presence-dot-lg ${online ? '' : 'off'}`} aria-hidden="true" />
              </div>

              <div className="profile-hero-main">
                <div className="profile-hero-top">
                  <div>
                    <h1 className="profile-name">{user.name}</h1>
                    {user.username && (
                      <div style={{ fontSize: 15, color: 'var(--accent-ink)', fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AtSign size={14} />{user.username}
                      </div>
                    )}
                    {joined && (
                      <div className="profile-joined">
                        <Calendar size={13} /> Joined {joined}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Button variant="ghost" size="sm" icon={copied ? Check : Share2} onClick={handleShare}
                      style={{ color: copied ? 'var(--accent-ink)' : undefined }}>
                      {copied ? 'Copied!' : 'Share'}
                    </Button>
                    <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditing(true)}>
                      Edit details
                    </Button>
                  </div>
                </div>

                {user.bio && <p className="profile-bio">{user.bio}</p>}

                <div className="profile-contacts">
                  {contacts.map((c, i) => {
                    const Inner = (
                      <>
                        <c.icon size={14} /> {c.label}
                      </>
                    )
                    return c.href ? (
                      <a key={i} className="profile-contact" href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                        {Inner}
                      </a>
                    ) : (
                      <span key={i} className="profile-contact">{Inner}</span>
                    )
                  })}
                </div>

                {socialLinks.length > 0 && (
                  <div className="profile-socials">
                    {socialLinks.map((s) => (
                      <a key={s.key} className="profile-social" href={s.href} target="_blank" rel="noreferrer" title={s.label}>
                        <s.icon size={16} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Stats ────────────────────────────────────────────── */}
          <div className="stats-grid" style={{ marginTop: 24 }}>
            <StatCard label="Total XP" value={user.xp || 0} icon={Zap} color="var(--accent)" />
            <StatCard label="Current Streak" value={`${activity?.current_streak ?? user.streak ?? 0} days`} icon={Flame} color="#f87171" />
            <StatCard label="Longest Streak" value={`${activity?.longest_streak ?? 0} days`} icon={Trophy} color="#fbbf24" />
            <StatCard label="Active Days" value={activity?.total_active_days ?? 0} icon={CalendarDays} color="var(--accent-2)" />
          </div>

          {/* ── Heatmap ──────────────────────────────────────────── */}
          <section className="card profile-heatmap-card">
            <div className="profile-section-head">
              <div>
                <h2 className="profile-section-title">Learning activity</h2>
                <p className="profile-section-sub">
                  {activity?.total_contributions ?? 0} contributions in the last year
                </p>
              </div>
            </div>
            {loadingAct ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spinner size={28} />
              </div>
            ) : (
              <StreakHeatmap days={activity?.days || []} />
            )}
          </section>
        </main>
      </div>

      {editing && (
        <EditProfileModal
          user={user}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            await refreshUser()
            setEditing(false)
          }}
        />
      )}
    </div>
  )
}

/* ── Edit modal ──────────────────────────────────────────────── */

const FIELDS = [
  { key: 'name', label: 'Display name', icon: null, placeholder: 'Your name', required: true },
  { key: 'username', label: 'Username', icon: AtSign, placeholder: 'your_username', hint: 'Letters, numbers, - and _ only' },
  { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@example.com', required: true },
  { key: 'phone', label: 'Phone number', icon: Phone, type: 'tel', placeholder: '+1 555 000 1234' },
  { key: 'location', label: 'Location', icon: MapPin, placeholder: 'City, Country' },
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'yoursite.com' },
  { key: 'avatar_url', label: 'Avatar image URL', icon: Link2, placeholder: 'https://…/photo.jpg' },
]

function EditProfileModal({ user, onClose, onSaved }) {
  const dialogRef = useRef(null)
  const [form, setForm] = useState(() => {
    const f = { name: '', username: '', email: '', phone: '', location: '', website: '', avatar_url: '', bio: '', twitter: '', github: '', linkedin: '' }
    for (const k of Object.keys(f)) f[k] = user[k] || ''
    return f
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Display name is required.')
    if (!form.email.trim() || !form.email.includes('@')) return setError('A valid email is required.')
    setSaving(true)
    try {
      await api.updateMe(form)
      await onSaved()
    } catch (err) {
      setError(err.message || 'Could not save changes.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal profile-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Edit profile">
        <div className="modal-head">
          <h2 className="modal-title">Edit profile</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <form className="modal-body profile-form" onSubmit={submit}>
          {FIELDS.map((fld) => (
            <div className="field" key={fld.key}>
              <label className="field-label">{fld.label}{fld.required && <span className="field-req"> *</span>}</label>
              <div className="field-input-wrap">
                {fld.icon && <fld.icon size={16} className="field-icon" />}
                <input
                  className={`field-input ${fld.icon ? 'field-input-icon' : ''}`}
                  type={fld.type || 'text'}
                  value={form[fld.key]}
                  onChange={e => set(fld.key)(e)}
                  placeholder={fld.placeholder}
                />
              </div>
              {fld.hint && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{fld.hint}</div>}
            </div>
          ))}

          <div className="field profile-form-wide">
            <label className="field-label">Bio</label>
            <textarea
              className="field-input profile-textarea"
              rows={3}
              maxLength={280}
              value={form.bio}
              onChange={set('bio')}
              placeholder="A short line about what you're learning…"
            />
            <span className="field-hint">{form.bio.length}/280</span>
          </div>

          <div className="profile-form-wide profile-form-socials">
            <div className="field-label" style={{ marginBottom: 4 }}>Social profiles</div>
            <div className="profile-social-grid">
              {SOCIALS.map((s) => (
                <div className="field" key={s.key}>
                  <div className="field-input-wrap">
                    <s.icon size={16} className="field-icon" />
                    <input
                      className="field-input field-input-icon"
                      value={form[s.key]}
                      onChange={set(s.key)}
                      placeholder={s.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="profile-form-wide field-error" role="alert">{error}</div>}

          <div className="profile-form-wide modal-actions">
            <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" icon={Check} loading={saving}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

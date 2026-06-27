import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import Nav from '../components/Nav'
import { Sidebar } from '../components/Nav'
import { Progress, Badge, Spinner, XPBadge } from '../components/UI'
import PathJourney from '../components/PathJourney'
import {
  BookOpen, Code2, Brain, CheckSquare, Lock, CheckCircle,
  Clock, ChevronRight, ArrowLeft, Trash2, AlignLeft, List,
} from 'lucide-react'
import '../components/UI.css'

const typeIcon  = { lesson: BookOpen, code: Code2, quiz: Brain, project: CheckSquare }
const typeColor = { lesson: '#7140ff', code: '#f59e0b', quiz: '#a78bfa', project: '#0f9d6b' }
const diffColor = { beginner: 'success', intermediate: 'warning', advanced: 'danger' }

export default function PathDetail() {
  const { pathId } = useParams()
  const navigate = useNavigate()
  const [path, setPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('timeline')

  useEffect(() => {
    api.getPath(pathId).then(setPath).catch(() => navigate('/dashboard')).finally(() => setLoading(false))
  }, [pathId])

  const handleDelete = async () => {
    if (!confirm('Delete this learning path?')) return
    await api.deletePath(pathId)
    navigate('/dashboard')
  }

  if (loading) return (
    <div>
      <Nav />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size={36} />
      </div>
    </div>
  )
  if (!path) return null

  const modules = path.modules || []
  const completedCount = modules.filter(m => m.status === 'completed').length

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">

          {/* ── Back ── */}
          <Link
            to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', marginBottom: 28, fontWeight: 500 }}
          >
            <ArrowLeft size={14} /> Back to dashboard
          </Link>

          {/* ── Path header card ── */}
          <div style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            boxShadow: 'var(--shadow)', marginBottom: 32,
          }}>
            {/* accent stripe */}
            <div style={{ height: 4, background: 'var(--grad)' }} />

            <div style={{ padding: '28px 32px 32px' }}>
              {/* badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge color={diffColor[path.level] || 'default'}>{path.level}</Badge>
                <Badge color="accent">{path.topic}</Badge>
                {path.tags?.map(t => <Badge key={t} color="default">{t}</Badge>)}
                <button
                  onClick={handleDelete}
                  className="btn btn-ghost btn-sm"
                  style={{ marginLeft: 'auto', color: 'var(--rose)', padding: '4px 8px' }}
                  title="Delete path"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* title + description */}
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.2 }}>
                {path.title}
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 14.5, lineHeight: 1.65, marginBottom: 24, maxWidth: 680 }}>
                {path.description}
              </p>

              {/* progress row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 7, fontWeight: 500 }}>
                    <span>{completedCount} of {path.total_modules} modules complete</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-ink)' }}>{path.progress ?? 0}%</span>
                  </div>
                  <Progress value={path.progress ?? 0} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-2)', flexShrink: 0 }}>
                  <Clock size={14} /> {path.estimated_hours}h estimated
                </div>
              </div>
            </div>
          </div>

          {/* ── Section header + view toggle ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' }}>
                Curriculum
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>
                {modules.length} modules · click any unlocked module to begin
              </p>
            </div>
            <div className="view-toggle">
              <button className={`view-toggle-btn ${view === 'timeline' ? 'active' : ''}`} onClick={() => setView('timeline')}>
                <AlignLeft size={14} /> Timeline
              </button>
              <button className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
                <List size={14} /> List
              </button>
            </div>
          </div>

          {/* ── Timeline view ── */}
          {view === 'timeline' && (
            <PathJourney modules={modules} onSelect={(id) => navigate(`/modules/${id}`)} />
          )}

          {/* ── List view ── */}
          {view === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modules.map((mod) => {
                const Icon = typeIcon[mod.type] || BookOpen
                const color = typeColor[mod.type] || '#7140ff'
                const isLocked = mod.status === 'locked'
                const isDone   = mod.status === 'completed'

                return (
                  <div
                    key={mod.id}
                    className={`module-card ${isLocked ? 'locked' : ''} ${isDone ? 'completed' : ''} ${mod.status === 'in_progress' ? 'in_progress' : ''}`}
                    onClick={() => !isLocked && navigate(`/modules/${mod.id}`)}
                  >
                    <div
                      className="module-icon"
                      style={{ background: isLocked ? 'var(--bg-3)' : color + '18', color: isLocked ? 'var(--text-3)' : color }}
                    >
                      {isDone
                        ? <CheckCircle size={20} color="var(--accent-3)" />
                        : isLocked
                          ? <Lock size={17} color="var(--text-3)" />
                          : <Icon size={20} />
                      }
                    </div>

                    <div className="module-info">
                      <div className="module-title">{mod.title}</div>
                      <div className="module-meta">
                        <Badge color={mod.type === 'lesson' ? 'accent' : mod.type === 'quiz' ? 'purple' : mod.type === 'code' ? 'warning' : 'success'}>
                          {mod.type}
                        </Badge>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {mod.duration_minutes}m
                        </span>
                        <XPBadge xp={mod.xp_reward} />
                      </div>
                    </div>

                    {!isLocked && <ChevronRight size={16} color="var(--text-3)" />}
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

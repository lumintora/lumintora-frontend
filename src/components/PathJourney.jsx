import { BookOpen, Code2, Brain, CheckSquare, Lock, CheckCircle, Clock, Zap, Play, Wand2, ChevronRight } from 'lucide-react'

const typeIcon  = { lesson: BookOpen, code: Code2, quiz: Brain, project: CheckSquare }
const typeLabel = { lesson: 'Lesson', code: 'Code', quiz: 'Quiz', project: 'Project' }
const typeColor = { lesson: '#7140ff', code: '#f59e0b', quiz: '#a78bfa', project: '#0f9d6b' }

export default function PathJourney({ modules = [], onSelect }) {
  const firstActiveIdx = modules.findIndex(
    m => m.status === 'available' || m.status === 'in_progress'
  )

  return (
    <div className="curr-list">
      {modules.map((mod, i) => {
        const Icon = typeIcon[mod.type] || BookOpen
        const color = typeColor[mod.type] || '#7140ff'
        const isLocked  = mod.status === 'locked'
        const isDone    = mod.status === 'completed'
        const isCurrent = i === firstActiveIdx
        const isLast    = i === modules.length - 1

        return (
          <div key={mod.id} className="curr-row">
            {/* ── Timeline rail ───────────────────── */}
            <div className="curr-rail">
              <div className={`curr-dot ${isDone ? 'curr-dot-done' : isCurrent ? 'curr-dot-active' : 'curr-dot-idle'}`}>
                {isDone
                  ? <CheckCircle size={15} strokeWidth={2.5} />
                  : <span>{i + 1}</span>
                }
                {isCurrent && <span className="curr-dot-ring" />}
              </div>
              {!isLast && <div className="curr-connector" />}
            </div>

            {/* ── Module card ──────────────────────── */}
            <button
              className={`curr-card ${isDone ? 'curr-card-done' : ''} ${isCurrent ? 'curr-card-active' : ''} ${isLocked ? 'curr-card-locked' : ''}`}
              disabled={isLocked}
              onClick={() => !isLocked && onSelect?.(mod.id)}
            >
              {/* icon */}
              <div className="curr-icon" style={{ background: isLocked ? 'var(--bg-3)' : color + '18', color: isLocked ? 'var(--text-3)' : color }}>
                {isLocked ? <Lock size={16} /> : <Icon size={18} />}
              </div>

              {/* body */}
              <div className="curr-body">
                <div className="curr-type" style={{ color: isLocked ? 'var(--text-3)' : color }}>
                  {typeLabel[mod.type] || 'Lesson'}
                  {mod.source === 'adaptive' && (
                    <span className="curr-adaptive-tag"><Wand2 size={10} /> Adaptive</span>
                  )}
                </div>
                <div className="curr-title">{mod.title}</div>
                <div className="curr-meta">
                  <span><Clock size={11} /> {mod.duration_minutes}m</span>
                  <span><Zap size={11} /> {mod.xp_reward} XP</span>
                </div>
              </div>

              {/* status */}
              <div className="curr-status-col">
                {isDone && (
                  <span className="curr-chip curr-chip-done">Completed</span>
                )}
                {isCurrent && (
                  <span className="curr-chip curr-chip-current">
                    <Play size={11} /> Continue
                  </span>
                )}
                {!isLocked && !isDone && !isCurrent && (
                  <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />
                )}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

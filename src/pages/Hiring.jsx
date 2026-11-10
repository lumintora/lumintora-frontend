import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import Nav, { Sidebar } from '../components/Nav'
import DemoHeader from '../components/DemoHeader'
import {
  Phone, Code2, Network, MessageSquare, Users, CheckCircle2,
  ArrowRight, Bot, Gauge, Send, RotateCcw, Award,
} from 'lucide-react'
import '../components/UI.css'

/* ── Big-tech Hiring Loop — a working mock interview ──
   Type answers, the backend scores them against a rubric, you progress through
   the loop, and a hiring committee returns a verdict. */

const STAGE_ICON = { phone: Phone, coding: Code2, design: Network, behavioral: MessageSquare }

const FALLBACK_STAGES = [
  { id: 'phone', label: 'Phone screen', time: '45 min', focus: 'A warm-up problem and a read on how you communicate.',
    prompt: 'Given a stream of numbers, return the running median at any point. Walk me through your approach before you write any code.',
    signals: ['Problem solving', 'Communication', 'Coding'] },
  { id: 'coding', label: 'Coding', time: '60 min', focus: 'A medium/hard problem. Correctness, edge cases, and how you test.',
    prompt: 'Serialize and deserialize a binary tree. Describe your encoding, then the time and space complexity, and how you’d test it.',
    signals: ['Problem solving', 'Coding', 'Testing rigor'] },
  { id: 'design', label: 'System design', time: '60 min', focus: 'Design a real system end to end. Trade-offs over trivia.',
    prompt: 'Design a URL shortener for 50k RPS. Start with the API, then take me through storage, caching, and failure modes.',
    signals: ['Architecture', 'Trade-off reasoning', 'Scale instincts'] },
  { id: 'behavioral', label: 'Behavioral', time: '45 min', focus: 'How you work with others and handle ambiguity.',
    prompt: 'Tell me about a time you disagreed with a teammate on a technical decision. What did you do, and how did it end?',
    signals: ['Collaboration', 'Ownership', 'Ambiguity'] },
]

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const barColor = (v) => (v >= 80 ? 'var(--green)' : v >= 68 ? 'var(--amber)' : 'var(--rose)')

// Offline fallbacks so the loop still works if the API is unreachable.
function localScore(stage, answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length
  const cap = words < 8 ? 38 : 94
  const signals = stage.signals.map((label, i) => ({ label, score: clamp(40 + words * 2 + (i - 1) * 4 + (words % 5), 0, cap) }))
  const overall = Math.round(signals.reduce((a, s) => a + s.score, 0) / signals.length)
  const feedback = words < 8 ? 'Too thin to score well — lay out your approach step by step and name the key trade-offs.'
    : overall >= 82 ? 'Strong answer — clear structure and the right core ideas.'
    : overall >= 68 ? 'Solid, but tighten it: state complexity, edge cases, and trade-offs explicitly.'
    : 'Mixed signal — cover the core concepts for this round and justify your decisions.'
  return { signals, overall, feedback }
}
function localDecide(scores) {
  const overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  if (!scores.length) return { decision: 'Incomplete', level: '—', overall, summary: 'Complete the loop to get a decision.' }
  if (overall >= 85) return { decision: 'Strong Hire', level: 'Senior · L5', overall, summary: 'Consistent top-of-bar signal across the loop. The committee would move to an offer.' }
  if (overall >= 75) return { decision: 'Hire', level: 'Mid–Senior · L4', overall, summary: 'Clears the bar with solid signal in every round.' }
  if (overall >= 63) return { decision: 'Leaning Hire', level: 'Mid · L4', overall, summary: 'On the bar but uneven — the committee would debate this.' }
  return { decision: 'No Hire', level: 'Below bar', overall, summary: 'Signal didn’t clear the bar this loop. Strengthen the weak rounds and try again.' }
}

const HEAD = {
  eyebrow: 'Big-tech Hiring Loop',
  title: 'Rehearse the whole loop, not just the coding round.',
  lede: 'Answer each round like the real thing. Your responses are scored on the signals an interviewer actually writes up — and a hiring committee gives the final verdict.',
}

function Bar({ label, v, animate }) {
  return (
    <div className="hl-signal">
      <div className="hl-signal-top"><span>{label}</span><strong style={{ color: barColor(v) }}>{v}</strong></div>
      <div className="hl-bar"><i style={{ width: animate ? `${v}%` : 0, background: barColor(v) }} /></div>
    </div>
  )
}

export default function Hiring() {
  const { user } = useAuth()
  const [stages, setStages] = useState(FALLBACK_STAGES)
  const [active, setActive] = useState(0)             // 0..stages.length (last = committee)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [decision, setDecision] = useState(null)
  const [deciding, setDeciding] = useState(false)

  useEffect(() => {
    let alive = true
    api.hiringLoop()
      .then(d => { if (alive && d?.stages?.length) setStages(d.stages) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const atCommittee = active >= stages.length
  const stage = atCommittee ? null : stages[active]
  const completed = stages.filter(s => results[s.id]).length
  const scoredAll = stages.length > 0 && stages.every(s => results[s.id])
  const canGoTo = (i) => i <= completed // reach the next unanswered round at most

  // Ask the committee once every round is scored.
  useEffect(() => {
    if (atCommittee && scoredAll && !decision && !deciding) {
      setDeciding(true)
      const scores = stages.map(s => results[s.id].overall)
      api.hiringDecide({ scores })
        .then(d => setDecision(d))
        .catch(() => setDecision(localDecide(scores)))
        .finally(() => setDeciding(false))
    }
  }, [atCommittee, scoredAll, decision, deciding, stages, results])

  const submit = async () => {
    const text = (answers[stage.id] || '').trim()
    if (!text || submitting) return
    setSubmitting(true)
    try {
      const res = await api.hiringScore({ stage_id: stage.id, answer: text })
      setResults(r => ({ ...r, [stage.id]: res }))
    } catch {
      setResults(r => ({ ...r, [stage.id]: localScore(stage, text) }))
    } finally {
      setSubmitting(false)
    }
  }

  const restart = () => { setAnswers({}); setResults({}); setDecision(null); setActive(0) }

  const result = stage ? results[stage.id] : null
  const StageIcon = stage ? (STAGE_ICON[stage.id] || MessageSquare) : Users

  const body = (
    <>
      {/* Stepper */}
      <div className="hl-steps">
        {stages.map((s, i) => {
          const Icon = STAGE_ICON[s.id] || MessageSquare
          const done = !!results[s.id]
          return (
            <button key={s.id} className={`hl-step ${i === active ? 'active' : ''} ${done ? 'done' : ''}`}
              disabled={!canGoTo(i)} onClick={() => canGoTo(i) && setActive(i)}>
              <span className="hl-step-ico">{done ? <CheckCircle2 size={16} /> : <Icon size={16} />}</span>
              <span className="hl-step-text"><strong>{s.label}</strong><span>{s.time}</span></span>
              <ArrowRight size={14} className="hl-step-arrow" />
            </button>
          )
        })}
        <button className={`hl-step ${atCommittee ? 'active' : ''}`} disabled={!scoredAll} onClick={() => scoredAll && setActive(stages.length)}>
          <span className="hl-step-ico"><Users size={16} /></span>
          <span className="hl-step-text"><strong>Committee</strong><span>Verdict</span></span>
        </button>
      </div>

      {atCommittee ? (
        <div className="hl-committee">
          <div className="sd-panel-h" style={{ textAlign: 'center' }}><Award size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Hiring committee</div>
          {deciding || !decision ? (
            <div className="hl-committee-wait"><Bot size={18} /> The committee is reading your packet…</div>
          ) : (
            <>
              <div className={`hl-verdict ${decision.decision.replace(/\s+/g, '-').toLowerCase()}`}>{decision.decision}</div>
              <div className="hl-verdict-sub">{decision.level} · overall signal {decision.overall}</div>
              <p className="hl-verdict-summary">{decision.summary}</p>
              <div className="hl-packet">
                {stages.map(s => (
                  <div key={s.id} className="hl-packet-row">
                    <span>{s.label}</span>
                    <strong style={{ color: barColor(results[s.id].overall) }}>{results[s.id].overall}</strong>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary btn-md" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={restart}>
                <RotateCcw size={15} /> Run the loop again
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="hl-stage">
          <div className="hl-stage-main">
            <div className="hl-stage-head">
              <span className="hl-stage-ico"><StageIcon size={18} /></span>
              <div>
                <div className="hl-stage-name">{stage.label}</div>
                <div className="hl-stage-focus">{stage.focus}</div>
              </div>
              <span className="hl-stage-count">Round {active + 1} / {stages.length}</span>
            </div>

            <div className="hl-interviewer">
              <span className="hl-int-ava"><Bot size={14} /></span>
              <div>
                <div className="hl-int-who">AI interviewer</div>
                <div className="hl-int-say">“{stage.prompt}”</div>
              </div>
            </div>

            <textarea
              className="field-input hl-answer"
              rows={6}
              placeholder="Type your answer — talk through your approach, trade-offs, complexity and edge cases…"
              value={answers[stage.id] || ''}
              onChange={e => setAnswers(a => ({ ...a, [stage.id]: e.target.value }))}
            />

            {!result ? (
              <button className="btn btn-primary btn-md" style={{ justifyContent: 'center' }}
                onClick={submit} disabled={submitting || !(answers[stage.id] || '').trim()}>
                <Send size={15} /> {submitting ? 'Scoring…' : 'Submit answer'}
              </button>
            ) : (
              <div className="hl-after">
                <div className={`hl-feedback ${result.overall >= 80 ? 'good' : result.overall >= 68 ? 'mid' : 'low'}`}>
                  <Bot size={14} /> {result.feedback}
                </div>
                <button className="btn btn-primary btn-md" style={{ justifyContent: 'center' }} onClick={() => setActive(active + 1)}>
                  {active === stages.length - 1 ? 'See committee decision' : `Next round: ${stages[active + 1].label}`} <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          <aside className="hl-scorecard">
            <div className="sd-panel-h"><Gauge size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />Scorecard</div>
            {result ? (
              <>
                {result.signals.map(s => <Bar key={s.label} label={s.label} v={s.score} animate />)}
                <div className="hl-overall">
                  <span>Round signal</span>
                  <strong style={{ color: barColor(result.overall) }}>{result.overall}</strong>
                </div>
              </>
            ) : (
              <>
                {stage.signals.map(l => <Bar key={l} label={l} v={0} animate={false} />)}
                <div className="hl-note"><Bot size={13} /> Submit your answer to score this round.</div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  )

  if (user) {
    return (
      <div>
        <Nav />
        <div className="layout">
          <Sidebar />
          <main className="main animate-fade">
            <div className="dash-header">
              <div className="dash-greeting">{HEAD.eyebrow}</div>
              <h1 className="dash-title">{HEAD.title}</h1>
              <p className="demo-inpage-lede">{HEAD.lede}</p>
            </div>
            {body}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="demo-page">
      <DemoHeader tag={HEAD.eyebrow} />
      <div className="demo-hero">
        <div className="section-label" style={{ textAlign: 'center' }}>{HEAD.eyebrow}</div>
        <h1 className="demo-h1">{HEAD.title}</h1>
        <p className="demo-lede">{HEAD.lede}</p>
      </div>
      <div className="demo-wrap">{body}</div>
    </div>
  )
}

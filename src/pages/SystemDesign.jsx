import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import Nav, { Sidebar } from '../components/Nav'
import DemoHeader from '../components/DemoHeader'
import {
  Network, User, Cloud, Share2, Server, Zap, Database, Layers, HardDrive,
  Bot, Play, CheckCircle2, AlertTriangle, Gauge, Plus, X, Trash2, Info, Link2,
} from 'lucide-react'
import '../components/UI.css'

/* ── The System Design Lab — a real, editable architecture canvas ──
   Add nodes, drag them, draw/delete your own connections, then get the
   design graded against real system-design principles. No backend. */

const PALETTE = [
  { type: 'client', label: 'Client',        icon: User,     c: 'var(--accent)' },
  { type: 'cdn',    label: 'CDN',           icon: Cloud,    c: '#0ea5e9' },
  { type: 'lb',     label: 'Load Balancer', icon: Share2,   c: '#14b8a6' },
  { type: 'api',    label: 'API Server',    icon: Server,   c: 'var(--accent-2)' },
  { type: 'cache',  label: 'Redis Cache',   icon: Zap,      c: '#f59e0b' },
  { type: 'db',     label: 'Postgres',      icon: Database, c: 'var(--green)' },
  { type: 'queue',  label: 'Queue',         icon: Layers,   c: '#8b5cf6' },
  { type: 'store',  label: 'Object Store',  icon: HardDrive,c: '#ef4444' },
]
const meta = (type) => PALETTE.find(p => p.type === type)

const INITIAL_NODES = [
  { id: 'n1', type: 'client', x: 12, y: 46 },
  { id: 'n2', type: 'cdn',    x: 34, y: 16 },
  { id: 'n3', type: 'lb',     x: 34, y: 74 },
  { id: 'n4', type: 'api',    x: 58, y: 46 },
  { id: 'n5', type: 'cache',  x: 82, y: 18 },
  { id: 'n6', type: 'db',     x: 82, y: 50 },
  { id: 'n7', type: 'queue',  x: 82, y: 80 },
]
const INITIAL_EDGES = [
  ['n1', 'n2'], ['n1', 'n3'], ['n2', 'n4'], ['n3', 'n4'], ['n4', 'n5'], ['n4', 'n6'], ['n4', 'n7'],
]

// Used only until the backend challenge loads (keeps the lab usable offline).
const FALLBACK_BRIEF = {
  title: 'Design a URL shortener',
  target: '50,000 requests / second',
  reqs: ['Redirects in under 50ms p99', 'Reads vastly outnumber writes', '≥ 99.9% availability', 'Survive a single-node failure'],
}

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`)

/* Grade the architecture against real system-design principles. */
function analyze(nodes, edges) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n.type]))
  const count = (t) => nodes.filter(n => n.type === t).length
  const has = (t) => count(t) > 0
  const linked = (t1, t2) => edges.some(([a, b]) => {
    const ta = byId[a], tb = byId[b]
    return (ta === t1 && tb === t2) || (ta === t2 && tb === t1)
  })
  const degree = (id) => edges.filter(([a, b]) => a === id || b === id).length

  const apiN = count('api'), dbN = count('db')
  const hasLB = has('lb'), hasCache = has('cache'), hasQueue = has('queue'),
        hasClient = has('client'), hasStore = has('store')
  const cacheWired = hasCache && linked('cache', 'api')
  const dbWired = dbN > 0 && linked('db', 'api')
  const clientReaches = has('client') && (linked('client', 'api') || linked('client', 'lb') || linked('client', 'cdn'))

  // Throughput — load balancer lets the API tier scale; cache absorbs reads; the DB caps writes.
  let rps = apiN > 0 ? (hasLB ? 20000 : 12000) * (hasLB ? apiN : 1) : 0
  if (cacheWired) rps = Math.round(rps * 1.8)
  if (dbWired && !cacheWired) rps = Math.min(rps, dbN >= 2 ? 60000 : 20000)

  // p99 latency — cached reads are fast; uncached DB reads are slow.
  const p99 = cacheWired ? 38 : dbWired ? 120 : apiN ? 90 : 0

  // Availability — remove single points of failure with LB + multiple API + DB replica.
  let avail = 99.0
  if (hasLB && apiN >= 2) avail += 0.8
  if (dbN >= 2) avail += 0.15
  avail = Math.min(avail, 99.99)

  const findings = []
  const add = (level, text) => findings.push({ level, text })
  if (apiN === 0) add('bad', 'No compute tier — add an API server to handle requests.')
  if (!hasClient) add('warn', 'No client / entry point on the diagram.')
  if (hasClient && apiN > 0 && !clientReaches) add('warn', 'Client isn’t wired to your API — connect it directly or via a load balancer / CDN.')
  if (apiN >= 1 && !hasLB) add('warn', 'Single API tier — add a load balancer to scale out and remove the single point of failure.')
  if (dbN === 0 && !hasStore) add('bad', 'No datastore — writes have nowhere to persist. Add a database.')
  if (dbN > 0 && !dbWired) add('warn', 'Your API isn’t connected to the database.')
  if (!hasCache) add('warn', 'No cache — reads hit the database directly. Put Redis in front to cut p99 latency.')
  if (hasCache && !cacheWired) add('warn', 'Cache isn’t wired to the API — connect it to absorb reads.')
  if (dbN === 1) add('warn', 'Single database is a SPOF — add a read replica for failover and read scaling.')
  if (!hasQueue) add('info', 'No async path — a queue would decouple write spikes (optional for this brief).')
  nodes.forEach(n => { if (degree(n.id) === 0) add('warn', `${meta(n.type)?.label} isn’t connected to anything.`) })

  const pass = rps >= 50000 && avail >= 99.9 && dbWired && cacheWired && clientReaches
  return { rps, p99, avail, pass, findings }
}

const HEAD = {
  eyebrow: 'System Design Lab',
  title: "Practice system design like you grind coding problems.",
  lede: 'Add real nodes, drag them, draw your own connections, then get the design graded against real traffic, latency and failure modes — the way a senior interviewer would.',
}

export default function SystemDesign() {
  const { user } = useAuth()
  const [nodes, setNodes] = useState(INITIAL_NODES)
  const [edges, setEdges] = useState(INITIAL_EDGES)
  const [selected, setSelected] = useState('n4')
  const [brief, setBrief] = useState(FALLBACK_BRIEF)
  const [review, setReview] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [evalNote, setEvalNote] = useState('')
  const canvasRef = useRef(null)
  const [dragId, setDragId] = useState(null)
  const [linkFrom, setLinkFrom] = useState(null)
  const [linkPt, setLinkPt] = useState(null)

  const at = (id) => nodes.find(n => n.id === id)
  const selNode = at(selected)
  const selMeta = selNode && meta(selNode.type)

  // Any edit invalidates the current grade.
  const dirty = () => { setReview(null); setEvalNote('') }

  // Pull the challenge (brief + requirements) from the backend.
  useEffect(() => {
    let alive = true
    api.systemDesignChallenge()
      .then(c => { if (alive && c?.title) setBrief({ title: c.title, target: c.target, reqs: c.reqs || [] }) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // Grade the design on the backend (falls back to a local estimate if offline).
  const runEvaluation = async () => {
    setEvaluating(true); setEvalNote('')
    const payload = { nodes: nodes.map(n => ({ id: n.id, type: n.type })), edges }
    try {
      const res = await api.systemDesignEvaluate(payload)
      setReview(res)
    } catch {
      setReview(analyze(nodes, edges))
      setEvalNote('Showing a local estimate — could not reach the grader.')
    } finally {
      setEvaluating(false)
    }
  }

  const pctFromEvent = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !rect.width) return null
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    }
  }

  const addNode = (type) => {
    const id = `n${Date.now()}`
    setNodes(ns => [...ns, { id, type, x: 46 + (ns.length % 3) * 7, y: 44 + (ns.length % 3) * 9 }])
    setSelected(id); dirty()
  }
  const deleteNode = (id) => {
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(([a, b]) => a !== id && b !== id))
    setSelected(null); dirty()
  }
  const removeEdge = (idx) => { setEdges(es => es.filter((_, i) => i !== idx)); dirty() }
  const clearAll = () => { setNodes([]); setEdges([]); setSelected(null); dirty() }
  const reset = () => { setNodes(INITIAL_NODES); setEdges(INITIAL_EDGES); setSelected('n4'); dirty() }

  // Drag a node (move)
  const startDrag = (e, id) => { e.preventDefault(); e.stopPropagation(); setSelected(id); setDragId(id) }
  useEffect(() => {
    if (!dragId) return
    const onMove = (e) => {
      const p = pctFromEvent(e); if (!p) return
      setNodes(ns => ns.map(n => (n.id === dragId
        ? { ...n, x: Math.max(5, Math.min(95, p.x)), y: Math.max(7, Math.min(93, p.y)) } : n)))
    }
    const onUp = () => setDragId(null)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp) }
  }, [dragId]) // eslint-disable-line

  // Draw a connection (drag from a node's handle onto another node)
  const startLink = (e, id) => { e.preventDefault(); e.stopPropagation(); setSelected(id); setLinkFrom(id); setLinkPt(pctFromEvent(e)) }
  useEffect(() => {
    if (!linkFrom) return
    const onMove = (e) => { const p = pctFromEvent(e); if (p) setLinkPt(p) }
    const onUp = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const toId = el?.closest('[data-node-id]')?.getAttribute('data-node-id')
      if (toId && toId !== linkFrom) {
        setEdges(es => (es.some(([a, b]) => (a === linkFrom && b === toId) || (a === toId && b === linkFrom)) ? es : [...es, [linkFrom, toId]]))
        dirty()
      }
      setLinkFrom(null); setLinkPt(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp) }
  }, [linkFrom]) // eslint-disable-line

  // Delete / Backspace removes the selected node.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        const tag = (e.target?.tagName || '').toUpperCase()
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        deleteNode(selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected]) // eslint-disable-line

  const selConns = edges.map((e, i) => ({ e, i })).filter(({ e }) => e[0] === selected || e[1] === selected)
  const levelIcon = { ok: CheckCircle2, bad: AlertTriangle, warn: AlertTriangle, info: Info }

  const body = (
    <>
      <div className="sd-lab">
        {/* Palette */}
        <aside className="sd-palette">
          <div className="sd-panel-h">Components</div>
          {PALETTE.map(p => (
            <button key={p.type} className="sd-pal-item" onClick={() => addNode(p.type)}>
              <span className="sd-pal-ico" style={{ background: `color-mix(in srgb, ${p.c} 15%, var(--bg-1))`, color: p.c }}>
                <p.icon size={15} />
              </span>
              <span className="sd-pal-label">{p.label}</span>
              <Plus size={14} className="sd-pal-plus" />
            </button>
          ))}
          <button className="sd-ghost-btn" onClick={reset}>Reset diagram</button>
          <button className="sd-ghost-btn" onClick={clearAll}>Clear canvas</button>
        </aside>

        {/* Canvas */}
        <div className="sd-canvas-wrap">
          <div className="sd-canvas-bar">
            <span><Network size={14} /> {brief.title}</span>
            <span className="sd-canvas-target"><Gauge size={13} /> Target {brief.target}</span>
          </div>
          <div className="sd-canvas" ref={canvasRef}>
            <svg className="lp-sd-edges" viewBox="0 0 100 100" preserveAspectRatio="none">
              {edges.map(([a, b], i) => {
                const na = at(a), nb = at(b)
                if (!na || !nb) return null
                return (
                  <g key={i} className="sd-edge-grp" onClick={() => removeEdge(i)}>
                    <line className="sd-edge-hit" x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} />
                    <line className="sd-edge" x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} />
                  </g>
                )
              })}
              {linkFrom && linkPt && at(linkFrom) && (
                <line className="sd-edge-temp" x1={at(linkFrom).x} y1={at(linkFrom).y} x2={linkPt.x} y2={linkPt.y} />
              )}
            </svg>
            {nodes.map(n => {
              const m = meta(n.type)
              return (
                <button
                  key={n.id}
                  data-node-id={n.id}
                  className={`lp-sd-node sd-node-btn ${selected === n.id ? 'sel' : ''} ${dragId === n.id ? 'dragging' : ''}`}
                  style={{ left: `${n.x}%`, top: `${n.y}%`, touchAction: 'none' }}
                  onPointerDown={(e) => startDrag(e, n.id)}
                  onClick={() => setSelected(n.id)}
                >
                  <span className="lp-sd-node-ico" style={{ background: `color-mix(in srgb, ${m.c} 15%, var(--bg-1))`, color: m.c }}>
                    <m.icon size={14} />
                  </span>
                  <span className="lp-sd-node-label">{m.label}</span>
                  <span className="sd-handle" title="Drag to connect" onPointerDown={(e) => startLink(e, n.id)} />
                  {selected === n.id && (
                    <span
                      className="sd-node-del"
                      title="Delete node (or press Delete)"
                      onPointerDown={(e) => { e.stopPropagation(); e.preventDefault() }}
                      onClick={(e) => { e.stopPropagation(); deleteNode(n.id) }}
                    >
                      <X size={10} />
                    </span>
                  )}
                </button>
              )
            })}
            {nodes.length === 0 && <div className="sd-empty">Add components from the left to start designing.</div>}
          </div>
          <div className="sd-canvas-foot">
            <span className="sd-hint"><Link2 size={12} /> Drag to move · drag the dot to connect · click a line or press Delete to remove</span>
            <button className="btn btn-primary btn-sm" onClick={runEvaluation} disabled={!nodes.length || evaluating}>
              <Play size={14} /> {evaluating ? 'Evaluating…' : 'Run evaluation'}
            </button>
          </div>
        </div>

        {/* Inspector / brief / verdict */}
        <aside className="sd-inspector">
          <div className="sd-panel-h">The brief</div>
          <div className="sd-brief">
            <div className="sd-brief-title">{brief.title}</div>
            <ul>
              {brief.reqs.map(r => <li key={r}><CheckCircle2 size={13} color="var(--green)" /> {r}</li>)}
            </ul>
          </div>

          {selMeta && (
            <>
              <div className="sd-panel-h" style={{ marginTop: 20 }}>Selected node</div>
              <div className="sd-sel">
                <span className="sd-pal-ico" style={{ background: `color-mix(in srgb, ${selMeta.c} 15%, var(--bg-1))`, color: selMeta.c }}>
                  <selMeta.icon size={16} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="sd-sel-name">{selMeta.label}</div>
                  <div className="sd-sel-sub">{selConns.length} connection{selConns.length === 1 ? '' : 's'}</div>
                </div>
                <button className="sd-del-btn" title="Delete node" onClick={() => deleteNode(selected)}><Trash2 size={14} /></button>
              </div>
              {selConns.length > 0 && (
                <div className="sd-conns">
                  {selConns.map(({ e, i }) => {
                    const otherId = e[0] === selected ? e[1] : e[0]
                    const om = meta(at(otherId)?.type)
                    return (
                      <div key={i} className="sd-conn-row">
                        <span>→ {om?.label || 'node'}</span>
                        <button className="sd-conn-x" title="Remove connection" onClick={() => removeEdge(i)}><X size={12} /></button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          <div className="sd-panel-h" style={{ marginTop: 20 }}>AI review</div>
          {!review ? (
            <div className="sd-verdict idle">
              <Bot size={16} />
              <span>Run the evaluation and the AI will grade your architecture against {brief.target}, latency and failure modes.</span>
            </div>
          ) : (
            <div className="sd-verdict">
              <div className="sd-metric">
                <span>Throughput</span>
                <strong style={{ color: review.rps >= 50000 ? 'var(--green)' : review.rps > 0 ? 'var(--amber)' : 'var(--rose)' }}>{fmt(review.rps)} RPS</strong>
              </div>
              <div className="sd-metric">
                <span>p99 latency</span>
                <strong style={{ color: review.p99 && review.p99 <= 50 ? 'var(--green)' : review.p99 ? 'var(--amber)' : 'var(--rose)' }}>{review.p99 ? `${review.p99} ms` : '—'}</strong>
              </div>
              <div className="sd-metric">
                <span>Availability</span>
                <strong style={{ color: review.avail >= 99.9 ? 'var(--green)' : 'var(--amber)' }}>{review.avail.toFixed(2)}%</strong>
              </div>
              {evalNote && <div className="sd-eval-note">{evalNote}</div>}

              <div className={`sd-note ${review.pass ? 'ok' : ''}`} style={{ marginTop: 12 }}>
                {review.pass
                  ? <><CheckCircle2 size={14} /> Strong design — this clears the {brief.target} bar with cached reads and a replicated datastore.</>
                  : <><AlertTriangle size={14} /> Not there yet — {review.findings.length} issue{review.findings.length === 1 ? '' : 's'} to fix below.</>}
              </div>

              {review.findings.length > 0 && (
                <div className="sd-findings">
                  {review.findings.slice(0, 6).map((f, i) => {
                    const I = levelIcon[f.level] || Info
                    return (
                      <div key={i} className={`sd-finding ${f.level}`}>
                        <I size={13} /><span>{f.text}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
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

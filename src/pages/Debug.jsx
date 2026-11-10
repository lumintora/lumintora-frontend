import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import Nav, { Sidebar } from '../components/Nav'
import DemoHeader from '../components/DemoHeader'
import {
  Bug, Bot, Terminal, CheckCircle2, XCircle, Lightbulb, Send, RotateCcw, Play,
} from 'lucide-react'
import '../components/UI.css'

/* ── AI Debugging — a working debugger ──
   You edit the real code and run the real tests (in-browser). The AI is a pair
   that only *guides* with progressive hints — it never writes the fix for you. */

const FALLBACK = {
  id: 'paginate',
  title: 'Pagination drops an item',
  file: 'paginate.js',
  entry: 'paginate',
  description: 'Every page comes back one item short. Find and fix the bug — I’ll help you reason it out, but you write the fix.',
  buggy_code: 'function paginate(items, page, size) {\n  const start = page * size\n  const end = start + size\n  return items.slice(start, end - 1)\n}',
  tests: (() => {
    const items = Array.from({ length: 30 }, (_, i) => i + 1)
    const page = (p) => items.slice(p * 10, p * 10 + 10)
    return [
      { name: 'first page returns 10 items', args: [items, 0, 10], expect: page(0) },
      { name: 'second page is full', args: [items, 1, 10], expect: page(1) },
      { name: 'last page is full', args: [items, 2, 10], expect: page(2) },
    ]
  })(),
  max_hints: 3,
}

const LOCAL_HINTS = [
  'Run the tests first and compare what they expect with what you get — how many items come back per page, versus how many should?',
  'Look only at the return line. Array.prototype.slice(start, end) — is that second argument inclusive or exclusive of end?',
  'slice(start, end) already stops *before* end — it’s end-exclusive. So the `- 1` is cutting one item too many. I won’t write the corrected line for you, but you now know exactly what to change.',
]

// Build and run the user's code against the test cases — real execution, in-browser.
function runUserCode(code, entry, tests) {
  let fn
  try {
    // eslint-disable-next-line no-new-func
    const factory = new Function(`"use strict";\n${code}\n;return typeof ${entry} === "function" ? ${entry} : undefined;`)
    fn = factory()
  } catch (e) {
    return { ok: false, error: `SyntaxError: ${e.message}`, results: [] }
  }
  if (typeof fn !== 'function') return { ok: false, error: `${entry} is not defined`, results: [] }
  const results = tests.map(t => {
    try {
      const got = fn(...t.args.map(a => (Array.isArray(a) ? [...a] : a)))
      return { name: t.name, pass: JSON.stringify(got) === JSON.stringify(t.expect), got, expect: t.expect }
    } catch (e) {
      return { name: t.name, pass: false, error: e.message }
    }
  })
  return { ok: results.length > 0 && results.every(r => r.pass), results }
}

const HEAD = {
  eyebrow: 'AI Debugging',
  title: 'Debug real broken code — the AI helps, you fix it.',
  lede: 'Edit the actual code and run the actual tests. Your AI pair guides you to the root cause with progressive hints, but it won’t write the fix for you — that’s the part you learn from.',
}

export default function Debug() {
  const { user } = useAuth()
  const [ch, setCh] = useState(FALLBACK)
  const [code, setCode] = useState(FALLBACK.buggy_code)
  const [run, setRun] = useState(null)        // { ok, error, results }
  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'I’m your debugging pair. I’ll help you find the bug and reason to the fix — but I won’t write it for you. Run the tests, then ask me for a hint.' },
  ])
  const [hintLevel, setHintLevel] = useState(0)
  const [hinting, setHinting] = useState(false)
  const [q, setQ] = useState('')
  const chatRef = useRef(null)

  useEffect(() => {
    let alive = true
    api.debugChallenge()
      .then(d => { if (alive && d?.buggy_code) { setCh(d); setCode(d.buggy_code) } })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])

  const pushAI = (text) => setMessages(m => [...m, { role: 'ai', text }])
  const pushUser = (text) => setMessages(m => [...m, { role: 'user', text }])

  const runTests = () => {
    setRunning(true)
    setTimeout(() => {
      const res = runUserCode(code, ch.entry, ch.tests || [])
      setRun(res)
      if (res.ok && !solved) { setSolved(true); pushAI('That’s it — all tests pass. You reasoned to the fix yourself. Nicely done. 🎉') }
      else if (!res.ok && solved) setSolved(false)
      setRunning(false)
    }, 160)
  }

  const resetCode = () => { setCode(ch.buggy_code); setRun(null); setSolved(false) }

  const askHint = async (question) => {
    if (hinting) return
    setHinting(true)
    if (question) pushUser(question)
    try {
      const res = await api.debugHint({ id: ch.id, level: hintLevel, question: question || '' })
      pushAI(res.hint)
      setHintLevel(res.level ?? hintLevel + 1)
    } catch {
      const text = hintLevel >= LOCAL_HINTS.length
        ? 'That’s as far as I’ll nudge — make the edit and run the tests. You’ve got this.'
        : LOCAL_HINTS[hintLevel]
      pushAI(question ? `I can guide you, but I won’t write the fix. Here’s a nudge: ${text}` : text)
      setHintLevel(l => l + 1)
    } finally {
      setHinting(false)
    }
  }

  const sendQ = (e) => { e.preventDefault(); const t = q.trim(); if (!t) return; setQ(''); askHint(t) }

  const body = (
    <div className="dbg-grid">
      {/* Code + tests */}
      <div className="dbg-left">
        <div className="dbg-file">
          <div className="dbg-file-bar">
            <Bug size={13} /> {ch.file}
            {solved && <span className="dbg-fixed-tag"><CheckCircle2 size={12} /> passing</span>}
            <button className="dbg-reset" onClick={resetCode} title="Restore the broken version"><RotateCcw size={12} /> reset</button>
          </div>
          <textarea
            className="dbg-editor"
            spellCheck={false}
            value={code}
            onChange={e => { setCode(e.target.value); if (solved) setSolved(false) }}
          />
          <div className="dbg-runbar">
            <span className="dbg-run-hint">Edit the code, then run the tests.</span>
            <button className="btn btn-primary btn-sm" onClick={runTests} disabled={running}>
              <Play size={14} /> {running ? 'Running…' : 'Run tests'}
            </button>
          </div>
        </div>

        <div className={`dbg-term ${run ? (run.ok ? 'pass' : 'fail') : ''}`}>
          <div className="dbg-term-bar"><Terminal size={13} /> test output</div>
          <div className="dbg-term-out">
            {!run ? (
              <span className="dbg-term-idle">Run the tests to see results.</span>
            ) : run.error ? (
              <span className="dbg-test-row fail"><XCircle size={13} /> {run.error}</span>
            ) : (
              <>
                {run.results.map((t, i) => (
                  <div key={i} className={`dbg-test-row ${t.pass ? 'pass' : 'fail'}`}>
                    {t.pass ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>
                      {t.pass ? '✓' : '✕'} {t.name}
                      {!t.pass && !t.error && (
                        <span className="dbg-test-detail"> — expected {JSON.stringify(t.expect).slice(0, 36)}… got {JSON.stringify(t.got).slice(0, 36)}…</span>
                      )}
                      {!t.pass && t.error && <span className="dbg-test-detail"> — {t.error}</span>}
                    </span>
                  </div>
                ))}
                <div className={`dbg-term-summary ${run.ok ? 'ok' : 'bad'}`}>
                  {run.ok ? `PASS · ${run.results.length}/${run.results.length} tests` : `FAIL · ${run.results.filter(r => r.pass).length}/${run.results.length} tests`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI helper */}
      <aside className="dbg-ai">
        <div className="sd-panel-h"><Bot size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />AI pair · guides, won’t fix</div>
        <div className="dbg-chat" ref={chatRef}>
          {messages.map((m, i) => (
            m.role === 'user'
              ? <div key={i} className="dbg-msg user">{m.text}</div>
              : <div key={i} className="dbg-msg ai"><span className="dbg-ai-ava"><Bot size={12} /></span><span>{m.text}</span></div>
          ))}
        </div>
        <div className="dbg-ai-controls">
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => askHint('')} disabled={hinting}>
            <Lightbulb size={14} /> {hinting ? 'Thinking…' : 'Give me a hint'}
          </button>
          <form className="dbg-ask-row" onSubmit={sendQ}>
            <input className="field-input dbg-ask-input" placeholder="Ask the AI a question…" value={q} onChange={e => setQ(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm dbg-ask-send" disabled={hinting || !q.trim()}><Send size={14} /></button>
          </form>
        </div>
      </aside>
    </div>
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

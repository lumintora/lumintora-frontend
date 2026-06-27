import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import Logo from '../components/Logo'
import { Button } from '../components/UI'
import {
  ArrowRight, Check, Sparkles, Route, Code2, Trophy, Bot, Flame,
  GraduationCap, Zap, Terminal, CheckCircle2, XCircle, BookOpen, User,
  Play, Plus, LayoutDashboard,
} from 'lucide-react'
import '../components/UI.css'

// The workflow loop — how a learner actually moves through Lumintora.
const steps = [
  { n: '01', title: 'Set a goal', desc: 'Tell Lumintora what you want to learn — a topic, a role, or a project.' },
  { n: '02', title: 'Get an adaptive path', desc: 'An AI generates a structured path with lessons, quizzes, and real coding problems.' },
  { n: '03', title: 'Practice & get judged', desc: 'Solve LeetCode-style problems against real test cases — Run the samples, Submit to judge them all.' },
  { n: '04', title: 'Build a streak', desc: 'Earn XP, watch your contribution heatmap fill in, and climb the leaderboard.' },
]

// Real, shipped capabilities only.
const features = [
  { icon: Route, title: 'Adaptive learning paths', desc: 'AI builds a path around your goal and reshapes it as you progress — not a fixed syllabus.' },
  { icon: Code2, title: 'Real coding judge', desc: 'LeetCode-style problems with sample + hidden test cases and per-case pass/fail verdicts.' },
  { icon: Bot, title: 'Always-on AI tutor', desc: 'Select any text and ask Lumi for a clear, concise explanation — right where you are.' },
  { icon: Flame, title: 'Streaks & heatmap', desc: 'A GitHub-style contribution heatmap, current & longest streaks, and XP that adds up.' },
  { icon: GraduationCap, title: 'Quizzes & XP', desc: 'Adaptive quizzes pinpoint weak spots and turn effort into measurable progress.' },
  { icon: Trophy, title: 'Leaderboard', desc: 'Friendly competition — see how your XP and streak stack up against other learners.' },
  { icon: Terminal, title: 'Code playground', desc: 'JavaScript runs instantly in your browser; Python runs on a real server runtime.' },
  { icon: User, title: 'Your profile', desc: 'Phone, email, socials, avatar, and your activity heatmap — a profile you fully control.' },
]

/* ── Product visuals (rendered mockups of the real UI) ───────────── */

function Shot({ url, children, className = '', bodyClass = '' }) {
  return (
    <div className={`lp-shot ${className}`}>
      <div className="lp-shot-bar">
        <span className="lp-shot-dot" style={{ background: '#ff5f57' }} />
        <span className="lp-shot-dot" style={{ background: '#febc2e' }} />
        <span className="lp-shot-dot" style={{ background: '#28c840' }} />
        <span className="lp-shot-url">{url}</span>
      </div>
      <div className={`lp-shot-body ${bodyClass}`}>{children}</div>
    </div>
  )
}

function MiniHeatmap() {
  // Deterministic pseudo-random levels (no Math.random — stable render).
  const cells = Array.from({ length: 7 * 20 }, (_, i) => ((i * 37 + 11) % 11))
  const level = (v) => (v < 4 ? 0 : v < 6 ? 1 : v < 8 ? 2 : v < 10 ? 3 : 4)
  return (
    <div className="lp-heat">
      {Array.from({ length: 20 }).map((_, c) => (
        <div key={c} className="lp-heat-col">
          {Array.from({ length: 7 }).map((_, r) => (
            <span key={r} className={`lp-heat-cell lvl-${level(cells[c * 7 + r])}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

function DashboardShot() {
  const stats = [
    ['Total XP', '1,240', Zap, 'var(--accent)'],
    ['Day Streak', '12', Flame, '#f87171'],
    ['Active Paths', '3', BookOpen, 'var(--accent-2)'],
    ['Completed', '8', CheckCircle2, 'var(--green)'],
  ]
  const paths = [
    { title: "Beginner's Cybersecurity Path", desc: 'A guided path to your first security role.', prog: 25, mods: '2/8 modules', hrs: '20h' },
    { title: 'Machine Learning with Python', desc: 'Land an ML role, one step at a time.', prog: 40, mods: '3/8 modules', hrs: '24h' },
  ]
  return (
    <Shot url="lumintora.app/dashboard" className="lp-shot-hero" bodyClass="lp-db-flush">
      {/* App top nav */}
      <div className="lp-db-nav">
        <Logo size={18} />
        <div className="lp-db-navlinks">
          <span className="active">Dashboard</span><span>Playground</span><span>Leaderboard</span>
        </div>
        <div className="lp-db-navright">
          <span className="lp-db-xp"><Zap size={10} /> 1,240 XP</span>
          <span className="lp-db-new"><Plus size={11} /> New Path</span>
          <span className="lp-db-ava">J</span>
        </div>
      </div>

      <div className="lp-db-main">
        {/* Sidebar */}
        <div className="lp-db-side">
          <span className="lp-db-side-h">LEARN</span>
          <span className="lp-db-side-i active"><LayoutDashboard size={13} /> Dashboard</span>
          <span className="lp-db-side-i"><Plus size={13} /> New Path</span>
          <span className="lp-db-side-i"><Code2 size={13} /> Playground</span>
          <span className="lp-db-side-h">ACCOUNT</span>
          <span className="lp-db-side-i"><User size={13} /> Profile</span>
        </div>

        {/* Content */}
        <div className="lp-db-content">
          <div className="lp-db-eyebrow">GOOD TO SEE YOU</div>
          <div className="lp-db-title">Welcome back, Jathin</div>

          <div className="lp-stat-row" style={{ marginTop: 14 }}>
            {stats.map(([l, v, I, c]) => (
              <div key={l} className="lp-stat">
                <span className="lp-stat-ico" style={{ background: `color-mix(in srgb, ${c} 14%, var(--bg-1))`, color: c }}><I size={14} /></span>
                <div>
                  <div className="lp-stat-v">{v}</div>
                  <div className="lp-stat-l">{l}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-db-practice">
            <span className="lp-db-practice-ico"><Code2 size={16} /></span>
            <div className="lp-db-practice-body">
              <div className="lp-db-practice-t">Hands-on code practice</div>
              <div className="lp-db-practice-d">Write and <strong>actually run</strong> code in a safe sandbox.</div>
            </div>
            <span className="lp-db-practice-cta"><Play size={11} /> Open Playground</span>
          </div>

          <div className="lp-db-paths-head">
            <span>Your Learning Paths</span>
            <span className="lp-db-new"><Plus size={11} /> New Path</span>
          </div>
          <div className="lp-db-paths">
            {paths.map((p) => (
              <div key={p.title} className="lp-db-path">
                <span className="lp-db-badge">BEGINNER</span>
                <div className="lp-db-path-t">{p.title}</div>
                <div className="lp-db-path-d">{p.desc}</div>
                <div className="lp-db-path-progrow"><span>Progress</span><span>{p.prog}%</span></div>
                <div className="lp-path-prog"><div className="lp-path-prog-fill" style={{ width: `${p.prog}%` }} /></div>
                <div className="lp-db-path-meta"><span><BookOpen size={11} /> {p.mods}</span><span>{p.hrs}</span><ArrowRight size={12} color="var(--accent)" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shot>
  )
}

function PathShot() {
  const modules = [
    { t: 'JSX & components', type: 'lesson', done: true },
    { t: 'Props & state', type: 'lesson', done: true },
    { t: 'Checkpoint quiz', type: 'quiz', done: false },
    { t: 'Build a todo app', type: 'code', done: false },
  ]
  const typeColor = { lesson: 'var(--accent)', quiz: '#a78bfa', code: '#fbbf24' }
  return (
    <Shot url="lumintora.app/start">
      <div className="lp-gen-bar">
        <Sparkles size={14} color="var(--accent)" />
        <span className="lp-gen-text">Learn React for frontend interviews</span>
        <span className="lp-gen-btn">Generate <ArrowRight size={12} /></span>
      </div>
      <div className="lp-gen-meta"><span className="lp-spark"><Sparkles size={11} /> AI generated your path</span> · 12 modules · ~8h</div>
      <div className="lp-path-card">
        <div className="lp-path-title">Frontend with React</div>
        <div className="lp-path-prog"><div className="lp-path-prog-fill" style={{ width: '34%' }} /></div>
        <div className="lp-path-modules">
          {modules.map((m) => (
            <div key={m.t} className={`lp-mod ${m.done ? 'done' : ''}`}>
              <span className="lp-mod-ico" style={{ background: typeColor[m.type] + '22', color: typeColor[m.type] }}>
                {m.done ? <Check size={12} /> : <span className="lp-mod-dot" style={{ background: typeColor[m.type] }} />}
              </span>
              <span className="lp-mod-title">{m.t}</span>
              <span className="lp-mod-type" style={{ color: typeColor[m.type] }}>{m.type}</span>
            </div>
          ))}
        </div>
      </div>
    </Shot>
  )
}

function JudgeShot() {
  return (
    <Shot url="lumintora.app/playground">
      <div className="lp-judge-head"><span className="lp-diff">Easy</span> Two Sum</div>
      <pre className="lp-code">{`function twoSum(nums, target) {
  const seen = {};
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (need in seen) return [seen[need], i];
    seen[nums[i]] = i;
  }
}`}</pre>
      <div className="lp-verdict ok"><CheckCircle2 size={15} /> Accepted · 5/5 test cases passed</div>
      <div className="lp-cases">
        <div className="lp-case ok"><CheckCircle2 size={12} /> Case 1 <code>[2,7,11,15], 9 → [0,1]</code></div>
        <div className="lp-case ok"><CheckCircle2 size={12} /> Case 2 <code>[3,2,4], 6 → [1,2]</code></div>
        <div className="lp-case bad"><XCircle size={12} /> Case 3 <code>expected [0,1], got [1,0]</code></div>
      </div>
    </Shot>
  )
}

function StreakShot() {
  return (
    <Shot url="lumintora.app/profile">
      <div className="lp-streak-row">
        <div className="lp-streak-big">
          <Flame size={22} color="#f87171" />
          <div>
            <div className="lp-streak-v">12</div>
            <div className="lp-streak-l">day streak</div>
          </div>
        </div>
        <div className="lp-streak-mini">
          <div><span className="lp-streak-mv">31</span><span className="lp-streak-ml">longest</span></div>
          <div><span className="lp-streak-mv">186</span><span className="lp-streak-ml">active days</span></div>
        </div>
      </div>
      <div className="lp-heat-card" style={{ marginTop: 4 }}>
        <div className="lp-heat-head"><span>Contribution heatmap</span><span className="lp-muted">last 20 weeks</span></div>
        <MiniHeatmap />
      </div>
    </Shot>
  )
}

function TutorShot() {
  return (
    <Shot url="lumintora.app · Lumi">
      <div className="lp-chat">
        <div className="lp-msg user">Explain Big-O notation simply.</div>
        <div className="lp-msg ai">
          <span className="lp-ai-ava"><Sparkles size={11} /></span>
          <span>Big-O describes how work grows as input grows. O(n) means double the input ≈ double the work; O(1) stays flat no matter the size.</span>
        </div>
        <div className="lp-chat-input"><span>Ask your tutor anything…</span><span className="lp-send"><ArrowRight size={13} /></span></div>
      </div>
    </Shot>
  )
}

const showcase = [
  { ...features[0], shot: <PathShot /> },      // Adaptive learning paths
  { ...features[1], shot: <JudgeShot /> },     // Real coding judge
  { ...features[2], shot: <TutorShot /> },     // AI tutor
  { ...features[3], shot: <StreakShot /> },    // Streaks & heatmap
]

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="lp-feat-ico"><Icon size={18} /></div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{desc}</div>
    </div>
  )
}

function UpdatesForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setStatus('error'); setMsg('Please enter a valid email.'); return }
    setStatus('loading')
    try {
      await api.joinWaitlist(email.trim())
      setStatus('done'); setMsg("You're subscribed — we'll share what's new.")
      setEmail('')
    } catch (err) {
      setStatus('error'); setMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'done') {
    return <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'var(--green)', fontSize: 15, fontWeight: 600 }}><Check size={18} /> {msg}</div>
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <input
          type="email" value={email}
          onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
          placeholder="Email for product updates" className="field-input"
          style={{ flex: 1, minWidth: 240, maxWidth: 340, textAlign: 'left' }} aria-label="Email address"
        />
        <Button type="submit" loading={status === 'loading'} size="lg" variant="secondary">Notify me</Button>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: status === 'error' ? 'var(--rose)' : 'var(--text-3)' }}>
        {status === 'error' ? msg : 'Occasional updates as new features ship. No spam.'}
      </div>
    </form>
  )
}

export default function Landing() {
  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <header style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px clamp(20px, 5vw, 56px)',
      }}>
        <Logo size={30} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/login" className="btn btn-ghost btn-md">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-md">Get started free <ArrowRight size={15} /></Link>
        </div>
      </header>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-glow" />
        <div className="beta-pill animate-fade">
          <span className="beta-pill-tag">BETA</span>
          <span>Lumintora v1 Beta is live — free to use</span>
        </div>
        <h1 className="landing-h1 animate-fade" style={{ animationDelay: '0.05s' }}>
          Learning that<br /><span className="gradient-text">adapts to you.</span>
        </h1>
        <p className="landing-sub animate-fade" style={{ animationDelay: '0.1s' }}>
          Lumintora generates an adaptive learning path around your goal, then backs it with a real
          coding judge, an AI tutor, and streaks that keep you moving.
        </p>
        <div className="landing-cta animate-fade" style={{ animationDelay: '0.15s' }}>
          <Link to="/register" className="btn btn-primary btn-xl">Start learning free <ArrowRight size={16} /></Link>
          <Link to="/login" className="btn btn-secondary btn-xl">Sign in</Link>
        </div>
        <div className="landing-hero-shot animate-fade" style={{ animationDelay: '0.2s' }}>
          <DashboardShot />
        </div>
      </div>

      {/* Workflow */}
      <div className="section">
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div className="section-label">How it works</div>
          <h2 className="section-title">From a goal to mastery — in one loop.</h2>
          <div className="lp-flow">
            {steps.map((s, i) => (
              <div key={s.n} className="lp-flow-step">
                <div className="lp-flow-n">{s.n}</div>
                <div className="lp-flow-title">{s.title}</div>
                <div className="lp-flow-desc">{s.desc}</div>
                {i < steps.length - 1 && <ArrowRight className="lp-flow-arrow" size={16} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Showcase — real product, with visuals */}
      <div className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 8px' }}>
            <div className="section-label">Inside Lumintora</div>
            <h2 className="section-title">Everything you need to actually learn.</h2>
          </div>
          {showcase.map((f, i) => (
            <div key={f.title} className={`lp-show ${i % 2 ? 'reverse' : ''}`}>
              <div className="lp-show-text">
                <div className="lp-feat-ico"><f.icon size={20} /></div>
                <h3 className="lp-show-title">{f.title}</h3>
                <p className="lp-show-desc">{f.desc}</p>
              </div>
              <div className="lp-show-shot">{f.shot}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="section">
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
            <div className="section-label">What's included</div>
            <h2 className="section-title">All of it, free in beta.</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Every feature below is live today. We're shipping more during the beta.</p>
          </div>
          <div className="lp-grid">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div id="access" className="section" style={{ textAlign: 'center', background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
        <div className="landing-glow" style={{ top: '50%' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
          <div className="beta-pill" style={{ margin: '0 auto 18px' }}>
            <span className="beta-pill-tag">BETA</span><span>Now open to everyone</span>
          </div>
          <h2 className="section-title">Create your account and start today.</h2>
          <p style={{ fontSize: 16, color: 'var(--text-2)', margin: '12px auto 28px', lineHeight: 1.6 }}>
            No waitlist, no payment — the v1 Beta is free. Sign up and generate your first adaptive path in under a minute.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <Link to="/register" className="btn btn-primary btn-xl">Get started free <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn btn-secondary btn-xl">Sign in</Link>
          </div>
          <UpdatesForm />
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px clamp(20px, 5vw, 56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-3)', flexWrap: 'wrap', gap: 16 }}>
        <Logo size={24} fontSize={16} wordColor="var(--text-2)" />
        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          <span className="beta-tag-mini">v1 Beta</span>
          <Link to="/register" style={{ color: 'var(--text-2)' }}>Get started</Link>
          <span>© 2026 Lumintora</span>
        </div>
      </footer>
    </div>
  )
}

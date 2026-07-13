import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import {
  ArrowRight, ArrowLeft, Check, Users, Bug, Award, FileText,
  Star, Trophy, MapPin, Clock, CheckCircle2, ChevronRight,
} from 'lucide-react'
import '../components/UI.css'

const ROLES = {
  gtm: {
    slug: 'gtm',
    title: 'GTM Intern',
    team: 'Growth',
    color: '#7c3aed',
    bg: '#7c3aed18',
    icon: Users,
    tagline: 'Grow Lumintora across college campuses in India.',
    about: `We're looking for a motivated student who lives and breathes campus life — someone who knows every club president, attends every hackathon, and wants to turn their network into real product impact. As our GTM Intern, you'll be the face of Lumintora at your campus and beyond.`,
    responsibilities: [
      'Represent Lumintora in IEEE, GDG, ACM, NSS, and coding clubs at your college',
      'Organise or co-host campus events, workshops, and product demo sessions',
      'Create short-form content (reels, posts, threads) to drive awareness',
      'Onboard students from your campus and track sign-up numbers weekly',
      'Share weekly reports with insights, feedback, and what\'s working',
      'Attend bi-weekly calls with the Lumintora core team',
    ],
    requirements: [
      'Currently enrolled in any undergraduate or postgraduate programme',
      'Active in at least one campus club or technical community',
      'Strong communication and interpersonal skills',
      'Basic understanding of social media and content creation',
      'Passionate about education and learning technology',
    ],
    benefits: [
      { icon: Award, text: 'Certificate of Internship (official, signed)' },
      { icon: FileText, text: 'Letter of Recommendation from the founders' },
      { icon: Star, text: 'LinkedIn endorsement from the Lumintora team' },
      { icon: Trophy, text: 'Lumintora Pro access — completely free' },
      { icon: Users, text: 'Direct mentorship from the founding team' },
      { icon: CheckCircle2, text: 'Real growth metrics on your resume' },
    ],
    questions: [
      {
        key: 'intro',
        label: '1. Tell us about yourself.',
        placeholder: 'Who are you, what do you study, and why are you applying for the GTM Intern role at Lumintora specifically?',
        rows: 4,
      },
      {
        key: 'communities',
        label: '2. Are you part of any technical communities or student clubs?',
        placeholder: 'List every community you\'re part of (IEEE, GDG, ACM, NSS, coding club, etc.). For each one, describe your role — are you a member, executive, lead, or founder?',
        rows: 4,
      },
      {
        key: 'events',
        label: '3. Have you organised or attended any tech events, hackathons, workshops, or conferences?',
        placeholder: 'Tell us about the most impactful one. What was the event, what did you do, how many people attended, and what was the outcome?',
        rows: 4,
      },
      {
        key: 'growth_strategy',
        label: '4. How would you grow Lumintora\'s presence in your college?',
        placeholder: 'Give us a concrete, step-by-step plan. Be specific about the activities, timeline, and how you\'d measure success.',
        rows: 5,
      },
      {
        key: 'creative_campaign',
        label: '5. You have one month and no budget. How do you get 100 students to sign up for Lumintora?',
        placeholder: 'Walk us through your exact strategy — which channels, what messaging, who you\'d target first, and why you think it\'ll work.',
        rows: 5,
      },
      {
        key: 'content',
        label: '6. Have you ever created content about tech or education — posts, reels, videos, Twitter threads?',
        placeholder: 'Share links to any content you\'ve made. If you haven\'t, describe what kind of content you\'d create for Lumintora and on which platforms.',
        rows: 4,
      },
      {
        key: 'convincing',
        label: '7. Describe a time you genuinely convinced someone to try something new.',
        placeholder: 'What were you promoting, who was the person, what was your approach, and did it work? Be honest.',
        rows: 4,
      },
      {
        key: 'social',
        label: '8. What\'s your LinkedIn and social media handle?',
        placeholder: 'Share your LinkedIn URL + any other handles (Instagram, Twitter/X, YouTube) where you post about tech or campus life.',
        rows: 2,
      },
      {
        key: 'why_lumintora',
        label: '9. Why Lumintora? What excites you about what we\'re building?',
        placeholder: 'Don\'t just say you love learning. What specifically about Lumintora\'s product, vision, or approach resonates with you?',
        rows: 4,
      },
    ],
  },
  qa: {
    slug: 'qa',
    title: 'QA Intern',
    team: 'Engineering',
    color: '#0891b2',
    bg: '#0891b218',
    icon: Bug,
    tagline: 'Help us ship a polished, bug-free product.',
    about: `We need someone with a detective's mindset — someone who doesn't just use a product, but actively tries to break it. As our QA Intern, you'll test features before they ship, write detailed bug reports, and work directly with our developers to close issues fast. You don't need prior experience — just sharp eyes and curiosity.`,
    responsibilities: [
      'Test new and existing features on Lumintora across devices and browsers',
      'Write clear, actionable bug reports with steps to reproduce',
      'Verify bug fixes and check for regressions after each deploy',
      'Explore edge cases — empty states, error handling, mobile layouts',
      'Suggest UX improvements when you notice friction in the product',
      'Collaborate directly with developers via GitHub Issues or Slack',
    ],
    requirements: [
      'Currently enrolled in any undergraduate or postgraduate programme',
      'High attention to detail and a systematic approach to problems',
      'Comfortable using browsers\' DevTools (Network tab, Console) is a plus',
      'Tested on both desktop and mobile devices',
      'No prior QA experience required — we\'ll train you',
    ],
    benefits: [
      { icon: Award, text: 'Certificate of Internship (official, signed)' },
      { icon: FileText, text: 'Letter of Recommendation from the founders' },
      { icon: Star, text: 'LinkedIn endorsement from the Lumintora team' },
      { icon: Trophy, text: 'Lumintora Pro access — completely free' },
      { icon: Bug, text: 'Real bugs you found will be credited to you' },
      { icon: CheckCircle2, text: 'Direct exposure to a live production codebase' },
    ],
    questions: [
      {
        key: 'intro',
        label: '1. Tell us about yourself.',
        placeholder: 'Who are you, what do you study, and why are you interested in QA specifically? What draws you to finding bugs?',
        rows: 4,
      },
      {
        key: 'first_impression',
        label: '2. Sign in to Lumintora (lumintora.in) and explore it for at least 15 minutes. What feature caught your attention first, and why?',
        placeholder: 'Be specific about the feature, what you liked or didn\'t like, and what you\'d want to test first if you were hired today.',
        rows: 4,
      },
      {
        key: 'bug_1',
        label: '3. Bug Report #1 — Find and describe your first bug on Lumintora.',
        placeholder: 'Format:\nTitle: [short description]\nSteps to reproduce: [numbered list]\nExpected: [what should happen]\nActual: [what happened]\nDevice/browser: [your setup]',
        rows: 6,
      },
      {
        key: 'bug_2',
        label: '4. Bug Report #2 — A second bug.',
        placeholder: 'Use the same format as above. Try to find a bug in a different part of the product.',
        rows: 6,
      },
      {
        key: 'bug_3',
        label: '5. Bug Report #3 — A third bug.',
        placeholder: 'Use the same format. Bonus: try testing on mobile if you haven\'t yet.',
        rows: 6,
      },
      {
        key: 'approach',
        label: '6. How do you approach testing a feature you\'ve never used before?',
        placeholder: 'Walk us through your process from first look to final sign-off — happy path, edge cases, invalid inputs, devices, etc.',
        rows: 5,
      },
      {
        key: 'devices',
        label: '7. What devices and browsers did you test Lumintora on? What differences did you notice?',
        placeholder: 'List exactly what you used (e.g. iPhone 13 / Chrome, Windows 11 / Firefox) and note any visual or functional differences you spotted across them.',
        rows: 3,
      },
      {
        key: 'tools',
        label: '8. Have you used any testing tools before? (Browser DevTools, Postman, Selenium, etc.)',
        placeholder: 'List any tools you\'ve used and how you used them. If you haven\'t used any, describe what you know about how DevTools can help with testing.',
        rows: 3,
      },
      {
        key: 'hardest_part',
        label: '9. What do you think is the hardest part of testing a consumer-facing product like Lumintora?',
        placeholder: 'Be honest and specific. We\'re looking for real insight, not a polished answer.',
        rows: 4,
      },
    ],
  },
}

function ApplicationForm({ role }) {
  const r = ROLES[role]
  const navigate = useNavigate()
  const [info, setInfo] = useState({ name: '', email: '', college: '', year: '', linkedin: '' })
  const [answers, setAnswers] = useState({})
  const [status, setStatus] = useState('idle')

  const setI = k => e => setInfo(f => ({ ...f, [k]: e.target.value }))
  const setA = k => e => setAnswers(a => ({ ...a, [k]: e.target.value }))

  const infoValid = info.name.trim() && info.email.trim() && info.college.trim() && info.year
  const allAnswered = r.questions.every(q => (answers[q.key] || '').trim().length > 0)

  const submit = async e => {
    e.preventDefault()
    if (!infoValid || !allAnswered) return
    setStatus('loading')
    try {
      const res = await fetch('https://lumintora-api.onrender.com/api/v1/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...info, role, answers }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="careers-success">
        <CheckCircle2 size={52} color="var(--green)" />
        <h2>Application received!</h2>
        <p>Thanks for applying for the <strong>{r.title}</strong> role. We review every application personally and will get back to you within 5 business days at <strong>{info.email}</strong>.</p>
        <Link to="/careers" className="btn btn-secondary">← Back to openings</Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="careers-apply-layout">
      {/* Left — job brief */}
      <div className="careers-job-brief">
        <Link to="/careers" className="careers-back"><ArrowLeft size={14} /> All openings</Link>
        <div className="careers-job-brief-icon" style={{ background: r.bg, color: r.color }}><r.icon size={28} /></div>
        <h2 className="careers-job-brief-title">{r.title}</h2>
        <div className="careers-job-meta">
          <span><MapPin size={13} /> Remote · India</span>
          <span><Clock size={13} /> Unpaid internship</span>
        </div>
        <p className="careers-job-brief-about">{r.about}</p>

        <div className="careers-brief-section">
          <div className="careers-brief-head">What you'll do</div>
          <ul className="careers-brief-list">
            {r.responsibilities.map(item => <li key={item}><Check size={12} style={{ color: r.color, flexShrink: 0, marginTop: 3 }} />{item}</li>)}
          </ul>
        </div>

        <div className="careers-brief-section">
          <div className="careers-brief-head">What you get</div>
          <div className="careers-brief-benefits">
            {r.benefits.map(b => (
              <div key={b.text} className="careers-brief-benefit">
                <b.icon size={14} style={{ color: r.color, flexShrink: 0 }} />
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — application form */}
      <div className="careers-form-col">
        <div className="careers-form-card">
          <div className="careers-form-head">
            <h3>Apply for {r.title}</h3>
            <p>Answer every question thoughtfully — we read every application.</p>
          </div>

          <div className="careers-form-section">
            <div className="careers-form-section-label">Your details</div>
            <div className="careers-form-row">
              <div className="careers-form-field">
                <label>Full name *</label>
                <input className="field-input" value={info.name} onChange={setI('name')} placeholder="Your full name" required />
              </div>
              <div className="careers-form-field">
                <label>Email *</label>
                <input className="field-input" type="email" value={info.email} onChange={setI('email')} placeholder="you@college.edu" required />
              </div>
            </div>
            <div className="careers-form-row">
              <div className="careers-form-field">
                <label>College / University *</label>
                <input className="field-input" value={info.college} onChange={setI('college')} placeholder="e.g. NIT Warangal" required />
              </div>
              <div className="careers-form-field">
                <label>Year of study *</label>
                <select className="field-input" value={info.year} onChange={setI('year')} required>
                  <option value="">Select year</option>
                  <option>1st year</option>
                  <option>2nd year</option>
                  <option>3rd year</option>
                  <option>4th year</option>
                  <option>Postgraduate</option>
                </select>
              </div>
            </div>
            <div className="careers-form-field">
              <label>LinkedIn profile <span className="careers-optional">(optional)</span></label>
              <input className="field-input" value={info.linkedin} onChange={setI('linkedin')} placeholder="https://linkedin.com/in/yourname" />
            </div>
          </div>

          <div className="careers-form-section">
            <div className="careers-form-section-label">Application questions</div>
            <div className="careers-form-note">
              We read every answer carefully. Take your time — quality matters more than speed.
            </div>
            {r.questions.map(q => (
              <div key={q.key} className="careers-form-field">
                <label>{q.label}</label>
                <textarea
                  className="field-input"
                  rows={q.rows}
                  placeholder={q.placeholder}
                  value={answers[q.key] || ''}
                  onChange={setA(q.key)}
                  style={{ resize: 'vertical', lineHeight: 1.6 }}
                  required
                />
              </div>
            ))}
          </div>

          {status === 'error' && (
            <p className="careers-error">Something went wrong. Please try again.</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 15 }}
            disabled={!infoValid || !allAnswered || status === 'loading'}
          >
            {status === 'loading' ? 'Submitting…' : 'Submit application'}
            {status !== 'loading' && <ArrowRight size={16} />}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>
            We'll reply to {info.email || 'your email'} within 5 business days.
          </p>
        </div>
      </div>
    </form>
  )
}

function RoleListing() {
  return (
    <div className="careers-listing">
      <div className="careers-listing-hero">
        <div className="section-label">We're hiring</div>
        <h1 className="careers-hero-title">Build the future of<br />learning with us.</h1>
        <p className="careers-hero-sub">
          Two unpaid internship roles with real product impact — certificates, letters of recommendation,
          and direct mentorship from our founding team.
        </p>
      </div>

      <div className="careers-roles">
        {Object.values(ROLES).map(r => (
          <Link key={r.slug} to={`/careers/${r.slug}`} className="careers-role-card">
            <div className="careers-role-left">
              <div className="careers-role-icon" style={{ background: r.bg, color: r.color }}>
                <r.icon size={20} />
              </div>
              <div>
                <div className="careers-role-title">{r.title}</div>
                <div className="careers-role-meta">
                  <span>{r.team}</span>
                  <span>·</span>
                  <span><MapPin size={11} /> Remote</span>
                  <span>·</span>
                  <span>Unpaid</span>
                </div>
                <p className="careers-role-tagline">{r.tagline}</p>
              </div>
            </div>
            <div className="careers-role-arrow">
              Apply <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      <div className="careers-perks">
        <div className="careers-perks-head">Every intern gets</div>
        <div className="careers-perks-grid">
          {[
            { icon: Award,        text: 'Certificate of Internship',       sub: 'Official, signed by founders' },
            { icon: FileText,     text: 'Letter of Recommendation',        sub: 'Strong LOR for placements' },
            { icon: Star,         text: 'LinkedIn Endorsement',            sub: 'From the Lumintora team' },
            { icon: Trophy,       text: 'Lumintora Pro — Free',            sub: 'Full access while you intern' },
            { icon: Users,        text: 'Founder Mentorship',              sub: 'Bi-weekly 1:1 calls' },
            { icon: CheckCircle2, text: 'Real product credit',             sub: 'Your work ships to real users' },
          ].map(p => (
            <div key={p.text} className="careers-perk">
              <p.icon size={20} style={{ color: 'var(--accent)' }} />
              <div>
                <div className="careers-perk-title">{p.text}</div>
                <div className="careers-perk-sub">{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Careers() {
  const { role } = useParams()
  const validRole = role && ROLES[role]

  return (
    <div className="careers-page">
      <header className="careers-header">
        <Link to="/">
          <Logo size={26} wordColor="var(--text)" />
        </Link>
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: 14, color: 'var(--text-2)', textDecoration: 'none' }}>Home</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
            Get started <ArrowRight size={13} />
          </Link>
        </nav>
      </header>

      <main className="careers-main">
        {validRole ? <ApplicationForm role={role} /> : <RoleListing />}
      </main>

      <footer className="careers-footer">
        <span>© 2026 Lumintora, Inc.</span>
        <span>Questions? Email <a href="mailto:lumintoraai@gmail.com">lumintoraai@gmail.com</a></span>
      </footer>
    </div>
  )
}

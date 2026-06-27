import { useState, useEffect } from 'react'
import Nav, { Sidebar } from '../components/Nav'
import CodeJudge from '../components/CodeJudge'
import { PROBLEMS, difficultyColor } from '../lib/problems'
import { Code2, Check, Zap } from 'lucide-react'
import '../components/UI.css'

// Real LeetCode-style practice: a function contract, sample + hidden test cases,
// Run / Submit, and per-case pass/fail verdicts. JavaScript is judged in your
// browser; Python runs on the server.

const SOLVED_KEY = 'lumintora_solved'
const loadSolved = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SOLVED_KEY) || '[]')) } catch { return new Set() }
}

export default function Playground() {
  const [activeId, setActiveId] = useState(PROBLEMS[0].id)
  const [solved, setSolved] = useState(loadSolved)

  const problem = PROBLEMS.find((p) => p.id === activeId)

  useEffect(() => {
    localStorage.setItem(SOLVED_KEY, JSON.stringify([...solved]))
  }, [solved])

  const markSolved = (id) => setSolved((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main main-wide animate-fade">
          <div className="pg-head">
            <div className="pg-head-icon"><Code2 size={20} /></div>
            <div>
              <h1 className="pg-title">Coding Practice</h1>
              <p className="pg-sub">
                Solve real problems with <strong>test cases</strong> — Run the samples, then Submit to judge all cases.
                <span className="pg-solved-count"><Zap size={13} /> {solved.size}/{PROBLEMS.length} solved</span>
              </p>
            </div>
          </div>

          {/* Problem picker */}
          <div className="pg-problems">
            {PROBLEMS.map((p) => (
              <button
                key={p.id}
                className={`pg-problem ${activeId === p.id ? 'active' : ''}`}
                onClick={() => setActiveId(p.id)}
              >
                <span className="pg-problem-check">
                  {solved.has(p.id) ? <Check size={13} /> : <span className="pg-problem-dot" />}
                </span>
                <span className="pg-problem-title">{p.title}</span>
                <span className="pg-problem-diff" style={{ color: difficultyColor[p.difficulty] }}>{p.difficulty}</span>
              </button>
            ))}
          </div>

          {/* Remount per problem so editor/results reset cleanly */}
          <CodeJudge
            key={problem.id}
            problem={problem}
            solved={solved.has(problem.id)}
            onSolved={markSolved}
          />
        </main>
      </div>
    </div>
  )
}

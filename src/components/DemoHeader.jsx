import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import Logo from './Logo'
import './UI.css'

/* Lightweight top bar for the public product-demo pages
   (System Design Lab, Hiring Loop, AI Debugging). No auth required. */
export default function DemoHeader({ tag }) {
  return (
    <header className="lp-header" style={{ position: 'sticky', top: 0, zIndex: 40 }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <Logo size={28} />
        {tag && <span className="demo-tag">{tag}</span>}
      </Link>
      <div className="lp-header-actions">
        <Link to="/" className="btn btn-ghost btn-md lp-hide-sm"><ArrowLeft size={15} /> Home</Link>
        <Link to="/register" className="btn btn-primary btn-md">Get started free <ArrowRight size={15} /></Link>
      </div>
    </header>
  )
}

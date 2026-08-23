import { useLayoutEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { applyTheme, getSavedThemeId, DEFAULT_THEME } from './lib/themes'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PathDetail from './pages/PathDetail'
import ModulePage from './pages/ModulePage'
import Leaderboard from './pages/Leaderboard'
import NewPath from './pages/NewPath'
import Onboarding from './pages/Onboarding'
import Playground from './pages/Playground'
import Profile from './pages/Profile'
import ResumeGenerator from './pages/ResumeGenerator'
import FeedbackForm from './pages/FeedbackForm'
import BlogPost from './pages/BlogPost'
import BlogIndex from './pages/BlogIndex'
import Careers from './pages/Careers'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import GoogleSuccess from './pages/GoogleSuccess'
import GoogleComplete from './pages/GoogleComplete'
import Verify from './pages/Verify'
import AiChat from './components/AiChat'

// The AI tutor only appears once the learner is signed in.
function ChatGate() {
  const { user } = useAuth()
  return user ? <AiChat /> : null
}

// Custom themes recolor the in-app experience only. The public homepage always
// renders in the default Aurora palette, so marketing visuals stay consistent.
function ThemeController() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    applyTheme(pathname === '/' || pathname.startsWith('/blog') ? DEFAULT_THEME : getSavedThemeId())
  }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeController />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/start" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
          <Route path="/paths/new" element={<ProtectedRoute><NewPath /></ProtectedRoute>} />
          <Route path="/paths/:pathId" element={<ProtectedRoute><PathDetail /></ProtectedRoute>} />
          <Route path="/modules/:moduleId" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute><ResumeGenerator /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><FeedbackForm /></ProtectedRoute>} />
          <Route path="/auth/success" element={<GoogleSuccess />} />
          <Route path="/auth/complete" element={<GoogleComplete />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/careers/:role" element={<Careers />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatGate />
      </BrowserRouter>
    </AuthProvider>
  )
}

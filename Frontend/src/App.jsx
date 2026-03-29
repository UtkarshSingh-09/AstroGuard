import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import FirePage from './pages/FirePage'
import TaxPage from './pages/TaxPage'
import PortfolioPage from './pages/PortfolioPage'
import DashboardPage from './pages/DashboardPage'
import Onboard from './pages/Onboard'
import Auth from './pages/Auth'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected UI error' }
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0B0C10] text-white flex items-center justify-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div className="rounded-2xl border border-white/[0.1] bg-[#111318]" style={{ padding: 24, maxWidth: 560 }}>
            <h2 className="font-bold" style={{ fontSize: 20, marginBottom: 8 }}>Recovered From A Page Error</h2>
            <p className="text-[#94A3B8]" style={{ fontSize: 14, marginBottom: 14 }}>
              The app prevented a blank screen and can continue safely.
            </p>
            <p className="text-rose-300" style={{ fontSize: 12, marginBottom: 14 }}>
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => { window.location.href = '/dashboard' }}
              className="rounded-lg bg-[#45A29E]/20 border border-[#45A29E]/40 text-[#45A29E] font-semibold hover:bg-[#45A29E]/30"
              style={{ padding: '10px 14px', fontSize: 13 }}
            >
              Go To Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <Router>
      <AppErrorBoundary>
        <div className="relative min-h-screen bg-void w-full min-w-0 overflow-x-hidden text-white font-sans selection:bg-[#45f3ff]/30 selection:text-white">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboard" element={<Onboard />} />
            <Route path="/fire" element={<FirePage />} />
            <Route path="/tax" element={<TaxPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AppErrorBoundary>
    </Router>
  )
}

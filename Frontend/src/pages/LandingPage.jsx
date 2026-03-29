import { useEffect, useRef } from 'react'
import HeroSection from '../components/sections/HeroSection'
import PerspectiveGrid from '../components/sections/PerspectiveGrid'
import AgentShowcase from '../components/sections/AgentShowcase'
import FeatureZPattern from '../components/sections/FeatureZPattern'
import PanicIntercept from '../components/sections/PanicIntercept'
import BehavioralFinale from '../components/sections/BehavioralFinale'
import Navbar from '../components/layout/Navbar'

function FloatingDots() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const DOT_COUNT = 60
    const dots = Array.from({ length: DOT_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.12,
      opacity: Math.random() * 0.25 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        d.pulse += 0.008
        const o = d.opacity + Math.sin(d.pulse) * 0.06

        if (d.x < -10) d.x = canvas.width + 10
        if (d.x > canvas.width + 10) d.x = -10
        if (d.y < -10) d.y = canvas.height + 10
        if (d.y > canvas.height + 10) d.y = -10

        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(69,162,158,${Math.max(0, o)})`
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 1,
      }}
    />
  )
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-void w-full" style={{ overflowX: 'hidden' }}>
      {/* Galactic Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.06]" 
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B0C10_100%)] opacity-80" />
      </div>

      <FloatingDots />

      {/* Foreground Content */}
      <div className="relative z-10 w-full">
        <Navbar />
        <HeroSection />

        <PerspectiveGrid />

        <AgentShowcase />

        <PerspectiveGrid
          badge="Core Engines"
          title="Three Engines."
          highlightWord="Zero Guesswork."
          titleSuffix=""
          subtitle="Deterministic math, traceable logic, and zero hallucinated numbers."
        />

        <FeatureZPattern />

        <BehavioralFinale />
      </div>
    </main>
  )
}

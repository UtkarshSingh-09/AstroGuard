import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function PerspectiveGrid({
  badge = 'Architecture',
  title = 'Powered by a',
  highlightWord = '10-Node',
  titleSuffix = 'Neural Architecture',
  subtitle = 'Each agent is a specialist. Together, they form an autonomous financial intelligence network.',
}) {
  const containerRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(gridRef.current, {
        backgroundPositionY: '+=200px',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative h-[50vh] overflow-hidden"
    >
      {/* The Perspective Grid */}
      <div
        ref={gridRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(69, 162, 158, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(69, 162, 158, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(75deg) translateY(-100px) scale(2.5)',
          transformOrigin: 'center top',
        }}
      />

      {/* Blue-indigo center glow (matching hero video tones) */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(30,58,138,0.25) 0%, rgba(48,84,255,0.08) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Secondary teal glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(69,162,158,0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animation: `floatParticle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Overlay text */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-accent-teal border border-accent-teal/30 rounded-full bg-accent-teal/5 mb-5">
            {badge}
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            {title}{' '}
            <span className="text-accent-teal">{highlightWord}</span>
            <br />
            {titleSuffix}
          </h2>
          <p className="text-text-slate text-base md:text-lg max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-void to-transparent z-10 pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-void to-transparent z-10 pointer-events-none" />

      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </section>
  )
}

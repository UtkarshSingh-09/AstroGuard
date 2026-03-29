import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network, Dna, Flame, Calculator, PieChart,
  ShieldAlert, Scale, BookOpen, Shuffle, FileText,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

const agents = [
  {
    icon: Network,
    name: 'OrchestratorAgent',
    tag: 'Core Router',
    description: 'The conductor. Routes every user query through the LangGraph StateGraph, delegating to the right specialist agent with zero latency.',
  },
  {
    icon: Dna,
    name: 'DNAAgent',
    tag: 'Profile Extractor',
    description: 'Extracts your Financial DNA through conversational onboarding — income, risk appetite, panic thresholds — into a strict JSON schema.',
  },
  {
    icon: Flame,
    name: 'FIREAgent',
    tag: 'Retirement Planner',
    description: 'Narrates your FIRE plan over deterministic math. Dynamic glidepath, corpus targets, and SIP recalculations — never a hallucinated number.',
  },
  {
    icon: Calculator,
    name: 'TaxAgent',
    tag: 'Tax Optimizer',
    description: 'Simplifies step-by-step Old vs New Regime comparison. Finds missed deductions and generates a traceable, auditable tax strategy.',
  },
  {
    icon: PieChart,
    name: 'PortfolioAgent',
    tag: 'MF Analyst',
    description: 'STCG-aware rebalancing with exact amounts, timelines, and overlap heatmaps. No vague advice — only actionable fund-level instructions.',
  },
  {
    icon: ShieldAlert,
    name: 'BehavioralGuardAgent',
    tag: 'Panic Interceptor',
    description: 'Monitors Nifty in real-time. When dips exceed your panic threshold, it fires a personalized WhatsApp intervention.',
  },
  {
    icon: Scale,
    name: 'RegulatorGuardAgent',
    tag: 'Compliance Watchdog',
    description: 'RAG-powered SEBI/RBI compliance layer. Intercepts unrealistic return promises and adjusts to conservative estimates.',
  },
  {
    icon: BookOpen,
    name: 'FinancialLiteracyAgent',
    tag: 'Micro-Educator',
    description: 'Generates 30-second "Did you know?" lessons post-calculation. Tracks literacy improvement through dynamic pre/post quizzes.',
  },
  {
    icon: Shuffle,
    name: 'LifeSimulatorAgent',
    tag: 'What-If Engine',
    description: 'Handles compound "what if" queries — bonus, job change, EMI. Chains Tax + FIRE + Portfolio agents for holistic scenario modeling.',
  },
  {
    icon: FileText,
    name: 'AuditNarratorAgent',
    tag: 'Trace Narrator',
    description: 'Transforms raw JSON traces into educational walkthroughs. Traceable logic, always.',
  },
]

export default function AgentShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState(1)
  const cardRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const goToNext = useCallback(() => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % agents.length)
  }, [])

  const goToPrev = useCallback(() => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + agents.length) % agents.length)
  }, [])

  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(goToNext, 6000)
    return () => clearInterval(interval)
  }, [isHovered, goToNext])

  const goTo = (index) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const agent = agents[activeIndex]
  const Icon = agent.icon

  const variants = {
    enter: (dir) => ({
      y: dir > 0 ? 15 : -15,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: (dir) => ({
      y: dir > 0 ? -15 : 15,
      opacity: 0,
      transition: { duration: 0.35, ease: 'easeIn' },
    }),
  }

  return (
    <section className="relative py-24 px-6">
      {/* Centered container */}
      <div className="flex flex-col items-center justify-center w-full">
        {/* Sub-heading */}
        <p className="text-text-slate text-sm tracking-[0.2em] uppercase mb-10 text-center">
          Meet the Specialist Agents
        </p>

        {/* Card */}
        <div
          ref={cardRef}
          className="relative w-full max-w-3xl h-[320px] md:h-[300px] mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Background shadow card for depth */}
          <div className="absolute inset-x-3 top-3 bottom-0 rounded-3xl bg-white/[0.02] border border-white/[0.04]" />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <div
                className="relative h-full rounded-3xl overflow-hidden border border-white/[0.06] backdrop-blur-xl"
                style={{ background: 'rgba(13,17,23,0.8)' }}
              >
                {/* Neural network image INSIDE the card */}
                <img
                  src="/neural-bg.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-[0.08] pointer-events-none"
                />

                {/* Spotlight glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-500 rounded-3xl"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(69, 162, 158, 0.10), transparent 40%)`,
                  }}
                />

                {/* Hover border glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl transition-all duration-700"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    boxShadow: '0 0 40px rgba(69,162,158,0.06), inset 0 0 1px rgba(69,162,158,0.15)',
                  }}
                />

                {/* Prev Arrow */}
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/15 hover:text-white/30 transition-colors duration-300 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Next Arrow */}
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/15 hover:text-white/30 transition-colors duration-300 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Card Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center gap-5 px-14 md:px-20">
                  <Icon
                    className="w-10 h-10 text-accent-teal"
                    strokeWidth={1.5}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(69, 162, 158, 0.4))' }}
                  />

                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{agent.name}</h3>
                    <span className="text-xs text-accent-gold font-medium tracking-wide uppercase">{agent.tag}</span>
                  </div>

                  <p className="text-text-slate text-sm md:text-base leading-relaxed max-w-lg">
                    {agent.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom reflection glow */}
        <div
          className="mx-auto mt-1 pointer-events-none"
          style={{
            width: '50%',
            maxWidth: '400px',
            height: 60,
            background: 'linear-gradient(to bottom, rgba(69,162,158,0.12), transparent)',
            filter: 'blur(25px)',
            borderRadius: '50%',
          }}
        />

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="text-xs text-text-slate font-mono tabular-nums">
            {String(activeIndex + 1).padStart(2, '0')}
          </span>

          <div className="flex gap-1.5">
            {agents.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-pointer"
                style={{ width: i === activeIndex ? 32 : 12 }}
              >
                <div className="absolute inset-0 bg-white/10 rounded-full" />
                {i === activeIndex && (
                  <motion.div
                    className="absolute inset-0 bg-accent-teal rounded-full"
                    layoutId="activeBar"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          <span className="text-xs text-text-slate font-mono tabular-nums">10</span>
        </div>
      </div>
    </section>
  )
}

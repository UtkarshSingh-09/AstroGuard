import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, Check, ShieldCheck, Sparkles, BrainCircuit, Flame, Calculator, PieChart } from 'lucide-react'

const THEME_BLUE = 'rgba(69,162,158,0.25)'

// --- Visual Components ---

function FireVisual() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI', text: 'Analyzing 10-year market glidepath...', done: true },
    { id: 2, sender: 'User', text: 'What if there is a 2008 crash?', done: true },
    { id: 3, sender: 'AI', text: 'Stress testing against 2008 scenario. Portfolio protected at -14% vs baseline -38%.', done: true },
    { id: 4, sender: 'User', text: 'Optimize SIP to capture recent dip.', done: true },
  ])

  const allMessages = [
    { sender: 'AI', text: 'Re-routing ₹4,500 from Large Cap to Debt. Corpus adjusted.' },
    { sender: 'User', text: 'Show me the updated glidepath.' },
    { sender: 'AI', text: 'Glidepath recalculated. On track to retire 3.4 years early.' },
    { sender: 'User', text: 'What about inflation hedging?' },
    { sender: 'AI', text: 'Adding 12% gold allocation. Real returns stabilized at 8.2%.' },
    { sender: 'User', text: 'Lock this plan.' },
    { sender: 'AI', text: 'Plan locked. Next rebalance scheduled for Q2 2026.' },
  ]

  const scrollRef = useRef(null)

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      const msg = allMessages[idx % allMessages.length]
      setMessages(prev => {
        const next = [...prev, { id: Date.now(), ...msg, done: false }]
        if (next.length > 5) next.shift()
        return next
      })
      setTimeout(() => {
        setMessages(c => c.map(m => ({ ...m, done: true })))
      }, 600)
      idx++
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={scrollRef} className="w-full h-full overflow-hidden flex flex-col justify-end" style={{ padding: '28px 24px' }}>
      <div className="flex flex-col" style={{ gap: '20px' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'User' ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  maxWidth: '88%',
                  padding: '14px 18px',
                  borderRadius: msg.sender === 'User' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                  background: msg.sender === 'User' ? 'rgba(69,162,158,0.12)' : 'rgba(255,255,255,0.04)',
                  border: msg.sender === 'User' ? '1px solid rgba(69,162,158,0.2)' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {msg.sender === 'AI' && (
                  <div style={{
                    flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BrainCircuit style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.4)' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    justifyContent: msg.sender === 'User' ? 'flex-end' : 'flex-start',
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                      {msg.sender === 'AI' ? 'AstraGuard' : 'You'}
                    </span>
                    {!msg.done && (
                      <span style={{ fontSize: '9px', color: 'rgba(69,243,255,0.5)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                        <Sparkles style={{ width: '10px', height: '10px', display: 'inline', marginRight: '4px' }} />
                        THINKING
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '13px', lineHeight: '1.55', color: 'rgba(255,255,255,0.85)',
                    margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word',
                  }}>
                    {msg.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TaxVisual() {
  const [activeIdx, setActiveIdx] = useState(0)
  const deductions = [
    { id: '80CCD', name: '80CCD(1B) NPS Match', val: '₹50,000' },
    { id: 'HRA', name: 'HRA Rent Validation', val: '₹1.4 Lakhs' },
    { id: '80D', name: 'Health Insurance Gap', val: '₹25,000' },
    { id: '24B', name: 'Home Loan Interest', val: '₹2.0 Lakhs' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % deductions.length)
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #161a22 0%, #12151b 100%)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header */}
        <div>
          <h4 style={{ fontSize: '20px', fontWeight: 500, color: 'white', letterSpacing: '-0.01em', marginBottom: '4px' }}>Old Regime Verification</h4>
          <p style={{ fontSize: '10px', color: 'rgba(69,162,158,0.5)', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>ASTRAGUARD INTELLIGENCE • ACTIVE</p>
        </div>

        {/* List items - NO borders, NO bars, clean flat list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {deductions.map((d, i) => {
            const isActive = i <= activeIdx
            return (
              <motion.div
                key={d.id}
                animate={{ opacity: isActive ? 1 : 0.35 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    border: isActive ? '1.5px solid rgba(69,162,158,0.6)' : '1.5px solid rgba(255,255,255,0.1)',
                    background: isActive ? 'rgba(69,162,158,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.4s ease',
                    boxShadow: isActive ? '0 0 12px rgba(69,162,158,0.3)' : 'none',
                  }}>
                    {isActive && <Check style={{ width: '12px', height: '12px', color: '#45A29E' }} />}
                  </div>
                  <span style={{ fontSize: '14px', letterSpacing: '0.02em', color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', fontWeight: isActive ? 500 : 400, transition: 'all 0.4s ease' }}>
                    {d.name}
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em' }}>{d.val}</span>
              </motion.div>
            )
          })}
        </div>

        {/* Result card */}
        <div style={{
          marginTop: '8px', width: '100%', padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(69,162,158,0.08) 0%, rgba(10,10,14,0.8) 100%)',
          border: '1px solid rgba(69,162,158,0.15)', borderRadius: '16px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <span style={{
              padding: '3px 10px', borderRadius: '8px',
              background: 'rgba(34,197,94,0.08)', color: 'rgba(34,197,94,0.8)',
              border: '1px solid rgba(34,197,94,0.15)', fontSize: '9px',
              fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Recommended
            </span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(69,162,158,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: '8px' }}>Optimum Strategy</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '26px', fontWeight: 300, color: 'white', letterSpacing: '-0.02em' }}>Old Regime</p>
            <p style={{ fontSize: '13px', color: 'rgba(34,197,94,0.8)', fontFamily: 'monospace' }}>+₹46,500 Saved</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MFVisual() {
  const [nodes, setNodes] = useState([
    { name: 'Axis Bluechip', val: 78 },
    { name: 'Mirae Asset', val: 32 },
    { name: 'Parag Parikh', val: 14 },
    { name: 'SBI Small Cap', val: 42 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        val: n.val > 60 ? Math.floor(65 + Math.random() * 30) : Math.floor(10 + Math.random() * 40)
      })))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #161a22 0%, #12151b 100%)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
          </div>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', fontFamily: 'monospace', textTransform: 'uppercase' }}>X-Ray Subroutine</span>
        </div>

        {/* 2x2 Grid of fund cards - square boxes with proper spacing */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {nodes.map((node, i) => {
            const isHigh = node.val > 65
            return (
              <motion.div
                key={i}
                animate={{
                  borderColor: isHigh ? 'rgba(255, 69, 69, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  backgroundColor: isHigh ? 'rgba(42, 17, 17, 0.35)' : 'rgba(20, 20, 22, 1)',
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  aspectRatio: '1.4', padding: '18px',
                  borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)',
                  background: 'rgba(20, 20, 22, 1)', overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: '0.02em' }}>{node.name}</span>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <motion.span
                    key={node.val}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      fontSize: '28px', fontWeight: 300, lineHeight: 1,
                      color: isHigh ? '#FF4545' : 'rgba(255,255,255,0.9)',
                    }}
                  >
                    {node.val}%
                  </motion.span>
                  {isHigh && <ShieldCheck style={{ width: '14px', height: '14px', color: '#FF4545', opacity: 0.5 }} />}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Alert box - sharp square corners, NO rounded pill */}
        <div style={{
          marginTop: '8px', padding: '16px 20px',
          background: 'linear-gradient(90deg, rgba(26,15,15,0.6) 0%, rgba(10,10,12,0.8) 100%)',
          border: '1px solid rgba(255,69,69,0.15)', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(255,69,69,0.5)', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.12em' }}>Alert</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: 500, letterSpacing: '0.02em' }}>Critical Overlap Detected</span>
          </div>
          {/* Square icon container instead of circle */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'rgba(255,69,69,0.08)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle style={{ width: '14px', height: '14px', color: '#FF4545' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertTriangle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  )
}

// --- Main Data Array ---

const features = [
  {
    icon: Flame,
    badge: 'FIRE Engine',
    link: '/fire',
    title: 'Rapidly Adjusts',
    titleSuffix: 'In Real-Time',
    description:
      'Not a static calculator. A living plan that recalculates your corpus, glidepath, and SIP targets instantly. Every number is completely deterministic.',
    component: FireVisual,
  },
  {
    icon: Calculator,
    badge: 'Tax Wizard',
    link: '/tax',
    title: 'Settles Old',
    titleSuffix: 'Vs New',
    description:
      'Step-by-step, fully traceable comparison. Finds every missed deduction — 80CCD(1B), NPS, HRA — and tells you exactly which regime saves you more.',
    component: TaxVisual,
  },
  {
    icon: PieChart,
    badge: 'Portfolio X-Ray',
    link: '/portfolio',
    title: 'Precision Focus',
    titleSuffix: 'Rebalancing',
    description:
      'Upload your statement. We scan every fund for overlapping assets, score XIRR, and execute STCG-aware rebalancing with exact timelines.',
    component: MFVisual,
  },
]

function FeatureRow({ feature, isReversed }) {
  const VisualComponent = feature.component

  return (
    <div style={{
      minHeight: '100svh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px',
    }}>
      {/* Outer glow behind the card */}
      <div style={{
        position: 'relative', width: '92%', maxWidth: '1600px',
      }}>
        <div style={{
          position: 'absolute', inset: '-40px', borderRadius: '60px',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(69,162,158,0.12) 0%, rgba(69,162,158,0.04) 40%, transparent 70%)',
          filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0,
        }} />

      {/* Full-page glassmorphism card */}
      <div style={{
        position: 'relative', width: '100%',
        minHeight: '82vh', borderRadius: '32px', overflow: 'hidden',
        border: '1px solid rgba(69,162,158,0.12)',
        background: 'linear-gradient(135deg, #10121a 0%, #0c0e14 50%, #0a0b10 100%)',
        boxShadow: '0 0 60px rgba(69,162,158,0.06), 0 30px 80px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', zIndex: 1,
      }}>
        {/* Corner glow — teal accent */}
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          width: '800px', height: '800px',
          filter: 'blur(180px)', opacity: 0.12,
          background: 'radial-gradient(circle, rgba(69,162,158,0.5) 0%, rgba(69,162,158,0.1) 50%, transparent 80%)',
          ...(isReversed
            ? { bottom: '-200px', left: '-200px' }
            : { top: '-200px', right: '-200px' }
          ),
        }} />
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          width: '600px', height: '600px',
          filter: 'blur(140px)', opacity: 0.15,
          background: THEME_BLUE,
          ...(isReversed
            ? { top: '-150px', right: '-150px' }
            : { bottom: '-150px', left: '-150px' }
          ),
        }} />

        {/* Content row - NO separator line between sides */}
        <div style={{
          position: 'relative', zIndex: 10, flex: 1,
          display: 'flex',
          flexDirection: isReversed ? 'row-reverse' : 'row',
          alignItems: 'stretch',
        }}>

          {/* TEXT SIDE - massive padding to keep content away from edges */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            paddingTop: '80px', paddingBottom: '80px',
            paddingLeft: isReversed ? '60px' : '120px',
            paddingRight: isReversed ? '120px' : '60px',
            position: 'relative',
          }}>
            {/* Teal gradient glow behind text */}
            <div style={{
              position: 'absolute', top: '40%', left: '45%',
              transform: 'translate(-50%, -50%)',
              width: '500px', height: '500px', borderRadius: '50%',
              filter: 'blur(140px)', pointerEvents: 'none',
              opacity: 0.18, background: 'radial-gradient(circle, rgba(69,162,158,0.6) 0%, rgba(69,162,158,0.15) 50%, transparent 80%)', zIndex: -1,
            }} />
            <div style={{
              position: 'absolute', top: '55%', left: '30%',
              transform: 'translate(-50%, -50%)',
              width: '300px', height: '300px', borderRadius: '50%',
              filter: 'blur(100px)', pointerEvents: 'none',
              opacity: 0.1, background: THEME_BLUE, zIndex: -1,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <h3 style={{
                fontSize: 'clamp(42px, 5vw, 72px)', fontWeight: 500,
                lineHeight: 1.05, letterSpacing: '-0.03em',
                color: 'rgba(255,255,255,0.95)', margin: 0,
              }}>
                {feature.title}<br />
                <span style={{ fontWeight: 700, color: 'white' }}>{feature.titleSuffix}</span>
              </h3>

              <p style={{
                fontSize: 'clamp(16px, 1.2vw, 20px)', lineHeight: 1.65,
                color: 'rgba(255,255,255,0.38)', fontWeight: 300,
                maxWidth: '480px', letterSpacing: '0.01em', margin: 0,
              }}>
                {feature.description}
              </p>

              <div style={{ paddingTop: '12px' }}>
                <a
                  href={feature.link}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '12px 26px', borderRadius: '100px',
                    fontSize: '14px', fontWeight: 500,
                    border: '1px solid rgba(69,162,158,0.35)',
                    background: 'rgba(69,162,158,0.1)',
                    color: '#45A29E',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 20px rgba(69,162,158,0.08)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(69,162,158,0.2)'; e.currentTarget.style.borderColor = 'rgba(69,162,158,0.55)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(69,162,158,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(69,162,158,0.1)'; e.currentTarget.style.borderColor = 'rgba(69,162,158,0.35)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(69,162,158,0.08)'; }}
                >
                  <span>Explore {feature.badge.split(' ')[0]}</span>
                  <ArrowRight style={{ width: '14px', height: '14px', opacity: 0.7 }} />
                </a>
              </div>
            </div>
          </div>

          {/* VISUAL SIDE - seamless background, no divider line */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '48px',
          }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>
              <div style={{
                position: 'absolute', inset: '-20px', borderRadius: '40px',
                background: 'radial-gradient(ellipse at 50% 40%, rgba(69,162,158,0.15) 0%, rgba(69,162,158,0.05) 50%, transparent 75%)',
                filter: 'blur(20px)', pointerEvents: 'none', zIndex: 0,
              }} />
              <div style={{
                position: 'relative', zIndex: 1,
                width: '100%',
                borderRadius: '20px', overflow: 'hidden',
                border: '1px solid rgba(69,162,158,0.15)',
                boxShadow: '0 4px 40px rgba(69,162,158,0.08), 0 24px 70px rgba(0,0,0,0.5)',
                background: 'linear-gradient(180deg, #151820 0%, #111418 50%, #0e1014 100%)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '14px 20px',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57', boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)' }} />
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FEBC2E', boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)' }} />
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28C840', boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.2)' }} />
                </div>
                <div style={{ background: 'transparent' }}>
                  <VisualComponent />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function FeatureZPattern() {
  return (
    <section id="features-section" style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', zIndex: 10, paddingTop: '20px', paddingBottom: '40px' }}>
      {features.map((feature, i) => (
        <FeatureRow key={feature.badge} feature={feature} isReversed={i % 2 !== 0} />
      ))}
    </section>
  )
}

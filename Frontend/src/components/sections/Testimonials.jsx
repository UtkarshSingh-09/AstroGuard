import { useState, useEffect, useRef } from 'react'

const testimonials = [
  {
    quote: "AstraGuard completely changed how I think about my SIPs. During the March correction, I would have panic-sold everything — but the behavioral intercept stopped me. My portfolio recovered 23% in 6 weeks.",
    name: "Raghav Mehta",
    role: "Software Engineer @ Flipkart",
    initials: "RM",
  },
  {
    quote: "The Tax Matrix alone saved me ₹68,000 last year. I had no idea I was missing NPS deductions under the old regime. The side-by-side comparison made the decision obvious in seconds.",
    name: "Priya Sundaram",
    role: "Product Manager @ Razorpay",
    initials: "PS",
  },
  {
    quote: "I've used every retirement calculator out there. AstraGuard's FIRE Planner is the first one that actually adjusts in real-time when I change assumptions. The stress test feature is genuinely brilliant.",
    name: "Ankur Desai",
    role: "VP Engineering @ Zerodha",
    initials: "AD",
  },
  {
    quote: "Portfolio X-Ray found 72% overlap between my mutual funds that no advisor ever caught. The rebalancing suggestions were specific, actionable, and saved me from unnecessary STCG tax hits.",
    name: "Meera Krishnan",
    role: "Data Scientist @ Google India",
    initials: "MK",
  },
  {
    quote: "The onboarding felt like talking to a financial therapist who actually understands behavioral finance. It extracted my risk profile in 3 minutes — more accurately than my CA of 10 years.",
    name: "Sahil Bhargava",
    role: "Founder @ TechStash",
    initials: "SB",
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const intervalRef = useRef(null)

  const startAutoplay = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActive(p => (p + 1) % testimonials.length)
    }, 5000)
  }

  useEffect(() => {
    startAutoplay()
    return () => clearInterval(intervalRef.current)
  }, [])

  const goTo = (i) => {
    setActive(i)
    startAutoplay()
  }

  const t = testimonials[active]

  return (
    <section style={{
      position: 'relative', width: '100%',
      padding: '100px 24px 120px', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '12px', marginBottom: '60px',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '100px',
          background: 'rgba(69,162,158,0.08)',
          border: '1px solid rgba(69,162,158,0.2)',
          fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em',
          color: '#45A29E', textTransform: 'uppercase',
        }}>
          Testimonials
        </span>
        <h2 style={{
          fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 600,
          color: 'white', textAlign: 'center', letterSpacing: '-0.03em',
          lineHeight: 1.15, margin: 0,
        }}>
          Trusted by <span style={{ color: '#45A29E' }}>Real Investors</span>
        </h2>
      </div>

      <div style={{
        position: 'relative', width: '100%', maxWidth: '900px',
      }}>
        <div style={{
          position: 'absolute', inset: '-30px', borderRadius: '50px',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(69,162,158,0.12) 0%, rgba(69,162,158,0.03) 50%, transparent 75%)',
          filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          borderRadius: '28px', overflow: 'hidden',
          border: '1px solid rgba(69,162,158,0.15)',
          background: 'linear-gradient(180deg, #13161e 0%, #0f1117 50%, #0c0e14 100%)',
          boxShadow: '0 4px 60px rgba(69,162,158,0.06), 0 30px 80px rgba(0,0,0,0.4)',
          padding: '60px 48px 48px',
          minHeight: '320px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '400px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(69,162,158,0.18) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />

          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(69,162,158,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div
            key={active}
            style={{
              position: 'relative', zIndex: 2,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '28px',
              animation: 'fadeSlideIn 0.5s ease forwards',
            }}
          >
            <svg style={{ width: 40, height: 32, opacity: 0.15 }} viewBox="0 0 40 32" fill="white">
              <path d="M0 32V19.2C0 13.87 1.07 9.6 3.2 6.4 5.33 3.2 8.8 0.93 13.6 0l2.4 5.6c-3.2.8-5.47 2.27-6.8 4.4-1.33 2.13-2 4.67-2 7.6h6.8V32H0zm22 0V19.2c0-5.33 1.07-9.6 3.2-12.8C27.33 3.2 30.8.93 35.6 0L38 5.6c-3.2.8-5.47 2.27-6.8 4.4-1.33 2.13-2 4.67-2 7.6h6.8V32H22z"/>
            </svg>

            <p style={{
              fontSize: 'clamp(17px, 1.4vw, 22px)', lineHeight: 1.7,
              color: 'rgba(255,255,255,0.85)', fontWeight: 400,
              maxWidth: '700px', margin: 0, letterSpacing: '0.01em',
              fontStyle: 'italic',
            }}>
              {t.quote}
            </p>

            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px', marginTop: '8px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #45A29E 0%, #3d9490 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 700, color: 'white',
                boxShadow: '0 0 20px rgba(69,162,158,0.25)',
              }}>
                {t.initials}
              </div>
              <span style={{
                fontSize: '16px', fontWeight: 600, color: '#45A29E',
                letterSpacing: '0.02em',
              }}>
                {t.name}
              </span>
              <span style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.03em',
              }}>
                {t.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', gap: '10px', marginTop: '36px',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === active ? '32px' : '10px',
              height: '10px', borderRadius: '100px', border: 'none',
              background: i === active ? '#45A29E' : 'rgba(255,255,255,0.12)',
              cursor: 'pointer', transition: 'all 0.3s ease',
              boxShadow: i === active ? '0 0 12px rgba(69,162,158,0.4)' : 'none',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}

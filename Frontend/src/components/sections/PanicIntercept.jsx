import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MessageCircle, TrendingDown, Shield, Bell } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function PanicIntercept() {
  const containerRef = useRef(null)
  const phoneRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })

      // Phone moves from center to left and rotates
      tl.fromTo(
        phoneRef.current,
        { x: '0vw', rotationY: 0, scale: 0.9, opacity: 0 },
        { x: '0vw', rotationY: 0, scale: 1, opacity: 1, duration: 0.3 }
      )
      tl.to(phoneRef.current, {
        x: '-25vw',
        rotationY: 360,
        duration: 1,
        ease: 'power2.inOut',
      })

      // Text fades in on the right
      tl.fromTo(
        textRef.current,
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-void"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Phone Mockup */}
        <div
          ref={phoneRef}
          className="relative flex-shrink-0"
          style={{ perspective: '1200px' }}
        >
          <div className="w-[280px] md:w-[320px] h-[560px] md:h-[640px] rounded-[3rem] border-2 border-white/15 bg-glass-surface/60 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(69,162,158,0.15)] relative">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-void rounded-b-2xl z-20" />

            {/* Phone Screen Content */}
            <div className="absolute inset-0 p-4 pt-12 flex flex-col">
              {/* Status bar */}
              <div className="flex justify-between items-center text-[10px] text-text-slate mb-4 px-2">
                <span>9:41</span>
                <div className="flex gap-1.5">
                  <div className="w-4 h-2 border border-text-slate/50 rounded-sm">
                    <div className="w-2/3 h-full bg-accent-teal rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Stock Chart Mockup */}
              <div className="bg-white/5 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">NIFTY 50</span>
                  <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -4.2%
                  </span>
                </div>
                {/* Mini chart SVG */}
                <svg viewBox="0 0 200 60" className="w-full h-12">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(239,68,68,0.3)" />
                      <stop offset="100%" stopColor="rgba(239,68,68,0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,15 Q20,10 40,12 T80,20 T120,35 T160,40 T200,55"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,15 Q20,10 40,12 T80,20 T120,35 T160,40 T200,55 L200,60 L0,60 Z"
                    fill="url(#chartGrad)"
                  />
                </svg>
                <p className="text-[10px] text-text-slate mt-1">Intraday • 3:45 PM IST</p>
              </div>

              {/* WhatsApp Notification */}
              <div className="mt-auto space-y-2">
                {/* Notification card */}
                <div className="bg-[#1a2e1a] rounded-xl p-3 border border-green-900/50 animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-400">AstraGuard Alert</p>
                      <p className="text-[10px] text-text-slate">via WhatsApp • now</p>
                    </div>
                    <Bell className="w-3.5 h-3.5 text-green-400 ml-auto" />
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed">
                    🚨 Nifty dropped 4.2% today. If you stop your ₹45K SIP now, your{' '}
                    <span className="text-accent-gold font-semibold">retirement delays by 2.3 years</span>
                    {' '}and you'll need ₹18.4L extra. Stay the course.
                  </p>
                </div>

                {/* Second message */}
                <div className="bg-[#1a2e1a]/60 rounded-xl p-3 border border-green-900/30">
                  <p className="text-xs text-white/80 leading-relaxed">
                    📊 Historical context: In 2020 crash, investors who held recovered 95% within 18 months.
                    Your FIRE score: <span className="text-accent-teal font-semibold">72/100</span>. Stay strong.
                  </p>
                </div>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Text Content (right side) */}
        <div ref={textRef} className="absolute right-8 md:right-16 lg:right-24 max-w-lg opacity-0">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-400">Behavioral Guard</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              We Intercept<br />
              <span className="text-accent-gold font-serif italic">the Panic.</span>
            </h2>
            <p className="text-text-slate text-lg leading-relaxed">
              When markets crash, 128% of SIPs get stopped. AstraGuard doesn't send generic
              "stay calm" messages. It calculates{' '}
              <span className="text-white font-semibold">your exact personal consequence</span>
              {' '}and delivers it to your WhatsApp before you make the mistake.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Real-time Nifty Monitoring', 'Personalized Consequence', 'WhatsApp Delivery'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-sm rounded-full bg-white/5 border border-white/10 text-text-slate">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-teal/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-accent-gold/5 blur-[100px] rounded-full pointer-events-none" />
    </section>
  )
}

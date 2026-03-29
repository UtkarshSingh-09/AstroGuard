import { Link } from 'react-router-dom'
import {
  CheckCircle,
  Activity,
  Flame,
  FileText,
  PieChart,
  Target,
  Zap,
  ArrowUpRight,
  TrendingUp,
  IndianRupee,
  CalendarDays,
  BarChart3,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { api } from '../services/api'
import { getActiveUserId } from '../services/session'
import { useState, useEffect } from 'react'

function KpiCard({ icon: Icon, iconColor, iconBg, label, value, sub, badge, badgeColor }) {
  return (
    <div style={{ padding: '32px 28px' }}
      className="flex flex-col rounded-2xl border border-white/[0.09] bg-[#111318] gap-8 hover:border-white/[0.16] transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={1.75} />
        </div>
        {badge && (
          <span className={`flex items-center gap-1.5 text-[12px] font-semibold rounded-full px-3 py-1.5 ${badgeColor}`}>
            <TrendingUp className="h-3.5 w-3.5" />
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold text-[#94A3B8] tracking-widest uppercase">{label}</p>
        <p className="text-[34px] font-bold text-white leading-none tracking-tight">{value}</p>
        {sub && <p className="text-[13px] text-[#94A3B8]/70 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function ProgressRing({ valuePct, score, max }) {
  const r = 74
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, Math.max(0, valuePct)) / 100) * circ
  const sz = 192
  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: sz, height: sz }}>
      <svg width={sz} height={sz} className="-rotate-90" aria-hidden>
        <circle cx={sz / 2} cy={sz / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
        <circle cx={sz / 2} cy={sz / 2} r={r}
          stroke="url(#ringGrad)" strokeWidth="10" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.22,1,.36,1)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#45A29E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[48px] font-bold text-white tabular-nums leading-none">{score}</span>
        <span className="text-[13px] text-[#94A3B8] mt-2">of {max}</span>
      </div>
    </div>
  )
}

const feed = [
  {
    icon: CheckCircle, iconColor: 'text-[#45A29E]', iconBg: 'bg-[#45A29E]/12',
    tag: 'Milestone', tagColor: 'text-[#45A29E] bg-[#45A29E]/12',
    title: 'Discipline milestone',
    body: "127-day SIP streak — you're in the top 8% of all users.",
    time: 'Just now',
  },
  {
    icon: Activity, iconColor: 'text-[#94A3B8]', iconBg: 'bg-white/[0.06]',
    tag: 'Market', tagColor: 'text-[#94A3B8] bg-white/[0.06]',
    title: 'Market check complete',
    body: 'Nifty 50 is flat today. No behavioral intervention scheduled.',
    time: '09:18 IST',
  },
  {
    icon: BarChart3, iconColor: 'text-amber-400', iconBg: 'bg-amber-400/10',
    tag: 'Alert', tagColor: 'text-amber-400 bg-amber-400/10',
    title: 'Rebalancing opportunity',
    body: 'Large-cap overlap detected across 2 funds in your portfolio.',
    time: 'Yesterday',
  },
]

const engines = [
  { to: '/fire', icon: Flame, title: 'FIRE Planner', desc: 'Retire at 50', badge: 'On track', badgeStyle: 'text-[#45A29E] bg-[#45A29E]/10', href: true },
  { to: '/tax', icon: FileText, title: 'Tax Optimizer', desc: '₹31,200 saved', badge: 'Act now', badgeStyle: 'text-sky-400 bg-sky-400/10', href: true },
  { to: '/portfolio?view=xray', icon: PieChart, title: 'Portfolio X-Ray', desc: 'Overlap found', badge: 'Review', badgeStyle: 'text-amber-400 bg-amber-400/10', href: true },
  { icon: Target, title: 'Emergency Fund', desc: '6-mo runway', badge: '40% done', badgeStyle: 'text-[#94A3B8] bg-white/[0.06]', href: false },
]

export default function DashboardPage() {
  const [simulating, setSimulating] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getUserProfile(getActiveUserId())
        setProfile(res.data)
      } catch (e) {
        console.warn('Failed to load profile, using defaults', e)
      }
    }
    load()
  }, [])

  const userName = profile?.name || getActiveUserId()
  const portfolioValue = profile?.portfolio_value || 0
  const annualSalary = profile?.annual_salary || 0
  const fireSummary = profile?.fire_summary || {}
  const taxSummary = profile?.tax_summary || {}
  const monthlySip = profile?.monthly_sip || (profile?.annual_salary ? profile?.annual_salary * 0.1 / 12 : 0)
  const xirr = (profile?.xirr === 0 || profile?.xirr == null) ? 12.4 : profile?.xirr
  const arthScore = profile?.arth_score?.total ?? profile?.arth_score?.score ?? (typeof profile?.arth_score === "number" ? profile?.arth_score : 0)
  const scoreMax = profile?.arth_score?.max || 1000
  const score = Math.min(arthScore, scoreMax) || 0
  const pct = (score / scoreMax) * 100

  const formatL = (n) => {
    if (!n) return '₹0'
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    return `₹${Math.round(n).toLocaleString('en-IN')}`
  }

  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-white font-sans">
      {/* Outer shell — always 80px left/right breathing room */}
      <div style={{ padding: '56px 80px' }} className="flex flex-col gap-12">

        {/* Page heading */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[34px] font-bold text-white tracking-tight leading-tight">{greeting}, {userName}</h1>
            <p className="text-[16px] text-[#94A3B8] mt-3">Your portfolio is performing well — here's your daily snapshot.</p>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-[#94A3B8]/70 bg-white/[0.03] border border-white/[0.07] rounded-xl shrink-0"
            style={{ padding: '12px 20px' }}>
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{today}</span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          <KpiCard icon={IndianRupee} iconColor="text-[#45A29E]" iconBg="bg-[#45A29E]/12"
            label={portfolioValue > 0 ? "Portfolio Value" : "Annual Salary"} value={formatL(portfolioValue || annualSalary)} sub={portfolioValue > 0 ? "Across investments" : "From Form 16"}
            badge={portfolioValue > 0 ? 'Active' : '--'} badgeColor="text-emerald-400 bg-emerald-400/10" />
          <KpiCard icon={TrendingUp} iconColor="text-sky-400" iconBg="bg-sky-400/10"
            label="Monthly SIP" value={monthlySip ? `₹${Math.round(monthlySip).toLocaleString('en-IN')}` : '--'} sub={monthlySip ? 'Active SIP' : 'No SIP data'}
            badge={monthlySip ? 'Active' : '--'} badgeColor="text-sky-400 bg-sky-400/10" />
          <KpiCard icon={BarChart3} iconColor="text-violet-400" iconBg="bg-violet-400/10"
            label="XIRR Returns" value={xirr != null ? `${xirr}%` : '--'} sub="Annualised since inception"
            badge={xirr != null ? `${xirr > 0 ? '+' : ''}${xirr}%` : '--'} badgeColor="text-emerald-400 bg-emerald-400/10" />
          <KpiCard icon={Zap} iconColor="text-amber-400" iconBg="bg-amber-400/10"
            label="Arth Score" value={score || '--'} sub={score ? `Out of ${scoreMax}` : 'Complete onboarding'}
            badge={score ? `${score} pts` : '--'} badgeColor="text-emerald-400 bg-emerald-400/10" />
        </div>

        {/* Arth Score + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">

          {/* Score */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111318] flex flex-col gap-10" style={{ padding: '40px 36px' }}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8] mb-3">Arth Score</p>
              <h2 className="text-[20px] font-semibold text-white">Behaviour &amp; plan adherence</h2>
            </div>
            <ProgressRing valuePct={pct} score={score} max={scoreMax} />
            <div className="flex flex-col gap-7">
              {[
                { label: 'SIP discipline', pct: 92, color: 'bg-[#45A29E]' },
                { label: 'Goal adherence', pct: 78, color: 'bg-sky-400' },
                { label: 'Risk alignment', pct: 85, color: 'bg-violet-400' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] text-[#94A3B8]">{item.label}</span>
                    <span className="text-[14px] font-semibold text-white tabular-nums">{item.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06]">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-[#94A3B8] text-center border-t border-white/[0.06]" style={{ paddingTop: '28px' }}>
              <span className="text-[#45A29E] font-semibold">+12 pts</span> vs last month — excellent discipline
            </p>
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111318] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06]" style={{ padding: '28px 36px' }}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8] mb-2">Activity Feed</p>
                <h2 className="text-[20px] font-semibold text-white">Recent signals &amp; milestones</h2>
              </div>
              <div className="flex items-center gap-2.5 rounded-full border border-[#45A29E]/20 bg-[#45A29E]/8"
                style={{ padding: '8px 16px' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45A29E] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#45A29E]" />
                </span>
                <span className="text-[12px] font-semibold text-[#45A29E]">Live</span>
              </div>
            </div>
            <ul className="flex flex-col divide-y divide-white/[0.05] flex-1">
              {feed.map(item => {
                const Icon = item.icon
                return (
                  <li key={item.title} className="flex gap-6 hover:bg-white/[0.02] transition-colors" style={{ padding: '28px 36px' }}>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                      <Icon className={`h-6 w-6 ${item.iconColor}`} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg ${item.tagColor}`}>{item.tag}</span>
                        <span className="text-[12px] text-[#94A3B8]/55 tabular-nums ml-auto shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[16px] font-semibold text-white">{item.title}</p>
                      <p className="text-[14px] text-[#94A3B8] leading-relaxed">{item.body}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Engines & Goals */}
        <div>
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8] mb-2">Modules</p>
              <h2 className="text-[20px] font-semibold text-white">Engines &amp; goals</h2>
            </div>
            <span className="text-[13px] text-[#94A3B8]/55">4 active</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {engines.map(e => {
              const Icon = e.icon
              const inner = (
                <div className="flex flex-col gap-8 h-full" style={{ padding: '32px 28px' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]"
                      style={{ height: 52, width: 52 }}>
                      <Icon className="h-6 w-6 text-white/65" strokeWidth={1.5} />
                    </div>
                    {e.href && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] group-hover:bg-[#45A29E]/15 transition-colors">
                        <ArrowUpRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#45A29E] transition-colors" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-white mb-2">{e.title}</h3>
                    <p className="text-[14px] text-[#94A3B8]">{e.desc}</p>
                  </div>
                  <div className="border-t border-white/[0.06]" style={{ paddingTop: 20 }}>
                    <span className={`inline-flex items-center rounded-lg text-[11px] font-bold uppercase tracking-wider ${e.badgeStyle}`}
                      style={{ padding: '8px 14px' }}>
                      {e.badge}
                    </span>
                  </div>
                </div>
              )
              return e.href ? (
                <Link key={e.title} to={e.to}
                  className="group block rounded-2xl border border-white/[0.08] bg-[#111318] transition-all duration-200 hover:border-[#45A29E]/30 hover:bg-[#45A29E]/[0.02]">
                  {inner}
                </Link>
              ) : (
                <div key={e.title} className="rounded-2xl border border-white/[0.08] bg-[#111318]">{inner}</div>
              )
            })}
          </div>
        </div>

        {/* Behavioral guard */}
        <div className="rounded-2xl border border-rose-500/15 bg-[#100d0d] flex flex-col sm:flex-row sm:items-center gap-8"
          style={{ padding: '36px 40px' }}>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-500/12 border border-rose-500/20">
            <Zap className="h-7 w-7 text-rose-400" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-bold text-white mb-2">Behavioral Guard — Demo mode</h2>
            <p className="text-[14px] text-[#94A3B8] leading-relaxed max-w-2xl">
              Simulate a sharp Nifty drawdown to trigger the panic-intercept flow. In production, this fires a real-time WhatsApp alert when your portfolio drops beyond your threshold.
            </p>
          </div>
          <button type="button"
            onClick={async () => {
              try {
                setSimulating(true)
                const res = await api.simulateIntervention('user_123', 15.0)
                if (res.data?.whatsapp_sent) {
                  alert("Simulation triggered! WhatsApp alert sent: " + JSON.stringify(res.data.intervention_message?.whatsapp_message))
                } else {
                  alert("Simulation triggered: " + JSON.stringify(res.data))
                }
              } catch (err) {
                console.error(err)
                alert("Failed to simulate. Ensure backend is running.")
              } finally {
                setSimulating(false)
              }
            }}
            disabled={simulating}
            className={`shrink-0 flex items-center gap-3 rounded-xl text-white text-[15px] font-semibold transition-colors whitespace-nowrap ${simulating ? 'bg-rose-600/50 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500'}`}
            style={{ padding: '16px 28px' }}>
            {simulating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Triggering...
              </>
            ) : (
              <>
                Simulate drawdown
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

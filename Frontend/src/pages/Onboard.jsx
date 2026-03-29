import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Sparkles, Shield, Play, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import { getActiveUserId } from '../services/session'

function formatINR(num) {
  if (num == null || isNaN(num)) return 'Rs 0'
  const abs = Math.abs(Math.round(num))
  const sign = num < 0 ? '-' : ''
  const str = abs.toString()
  if (str.length <= 3) return sign + 'Rs ' + str
  let lastThree = str.slice(-3)
  let rest = str.slice(0, -3)
  if (rest.length > 0) lastThree = ',' + lastThree
  return sign + 'Rs ' + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

function getIntervention(payload) {
  return payload?.intervention || payload?.behavioral_intervention || payload?.guardrails?.intervention || ''
}

function isProfileComplete(data) {
  const status = String(data?.status || data?.state || '').toLowerCase().trim()
  const pct = Number(data?.completion_percentage ?? data?.progress ?? 0)
  const responseText = String(data?.response || data?.next_question || '').toLowerCase()
  const hasDna = !!(data?.financial_dna && data?.behavioral_dna)
  const completionCue =
    responseText.includes('complete picture') ||
    responseText.includes('run the financial simulations') ||
    responseText.includes('run financial simulations')
  return (
    status === 'complete' ||
    status === 'completed' ||
    status === 'done' ||
    status === 'finished' ||
    pct >= 100 ||
    hasDna ||
    completionCue
  )
}

export default function Onboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const chatEndRef = useRef(null)
  const bootstrappedRef = useRef(false)
  const idRef = useRef(1)
  const nextId = () => {
    const n = idRef.current
    idRef.current += 1
    return `m-${n}`
  }

  const userId = getActiveUserId()
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 10))

  const scannerState = location?.state || {}
  const fromFileScanner = scannerState?.source === 'file-scanner'
  const casUpload = scannerState?.casUpload || null
  const form16Upload = scannerState?.form16Upload || null

  const combinedSummary = useMemo(() => {
    if (!fromFileScanner || !casUpload || !form16Upload) return ''
    const salary = form16Upload?.extraction?.financial_dna?.salary?.annual_salary || form16Upload?.extraction?.salary || null
    const regime = form16Upload?.tax_analysis?.recommended_regime || form16Upload?.tax_analysis?.regime || 'ANALYZED'
    const mfValue = casUpload?.summary?.total_valuation || casUpload?.portfolio_analysis?.total_valuation || null
    const salaryText = salary ? `a base salary of ${formatINR(salary)}` : 'salary details'
    const mfText = mfValue ? `an active mutual fund portfolio worth ${formatINR(mfValue)}` : 'an active mutual fund portfolio'
    return `I have successfully parsed your CAS and Form 16. I see ${salaryText} and ${mfText}. You are currently in the ${regime} tax regime. Shall we run the financial simulations?`
  }, [fromFileScanner, casUpload, form16Upload])

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => {
    if (combinedSummary) return [{ id: 'm-0', sender: 'bot', text: combinedSummary }]
    return [{
      id: 'm-0',
      sender: 'bot',
      text: "Hi - I am AstraGuard AI. I will build your Financial DNA profile. Send your first answer to begin.",
    }]
  })
  const [completionPct, setCompletionPct] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const [engineLoading, setEngineLoading] = useState({ tax: false, fire: false, xray: false })
  const [engineResult, setEngineResult] = useState({ tax: null, fire: null, xray: null })
  const [engineIntervention, setEngineIntervention] = useState({ tax: '', fire: '', xray: '' })
  const [engineError, setEngineError] = useState({ tax: '', fire: '', xray: '' })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, engineResult])

  const appendBot = (text) => {
    if (!text) return
    setMessages((prev) => [...prev, { id: nextId(), sender: 'bot', text }])
  }

  const callChatLikeEndpoint = async (history, message = '') => {
    try {
      const res = await api.chat(userId, sessionId, message, history)
      return res.data
    } catch (err) {
      const status = err?.response?.status
      if (status === 404 || status === 405 || status === 422) {
        const fallback = await api.onboard(userId, sessionId, history)
        return fallback.data
      }
      throw err
    }
  }

  useEffect(() => {
    if (!fromFileScanner || !casUpload || !form16Upload || bootstrappedRef.current) return
    bootstrappedRef.current = true
    const bootstrap = async () => {
      setIsTyping(true)
      try {
        const data = await callChatLikeEndpoint([])
        setCompletionPct(data?.completion_percentage || 0)
        appendBot(data?.response || data?.next_question || 'Tell me your next financial detail so I can complete your profile.')
        if (isProfileComplete(data)) {
          setIsDone(true)
          appendBot('Profile complete. You can now run Tax, FIRE, or Portfolio X-Ray.')
        }
      } catch (err) {
        appendBot("I parsed your documents, but could not fetch the next question yet. Please send any message and I will continue.")
      } finally {
        setIsTyping(false)
      }
    }
    bootstrap()
  }, [fromFileScanner, casUpload, form16Upload])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isTyping) return
    const intent = trimmed.toLowerCase()
    if (intent.includes('tax simulator') || intent.includes('run tax') || intent.includes('run my tax')) {
      setInput('')
      await runEngine('tax')
      return
    }
    if (intent.includes('fire') || intent.includes('retirement age')) {
      setInput('')
      await runEngine('fire')
      return
    }
    if (intent.includes('xray') || intent.includes('x-ray') || intent.includes('portfolio')) {
      setInput('')
      await runEngine('xray')
      return
    }
    const userMsg = { id: nextId(), sender: 'user', text: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setIsTyping(true)

    try {
      const history = nextMessages
        .filter((m) => m.id !== 'm-0')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }))

      const data = await callChatLikeEndpoint(history, trimmed)
      setCompletionPct(data?.completion_percentage || 0)
      appendBot(data?.response || data?.next_question || 'Noted. Please continue.')
      if (isProfileComplete(data)) {
        setIsDone(true)
        appendBot('Profile complete. You can now run Tax, FIRE, or Portfolio X-Ray.')
      }
    } catch (err) {
      appendBot('Sorry, I had trouble connecting to backend. Please retry.')
    } finally {
      setIsTyping(false)
    }
  }

  const runEngine = async (type) => {
    setEngineLoading((p) => ({ ...p, [type]: true }))
    setEngineError((p) => ({ ...p, [type]: '' }))
    try {
      let data
      if (type === 'tax') {
        const res = await api.runTax(userId)
        data = res.data
      } else if (type === 'fire') {
        const res = await api.runFIREByUser(userId)
        data = res.data
      } else {
        const res = await api.runPortfolioXray(userId)
        data = res.data
      }
      setEngineResult((p) => ({ ...p, [type]: data }))
      setEngineIntervention((p) => ({ ...p, [type]: getIntervention(data) }))
      appendBot(data?.narration || data?.response || `${type.toUpperCase()} simulation complete.`)
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Unknown error'
      setEngineError((p) => ({ ...p, [type]: msg }))
    } finally {
      setEngineLoading((p) => ({ ...p, [type]: false }))
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const tax = engineResult.tax
  const fire = engineResult.fire
  const xray = engineResult.xray

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(69,162,158,0.12) 0%, transparent 65%)' }}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: 900, padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
          style={{ gap: 16, marginBottom: 24 }}
        >
          <div className="flex items-center justify-center rounded-2xl bg-[#45A29E]/15 border border-[#45A29E]/25" style={{ height: 56, width: 56 }}>
            <Shield className="text-[#45A29E]" style={{ height: 28, width: 28 }} strokeWidth={1.75} />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-white tracking-tight" style={{ fontSize: 24 }}>Financial DNA Extraction</h1>
            <p className="text-[#94A3B8]" style={{ fontSize: 14, marginTop: 8 }}>Complete profile, then run specialist engines</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex items-center w-full"
          style={{ marginBottom: 20 }}
        >
          <div className="flex-1 rounded-full bg-white/[0.04] overflow-hidden border border-white/10" style={{ height: 8 }}>
            <div className="h-full bg-[#45A29E] transition-all duration-700 ease-out" style={{ width: `${Math.max(5, completionPct)}%` }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-2xl border border-white/[0.08] bg-[#0f1014] overflow-hidden shadow-2xl flex flex-col"
          style={{ minHeight: 620 }}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] shrink-0" style={{ padding: '20px 24px' }}>
            <span className="font-semibold uppercase text-[#94A3B8]" style={{ fontSize: 11, letterSpacing: '0.14em' }}>
              {isDone ? 'Profile complete' : 'Gathering DNA'}
            </span>
            <span className="font-semibold text-[#45A29E] tabular-nums" style={{ fontSize: 13 }}>{Math.round(completionPct)}%</span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ padding: '20px 24px', gap: 18 }}>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className={`flex w-full ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.sender === 'bot' ? (
                    <div className="flex items-start" style={{ gap: 12, maxWidth: '90%' }}>
                      <div className="shrink-0 rounded-full bg-[#45A29E]/12 border border-[#45A29E]/25 flex items-center justify-center" style={{ height: 34, width: 34, marginTop: 2 }}>
                        <Sparkles className="text-[#45A29E]" style={{ height: 16, width: 16 }} strokeWidth={1.75} />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-[#1a1d24] border border-white/[0.07] text-white whitespace-pre-line" style={{ padding: '14px 16px', fontSize: 14, lineHeight: 1.6 }}>
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tr-sm bg-[#45A29E]/12 border border-[#45A29E]/20 text-white" style={{ padding: '14px 16px', fontSize: 14, lineHeight: 1.6, maxWidth: '80%' }}>
                      {msg.text}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex items-center text-[#94A3B8]" style={{ gap: 10 }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span style={{ fontSize: 13 }}>Thinking...</span>
              </div>
            )}

            {isDone && (
              <div className="rounded-xl border border-white/[0.1] bg-[#141720]" style={{ padding: '14px' }}>
                <p className="text-white font-semibold" style={{ fontSize: 14, marginBottom: 10 }}>
                  Onboarding complete. Main dashboard unlocked.
                </p>
                <div className="flex flex-wrap" style={{ gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-lg bg-[#45A29E]/15 border border-[#45A29E]/35 text-[#45A29E] font-semibold hover:bg-[#45A29E]/25 disabled:opacity-50"
                    style={{ padding: '10px 12px', fontSize: 13 }}
                  >
                    <span className="inline-flex items-center" style={{ gap: 8 }}>
                      <Play className="h-4 w-4" />
                      Open Main Dashboard
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/tax')}
                    className="rounded-lg bg-[#45A29E]/15 border border-[#45A29E]/35 text-[#45A29E] font-semibold hover:bg-[#45A29E]/25 disabled:opacity-50"
                    style={{ padding: '10px 12px', fontSize: 13 }}
                  >
                    Open Tax Optimizer
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/fire')}
                    className="rounded-lg bg-[#45A29E]/15 border border-[#45A29E]/35 text-[#45A29E] font-semibold hover:bg-[#45A29E]/25 disabled:opacity-50"
                    style={{ padding: '10px 12px', fontSize: 13 }}
                  >
                    Open FIRE Planner
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/portfolio?view=xray')}
                    className="rounded-lg bg-[#45A29E]/15 border border-[#45A29E]/35 text-[#45A29E] font-semibold hover:bg-[#45A29E]/25 disabled:opacity-50"
                    style={{ padding: '10px 12px', fontSize: 13 }}
                  >
                    Open Portfolio X-Ray
                  </button>
                </div>
              </div>
            )}

            {tax && (
              <div className="rounded-xl border border-white/[0.1] bg-[#141720]" style={{ padding: 14 }}>
                {engineIntervention.tax && (
                  <div className="rounded-lg border border-orange-400/40 bg-orange-500/10 text-orange-300 animate-pulse" style={{ padding: '10px 12px', marginBottom: 10, fontSize: 12 }}>
                    {engineIntervention.tax}
                  </div>
                )}
                <p className="text-white font-semibold" style={{ fontSize: 14, marginBottom: 8 }}>Tax Result</p>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 8 }}>
                  <div className="rounded-lg border border-white/[0.08] bg-black/30" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Old Regime</p>
                    <p className="text-white font-bold">{formatINR(tax?.calculation?.old_regime?.total_tax)}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/30" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>New Regime</p>
                    <p className="text-white font-bold">{formatINR(tax?.calculation?.new_regime?.total_tax)}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/30" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Savings</p>
                    <p className="text-[#45A29E] font-bold">{formatINR(tax?.calculation?.comparison?.savings_with_optimal)}</p>
                  </div>
                </div>
                {engineError.tax && <p className="text-rose-400" style={{ fontSize: 12, marginTop: 8 }}>{engineError.tax}</p>}
              </div>
            )}

            {fire && (
              <div className="rounded-xl border border-white/[0.1] bg-[#141720]" style={{ padding: 14 }}>
                {engineIntervention.fire && (
                  <div className="rounded-lg border border-orange-400/40 bg-orange-500/10 text-orange-300 animate-pulse" style={{ padding: '10px 12px', marginBottom: 10, fontSize: 12 }}>
                    {engineIntervention.fire}
                  </div>
                )}
                <p className="text-white font-semibold" style={{ fontSize: 14, marginBottom: 8 }}>FIRE Result</p>
                <div className="rounded-lg border border-[#45A29E]/30 bg-[#45A29E]/10" style={{ padding: 12 }}>
                  <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Projected Retirement Age</p>
                  <p className="text-[#45A29E] font-bold" style={{ fontSize: 26 }}>
                    {fire?.calculation?.projected_retirement_age ?? '--'}
                  </p>
                </div>
                {engineError.fire && <p className="text-rose-400" style={{ fontSize: 12, marginTop: 8 }}>{engineError.fire}</p>}
              </div>
            )}

            {xray && (
              <div className="rounded-xl border border-white/[0.1] bg-[#141720]" style={{ padding: 14 }}>
                {engineIntervention.xray && (
                  <div className="rounded-lg border border-orange-400/40 bg-orange-500/10 text-orange-300 animate-pulse" style={{ padding: '10px 12px', marginBottom: 10, fontSize: 12 }}>
                    {engineIntervention.xray}
                  </div>
                )}
                <p className="text-white font-semibold" style={{ fontSize: 14, marginBottom: 8 }}>Portfolio X-Ray</p>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 8, marginBottom: 10 }}>
                  <div className="rounded-lg border border-white/[0.08] bg-black/30" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Total Value</p>
                    <p className="text-white font-bold">{formatINR(xray?.analysis?.total_value)}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/30" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Equity</p>
                    <p className="text-white font-bold">{xray?.analysis?.equity_percentage ?? 0}%</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/30" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Debt</p>
                    <p className="text-white font-bold">{xray?.analysis?.debt_percentage ?? 0}%</p>
                  </div>
                </div>
                {!!xray?.analysis?.red_flags?.length && (
                  <div className="rounded-lg border border-rose-500/35 bg-rose-500/10" style={{ padding: 10 }}>
                    <p className="text-rose-300 font-semibold" style={{ fontSize: 12, marginBottom: 6 }}>Red Flags</p>
                    {xray.analysis.red_flags.map((flag, idx) => (
                      <p key={`flag-${idx}`} className="text-rose-200" style={{ fontSize: 12, lineHeight: 1.5 }}>
                        - {flag}
                      </p>
                    ))}
                  </div>
                )}
                {engineError.xray && <p className="text-rose-400" style={{ fontSize: 12, marginTop: 8 }}>{engineError.xray}</p>}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-white/[0.06] bg-[#0b0d10] shrink-0" style={{ padding: '16px 24px' }}>
            <div
              className="flex items-center rounded-xl border transition-all duration-200 border-white/[0.1] bg-[#141720] focus-within:border-[#45A29E]/45"
              style={{ padding: '12px 14px', gap: 10 }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your answer or command..."
                disabled={isTyping}
                className="flex-1 min-w-0 bg-transparent text-white placeholder:text-[#94A3B8]/45 outline-none"
                style={{ fontSize: 14 }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`flex shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                  input.trim() && !isTyping ? 'bg-[#45A29E] text-black hover:bg-[#3d9490] cursor-pointer' : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
                }`}
                style={{ height: 34, width: 34 }}
              >
                <ArrowUp style={{ height: 16, width: 16 }} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

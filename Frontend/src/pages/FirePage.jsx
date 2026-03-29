import { useEffect, useMemo, useState } from 'react'
import { Flame, Loader2 } from 'lucide-react'
import { api } from '../services/api'
import { getActiveUserId } from '../services/session'
import { SimpleMarkdown } from '../components/SimpleMarkdown'
import { BackendInsights } from '../components/BackendInsights'

function formatINR(num) {
  if (num == null || isNaN(num)) return 'Rs 0'
  return `Rs ${Math.round(num).toLocaleString('en-IN')}`
}

function asText(value, fallback = '') {
  if (value == null) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map((v) => asText(v)).join(', ')
  if (typeof value === 'object') {
    if (value.message && typeof value.message === 'string') return value.message
    if (value.error) return asText(value.error)
    if (value.detail) return asText(value.detail)
    if (value.code && typeof value.code === 'string') return `${value.code}: ${value.message || 'Error'}`
    return JSON.stringify(value)
  }
  return fallback
}

function getErrorText(err, fallback) {
  const detail = err?.response?.data?.detail
  if (Array.isArray(detail)) {
    const msg = detail[0]?.msg || detail[0]?.message
    if (msg) return String(msg)
  }
  return (
    asText(detail) ||
    asText(err?.response?.data?.error) ||
    asText(err?.response?.data) ||
    asText(err?.message) ||
    fallback
  )
}

export default function FirePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [intervention, setIntervention] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.runFIREByUser(getActiveUserId())
        setData(res.data)
        if (res.data?.whatsapp_sent || res.data?.intervention) {
          setIntervention(
            asText(res.data?.intervention) ||
              'ASTRAGUARD INTERVENTION: High-risk behavior detected. Please check WhatsApp before making financial decisions.'
          )
        }
      } catch (err) {
        setError(getErrorText(err, 'Failed to load FIRE simulation.'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const calc = data?.summary || data?.calculation || {}
  const targetAge = calc?.target_retire_age ?? calc?.target_age ?? 0
  const estimatedAge = calc?.estimated_retire_age_current ?? calc?.projected_retirement_age ?? 0
  const fireNumber = calc?.corpus_needed ?? calc?.fire_number ?? calc?.target_corpus ?? 0
  
  // Directly extract existing assets as a safe fallback for the UI demo when backend sync lags
  const dnaMutFunds = data?.financial_dna?.existing_investments?.mutual_funds || 0
  const dnaEpf = data?.financial_dna?.existing_investments?.epf || 0
  const dnaPpf = data?.financial_dna?.existing_investments?.ppf || 0
  const dnaCorpus = dnaMutFunds + dnaEpf + dnaPpf
  
  const currentCorpus = calc?.current_corpus ?? calc?.existing_corpus ?? dnaCorpus ?? 0
  const gapSIP = calc?.monthly_sip_needed_additional ?? calc?.additional_monthly_sip_needed ?? calc?.sip_gap ?? 0
  const userAge = data?.financial_dna?.age || 30

  const ageColor =
    targetAge && estimatedAge
      ? estimatedAge <= targetAge
        ? '#22c55e'
        : estimatedAge <= targetAge + 2
          ? '#f59e0b'
          : '#ef4444'
      : '#45A29E'

  const chart = useMemo(() => {
    // Generate an exponential growth curve spanning from current age to estimated FIRE age
    let finalAge = estimatedAge || 60
    let startAge = userAge || 30
    if (finalAge <= startAge) finalAge = startAge + 15

    const points = [
      { age: startAge, corpus: currentCorpus },
      { age: startAge + Math.floor((finalAge - startAge) * 0.25), corpus: currentCorpus + ((fireNumber - currentCorpus) * 0.1) },
      { age: startAge + Math.floor((finalAge - startAge) * 0.50), corpus: currentCorpus + ((fireNumber - currentCorpus) * 0.3) },
      { age: startAge + Math.floor((finalAge - startAge) * 0.75), corpus: currentCorpus + ((fireNumber - currentCorpus) * 0.6) },
      { age: finalAge, corpus: fireNumber },
    ]
    
    const maxY = Math.max(...points.map((p) => p.corpus), fireNumber || 1)
    const minAge = Math.min(...points.map((p) => p.age))
    const maxAge = Math.max(...points.map((p) => p.age))
    const toX = (age) => ((age - minAge) / Math.max(1, maxAge - minAge)) * 100
    const toY = (value) => 100 - (value / maxY) * 100
    const line = points.map((p) => `${toX(p.age)},${toY(p.corpus)}`).join(' ')
    const targetY = toY(fireNumber || maxY)
    
    return { line, targetY, minAge, maxAge }
  }, [currentCorpus, fireNumber, estimatedAge, userAge])

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full flex justify-center" style={{ padding: '48px 32px 64px' }}>
        <div className="w-full" style={{ maxWidth: 1180 }}>
          <div className="flex items-center" style={{ gap: 16, marginBottom: 28 }}>
            <div className="flex items-center justify-center rounded-2xl bg-[#45A29E]/12 border border-[#45A29E]/20" style={{ height: 48, width: 48 }}>
              <Flame className="text-[#45A29E]" style={{ height: 24, width: 24 }} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-bold text-white" style={{ fontSize: 26, lineHeight: 1.2 }}>FIRE Planner</h1>
              <p className="text-[#94A3B8]" style={{ fontSize: 14, marginTop: 4 }}>Progress tracker for retirement independence</p>
            </div>
          </div>

          {!!intervention && (
            <div className="rounded-xl border border-orange-400/40 bg-orange-500/10 text-orange-200 animate-pulse" style={{ padding: 14, marginBottom: 16 }}>
              <strong>ASTRAGUARD INTERVENTION:</strong> {intervention}
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#111318] flex items-center justify-center" style={{ minHeight: 220 }}>
              <div className="flex items-center" style={{ gap: 10 }}>
                <Loader2 className="h-5 w-5 animate-spin text-[#45A29E]" />
                <span className="text-[#94A3B8]">Running FIRE simulation...</span>
              </div>
            </div>
          )}

          {!!error && !loading && (
            <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 text-rose-300" style={{ padding: 14 }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col" style={{ gap: 18 }}>
              <div className="rounded-2xl border border-white/[0.08] bg-[#111318]" style={{ padding: 24 }}>
                <p className="text-[#94A3B8]" style={{ fontSize: 12, marginBottom: 8 }}>Grand FIRE Age</p>
                <h2 className="font-bold" style={{ fontSize: 36, color: ageColor }}>
                  Expected FIRE Age: {estimatedAge || '--'}
                </h2>
                <p className="text-[#94A3B8]" style={{ marginTop: 8 }}>
                  Target Age: {targetAge || '--'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111318]" style={{ padding: 24 }}>
                <p className="text-white font-semibold" style={{ fontSize: 16, marginBottom: 12 }}>Corpus Mountain Chart</p>
                <svg viewBox="0 0 100 100" className="w-full" style={{ height: 240 }}>
                  <line x1="0" x2="100" y1={chart.targetY} y2={chart.targetY} stroke="#f59e0b" strokeDasharray="3 2" strokeWidth="1.2" />
                  <polyline fill="none" stroke="#45A29E" strokeWidth="2" points={chart.line} />
                </svg>
                <div className="flex justify-between text-[#94A3B8]" style={{ fontSize: 12 }}>
                  <span>Age {chart.minAge}</span>
                  <span>Age {chart.maxAge}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111318]" style={{ padding: 24 }}>
                <p className="text-white font-semibold" style={{ fontSize: 16, marginBottom: 10 }}>Reality Check</p>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 10 }}>
                  <div className="rounded-lg border border-white/[0.08] bg-black/20" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Required Corpus</p>
                    <p className="text-white font-semibold">{formatINR(fireNumber)}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/20" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Current Corpus</p>
                    <p className="text-white font-semibold">{formatINR(currentCorpus)}</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/20" style={{ padding: 10 }}>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Additional SIP Needed</p>
                    <p className="text-[#45A29E] font-semibold">{formatINR(gapSIP)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#45A29E]/30 bg-[#45A29E]/10" style={{ padding: 18 }}>
                <p className="text-white font-semibold" style={{ fontSize: 14, marginBottom: 8 }}>AstraGuard Advisor</p>
                <div className="text-white/90" style={{ fontSize: 14, lineHeight: 1.65 }}>
                  <SimpleMarkdown text={(() => {
                    const raw = data?.narration || data?.response
                    if (!raw) return 'FIRE simulation complete.'
                    if (typeof raw === 'string') return raw
                    
                    const summary = raw.summary_narration ? `**Summary**\n${raw.summary_narration}\n\n` : ''
                    const consequence = raw.consequence_narrative ? `**Trajectory**\n${raw.consequence_narrative}\n\n` : ''
                    const glide = raw.glidepath_explanation ? `**Glidepath**\n${raw.glidepath_explanation}\n\n` : ''
                    const action = raw.action_today ? `**Action Today:** ${raw.action_today}` : ''
                    
                    return `${summary}${consequence}${glide}${action}`.trim() || JSON.stringify(raw)
                  })()} />
                </div>
              </div>

              <BackendInsights data={data} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

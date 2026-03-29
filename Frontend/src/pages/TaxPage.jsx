import { useEffect, useState } from 'react'
import { Scale, Loader2, CheckCircle2 } from 'lucide-react'
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

export default function TaxPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [intervention, setIntervention] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.runTax(getActiveUserId())
        setData(res.data)
        if (res.data?.whatsapp_sent || res.data?.intervention) {
          setIntervention(
            asText(res.data?.intervention) ||
              'ASTRAGUARD INTERVENTION: High-risk behavior detected. Please check WhatsApp before making financial decisions.'
          )
        }
      } catch (err) {
        setError(getErrorText(err, 'Failed to load tax simulation.'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const oldRegime = data?.old_regime || data?.calculation?.old_regime || {}
  const newRegime = data?.new_regime || data?.calculation?.new_regime || {}
  const comp = data?.comparison || data?.calculation?.comparison || {}

  const oldTax = oldRegime?.total_tax ?? 0
  const newTax = newRegime?.total_tax ?? 0
  const optimal = String(comp?.optimal_regime || '').toUpperCase()
  const savings = comp?.savings_with_optimal ?? 0

  const maxTax = Math.max(oldTax, newTax, 1)
  const oldPct = (oldTax / maxTax) * 100
  const newPct = (newTax / maxTax) * 100

  const chapterVia = oldRegime?.chapter_via_deductions || {}
  const deductions = [
    ['Standard Deduction', oldRegime?.standard_deduction],
    ['HRA Exemption', oldRegime?.hra_exemption],
    ['80C', chapterVia?.['80C'] ?? oldRegime?.section_80c],
    ['80CCD(1B) NPS', chapterVia?.['80CCD_1B']],
    ['80D Health Insurance', chapterVia?.['80D'] ?? oldRegime?.section_80d],
    ['Sec 24B Home Loan', chapterVia?.['24B']],
  ].filter(([, v]) => v != null && v > 0)

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full flex flex-col items-center" style={{ padding: '48px 32px 64px' }}>
        <div className="w-full" style={{ maxWidth: 1180 }}>
          <div className="flex items-center" style={{ gap: 16, marginBottom: 28 }}>
            <div className="flex items-center justify-center rounded-2xl bg-[#45A29E]/12 border border-[#45A29E]/20" style={{ height: 48, width: 48 }}>
              <Scale className="text-[#45A29E]" style={{ height: 24, width: 24 }} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-bold text-white" style={{ fontSize: 26, lineHeight: 1.2 }}>Tax Optimizer</h1>
              <p className="text-[#94A3B8]" style={{ fontSize: 14, marginTop: 4 }}>Victory dashboard: Old vs New regime recommendation</p>
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#111318] flex items-center justify-center" style={{ minHeight: 220 }}>
              <div className="flex items-center" style={{ gap: 10 }}>
                <Loader2 className="h-5 w-5 animate-spin text-[#45A29E]" />
                <span className="text-[#94A3B8]">Running tax simulation...</span>
              </div>
            </div>
          )}

          {!!error && !loading && (
            <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 text-rose-300" style={{ padding: 14 }}>
              {error}
            </div>
          )}

          {!!intervention && (
            <div className="rounded-xl border border-orange-400/40 bg-orange-500/10 text-orange-200 animate-pulse" style={{ padding: 14, marginBottom: 16 }}>
              <strong>ASTRAGUARD INTERVENTION:</strong> {intervention}
            </div>
          )}

          {!loading && !error && data && (
            <div className="flex flex-col" style={{ gap: 18 }}>
              <div className="rounded-2xl border border-white/[0.08] bg-[#111318]" style={{ padding: 24 }}>
                <div className="flex items-start justify-between" style={{ gap: 16 }}>
                  <div>
                    <p className="text-[#94A3B8]" style={{ fontSize: 12, marginBottom: 8 }}>Grand Verdict</p>
                    <h2 className="font-bold text-white" style={{ fontSize: 26 }}>
                      {optimal === 'NEW' ? 'You Should Choose The New Regime' : 'You Should Choose The Old Regime'}
                    </h2>
                    <p className="text-[#45A29E] font-semibold" style={{ fontSize: 18, marginTop: 8 }}>
                      You will save exactly {formatINR(savings)} this year
                    </p>
                  </div>
                  <CheckCircle2 className="text-[#45A29E]" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111318]" style={{ padding: 24 }}>
                <p className="text-white font-semibold" style={{ fontSize: 16, marginBottom: 16 }}>Head-to-Head Comparison</p>
                <div className="flex flex-col" style={{ gap: 12 }}>
                  <div>
                    <div className="flex justify-between text-sm text-[#94A3B8]"><span>Old Regime</span><span>{formatINR(oldTax)}</span></div>
                    <div className="h-3 rounded-full bg-white/[0.06]" style={{ marginTop: 6 }}>
                      <div className="h-3 rounded-full bg-rose-400" style={{ width: `${oldPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-[#94A3B8]"><span>New Regime</span><span>{formatINR(newTax)}</span></div>
                    <div className="h-3 rounded-full bg-white/[0.06]" style={{ marginTop: 6 }}>
                      <div className="h-3 rounded-full bg-[#45A29E]" style={{ width: `${newPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111318]" style={{ padding: 24 }}>
                <p className="text-white font-semibold" style={{ fontSize: 16, marginBottom: 12 }}>Deductions Breakdown</p>
                {deductions.length === 0 && <p className="text-[#94A3B8]">No detailed deduction breakdown returned by backend.</p>}
                {deductions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10 }}>
                    {deductions.map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-white/[0.08] bg-black/20 flex justify-between" style={{ padding: 10 }}>
                        <span className="text-[#94A3B8]">{label}</span>
                        <span className="text-white font-semibold">{formatINR(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#45A29E]/30 bg-[#45A29E]/10" style={{ padding: 18 }}>
                <p className="text-white font-semibold" style={{ fontSize: 14, marginBottom: 8 }}>AstraGuard Advisor</p>
                <div className="text-white/90" style={{ fontSize: 14, lineHeight: 1.65 }}>
                  <SimpleMarkdown text={(() => {
                    const raw = data?.narration || data?.response
                    if (!raw) return 'Tax simulation complete.'
                    if (typeof raw === 'string') return raw
                    
                    const insight = raw.key_insight ? `**Key Insight**\n${raw.key_insight}\n\n` : ''
                    const deductions = raw.missed_deduction_actions?.length ? `**Missed Actions**\n${raw.missed_deduction_actions.map(d => `- ${d}`).join('\n')}\n\n` : ''
                    const helper = raw.regime_helper ? `**Which Regime?**\n${raw.regime_helper}` : ''
                    
                    return `${insight}${deductions}${helper}`.trim() || raw.one_line_summary || JSON.stringify(raw)
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

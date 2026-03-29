import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, Search, BrainCircuit, TrendingUp, Wallet, BarChart3, AlertTriangle, Info, Loader2, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { extractUserId, getActiveUserId, setActiveUserId } from '../services/session'
import { SimpleMarkdown } from '../components/SimpleMarkdown'
import { BackendInsights } from '../components/BackendInsights'

function formatINR(num) {
  if (num == null || isNaN(num)) return '₹0'
  const abs = Math.abs(Math.round(num))
  const sign = num < 0 ? '-' : ''
  const str = abs.toString()
  if (str.length <= 3) return sign + '₹' + str
  let lastThree = str.slice(-3)
  let rest = str.slice(0, -3)
  if (rest.length > 0) lastThree = ',' + lastThree
  return sign + '₹' + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree
}

const FUNDS = ['PPFAS Flexi', 'HDFC Mid-Cap', 'SBI Small', 'Axis Bluechip', 'Mirae Large']

const OVERLAP_DATA = [
  [100, 45, 12, 38, 52],
  [45, 100, 8, 22, 18],
  [12, 8, 100, 5, 14],
  [38, 22, 5, 100, 65],
  [52, 18, 14, 65, 100],
]

const OVERLAP_STOCKS = {
  '0-1': 'HDFC Bank, Infosys, ICICI Bank',
  '1-0': 'HDFC Bank, Infosys, ICICI Bank',
  '0-4': 'Reliance, TCS, Bajaj Finance',
  '4-0': 'Reliance, TCS, Bajaj Finance',
  '0-3': 'HDFC Bank, Kotak, Bharti Airtel',
  '3-0': 'HDFC Bank, Kotak, Bharti Airtel',
  '3-4': 'Reliance, HDFC Bank, TCS, L&T',
  '4-3': 'Reliance, HDFC Bank, TCS, L&T',
}

const FUND_HOLDINGS = [
  { name: 'Parag Parikh Flexi Cap', code: 'PPFAS', invested: 350000, current: 442000, xirr: 21.2 },
  { name: 'HDFC Mid-Cap Opportunities', code: 'HDFC Mid', invested: 280000, current: 338000, xirr: 16.8 },
  { name: 'SBI Small Cap Fund', code: 'SBI Small', invested: 200000, current: 268000, xirr: 24.1 },
  { name: 'Axis Bluechip Fund', code: 'Axis Blue', invested: 250000, current: 289000, xirr: 12.4 },
  { name: 'Mirae Asset Large Cap', code: 'Mirae', invested: 170000, current: 205000, xirr: 15.7 },
]

const glassStyle = {
  background: 'linear-gradient(135deg, rgba(31,40,51,0.8) 0%, rgba(31,40,51,0.3) 100%)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
}

function PortfolioXrayView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [intervention, setIntervention] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.runPortfolioXray(getActiveUserId())
        const jobId = res.data?.job_id
        if (!jobId) {
          // Direct result (unlikely but handle)
          setData(res.data)
          return
        }
        // Poll for job completion
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
        for (let i = 0; i < 20; i++) {
          await new Promise(r => setTimeout(r, 1500))
          const poll = await fetch(`${baseURL}/api/portfolio/xray/${jobId}`)
          const result = await poll.json()
          if (result?.status === 'error') {
            setError(result?.error?.message || 'Portfolio analysis failed')
            return
          }
          if (result?.status !== 'processing' && result?.portfolio_summary) {
            setData(result)
            if (result?.whatsapp_sent || result?.intervention) {
              setIntervention(
                result?.intervention ||
                  'ASTRAGUARD INTERVENTION: High-risk behavior detected. Please check WhatsApp before making financial decisions.'
              )
            }
            return
          }
        }
        setError('Portfolio analysis timed out. Please try again.')
      } catch (err) {
        setError(err?.response?.data?.detail || err?.response?.data?.error || err?.message || 'Failed to load X-Ray.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const ps = data?.portfolio_summary || data?.analysis || {}
  const overlapData = data?.overlap_analysis || {}
  const overlap = Number(overlapData?.overlap_score ?? ps?.overlap_score ?? 0)
  const gaugeColor = overlap < 30 ? '#22c55e' : overlap <= 60 ? '#f59e0b' : '#ef4444'
  const redFlags = data?.red_flags || overlapData?.significant_overlaps?.map(o => `${o.funds?.join(' & ')}: ${o.overlap_pct}% overlap`) || []

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full flex flex-col items-center" style={{ padding: '48px 32px 64px' }}>
        <div className="w-full" style={{ maxWidth: 1180 }}>
          <div className="flex items-center" style={{ gap: 16, marginBottom: 28 }}>
            <div className="flex items-center justify-center rounded-2xl bg-[#45A29E]/12 border border-[#45A29E]/20" style={{ height: 48, width: 48 }}>
              <Search className="text-[#45A29E]" style={{ height: 24, width: 24 }} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-bold text-white" style={{ fontSize: 26, lineHeight: 1.2 }}>Portfolio X-Ray</h1>
              <p className="text-[#94A3B8]" style={{ fontSize: 14, marginTop: 4 }}>Brutally honest health checkup of your investments</p>
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
                <span className="text-[#94A3B8]">Generating portfolio X-Ray...</span>
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
              <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
                <div className="rounded-xl border border-white/[0.08] bg-[#111318]" style={{ padding: 16 }}>
                  <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>Total Corpus Value</p>
                  <p className="text-white font-bold" style={{ fontSize: 24 }}>{formatINR(ps?.current_value ?? ps?.total_current_value ?? ps?.total_value ?? 0)}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-[#111318]" style={{ padding: 16 }}>
                  <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>XIRR</p>
                  <p className="text-white font-bold" style={{ fontSize: 24 }}>{ps?.portfolio_xirr ?? ps?.xirr ?? '--'}%</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-[#111318]" style={{ padding: 16 }}>
                  <p className="text-[#94A3B8]" style={{ fontSize: 12, marginBottom: 8 }}>Asset Allocation</p>
                  <p className="text-white font-semibold" style={{ fontSize: 14 }}>Equity {ps?.equity_pct ?? ps?.equity_percentage ?? 100}% | Debt {ps?.debt_pct ?? ps?.debt_percentage ?? 0}%</p>
                  <div className="h-3 rounded-full bg-white/[0.08]" style={{ marginTop: 8 }}>
                    <div className="h-3 rounded-full bg-[#45A29E]" style={{ width: `${ps?.equity_pct ?? ps?.equity_percentage ?? 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111318]" style={{ padding: 18 }}>
                <p className="text-white font-semibold" style={{ fontSize: 16, marginBottom: 10 }}>Overlap Gauge</p>
                <div className="h-4 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-4 rounded-full" style={{ width: `${Math.min(100, Math.max(0, overlap))}%`, background: gaugeColor }} />
                </div>
                <p className="text-[#94A3B8]" style={{ fontSize: 12, marginTop: 8 }}>
                  Overlap score: {overlap}% ({overlap < 30 ? 'Healthy' : overlap <= 60 ? 'Moderate' : 'Dangerous concentration risk'})
                </p>
              </div>

              {!!redFlags?.length && (
                <div className="rounded-2xl border border-rose-500/35 bg-rose-500/10" style={{ padding: 18 }}>
                  <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
                    <AlertTriangle className="text-rose-300" />
                    <p className="text-rose-200 font-semibold">Red Flag Alerts</p>
                  </div>
                  {redFlags.map((flag, idx) => (
                    <p key={`flag-${idx}`} className="text-rose-100" style={{ fontSize: 13, lineHeight: 1.6 }}>
                      - {typeof flag === 'string' ? flag : flag?.description || JSON.stringify(flag)}
                    </p>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-[#45A29E]/30 bg-[#45A29E]/10" style={{ padding: 18 }}>
                <p className="text-white font-semibold" style={{ fontSize: 14, marginBottom: 8 }}>AstraGuard Advisor</p>
                <div className="text-white/90" style={{ fontSize: 14, lineHeight: 1.65 }}>
                  <SimpleMarkdown text={(() => {
                    const raw = data?.narration || data?.response || data?.one_line_summary
                    if (!raw) return 'Portfolio X-Ray complete.'
                    if (typeof raw === 'string') return raw
                    return raw?.portfolio_health || raw?.one_line_summary || raw?.summary_narration || JSON.stringify(raw)
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

export default function PortfolioPage() {
  const navigate = useNavigate()
  const viewMode = new URLSearchParams(window.location.search).get('view')
  const [dataLoaded, setDataLoaded] = useState(new URLSearchParams(window.location.search).get('demo') === '1')
  const [casLoading, setCasLoading] = useState(false)
  const [form16Loading, setForm16Loading] = useState(false)
  const [hoveredCell, setHoveredCell] = useState(null)
  const [isCasDragOver, setIsCasDragOver] = useState(false)
  const [isForm16DragOver, setIsForm16DragOver] = useState(false)
  const [casPassword, setCasPassword] = useState('')
  const [casPasswordEnabled, setCasPasswordEnabled] = useState(true)
  const [casUpload, setCasUpload] = useState({ success: false, fileName: '', error: '', response: null })
  const [form16Upload, setForm16Upload] = useState({ success: false, fileName: '', error: '', response: null })
  const [chatBubbles, setChatBubbles] = useState([])
  const casFileRef = useRef(null)
  const form16FileRef = useRef(null)

  useEffect(() => {
    if (casUpload.success && form16Upload.success) {
      navigate('/onboard', {
        state: {
          source: 'file-scanner',
          casUpload: casUpload.response,
          form16Upload: form16Upload.response,
        },
      })
    }
  }, [casUpload.success, form16Upload.success, casUpload.response, form16Upload.response, navigate])

  const addAssistantBubble = (text) => {
    if (!text) return
    setChatBubbles((prev) => [...prev, { role: 'assistant', text }])
  }

  const buildCombinedSummary = (casData, form16Data) => {
    const salary = form16Data?.extraction?.financial_dna?.salary?.annual_salary || form16Data?.extraction?.salary || null
    const taxRegime = form16Data?.tax_analysis?.recommended_regime || form16Data?.tax_analysis?.regime || 'analyzed'
    const mfValue = casData?.summary?.total_valuation || casData?.portfolio_analysis?.total_valuation || null
    const salaryText = salary ? `base salary of ${formatINR(salary)}` : 'salary details'
    const mfText = mfValue ? `a mutual fund portfolio worth ${formatINR(mfValue)}` : 'an active mutual fund portfolio'
    return `I have successfully parsed your CAS and Form 16. I see ${salaryText} and ${mfText}. You are currently in the ${taxRegime} regime. Would you like me to simulate how switching regimes affects your monthly cash flow?`
  }

  const totalInvested = FUND_HOLDINGS.reduce((s, f) => s + f.invested, 0)
  const totalCurrent = FUND_HOLDINGS.reduce((s, f) => s + f.current, 0)
  const weightedXIRR = FUND_HOLDINGS.reduce((s, f) => s + f.xirr * (f.invested / totalInvested), 0)

  const uploadCASFile = async (file) => {
    try {
      if (!file || !String(file.name || '').toLowerCase().endsWith('.pdf')) {
        alert('Please upload a PDF file for CAS.')
        return
      }
      if (casPasswordEnabled && !casPassword.trim()) {
        setCasUpload({ success: false, fileName: '', error: 'Please enter your CAS PDF password before uploading.', response: null })
        return
      }
      setCasLoading(true)
      setCasUpload({ success: false, fileName: file.name, error: '', response: null })
      const activeUserId = getActiveUserId()
      const res = await api.uploadCAS(activeUserId, casPasswordEnabled ? casPassword.trim() : '', file)
      console.log('CAS Upload Success!', res.data)
      const receivedUserId = extractUserId(res.data)
      if (receivedUserId) setActiveUserId(receivedUserId)
      setCasUpload({ success: true, fileName: file.name, error: '', response: res.data })
      addAssistantBubble(res?.data?.portfolio_analysis?.llm_narration || 'CAS parsed successfully and portfolio data is now available.')
      if (form16Upload.success) {
        addAssistantBubble(buildCombinedSummary(res.data, form16Upload.response))
      }
    } catch (err) {
      console.error('CAS Upload Failed:', err)
      const backendMessage = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Unknown error'
      setCasUpload({ success: false, fileName: file?.name || '', error: `CAS upload failed: ${backendMessage}`, response: null })
    } finally {
      setCasLoading(false)
    }
  }

  const uploadForm16File = async (file) => {
    try {
      if (!file || !String(file.name || '').toLowerCase().endsWith('.pdf')) {
        alert('Please upload a PDF file for Form 16.')
        return
      }
      setForm16Loading(true)
      setForm16Upload({ success: false, fileName: file.name, error: '', response: null })
      const activeUserId = getActiveUserId()
      const res = await api.uploadForm16(activeUserId, file)
      console.log('Form 16 Upload Success!', res.data)
      const receivedUserId = extractUserId(res.data)
      if (receivedUserId) setActiveUserId(receivedUserId)
      setForm16Upload({ success: true, fileName: file.name, error: '', response: res.data })
      addAssistantBubble(res?.data?.tax_analysis?.llm_narration || 'Form 16 parsed successfully and tax analysis is ready.')
      if (casUpload.success) {
        addAssistantBubble(buildCombinedSummary(casUpload.response, res.data))
      }
    } catch (err) {
      console.error('Form 16 Upload Failed:', err)
      const backendMessage = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Unknown error'
      setForm16Upload({ success: false, fileName: file?.name || '', error: `Form 16 upload failed: ${backendMessage}`, response: null })
    } finally {
      setForm16Loading(false)
    }
  }

  const handleCASDrop = async (e) => {
    e.preventDefault()
    setIsCasDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadCASFile(e.dataTransfer.files[0])
    }
  }

  const handleForm16Drop = async (e) => {
    e.preventDefault()
    setIsForm16DragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadForm16File(e.dataTransfer.files[0])
    }
  }

  if (viewMode === 'xray') return <PortfolioXrayView />

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full flex flex-col items-center" style={{ padding: '48px 32px 64px' }}>
        <div className="w-full" style={{ maxWidth: 1280 }}>

          {/* Header */}
          <div className="flex items-center" style={{ gap: 16, marginBottom: 12 }}>
            <div className="flex items-center justify-center rounded-2xl bg-[#45A29E]/12 border border-[#45A29E]/20"
              style={{ height: 48, width: 48 }}>
              <Search className="text-[#45A29E]" style={{ height: 24, width: 24 }} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-bold text-white" style={{ fontSize: 26, lineHeight: 1.2 }}>File Scanner</h1>
              <p className="text-[#94A3B8]" style={{ fontSize: 14, marginTop: 4 }}>Upload CAMS and Form 16 documents securely for backend parsing</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!dataLoaded ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ marginTop: 40 }}
              >
                {/* Upload zones */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }} className="lg:!grid-cols-2">
                  <div
                    className={`rounded-3xl border-2 border-dashed relative overflow-hidden transition-all duration-300 ${isCasDragOver ? 'border-[#45A29E] bg-[#45A29E]/[0.06]' : 'border-[#45A29E]/40 hover:bg-[#45A29E]/[0.03]'
                      }`}
                    style={{ ...glassStyle, padding: '28px 24px' }}
                    onDragOver={(e) => { e.preventDefault(); setIsCasDragOver(true) }}
                    onDragLeave={() => setIsCasDragOver(false)}
                    onDrop={handleCASDrop}
                  >
                    <input
                      ref={casFileRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          uploadCASFile(e.target.files[0])
                        }
                      }}
                    />
                    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                      <h3 className="font-bold text-white" style={{ fontSize: 17 }}>CAMS Document</h3>
                      <span className="text-[#45A29E]" style={{ fontSize: 12, fontWeight: 700 }}>PASSWORD FLOW</span>
                    </div>
                    <div
                      className="rounded-2xl border border-white/[0.1] bg-black/30 flex flex-col items-center justify-center cursor-pointer"
                      style={{ minHeight: 190, padding: '24px 16px' }}
                      onClick={() => casFileRef.current?.click()}
                    >
                      {casLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="flex items-center justify-center rounded-2xl bg-[#45A29E]/15 border border-[#45A29E]/25 text-[#45A29E]"
                          style={{ height: 54, width: 54, marginBottom: 14 }}
                        >
                          <Loader2 style={{ height: 24, width: 24 }} strokeWidth={2} />
                        </motion.div>
                      ) : (
                        <UploadCloud className="text-[#45A29E]" style={{ height: 28, width: 28, marginBottom: 14 }} strokeWidth={1.75} />
                      )}
                      <p className="text-white/90 font-semibold text-center" style={{ fontSize: 15 }}>
                        {casLoading ? 'Uploading CAMS PDF...' : 'Drop or click to upload CAMS PDF'}
                      </p>
                      <p className="text-[#94A3B8] text-center" style={{ fontSize: 12, marginTop: 8 }}>
                        Detailed CAS PDF only
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-black/30" style={{ marginTop: 14, padding: '12px 14px' }}>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-white/80 font-semibold" style={{ fontSize: 13 }}>CAS password required</span>
                        <input
                          type="checkbox"
                          checked={casPasswordEnabled}
                          onChange={(e) => setCasPasswordEnabled(e.target.checked)}
                        />
                      </label>
                      {casPasswordEnabled && (
                        <div style={{ marginTop: 10 }}>
                          <input
                            type="password"
                            value={casPassword}
                            onChange={(e) => setCasPassword(e.target.value)}
                            placeholder="Enter CAS PDF password (often PAN in uppercase)"
                            className="w-full rounded-xl border border-white/[0.12] bg-black/40 text-white outline-none focus:border-[#45A29E]/60"
                            style={{ padding: '10px 12px', fontSize: 13 }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`rounded-3xl border-2 border-dashed relative overflow-hidden transition-all duration-300 ${isForm16DragOver ? 'border-[#45A29E] bg-[#45A29E]/[0.06]' : 'border-white/25 hover:bg-white/[0.03]'
                      }`}
                    style={{ ...glassStyle, padding: '28px 24px' }}
                    onDragOver={(e) => { e.preventDefault(); setIsForm16DragOver(true) }}
                    onDragLeave={() => setIsForm16DragOver(false)}
                    onDrop={handleForm16Drop}
                  >
                    <input
                      ref={form16FileRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          uploadForm16File(e.target.files[0])
                        }
                      }}
                    />
                    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                      <h3 className="font-bold text-white" style={{ fontSize: 17 }}>Form 16 Document</h3>
                      <span className="text-white/60" style={{ fontSize: 12, fontWeight: 700 }}>NO PASSWORD</span>
                    </div>
                    <div
                      className="rounded-2xl border border-white/[0.1] bg-black/30 flex flex-col items-center justify-center cursor-pointer"
                      style={{ minHeight: 190, padding: '24px 16px' }}
                      onClick={() => form16FileRef.current?.click()}
                    >
                      {form16Loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white"
                          style={{ height: 54, width: 54, marginBottom: 14 }}
                        >
                          <Loader2 style={{ height: 24, width: 24 }} strokeWidth={2} />
                        </motion.div>
                      ) : (
                        <FileText className="text-white/80" style={{ height: 28, width: 28, marginBottom: 14 }} strokeWidth={1.75} />
                      )}
                      <p className="text-white/90 font-semibold text-center" style={{ fontSize: 15 }}>
                        {form16Loading ? 'Uploading Form 16 PDF...' : 'Drop or click to upload Form 16 PDF'}
                      </p>
                      <p className="text-[#94A3B8] text-center" style={{ fontSize: 12, marginTop: 8 }}>
                        Part A / Part B supported
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-black/30" style={{ marginTop: 14, padding: '12px 14px' }}>
                      <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>
                        Form 16 upload will send only `user_id` and `file` to backend.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/[0.08]" style={{ ...glassStyle, marginTop: 18, padding: '16px 18px' }}>
                  <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                    <div>
                      <p className="text-white/70 font-semibold" style={{ fontSize: 13, marginBottom: 6 }}>CAMS Status</p>
                      <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>
                        {casUpload.success ? `Uploaded: ${casUpload.fileName}` : casUpload.error || 'Waiting for CAS upload'}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/70 font-semibold" style={{ fontSize: 13, marginBottom: 6 }}>Form 16 Status</p>
                      <p className="text-[#94A3B8]" style={{ fontSize: 12 }}>
                        {form16Upload.success ? `Uploaded: ${form16Upload.fileName}` : form16Upload.error || 'Waiting for Form 16 upload'}
                      </p>
                    </div>
                  </div>
                  <p className="text-white/40" style={{ fontSize: 12, marginTop: 12 }}>
                    Results dashboard unlocks automatically after both uploads succeed.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.08]" style={{ ...glassStyle, marginTop: 16, padding: '18px 18px' }}>
                  <h3 className="font-bold text-white" style={{ fontSize: 15, marginBottom: 10 }}>AstraGuard Response</h3>
                  <div className="flex flex-col" style={{ gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                    {chatBubbles.length === 0 && (
                      <p className="text-[#94A3B8]" style={{ fontSize: 13 }}>
                        Upload documents to view backend AI responses here.
                      </p>
                    )}
                    {chatBubbles.map((bubble, idx) => (
                      <div key={`${bubble.role}-${idx}`} className="rounded-xl border border-[#45A29E]/20 bg-[#45A29E]/10" style={{ padding: '10px 12px' }}>
                        <p className="text-white/90" style={{ fontSize: 13, lineHeight: 1.55 }}>{bubble.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guide Panel */}
                <div style={{
                  marginTop: 32, borderRadius: 20, padding: '28px 32px',
                  border: '1px solid rgba(69,162,158,0.15)',
                  background: 'linear-gradient(135deg, rgba(69,162,158,0.04) 0%, rgba(17,19,24,0.8) 100%)',
                }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                    Don't have your statements yet?
                  </p>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginBottom: 24 }}>
                    Download our smart guide extension, then visit the portal. The extension will automatically activate and guide you step-by-step to download your files.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    <a
                      href="/astra-guide-extension.zip"
                      download="astra-guide-extension.zip"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        padding: '16px 20px', borderRadius: 14,
                        background: '#45A29E', color: '#0B0C10',
                        fontSize: 14, fontWeight: 700,
                        textDecoration: 'none', transition: 'all 0.2s ease',
                        boxShadow: '0 0 24px rgba(69,162,158,0.15)',
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      1. Download Extension
                    </a>

                    <a
                      href="https://mfs.kfintech.com/investor/General/ConsolidatedAccountStatement"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderRadius: 14,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500,
                        textDecoration: 'none', transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 22, height: 22, borderRadius: 6,
                          background: 'rgba(69,162,158,0.2)', color: '#45A29E',
                          fontSize: 11, fontWeight: 700,
                        }}>2</span>
                        Go to KFintech
                      </span>
                      <span style={{ opacity: 0.5, fontSize: 12 }}>↗</span>
                    </a>

                    <a
                      href="https://www.tdscpc.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderRadius: 14,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500,
                        textDecoration: 'none', transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 22, height: 22, borderRadius: 6,
                          background: 'rgba(69,162,158,0.2)', color: '#45A29E',
                          fontSize: 11, fontWeight: 700,
                        }}>3</span>
                        Go to TRACES (Form 16)
                      </span>
                      <span style={{ opacity: 0.5, fontSize: 12 }}>↗</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28, marginTop: 36 }}
                className="lg:!grid-cols-[360px_1fr]"
              >
                {/* LEFT COLUMN */}
                <div className="flex flex-col" style={{ gap: 24 }}>

                  {/* Topline metrics */}
                  <div className="rounded-3xl border border-white/[0.08] overflow-hidden"
                    style={{ ...glassStyle, padding: '32px 28px' }}>
                    <h3 className="font-bold text-white" style={{ fontSize: 16, marginBottom: 24 }}>Portfolio Summary</h3>

                    {[
                      { label: 'Total Invested', value: formatINR(totalInvested), icon: Wallet, color: 'text-white' },
                      { label: 'Current Value', value: formatINR(totalCurrent), icon: TrendingUp, color: 'text-[#45A29E]' },
                      { label: 'True XIRR', value: weightedXIRR.toFixed(1) + '%', icon: BarChart3, color: 'text-[#45A29E]' },
                    ].map((m, i) => (
                      <div key={m.label} className="flex items-center justify-between"
                        style={{
                          padding: '16px 0',
                          borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        }}>
                        <div className="flex items-center" style={{ gap: 12 }}>
                          <m.icon className="text-[#94A3B8]" style={{ height: 16, width: 16 }} strokeWidth={1.75} />
                          <span className="text-[#94A3B8]" style={{ fontSize: 13 }}>{m.label}</span>
                        </div>
                        <span className={`font-bold ${m.color}`} style={{ fontSize: 18 }}>{m.value}</span>
                      </div>
                    ))}

                    <div className="rounded-xl bg-[#45A29E]/8 border border-[#45A29E]/15" style={{ padding: '16px 20px', marginTop: 20 }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                        <span className="text-white/50" style={{ fontSize: 12 }}>Unrealized Gain</span>
                        <span className="font-bold text-[#45A29E]" style={{ fontSize: 15 }}>{formatINR(totalCurrent - totalInvested)}</span>
                      </div>
                      <div className="rounded-full bg-black/40 overflow-hidden" style={{ height: 6 }}>
                        <div className="rounded-full bg-[#45A29E] h-full" style={{ width: `${Math.min(((totalCurrent - totalInvested) / totalInvested) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* AI Rebalancing */}
                  <div className="rounded-3xl border border-white/[0.08] overflow-hidden"
                    style={{ ...glassStyle, padding: '32px 28px' }}>
                    <div className="flex items-center" style={{ gap: 12, marginBottom: 20 }}>
                      <div className="flex items-center justify-center rounded-xl bg-[#E11D48]/12 border border-[#E11D48]/20"
                        style={{ height: 36, width: 36 }}>
                        <BrainCircuit className="text-[#E11D48]" style={{ height: 18, width: 18 }} strokeWidth={1.75} />
                      </div>
                      <h3 className="font-bold text-white" style={{ fontSize: 16 }}>AI Rebalancing Strategy</h3>
                    </div>

                    <div className="rounded-xl border border-[#E11D48]/15 bg-[#E11D48]/[0.04]" style={{ padding: '20px 20px', marginBottom: 20 }}>
                      <div className="flex items-start" style={{ gap: 10, marginBottom: 12 }}>
                        <AlertTriangle className="text-[#E11D48] shrink-0" style={{ height: 16, width: 16, marginTop: 2 }} strokeWidth={2} />
                        <span className="text-[#E11D48] font-semibold" style={{ fontSize: 13 }}>High Concentration Risk Detected</span>
                      </div>
                      <p className="text-white/60" style={{ fontSize: 14, lineHeight: 1.75 }}>
                        High exposure to Reliance Industries across 3 funds (PPFAS, Axis, Mirae).
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06]" style={{ padding: '20px 20px' }}>
                      <p className="text-white/50 font-semibold" style={{ fontSize: 11, letterSpacing: '0.1em', marginBottom: 12 }}>RECOMMENDED ACTION</p>
                      <p className="text-white/70" style={{ fontSize: 14, lineHeight: 1.75 }}>
                        Sell {formatINR(120000)} of Parag Parikh Flexi Cap.{' '}
                        <span className="text-[#45A29E] font-semibold">Wait until April 15th</span> to execute to avoid 20% STCG tax penalty.
                      </p>
                    </div>
                  </div>

                  {/* Fund list */}
                  <div className="rounded-3xl border border-white/[0.08] overflow-hidden"
                    style={{ ...glassStyle, padding: '28px 24px' }}>
                    <h3 className="font-bold text-white" style={{ fontSize: 15, marginBottom: 20 }}>Fund Holdings</h3>
                    <div className="flex flex-col" style={{ gap: 12 }}>
                      {FUND_HOLDINGS.map((f) => (
                        <div key={f.code} className="rounded-xl bg-white/[0.03] border border-white/[0.05]"
                          style={{ padding: '16px 18px' }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                            <span className="text-white/80 font-medium" style={{ fontSize: 13 }}>{f.code}</span>
                            <span className="text-[#45A29E] font-bold" style={{ fontSize: 13 }}>{f.xirr}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/30" style={{ fontSize: 12 }}>Invested: {formatINR(f.invested)}</span>
                            <span className="text-white/50" style={{ fontSize: 12 }}>Current: {formatINR(f.current)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Heatmap */}
                <div className="rounded-3xl border border-white/[0.08] overflow-hidden"
                  style={{ ...glassStyle, padding: '32px 32px' }}>
                  <h3 className="font-bold text-white" style={{ fontSize: 17, marginBottom: 6 }}>Underlying Asset Overlap</h3>
                  <p className="text-[#94A3B8]" style={{ fontSize: 13, marginBottom: 8 }}>Fund vs Fund — hover crimson cells for overlapping stocks</p>

                  <div className="flex items-center" style={{ gap: 20, marginBottom: 28 }}>
                    <div className="flex items-center" style={{ gap: 6 }}>
                      <div className="rounded" style={{ width: 12, height: 12, background: 'rgba(225,29,72,0.25)' }} />
                      <span className="text-white/40" style={{ fontSize: 11 }}>&gt; 40% overlap</span>
                    </div>
                    <div className="flex items-center" style={{ gap: 6 }}>
                      <div className="rounded" style={{ width: 12, height: 12, background: 'rgba(69,162,158,0.25)' }} />
                      <span className="text-white/40" style={{ fontSize: 11 }}>&lt; 20% overlap</span>
                    </div>
                    <div className="flex items-center" style={{ gap: 6 }}>
                      <div className="rounded" style={{ width: 12, height: 12, background: 'rgba(255,255,255,0.08)' }} />
                      <span className="text-white/40" style={{ fontSize: 11 }}>20–40%</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ marginLeft: 0 }}>
                    <div style={{ minWidth: 560 }}>
                      {/* Header row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                        <div />
                        {FUNDS.map((f) => (
                          <div key={f} className="text-center text-white/40 font-medium" style={{ fontSize: 11, padding: '8px 4px' }}>
                            {f}
                          </div>
                        ))}
                      </div>

                      {/* Data rows */}
                      {FUNDS.map((rowFund, ri) => (
                        <div key={rowFund} style={{ display: 'grid', gridTemplateColumns: '100px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                          <div className="flex items-center text-white/40 font-medium" style={{ fontSize: 11, padding: '0 8px' }}>
                            {rowFund}
                          </div>
                          {OVERLAP_DATA[ri].map((val, ci) => {
                            const isDiag = ri === ci
                            const isHigh = val > 40 && !isDiag
                            const isLow = val < 20 && !isDiag
                            const cellKey = `${ri}-${ci}`
                            const isHovered = hoveredCell === cellKey
                            const stocks = OVERLAP_STOCKS[cellKey]

                            return (
                              <div
                                key={ci}
                                className="relative flex items-center justify-center rounded-lg transition-all duration-200 cursor-default"
                                style={{
                                  height: 56,
                                  background: isDiag ? '#0B0C10'
                                    : isHigh ? 'rgba(225,29,72,0.15)'
                                      : isLow ? 'rgba(69,162,158,0.12)'
                                        : 'rgba(255,255,255,0.04)',
                                  border: isDiag ? '1px solid rgba(255,255,255,0.04)'
                                    : isHigh ? '1px solid rgba(225,29,72,0.2)'
                                      : isLow ? '1px solid rgba(69,162,158,0.15)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                }}
                                onMouseEnter={() => !isDiag && setHoveredCell(cellKey)}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                {!isDiag && (
                                  <span className={`font-bold ${isHigh ? 'text-[#E11D48]' : isLow ? 'text-[#45A29E]' : 'text-white/40'
                                    }`} style={{ fontSize: 15 }}>
                                    {val}%
                                  </span>
                                )}
                                {isDiag && (
                                  <span className="text-white/10" style={{ fontSize: 11 }}>—</span>
                                )}

                                {/* Tooltip */}
                                <AnimatePresence>
                                  {isHovered && stocks && isHigh && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 4 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute z-50 rounded-lg border border-[#E11D48]/25 bg-[#1a1015]"
                                      style={{
                                        bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                                        padding: '10px 14px', whiteSpace: 'nowrap',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                      }}
                                    >
                                      <div className="flex items-center" style={{ gap: 6, marginBottom: 4 }}>
                                        <Info className="text-[#E11D48]" style={{ height: 12, width: 12 }} strokeWidth={2} />
                                        <span className="text-[#E11D48] font-semibold" style={{ fontSize: 11 }}>Top Overlapping Stocks</span>
                                      </div>
                                      <p className="text-white/70" style={{ fontSize: 12 }}>{stocks}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary insight */}
                  <div className="rounded-xl border border-[#E11D48]/15 bg-[#E11D48]/[0.04]"
                    style={{ padding: '20px 24px', marginTop: 28 }}>
                    <div className="flex items-start" style={{ gap: 12 }}>
                      <AlertTriangle className="text-[#E11D48] shrink-0" style={{ height: 18, width: 18, marginTop: 2 }} strokeWidth={1.75} />
                      <div>
                        <h4 className="font-bold text-[#E11D48]" style={{ fontSize: 14, marginBottom: 6 }}>Critical Overlap Warning</h4>
                        <p className="text-white/50" style={{ fontSize: 13, lineHeight: 1.7 }}>
                          Axis Bluechip and Mirae Large Cap share <span className="text-[#E11D48] font-semibold">65%</span> underlying asset overlap.
                          Holding both provides minimal diversification benefit. Consider consolidating into one fund to reduce redundancy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg\\:!grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .lg\\:!grid-cols-\\[360px_1fr\\] {
            grid-template-columns: 360px 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

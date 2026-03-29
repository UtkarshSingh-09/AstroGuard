import React from 'react'

export function BackendInsights({ data }) {
  if (!data) return null

  const flags = data.compliance_flags || []
  const audit = data.audit_narration
  const literacy = data.literacy_insight

  if (flags.length === 0 && !audit && !literacy) return null

  return (
    <div className="flex flex-col gap-10 mt-12">
      <div className="flex items-center gap-6">
        <div className="h-[1px] flex-1 bg-white/[0.04]"></div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">Backend AI Insights</span>
        <div className="h-[1px] flex-1 bg-white/[0.04]"></div>
      </div>

      {flags.length > 0 && (
        <div className="rounded-[24px] border border-rose-500/30 bg-rose-500/5" style={{ padding: 32 }}>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-rose-400 font-bold" style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Regulator Guard
            </span>
          </div>
          <div className="flex flex-col gap-8">
            {flags.map((flag, idx) => (
              <div key={idx} className="flex flex-col gap-3 pb-8 border-b border-rose-500/10 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 uppercase tracking-wider">
                    {flag.type} | {flag.rule}
                  </span>
                </div>
                <p className="text-white/90 text-[15px] leading-loose">{flag.issue}</p>
                <div className="text-[#94A3B8] text-[13px] leading-loose mt-2">
                  <span className="font-semibold text-white/40 uppercase tracking-wide text-[11px] mr-2">Original:</span>
                  <span className="text-white/60">{flag.original_text}</span>
                  <br />
                  <span className="font-semibold text-emerald-400 uppercase tracking-wide text-[11px] mr-2 mt-2 inline-block">Fixed:</span>
                  <span className="text-white/80">{flag.suggested_fix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {audit && (
        <div className="rounded-[24px] border border-violet-500/30 bg-violet-500/5" style={{ padding: 32 }}>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-violet-400 font-bold" style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Audit Narrator
            </span>
            <span className="text-violet-400/60 text-xs">({audit.calculation_type})</span>
          </div>
          {audit.summary && (
            <p className="text-white/80 text-[15px] mb-8 leading-loose">{audit.summary}</p>
          )}
          <div className="flex flex-col gap-8">
            {audit.narrated_steps?.map((step) => (
              <div key={step.step_number} className="flex flex-col gap-2 pb-8 border-b border-violet-500/10 last:border-0 last:pb-0">
                <p className="font-semibold text-white/95 text-[15px] mb-1">{step.title}</p>
                <div className="font-mono text-violet-300 bg-black/40 px-5 py-4 rounded-xl text-[13px] my-2 break-all shadow-inner leading-relaxed">
                  {step.formula_visual}
                </div>
                <p className="text-white/70 text-[14px] leading-loose">{step.explanation}</p>
                {step.why_it_matters && (
                  <p className="text-violet-300/80 text-[13px] mt-2 leading-loose">{step.why_it_matters}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {literacy && (
        <div className="rounded-[24px] border border-sky-500/30 bg-sky-500/5" style={{ padding: 32 }}>
          <div className="flex items-center gap-2 mb-8">
            <span className="text-sky-400 font-bold" style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Literacy Agent
            </span>
            <span className="text-sky-400/60 text-xs">({literacy.literacy_dimension})</span>
          </div>
          
          {literacy.micro_lesson && (
            <div className="mb-10 pb-10 border-b border-sky-500/10">
              <p className="font-bold text-white text-[15px] mb-4">Lesson: {literacy.micro_lesson.lesson_title}</p>
              <p className="text-white/80 text-[14px] leading-loose mb-5">{literacy.micro_lesson.lesson_body}</p>
              <span className="text-sky-300/90 text-xs font-semibold bg-sky-500/10 inline-block px-4 py-2 rounded-xl text-sky-200">
                Concept: {literacy.micro_lesson.concept_taught}
              </span>
            </div>
          )}

          {literacy.quiz && literacy.quiz.questions?.length > 0 && (
            <div>
              <p className="font-bold text-white text-[15px] mb-6">Quiz ({literacy.quiz.difficulty || 'Normal'})</p>
              <div className="flex flex-col gap-10">
                {literacy.quiz.questions.map((q, idx) => (
                  <div key={idx} className="pb-8 border-b border-sky-500/10 last:border-0 last:pb-0">
                    <p className="text-white/90 text-[15px] font-medium mb-6 leading-loose">Q{idx + 1}: {q.question}</p>
                    <div className="flex flex-col gap-4 mb-6">
                      {q.options?.map((opt, oIdx) => (
                        <div key={oIdx} className={`rounded-xl px-5 py-4 text-[14px] leading-relaxed transition-colors ${oIdx === q.correct_index ? 'bg-sky-500/20 text-sky-200 font-medium' : 'bg-black/20 text-white/50'}`}>
                          {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correct_index && '✓'}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-4">
                        <p className="text-sky-300/80 text-[13px] leading-loose"><span className="font-bold text-sky-400 mr-2">Explanation:</span> {q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {data.sebi_disclaimer && (
        <div className="text-center text-[11px] text-[#94A3B8]/50 mt-8 mb-4 leading-loose max-w-2xl mx-auto px-4">
          {data.sebi_disclaimer}
        </div>
      )}
    </div>
  )
}

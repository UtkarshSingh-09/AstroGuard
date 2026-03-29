import React from 'react'

export function SimpleMarkdown({ text, className = '' }) {
  if (!text || typeof text !== 'string') return null

  // Process standard Markdown into styled React elements
  const lines = text.split('\n')
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {lines.map((line, i) => {
        // Empty lines
        if (!line.trim()) return <div key={i} className="h-1" />

        // Headings (e.g. ### Title)
        const headingMatch = line.match(/^(#{1,6})\s+(.*)/)
        if (headingMatch) {
          const level = headingMatch[1].length
          return (
            <div key={i} className={`font-semibold text-white ${level === 1 ? 'text-lg mt-2' : level === 2 ? 'text-base mt-2' : 'text-sm mt-1'}`}>
              {renderInline(headingMatch[2])}
            </div>
          )
        }

        // Bullet lists
        if (line.match(/^[-*]\s+/)) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-[#45A29E] mt-[2px] shrink-0">•</span>
              <span className="flex-1 opacity-90">{renderInline(line.replace(/^[-*]\s+/, ''))}</span>
            </div>
          )
        }
        
        // Numbered lists
        const numMatch = line.match(/^(\d+\.)\s+(.*)/)
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-[#45A29E] font-medium mt-[1px] shrink-0">{numMatch[1]}</span>
              <span className="flex-1 opacity-90">{renderInline(numMatch[2])}</span>
            </div>
          )
        }

        // Normal paragraph
        return (
          <div key={i} className="opacity-90">
            {renderInline(line)}
          </div>
        )
      })}
    </div>
  )
}

function renderInline(str) {
  // Very simplistic bold parsing
  const parts = str.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.substring(2, part.length - 2)}</strong>
    }
    return part
  })
}

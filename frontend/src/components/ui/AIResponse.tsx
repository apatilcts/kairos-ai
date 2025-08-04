import React from 'react'
import { CitationLink } from './CitationLink'

interface AIResponseProps {
  content: string
  className?: string
}

export function AIResponse({ content, className = '' }: AIResponseProps) {
  // Extract citations from the response text
  const citationRegex = /\[Source: ([^\]]+)\]/g
  const parts = content.split(citationRegex)
  const citations: string[] = []
  
  // Extract all unique citations
  let match
  while ((match = citationRegex.exec(content)) !== null) {
    if (!citations.includes(match[1])) {
      citations.push(match[1])
    }
  }

  // Process content to highlight citations
  const processedContent = content.replace(citationRegex, '')

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main response content */}
      <div className="prose prose-sm max-w-none text-gray-700">
        {processedContent.split('\n').map((paragraph, idx) => (
          paragraph.trim() && (
            <p key={idx} className="mb-2">
              {paragraph}
            </p>
          )
        ))}
      </div>

      {/* Citations */}
      {citations.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-start space-x-2">
            <span className="text-xs font-medium text-gray-500 mt-1">Sources:</span>
            <div className="flex flex-wrap gap-2">
              {citations.map((citation, idx) => (
                <CitationLink 
                  key={idx}
                  source={citation}
                  onClick={() => {
                    // TODO: Implement source document viewing
                    console.log('View source:', citation)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
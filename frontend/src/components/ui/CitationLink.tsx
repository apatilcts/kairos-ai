import React from 'react'
import { LinkIcon } from '@heroicons/react/24/outline'

interface CitationLinkProps {
  source: string
  onClick?: () => void
  className?: string
}

export function CitationLink({ source, onClick, className = '' }: CitationLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-md border border-blue-200 transition-colors ${className}`}
    >
      <LinkIcon className="w-3 h-3 mr-1" />
      {source}
    </button>
  )
}
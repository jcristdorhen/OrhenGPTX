"use client"

import { useEffect, useState } from 'react'
import { CopyIcon, CheckIcon } from 'lucide-react'
import { syntaxHighlight } from '@/lib/prism-config'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language: string
  showLineNumbers?: boolean
  title?: string
  className?: string
}

export function CodeBlock({
  code,
  language,
  showLineNumbers = true,
  title,
  className
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
  }

  return (
    <div className={cn(
      "rounded-lg overflow-hidden border border-border bg-[#1e1e1e]",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-border">
        <span className="text-sm font-medium text-gray-200">
          {title || language.toUpperCase()}
        </span>
        <button
          onClick={copyCode}
          className="p-1.5 rounded-md hover:bg-[#333333] transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-400" />
          ) : (
            <CopyIcon className="h-4 w-4 text-gray-400 hover:text-gray-300" />
          )}
        </button>
      </div>
      <pre className={cn(
        "p-4 overflow-x-auto",
        showLineNumbers && "line-numbers"
      )}>
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(code, language)
          }}
        />
      </pre>
    </div>
  )
}

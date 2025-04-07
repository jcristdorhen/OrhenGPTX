"use client"

import { useState } from "react"
import { ClipboardIcon, CheckIcon } from "lucide-react"
import { motion } from "framer-motion"

interface CodeBlockProps {
  code: string
  language: string
  title?: string
}

export function CodeBlock({ code, language, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between bg-[#1d1f21] border-b border-gray-700 px-4 py-2">
        <span className="text-sm text-gray-400">
          {title || language}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyToClipboard}
          className="text-gray-400 hover:text-gray-200"
          aria-label="Copy code"
        >
          {copied ? <CheckIcon size={16} /> : <ClipboardIcon size={16} />}
        </motion.button>
      </div>
      <pre className="!mt-0 !bg-[#1d1f21]">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}

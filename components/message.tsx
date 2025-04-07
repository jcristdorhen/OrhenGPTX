"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Message as MessageType } from "@/lib/store"
import { ClipboardIcon, CheckIcon } from "lucide-react"
import MarkdownRenderer from "./markdown-renderer"

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="py-3"
    >
      <div className={`max-w-3xl mx-auto px-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`flex items-start max-w-[70%] gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`group relative break-words rounded-2xl px-4 py-3 
            ${message.role === "user" 
              ? "bg-black text-white" 
              : "bg-gray-100 text-gray-900"}`
          }>
            {message.role === "assistant" && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyToClipboard}
                className="absolute -right-8 p-1 text-gray-400 hover:text-gray-600 mt-1.5"
                aria-label="Copy to clipboard"
              >
                {copied ? <CheckIcon size={16} /> : <ClipboardIcon size={16} />}
              </motion.button>
            )}

            {message.role === "user" ? (
              <p className="text-[15px] leading-relaxed">{message.content}</p>
            ) : (
              <div className="text-[15px] leading-relaxed prose prose-slate max-w-none">
                <MarkdownRenderer content={message.content} />
              </div>
            )}

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-200 pt-3">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="border rounded-lg p-2 bg-white/50">
                    <p className="text-sm font-medium">{attachment.name}</p>
                    {attachment.type.startsWith("image/") ? (
                      <img
                        src={attachment.url || "/placeholder.svg"}
                        alt={attachment.name}
                        className="mt-1 max-w-xs max-h-40 object-contain rounded-md"
                      />
                    ) : (
                      <p className="text-xs text-gray-500">{attachment.type}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}


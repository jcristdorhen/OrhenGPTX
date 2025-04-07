"use client"

import ReactMarkdown from "react-markdown"
import { CodeBlock } from "@/components/ui/code-block"

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          
          if (!inline && match) {
            const language = match[1]
            const code = String(children).replace(/\n$/, '')
            const title = language === 'html' ? 
              code.match(/<title>(.*?)<\/title>/i)?.[1] : undefined
            
            return (
              <CodeBlock 
                code={code}
                language={language}
                title={title}
              />
            )
          }
          return <code className={className} {...props}>{children}</code>
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}



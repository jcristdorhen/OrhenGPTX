"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function ChatInput() {
  const [message, setMessage] = useState("")

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t">
      <div className="max-w-3xl mx-auto p-4">
        <div className="relative flex items-center">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[52px] resize-none pr-20 bg-white"
            rows={1}
          />
          <Button 
            className="absolute right-2"
            size="sm"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

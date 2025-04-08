"use client"

import { ChatInput } from "./chat-input"

export function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <ChatInput />
    </div>
  )
}

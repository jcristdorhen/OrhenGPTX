"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useChatStore } from "@/lib/store"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ChatInput from "@/components/chat-input"
import Chat from "@/components/chat"

export default function ChatGPTInterface() {
  const { isChatMode, setChatMode, clearMessages } = useChatStore()
  
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header /> {/* Header will stay fixed */}

      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {isChatMode ? (
            <motion.div
              key="chat"
              className="flex-1 flex flex-col relative h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex-1 overflow-y-auto">
                <Chat />
              </div>
              <div className="flex justify-center px-4 pb-4 w-full max-w-3xl mx-auto">
                <ChatInput />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              className="flex flex-1 flex-col items-center justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-4xl font-bold">Hi, I'm OrhenGPT</h1>
                <p className="text-gray-600">How can I help you today?</p>
              </div>
              <div className="w-full max-w-3xl">
                <ChatInput />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}


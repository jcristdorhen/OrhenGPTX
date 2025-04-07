"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useChatStore } from "@/lib/store"

export default function Footer() {
  const { isChatMode } = useChatStore()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 text-center text-sm text-gray-600"
    >
      {isChatMode ? (
        <p>OrhenGPT can make mistakes. Check important info.</p>
      ) : (
        <p>
          By messaging OrhenGPT, you agree to our{" "}
            <Link href="https://policies.google.com/terms?hl=en-US" className="text-gray-800 font-medium" target="_blank" rel="noopener noreferrer">
            Terms
            </Link>{" "}
            and have read our{" "}
            <Link href="https://policies.google.com/privacy?hl=en-US" className="text-gray-800 font-medium" target="_blank" rel="noopener noreferrer">
            Privacy Policy
            </Link>
          .
        </p>
      )}
    </motion.footer>
  )
}


"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DevelopmentModalProps {
  open: boolean
  onClose: () => void
}

export function DevelopmentModal({ open, onClose }: DevelopmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-h-[200px] w-[95vw] max-w-md rounded-2xl border-0 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:w-[90vw] flex flex-col items-center justify-center gap-6">
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 0px rgba(59, 130, 246, 0)",
              "0 0 30px rgba(59, 130, 246, 0.3)",
              "0 0 0px rgba(59, 130, 246, 0)"
            ],
            borderColor: [
              "rgba(59, 130, 246, 0)",
              "rgba(59, 130, 246, 0.3)",
              "rgba(59, 130, 246, 0)"
            ]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <DialogHeader className="relative flex-none w-full">
          <DialogTitle asChild>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  filter: [
                    "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
                    "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))",
                    "drop-shadow(0 0 0px rgba(59, 130, 246, 0))"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
              >
                ✨ In Development ✨
              </motion.div>
            </motion.div>
          </DialogTitle>
        </DialogHeader>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative text-center flex-1 flex flex-col items-center justify-center w-full px-4"
        >
          <motion.div
            animate={{
              background: [
                "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
                "linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
                "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="rounded-lg p-6 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 opacity-50"
              animate={{
                background: [
                  "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.p 
              className="text-gray-800 font-medium mb-3 relative"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              This feature is currently under development.
            </motion.p>
            <motion.p 
              className="text-sm text-gray-600 relative"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Check back soon for magical updates! ✨
            </motion.p>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

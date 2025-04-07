"use client"

import { useState, type FormEvent, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Message } from "@/lib/store";
import { 
  PaperclipIcon, 
  SearchIcon, 
  MicIcon, 
  XIcon, 
  SendIcon
} from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { useChatStore } from "@/lib/store"
import { sendMessage, searchQuery } from "@/lib/chat-service"

type InputMode = "normal" | "voice" | "attach" | "search"

export default function ChatInput() {
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ file: File; url: string }>>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const showSubmitButton = input.trim().length > 0 || attachments.length > 0

  const { addMessage, messages, setLoading, isLoading, setChatMode, inputMode, setInputMode, setSearchResults, isChatMode } =
    useChatStore()

  const handleChatResponse = async (userInput: string, mode: InputMode) => {
    if ((!userInput.trim() && attachments.length === 0) || isLoading) return;
    
    setLoading(true);

    try {
      // Create a complete user message with all required fields
      const userMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "user" as const,
        content: userInput || "Sent attachments",
        timestamp: Date.now(),
        attachments: attachments.length > 0 
          ? attachments.map(att => ({
              type: att.file.type,
              url: att.url,
              name: att.file.name,
            }))
          : undefined,
      };

      // Add user message first
      addMessage(userMessage);

      // Then send all messages including the new one
      const response = await sendMessage([...messages, userMessage], mode);
      
      if (response) {
        addMessage({
          role: "assistant",
          content: response,
        });
      }
    } catch (error) {
      console.error("Error in chat:", error);
      addMessage({
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to process your request"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
        const tracks = mediaRecorderRef.current.stream?.getTracks()
        tracks?.forEach(track => track.stop())
      }
    }
  }, [isRecording])

  // Trigger file input when switching to attach mode
  useEffect(() => {
    if (inputMode === "attach" && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [inputMode])

  useEffect(() => {
    if (!isChatMode) {
      setInput("")
      setAttachments([])
      setIsRecording(false)
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        const tracks = mediaRecorderRef.current.stream?.getTracks()
        tracks?.forEach(track => track.stop())
      }
    }
  }, [isChatMode, setAttachments])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)  
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks)
        // Here you would typically send this blob to a speech-to-text service
        // For now, we'll just add it as an attachment
        const url = URL.createObjectURL(audioBlob)
        setAttachments([...attachments, { file: new File([audioBlob], "recording.wav"), url }])
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    setChatMode(true);

    try {
      // Handle search mode first if needed
      if (inputMode === "search") {
        const results = await searchQuery(input);
        setSearchResults(results);
      }

      // Process the chat response
      await handleChatResponse(input, inputMode);

      // Clear inputs after successful submission
      setInput("");
      setAttachments([]);
      setInputMode("normal");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file)
        setAttachments((prev) => [...prev, { file, url }])
      })
    }
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="sticky bottom-0 w-full bg-white/80 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-2xl px-0 py-0">
        <div className="relative flex flex-col overflow-hidden rounded-[28px] border bg-white shadow-lg">
          {/* Main input area */}
          <div className="min-h-[82px] w-full">
            <TextareaAutosize
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything"
              className="max-h-[25dvh] min-h-[82px] w-full resize-none border-0 bg-transparent px-5 py-3 
                       text-sm focus:outline-none focus:ring-0 disabled:opacity-50"
              minRows={1}
              maxRows={8}
              style={{ height: 80 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
            />
          </div>

            {/* Action buttons container */}
            <div className="absolute bottom-1.5 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!showSubmitButton && (
              <>
              <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputMode(inputMode === "attach" ? "normal" : "attach")}
              className={`group relative inline-flex h-9 items-center justify-center rounded-full px-2 text-xs border
               hover:bg-gray-100 transition-colors
               ${inputMode === "attach" 
                 ? "bg-black/10 text-black" 
                 : "text-secondary border-token-border-light"}`}
              tabIndex={0}
              >
              <PaperclipIcon className="h-[18px] w-[18px]" />
              <span className="ps-1 pe-1 whitespace-nowrap">Attach</span>
              <span className="absolute -top-8 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 transition-all">
              Attach files
              </span>
              </motion.button>

              <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputMode(inputMode === "search" ? "normal" : "search")}
              className={`group relative inline-flex h-9 items-center justify-center rounded-full px-2 text-xs border
               hover:bg-gray-100 transition-colors
               ${inputMode === "search"
                 ? "bg-black/10 text-black"
                 : "text-secondary border-token-border-light"}`}
              tabIndex={0}
              >
              <SearchIcon className="h-[18px] w-[18px]" />
              <span className="ps-1 pe-1 whitespace-nowrap">Search</span>
              <span className="absolute -top-8 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 transition-all">
              Search messages
              </span>
              </motion.button>
              </>
              )}
            </div>

            {/* Right side button - Voice/Submit toggle */}
            <AnimatePresence mode="wait">
              {showSubmitButton ? (
                <motion.button
                  key="submit"
                  type="submit"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isLoading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black 
                           text-white hover:opacity-70 disabled:bg-[#D7D7D7] disabled:text-[#f4f4f4]
                           disabled:hover:opacity-100"
                  tabIndex={0}
                >
                  <SendIcon className="h-5 w-5" />
                </motion.button>
              ) : (
                <motion.button
                  key="voice"
                  type="button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`inline-flex h-9 items-center justify-center rounded-full px-3 text-xs 
                             font-medium transition-colors bg-black text-white hover:opacity-80`}
                  tabIndex={0}
                >
                  <MicIcon className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* File input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />

          {/* Attachments section */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t bg-gray-50 px-3 py-2 rounded-b-2xl"
              >
                <div className="flex flex-wrap gap-1.5">
                  {attachments.map((att, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="group relative"
                    >
                      <div className="flex items-center gap-1.5 rounded-lg border bg-white p-1.5 text-xs">
                        <span className="max-w-[120px] truncate">{att.file.name}</span>
                        <motion.button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                          className="rounded-md p-0.5 hover:bg-gray-100"
                          whileTap={{ scale: 0.9 }}
                        >
                          <XIcon className="h-3.5 w-3.5 text-gray-400" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.form>
  )
}


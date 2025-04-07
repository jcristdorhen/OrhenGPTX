import { create } from "zustand"
import { persist } from "zustand/middleware"

export type MessageRole = "user" | "assistant" | "system"

export type Message = {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  attachments?: Array<{
    type: string
    url: string
    name: string
  }>
}

type InputMode = "normal" | "voice" | "search" | "attach"

type ChatState = {
  messages: Message[]
  isLoading: boolean
  isChatMode: boolean
  inputMode: InputMode
  searchResults: Array<{ title: string; url: string; snippet: string }>
  attachments: Array<{ file: File; url: string }>
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  setLoading: (loading: boolean) => void
  setChatMode: (chatMode: boolean) => void
  setInputMode: (mode: InputMode) => void
  setSearchResults: (results: Array<{ title: string; url: string; snippet: string }>) => void
  clearMessages: () => void
  setAttachments: (attachments: Array<{ file: File; url: string }>) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      isChatMode: false,
      inputMode: "normal",
      searchResults: [],
      attachments: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: Date.now(),
              content: message.content.trim(), // Ensure content is trimmed
              role: message.role,
              attachments: message.attachments,
            },
          ],
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      setChatMode: (chatMode) => set({ isChatMode: chatMode }),
      setInputMode: (mode) => set({ inputMode: mode }),
      setSearchResults: (results) => set({ searchResults: results }),
      clearMessages: () => 
        set({
          messages: [],
          searchResults: [],
          inputMode: "normal",
          isLoading: false,
          isChatMode: false,
          attachments: []
        }),
      setAttachments: (attachments) => set({ attachments }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ 
        messages: state.messages,
        isChatMode: state.isChatMode 
      }),
      storage: {
        getItem: (name) => {
          const data = localStorage.getItem(name);
          if (!data) return null;
          // Clear storage if it's a new session
          if (!sessionStorage.getItem('chatSession')) {
            localStorage.removeItem(name);
            sessionStorage.setItem('chatSession', 'active');
            return null;
          }
          return JSON.parse(data);
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
)

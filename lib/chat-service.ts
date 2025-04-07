import type { Message } from "./store"

export async function sendMessage(messages: Message[], mode = "normal") {
  try {
    // Validate messages array with more detailed error
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array cannot be empty")
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        messages,
        mode 
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to send message")
    }

    if (!data.text) {
      throw new Error("Empty response from AI")
    }

    return data.text
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

export async function processVoiceInput(audioBlob: Blob) {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob)

    const response = await fetch("/api/voice", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to process voice input")
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error("Error processing voice input:", error)
    throw error
  }
}

export async function searchQuery(query: string) {
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error("Failed to process search")
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    console.error("Error processing search:", error)
    throw error
  }
}


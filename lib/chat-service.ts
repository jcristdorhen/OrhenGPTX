import type { Message } from "./store"
import { getInstructions, validateMessage } from './ai-instructions';

export async function sendMessage(messages: Message[], mode = "normal") {
  try {
    const instructions = getInstructions();
    
    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ChatServiceError("Messages array cannot be empty");
    }

    if (!messages.every(validateMessage)) {
      throw new ChatServiceError("Invalid message format");
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        mode,
        instructions // Add instructions to the request
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

export class ChatServiceError extends Error {
  constructor(
    message: string,
    public code: string = 'CHAT_SERVICE_ERROR',
    public status: number = 500
  ) {
    super(message);
    this.name = 'ChatServiceError';
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
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ChatServiceError(
        error.message || 'Failed to process search',
        error.code || 'SEARCH_ERROR',
        response.status
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error processing search:", error);
    if (error instanceof ChatServiceError) {
      throw error;
    }
    throw new ChatServiceError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'SEARCH_ERROR'
    );
  }
}


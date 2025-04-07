import { ChatServiceError } from "@/lib/chat-service";
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body format",
          status: "error",
          code: "INVALID_REQUEST"
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const { messages, mode } = body;

    // Improved validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format - messages must be an array" }), 
        { status: 400, headers: { "Content-Type": "application/json" }}
      )
    }

    // Validate each message
    const isValidMessage = (msg: any) => {
      return msg 
        && typeof msg === 'object'
        && typeof msg.content === 'string' 
        && ['user', 'assistant', 'system'].includes(msg.role);
    }

    if (!messages.every(isValidMessage)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format - each message must have content and valid role" }), 
        { status: 400, headers: { "Content-Type": "application/json" }}
      )
    }

    // Get the model
    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
    })

    // Convert messages to Gemini format
    const formattedHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    })

    // Get the last user message
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || typeof lastMessage.content !== 'string') {
      return new Response(
        JSON.stringify({
          error: "Invalid message format",
          status: "error",
          code: "INVALID_MESSAGE"
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Send the message to Gemini
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    const text = response.text()

    if (!text) {
      throw new Error("Empty response from AI model")
    }

    // Format response with improved structure
    return new Response(
      JSON.stringify({
        text: text.trim(),
        timestamp: Date.now(),
        format: "markdown",
        status: "success"
      }), 
      {
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate"
        }
      }
    )
  } catch (error) {
    console.error("Error processing chat request:", error);
    
    const statusCode = error instanceof ChatServiceError ? error.status : 500;
    const errorCode = error instanceof ChatServiceError ? error.code : 'INTERNAL_ERROR';
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to process request",
        code: errorCode,
        timestamp: Date.now(),
        status: "error"
      }), 
      {
        status: statusCode,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}


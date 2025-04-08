import { ChatServiceError } from "@/lib/chat-service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIModelInstructions } from "@/lib/ai-instructions";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, mode, instructions } = body;

    // Validate request
    if (!body || !messages || !Array.isArray(messages)) {
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

    // Initialize model with instructions
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation", // Change to vision-capable model for image analysis
    });

    // Format messages - ensure first message is from user and handle image data
    const formattedHistory = messages
      .slice(0, -1)
      .filter(msg => msg.role !== 'system')
      .map((msg: any) => {
        // Skip attachment processing for messages without attachments
        if (!msg.attachments?.length) {
          return {
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          };
        }

        // Process attachments and ensure base64 data exists
        const validImageAttachments = msg.attachments
          .filter((att: any) => 
            att.type.startsWith('image/') && 
            att.url.includes('base64,')
          )
          .map((att: any) => ({
            inlineData: {
              mimeType: att.type,
              data: att.url.split('base64,')[1] // More reliable base64 extraction
            }
          }))
          .filter((att: any) => att.inlineData.data); // Ensure data exists

        // Only include attachments if they were processed successfully
        return {
          role: msg.role === "user" ? "user" : "model",
          parts: [
            { text: msg.content },
            ...(validImageAttachments.length > 0 ? validImageAttachments : [])
          ]
        };
      })
      .filter(msg => msg.parts.length > 0); // Remove empty messages

    // Process last message with any attachments
    const lastMessage = messages[messages.length - 1];
    const lastMessageParts = [{ text: lastMessage.content }];

    // Add valid image attachments to last message
    if (lastMessage.attachments?.length) {
      const validImageAttachments = lastMessage.attachments
        .filter((att: any) => 
          att.type.startsWith('image/') && 
          att.url.includes('base64,')
        )
        .map((att: any) => ({
          inlineData: {
            mimeType: att.type,
            data: att.url.split('base64,')[1]
          }
        }))
        .filter((att: any) => att.inlineData.data);

      if (validImageAttachments.length > 0) {
        lastMessageParts.push(...validImageAttachments);
      }
    }

    if (!lastMessageParts.length) {
      throw new Error("Message must contain either text or image content");
    }

    // Start chat with proper history
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      }
    });

    // Send message
    const result = await chat.sendMessage(lastMessageParts);
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


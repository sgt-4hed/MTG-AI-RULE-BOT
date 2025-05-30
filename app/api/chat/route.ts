import { google } from "@ai-sdk/google"
import { streamText } from "ai"

export async function POST(req: Request) {
  console.log("=== Chat API Called (Google AI) ===")

  try {
    // Parse the request
    const body = await req.json()
    console.log("Request body parsed successfully")

    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages:", messages)
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const lastMessage = messages[messages.length - 1]
    console.log("Last message:", lastMessage?.content?.substring(0, 50) + "...")

    // Enhanced system prompt for MTG rules
    const systemPrompt = `You are an expert Magic: The Gathering judge and rules advisor. You provide accurate, helpful answers about MTG rules, interactions, and game mechanics.

GUIDELINES:
- Provide clear, accurate rule explanations based on the comprehensive rules
- Reference specific rule numbers when you know them (e.g., "According to rule 704.3...")
- Give practical examples to illustrate complex interactions
- If multiple rules interact, explain the relationship between them
- For complex scenarios, break down the step-by-step resolution
- Keep responses focused and well-organized
- Use clear language that both new and experienced players can understand
- When discussing timing, be specific about when things happen

RESPONSE FORMAT:
- Start with a direct answer to the question
- Cite relevant rule numbers when applicable
- Provide examples when helpful
- Explain any related concepts that might be confusing

Remember: You are helping players understand Magic: The Gathering rules and interactions.`

    console.log("Calling Google AI API...")

    // Make the Google AI API call using Gemini model
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    console.log("Google AI API call successful, returning stream...")

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("=== Chat API Error ===")
    console.error("Error type:", typeof error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")

    // Return a detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = {
      error: errorMessage,
      type: typeof error,
      timestamp: new Date().toISOString(),
      provider: "Google AI (Gemini)",
    }

    return new Response(JSON.stringify(errorDetails), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

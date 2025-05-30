import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function GET() {
  console.log("=== Testing Google AI Setup ===")

  try {
    // Test environment variable
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    console.log("Google AI API Key exists:", !!apiKey)
    console.log("API Key starts with:", apiKey?.substring(0, 10) + "...")

    // Test simple generation
    console.log("Testing Google AI generation...")

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: "Say 'Hello from MTG AI with Google Gemini!' and nothing else.",
      maxTokens: 20,
    })

    console.log("Google AI test successful!")
    console.log("Response:", result.text)

    return Response.json({
      success: true,
      message: "Google AI is working correctly",
      response: result.text,
      apiKeyConfigured: !!apiKey,
      provider: "Google AI (Gemini 1.5 Flash)",
    })
  } catch (error) {
    console.error("=== Google AI Test Failed ===")
    console.error("Error:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        apiKeyConfigured: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        provider: "Google AI",
      },
      { status: 500 },
    )
  }
}

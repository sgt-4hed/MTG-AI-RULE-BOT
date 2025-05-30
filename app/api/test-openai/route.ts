import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function GET() {
  try {
    console.log("Testing OpenAI connection...")

    const result = await generateText({
      model: openai("gpt-4o"),
      prompt: "Say 'Hello, MTG AI is working!' in exactly those words.",
      maxTokens: 20,
    })

    console.log("OpenAI test successful:", result.text)

    return Response.json({
      success: true,
      message: "OpenAI API is working correctly",
      response: result.text,
    })
  } catch (error) {
    console.error("OpenAI test failed:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "OpenAI API test failed",
      },
      { status: 500 },
    )
  }
}

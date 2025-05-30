import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import {
  searchRulesGuru,
  extractCardNames,
  searchScryfallCard,
  getScryfallRulings,
  formatCardForAI,
  formatRulesForAI,
  searchScryfallCards,
} from "@/lib/mtg-apis"

export async function POST(req: Request) {
  console.log("=== Chat API Called (Google AI with MTG APIs) ===")

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
    const userQuery = lastMessage?.content || ""
    console.log("User query:", userQuery.substring(0, 100) + "...")

    // Extract potential card names from the query
    const potentialCardNames = extractCardNames(userQuery)
    console.log("Potential card names found:", potentialCardNames)

    // Gather additional context from MTG APIs
    let additionalContext = ""

    // Search for card information if card names are mentioned
    if (potentialCardNames.length > 0) {
      console.log("Fetching card information...")

      for (const cardName of potentialCardNames.slice(0, 3)) {
        // Limit to 3 cards to avoid timeout
        try {
          const card = await searchScryfallCard(cardName)
          if (card) {
            console.log(`Found card: ${card.name}`)
            const rulings = await getScryfallRulings(card.name)
            additionalContext += formatCardForAI(card, rulings) + "\n"
          } else {
            // Try fuzzy search if exact match fails
            const fuzzyResults = await searchScryfallCards(cardName)
            if (fuzzyResults.length > 0) {
              console.log(`Found similar card: ${fuzzyResults[0].name}`)
              const rulings = await getScryfallRulings(fuzzyResults[0].name)
              additionalContext += formatCardForAI(fuzzyResults[0], rulings) + "\n"
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch card info for ${cardName}:`, error)
        }
      }
    }

    // Search Rules Guru for relevant rules (if available)
    try {
      console.log("Searching Rules Guru...")
      const rulesResult = await searchRulesGuru(userQuery)
      if (rulesResult.success && rulesResult.data?.rules) {
        console.log(`Found ${rulesResult.data.rules.length} relevant rules`)
        additionalContext += formatRulesForAI(rulesResult.data.rules) + "\n"
      }
    } catch (error) {
      console.warn("Rules Guru search failed:", error)
    }

    // Enhanced system prompt with API context
    const systemPrompt = `You are an expert Magic: The Gathering judge and rules advisor. You provide accurate, helpful answers about MTG rules, interactions, and game mechanics.

${
  additionalContext
    ? `CURRENT CONTEXT FROM MTG DATABASES:
${additionalContext}

Use this information to provide more accurate and detailed answers. Reference specific card text and rulings when relevant.

`
    : ""
}GUIDELINES:
- Provide clear, accurate rule explanations based on the comprehensive rules
- Reference specific rule numbers when you know them (e.g., "According to rule 704.3...")
- Give practical examples to illustrate complex interactions
- If multiple rules interact, explain the relationship between them
- For complex scenarios, break down the step-by-step resolution
- Keep responses focused and well-organized
- Use clear language that both new and experienced players can understand
- When discussing timing, be specific about when things happen
- If you reference card information from the context above, make sure it's accurate
- Always prioritize official rulings and current Oracle text

RESPONSE FORMAT:
- Start with a direct answer to the question
- Cite relevant rule numbers when applicable
- Reference specific card text when discussing cards
- Provide examples when helpful
- Explain any related concepts that might be confusing
- If official rulings exist for mentioned cards, include them

Remember: You are helping players understand Magic: The Gathering rules and interactions with the most current and accurate information available.`

    console.log("Calling Google AI API with enhanced context...")

    // Make the Google AI API call using Gemini model
    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
      maxTokens: 1500, // Increased for more detailed responses
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
      provider: "Google AI (Gemini) with MTG APIs",
    }

    return new Response(JSON.stringify(errorDetails), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

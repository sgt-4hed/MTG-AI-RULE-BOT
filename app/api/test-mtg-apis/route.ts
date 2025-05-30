import {
  searchRulesGuru,
  searchScryfallCard,
  getScryfallRulings,
  searchScryfallCards,
  extractCardNames,
} from "@/lib/mtg-apis"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testCard = searchParams.get("card") || "Lightning Bolt"
  const testQuery = searchParams.get("query") || "priority"

  const results = {
    timestamp: new Date().toISOString(),
    tests: {} as any,
  }

  // Test card name extraction
  console.log("Testing card name extraction...")
  const sampleText = `What happens when I cast "Lightning Bolt" targeting a creature with "Counterspell" on the stack?`
  results.tests.cardNameExtraction = {
    input: sampleText,
    extracted: extractCardNames(sampleText),
  }

  // Test Scryfall card search
  console.log("Testing Scryfall card search...")
  try {
    const card = await searchScryfallCard(testCard)
    results.tests.scryfallCard = {
      success: true,
      card: card
        ? {
            name: card.name,
            type: card.type_line,
            text: card.oracle_text?.substring(0, 100) + "...",
            hasRulings: !!card.rulings_uri,
          }
        : null,
    }

    // Test rulings if card found
    if (card) {
      console.log("Testing Scryfall rulings...")
      const rulings = await getScryfallRulings(card.name)
      results.tests.scryfallRulings = {
        success: true,
        count: rulings.length,
        sample: rulings.slice(0, 2).map((r) => ({
          date: r.published_at,
          text: r.comment.substring(0, 100) + "...",
        })),
      }
    }
  } catch (error) {
    results.tests.scryfallCard = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }

  // Test fuzzy card search
  console.log("Testing Scryfall fuzzy search...")
  try {
    const fuzzyResults = await searchScryfallCards("Lightning")
    results.tests.scryfallFuzzy = {
      success: true,
      count: fuzzyResults.length,
      sample: fuzzyResults.slice(0, 3).map((c) => c.name),
    }
  } catch (error) {
    results.tests.scryfallFuzzy = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }

  // Test Rules Guru (may not be available)
  console.log("Testing Rules Guru...")
  try {
    const rulesResult = await searchRulesGuru(testQuery)
    results.tests.rulesGuru = {
      success: rulesResult.success,
      data: rulesResult.success
        ? {
            count: rulesResult.data?.total || 0,
            sample: rulesResult.data?.rules?.slice(0, 2),
          }
        : null,
      error: rulesResult.error,
    }
  } catch (error) {
    results.tests.rulesGuru = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }

  return Response.json(results)
}

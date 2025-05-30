// MTG Rules Guru API and Gatherer integration utilities

export interface RulesGuruResponse {
  success: boolean
  data?: {
    rules: Array<{
      number: string
      text: string
      category?: string
    }>
    total: number
  }
  error?: string
}

export interface GathererCard {
  name: string
  manaCost?: string
  type: string
  text?: string
  power?: string
  toughness?: string
  loyalty?: string
  rulings?: Array<{
    date: string
    text: string
  }>
  printings?: string[]
}

export interface ScryfallCard {
  name: string
  mana_cost?: string
  type_line: string
  oracle_text?: string
  power?: string
  toughness?: string
  loyalty?: string
  rulings_uri?: string
  scryfall_uri: string
}

export interface ScryfallRuling {
  object: string
  oracle_id: string
  source: string
  published_at: string
  comment: string
}

// Rules Guru API functions
export async function searchRulesGuru(query: string): Promise<RulesGuruResponse> {
  try {
    // Rules Guru API endpoint (if available)
    // Note: This is a placeholder - you may need to adjust based on actual API
    const response = await fetch(`https://api.rulesguru.net/search?q=${encodeURIComponent(query)}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MTG-AI-Rulebook/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Rules Guru API error: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.warn("Rules Guru API unavailable:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Scryfall API functions (more reliable than Gatherer scraping)
export async function searchScryfallCard(cardName: string): Promise<ScryfallCard | null> {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MTG-AI-Rulebook/1.0",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Card not found
      }
      throw new Error(`Scryfall API error: ${response.status}`)
    }

    const card = await response.json()
    return card
  } catch (error) {
    console.warn("Scryfall card search failed:", error)
    return null
  }
}

export async function searchScryfallCards(query: string): Promise<ScryfallCard[]> {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MTG-AI-Rulebook/1.0",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return [] // No cards found
      }
      throw new Error(`Scryfall API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.warn("Scryfall card search failed:", error)
    return []
  }
}

export async function getScryfallRulings(cardName: string): Promise<ScryfallRuling[]> {
  try {
    // First get the card
    const card = await searchScryfallCard(cardName)
    if (!card || !card.rulings_uri) {
      return []
    }

    // Then get its rulings
    const response = await fetch(card.rulings_uri, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MTG-AI-Rulebook/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Scryfall rulings API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.warn("Scryfall rulings fetch failed:", error)
    return []
  }
}

// Helper function to extract card names from user queries
export function extractCardNames(text: string): string[] {
  const cardNames: string[] = []

  // Look for quoted card names
  const quotedMatches = text.match(/"([^"]+)"/g)
  if (quotedMatches) {
    cardNames.push(...quotedMatches.map((match) => match.slice(1, -1)))
  }

  // Look for common card name patterns (capitalized words)
  const capitalizedMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g)
  if (capitalizedMatches) {
    // Filter out common words that aren't card names
    const commonWords = new Set([
      "Magic",
      "The",
      "Gathering",
      "MTG",
      "Card",
      "Spell",
      "Creature",
      "Artifact",
      "Enchantment",
      "Instant",
      "Sorcery",
      "Land",
      "Planeswalker",
    ])
    const filteredMatches = capitalizedMatches.filter((match) => !commonWords.has(match) && match.length > 2)
    cardNames.push(...filteredMatches)
  }

  return [...new Set(cardNames)] // Remove duplicates
}

// Helper function to format card information for AI context
export function formatCardForAI(card: ScryfallCard, rulings?: ScryfallRuling[]): string {
  let cardInfo = `**${card.name}**\n`

  if (card.mana_cost) {
    cardInfo += `Mana Cost: ${card.mana_cost}\n`
  }

  cardInfo += `Type: ${card.type_line}\n`

  if (card.oracle_text) {
    cardInfo += `Text: ${card.oracle_text}\n`
  }

  if (card.power && card.toughness) {
    cardInfo += `Power/Toughness: ${card.power}/${card.toughness}\n`
  }

  if (card.loyalty) {
    cardInfo += `Loyalty: ${card.loyalty}\n`
  }

  if (rulings && rulings.length > 0) {
    cardInfo += `\nRecent Rulings:\n`
    rulings.slice(0, 3).forEach((ruling) => {
      cardInfo += `- (${ruling.published_at}) ${ruling.comment}\n`
    })
  }

  return cardInfo
}

// Helper function to format rules for AI context
export function formatRulesForAI(rules: Array<{ number: string; text: string; category?: string }>): string {
  if (rules.length === 0) return ""

  let rulesInfo = `**Relevant MTG Rules:**\n`
  rules.slice(0, 5).forEach((rule) => {
    rulesInfo += `${rule.number}: ${rule.text}\n`
    if (rule.category) {
      rulesInfo += `(Category: ${rule.category})\n`
    }
    rulesInfo += `\n`
  })

  return rulesInfo
}

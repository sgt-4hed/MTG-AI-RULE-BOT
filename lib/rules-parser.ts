export interface ParsedMTGRule {
  number: string
  content: string
  category: string
  subcategory?: string
  section: string
  keywords?: string[]
}

export interface RuleSection {
  number: string
  title: string
  rules: ParsedMTGRule[]
}

export async function fetchAndParseOfficialRules(url: string): Promise<ParsedMTGRule[]> {
  console.log("Fetching official MTG Comprehensive Rules...")

  try {
    // Fix URL encoding issues
    const cleanUrl = url.replace(/%20/g, " ")
    console.log("Attempting to fetch from:", cleanUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MTG-Rulebook-App/1.0",
        Accept: "text/plain, text/*, */*",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }

    const text = await response.text()

    if (!text || text.length < 1000) {
      throw new Error("Received empty or invalid rules document")
    }

    console.log(`Fetched rules document (${text.length} characters)`)
    console.log("Parsing rules document...")

    const parsedRules = parseRulesDocument(text)

    // Ensure we return an array
    if (!Array.isArray(parsedRules)) {
      throw new Error("Failed to parse rules document - invalid format")
    }

    return parsedRules
  } catch (error) {
    console.error("Failed to fetch rules:", error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out while fetching rules document")
      }
      throw new Error(`Failed to fetch official rules document: ${error.message}`)
    }

    throw new Error("Failed to fetch official rules document")
  }
}

export function parseRulesDocument(text: string): ParsedMTGRule[] {
  // Ensure we have a string to work with
  if (typeof text !== "string" || !text) {
    console.error("Invalid text provided to parseRulesDocument")
    return []
  }

  const lines = text.split("\n")
  const rules: ParsedMTGRule[] = []

  // Ensure lines is an array
  if (!Array.isArray(lines)) {
    console.error("Failed to split text into lines")
    return []
  }

  let currentSection = ""
  let currentSectionTitle = ""
  let currentCategory = ""

  // Section mappings for better categorization
  const sectionMappings: Record<string, string> = {
    "1": "Game Concepts",
    "2": "Parts of a Card",
    "3": "Card Types",
    "4": "Zones",
    "5": "Turn Structure",
    "6": "Spells, Abilities, and Effects",
    "7": "Additional Rules",
    "8": "Multiplayer Rules",
    "9": "Casual Variants",
  }

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || ""

      // Skip empty lines
      if (!line) continue

      // Detect section headers (like "1. Game Concepts")
      const sectionMatch = line.match(/^(\d+)\.\s+(.+)$/)
      if (sectionMatch && line.length < 100) {
        currentSection = sectionMatch[1] || ""
        currentSectionTitle = sectionMatch[2] || ""
        currentCategory = sectionMappings[currentSection] || currentSectionTitle
        continue
      }

      // Detect subsection headers (like "100. General")
      const subsectionMatch = line.match(/^(\d{3})\.\s+(.+)$/)
      if (subsectionMatch && line.length < 100) {
        // This is a subsection, we can use it for subcategory
        continue
      }

      // Detect rule numbers (like "100.1", "100.1a", "100.2b", etc.)
      const ruleMatch = line.match(/^(\d{3}\.\d+[a-z]?)\.\s+(.+)$/)
      if (ruleMatch) {
        const ruleNumber = ruleMatch[1] || ""
        let ruleContent = ruleMatch[2] || ""

        // Check if the rule continues on the next lines
        let j = i + 1
        while (j < lines.length) {
          const nextLine = lines[j]?.trim() || ""

          // If next line starts with a rule number or section, stop
          if (nextLine.match(/^\d{3}\.\d+[a-z]?\./)) break
          if (nextLine.match(/^\d+\.\s+/)) break
          if (nextLine.match(/^\d{3}\.\s+/)) break

          // If it's an empty line, check if there's more content after
          if (!nextLine) {
            // Look ahead to see if there's more content
            if (
              j + 1 < lines.length &&
              lines[j + 1]?.trim() &&
              !lines[j + 1].trim().match(/^\d{3}\.\d+[a-z]?\./) &&
              !lines[j + 1].trim().match(/^\d+\.\s+/) &&
              !lines[j + 1].trim().match(/^\d{3}\.\s+/)
            ) {
              ruleContent += " "
              j++
              continue
            } else {
              break
            }
          }

          // Add the line to the rule content
          ruleContent += " " + nextLine
          j++
        }

        // Extract keywords from the rule content
        const keywords = extractKeywords(ruleContent)

        // Determine subcategory based on rule number ranges
        const subcategory = getSubcategoryFromRuleNumber(ruleNumber)

        // Only add valid rules
        if (ruleNumber && ruleContent) {
          rules.push({
            number: ruleNumber,
            content: ruleContent.trim(),
            category: currentCategory || "General",
            subcategory,
            section: currentSection || "0",
            keywords: Array.isArray(keywords) ? keywords : [],
          })
        }

        // Update the loop counter
        i = j - 1
      }
    }
  } catch (error) {
    console.error("Error parsing rules document:", error)
    return []
  }

  console.log(`Parsed ${rules.length} rules from official document`)
  return rules
}

function extractKeywords(content: string): string[] {
  // Ensure content is a string
  if (typeof content !== "string") {
    return []
  }

  const keywords: Set<string> = new Set()

  // Common MTG keywords and terms
  const mtgTerms = [
    "mana",
    "spell",
    "ability",
    "creature",
    "artifact",
    "enchantment",
    "instant",
    "sorcery",
    "land",
    "planeswalker",
    "battlefield",
    "graveyard",
    "library",
    "hand",
    "exile",
    "stack",
    "combat",
    "attack",
    "block",
    "damage",
    "life",
    "counter",
    "token",
    "permanent",
    "activated",
    "triggered",
    "static",
    "priority",
    "phase",
    "step",
    "turn",
    "player",
    "target",
    "choose",
    "control",
    "owner",
    "cast",
    "play",
    "draw",
    "discard",
    "flying",
    "trample",
    "first strike",
    "double strike",
    "deathtouch",
    "lifelink",
    "vigilance",
    "reach",
    "haste",
    "hexproof",
    "indestructible",
    "menace",
    "prowess",
  ]

  try {
    const contentLower = content.toLowerCase()

    // Add MTG terms that appear in the content
    mtgTerms.forEach((term) => {
      if (contentLower.includes(term)) {
        keywords.add(term)
      }
    })

    // Extract quoted terms (often important game terms)
    const quotedTerms = content.match(/"([^"]+)"/g)
    if (quotedTerms && Array.isArray(quotedTerms)) {
      quotedTerms.forEach((quoted) => {
        const term = quoted.replace(/"/g, "").toLowerCase()
        if (term.length > 2 && term.length < 20) {
          keywords.add(term)
        }
      })
    }
  } catch (error) {
    console.error("Error extracting keywords:", error)
  }

  return Array.from(keywords)
}

function getSubcategoryFromRuleNumber(ruleNumber: string): string | undefined {
  // Ensure ruleNumber is a string
  if (typeof ruleNumber !== "string" || !ruleNumber) {
    return undefined
  }

  try {
    const num = Number.parseInt(ruleNumber.split(".")[0])

    // Map rule number ranges to subcategories
    const subcategoryMappings: Record<string, string> = {
      // Game Concepts (100-199)
      "100": "General",
      "101": "Starting the Game",
      "102": "Players",
      "103": "Ending the Game",
      "104": "Numbers and Symbols",
      "105": "Colors",
      "106": "Mana",
      "107": "Numbers and Symbols",
      "108": "Cards",
      "109": "Objects",
      "110": "Permanents",
      "111": "Tokens",
      "112": "Spells",
      "113": "Abilities",
      "114": "Emblems",
      "115": "Targets",
      "116": "Special Actions",
      "117": "Timing and Priority",
      "118": "Life",
      "119": "Damage",
      "120": "Drawing a Card",
      "121": "Counters",

      // Parts of a Card (200-299)
      "200": "General",
      "201": "Name",
      "202": "Mana Cost and Color",
      "203": "Color Indicator",
      "204": "Type Line",
      "205": "Text Box",
      "206": "Power/Toughness",
      "207": "Loyalty",
      "208": "Hand Modifier",
      "209": "Life Modifier",

      // Card Types (300-399)
      "300": "General",
      "301": "Artifacts",
      "302": "Creatures",
      "303": "Enchantments",
      "304": "Instants",
      "305": "Lands",
      "306": "Planeswalkers",
      "307": "Sorceries",
      "308": "Tribals",
      "309": "Dungeons",

      // Zones (400-499)
      "400": "General",
      "401": "Library",
      "402": "Hand",
      "403": "Battlefield",
      "404": "Graveyard",
      "405": "Stack",
      "406": "Exile",
      "407": "Ante",
      "408": "Command",

      // Turn Structure (500-599)
      "500": "General",
      "501": "Beginning Phase",
      "502": "Untap Step",
      "503": "Upkeep Step",
      "504": "Draw Step",
      "505": "Main Phase",
      "506": "Combat Phase",
      "507": "Beginning of Combat Step",
      "508": "Declare Attackers Step",
      "509": "Declare Blockers Step",
      "510": "Combat Damage Step",
      "511": "End of Combat Step",
      "512": "Ending Phase",
      "513": "End Step",
      "514": "Cleanup Step",

      // Spells, Abilities, and Effects (600-699)
      "600": "General",
      "601": "Casting Spells",
      "602": "Activating Activated Abilities",
      "603": "Handling Triggered Abilities",
      "604": "Handling Static Abilities",
      "605": "Mana Abilities",
      "606": "Loyalty Abilities",
      "607": "Linked Abilities",
      "608": "Resolving Spells and Abilities",
      "609": "Effects",
      "610": "One-Shot Effects",
      "611": "Continuous Effects",
      "612": "Text-Changing Effects",
      "613": "Interaction of Continuous Effects",
      "614": "Replacement Effects",
      "615": "Prevention Effects",
      "616": "Interaction of Replacement/Prevention Effects",

      // Additional Rules (700-799)
      "700": "General",
      "701": "Keyword Actions",
      "702": "Keyword Abilities",
      "703": "Turn-Based Actions",
      "704": "State-Based Actions",
      "705": "Flipping a Coin",
      "706": "Copying Objects",
      "707": "Face-Down Spells and Permanents",
      "708": "Split Cards",
      "709": "Flip Cards",
      "710": "Leveler Cards",
      "711": "Double-Faced Cards",
      "712": "Meld Cards",
      "713": "Checklist Cards",
      "714": "Saga Cards",
      "715": "Adventures",
      "716": "Modal Double-Faced Cards",
      "717": "Class Cards",
    }

    const prefix = num.toString()
    return subcategoryMappings[prefix]
  } catch (error) {
    console.error("Error getting subcategory:", error)
    return undefined
  }
}

// Fallback sample rules in case the official fetch fails
export function getFallbackRules(): ParsedMTGRule[] {
  return [
    {
      number: "100.1",
      content:
        "These Magic rules apply to any Magic game with two or more players, including two-player games and multiplayer games.",
      category: "Game Concepts",
      subcategory: "General",
      section: "1",
      keywords: ["game", "players", "multiplayer"],
    },
    {
      number: "101.1",
      content:
        "At the start of a game, each player shuffles their deck so that the cards are in a random order. Each player's deck becomes their library.",
      category: "Game Concepts",
      subcategory: "Starting the Game",
      section: "1",
      keywords: ["shuffle", "deck", "library", "random"],
    },
    {
      number: "117.1",
      content:
        "Unless a spell or ability is instructing a player to take an action, which player can take actions at any given time is determined by a system of priority.",
      category: "Game Concepts",
      subcategory: "Timing and Priority",
      section: "1",
      keywords: ["priority", "timing", "actions"],
    },
    {
      number: "405.1",
      content:
        "When a spell is cast, the physical card is put on the stack. When an ability is activated or triggers, it goes on top of the stack without any card associated with it.",
      category: "Zones",
      subcategory: "Stack",
      section: "4",
      keywords: ["stack", "spells", "abilities", "LIFO"],
    },
    {
      number: "608.1",
      content: "Each time all players pass in succession, the spell or ability on top of the stack resolves.",
      category: "Spells, Abilities, and Effects",
      subcategory: "Resolving Spells and Abilities",
      section: "6",
      keywords: ["resolve", "stack", "priority"],
    },
    {
      number: "704.3",
      content:
        "Whenever a player would get priority, the game checks for and resolves all applicable state-based actions simultaneously as a single event.",
      category: "Additional Rules",
      subcategory: "State-Based Actions",
      section: "7",
      keywords: ["state-based actions", "priority", "simultaneous"],
    },
    {
      number: "702.9",
      content:
        "Flying is an evasion ability. A creature with flying can't be blocked except by creatures with flying and/or reach.",
      category: "Additional Rules",
      subcategory: "Keyword Abilities",
      section: "7",
      keywords: ["flying", "evasion", "blocked", "reach"],
    },
    {
      number: "702.19",
      content:
        "Trample is a static ability that modifies the rules for assigning an attacking creature's combat damage.",
      category: "Additional Rules",
      subcategory: "Keyword Abilities",
      section: "7",
      keywords: ["trample", "combat damage", "excess damage"],
    },
    {
      number: "506.1",
      content:
        "The combat phase has five steps, in this order: beginning of combat, declare attackers, declare blockers, combat damage, and end of combat.",
      category: "Turn Structure",
      subcategory: "Combat Phase",
      section: "5",
      keywords: ["combat", "attackers", "blockers", "damage"],
    },
    {
      number: "601.1",
      content:
        "Previously, the action of casting a spell, or casting a card as a spell, was referred to on cards as 'playing' that spell or that card.",
      category: "Spells, Abilities, and Effects",
      subcategory: "Casting Spells",
      section: "6",
      keywords: ["casting", "spells", "playing"],
    },
  ]
}

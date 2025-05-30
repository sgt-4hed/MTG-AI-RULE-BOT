import { Redis } from "@upstash/redis"
import { fetchAndParseOfficialRules, getFallbackRules, type ParsedMTGRule } from "./rules-parser"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface MTGRule {
  number: string
  title: string
  content: string
  category: string
  subcategory?: string
  keywords?: string[]
  examples?: string[]
}

// Try multiple URLs for the official rules
const OFFICIAL_RULES_URLS = [
  "https://media.wizards.com/2025/downloads/MagicCompRules 20250404.txt",
  "https://media.wizards.com/2024/downloads/MagicCompRules 20241206.txt",
  "https://media.wizards.com/2024/downloads/MagicCompRules 20241101.txt",
]

export interface SearchFilters {
  category?: string
  subcategory?: string
  ruleType?: string
  keywords?: string[]
  complexity?: string
}

// Define rule types based on rule number patterns
const ruleTypePatterns = {
  "Game Mechanics": [/^1\d{2}\.\d+/, /^5\d{2}\.\d+/],
  "Card Rules": [/^2\d{2}\.\d+/, /^3\d{2}\.\d+/],
  Abilities: [/^6\d{2}\.\d+/, /^7\d{2}\.1\d+/],
  "State-Based Actions": [/^704\.\d+/],
  "Keyword Abilities": [/^702\.\d+/],
  Zones: [/^4\d{2}\.\d+/],
  Multiplayer: [/^8\d{2}\.\d+/],
  Variants: [/^9\d{2}\.\d+/],
}

// Define complexity levels based on rule content and structure
function getRuleComplexity(rule: MTGRule): string {
  if (!rule || !rule.content) return "Basic"

  // Rules with examples or long explanations are often more complex
  if (rule.content.length > 300) return "Advanced"

  // Rules with specific technical terms tend to be more complex
  const complexTerms = [
    "layers",
    "continuous effect",
    "replacement effect",
    "state-based action",
    "priority",
    "stack",
    "triggered ability",
    "resolution",
    "interaction",
  ]

  for (const term of complexTerms) {
    if (rule.content.toLowerCase().includes(term)) return "Advanced"
  }

  // Rules with multiple conditions or exceptions are more complex
  if (
    (rule.content.match(/if/gi) || []).length > 1 ||
    rule.content.includes("except") ||
    rule.content.includes("unless") ||
    rule.content.includes("however")
  ) {
    return "Intermediate"
  }

  // Default to basic
  return "Basic"
}

// Get rule type based on rule number
function getRuleType(ruleNumber: string): string {
  if (!ruleNumber) return "General"

  for (const [type, patterns] of Object.entries(ruleTypePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(ruleNumber)) return type
    }
  }
  return "General"
}

export async function cacheResponse(question: string, answer: string) {
  const key = `mtg:qa:${Buffer.from(question.toLowerCase()).toString("base64")}`
  await redis.setex(key, 3600, answer) // Cache for 1 hour
}

export async function getCachedResponse(question: string): Promise<string | null> {
  const key = `mtg:qa:${Buffer.from(question.toLowerCase()).toString("base64")}`
  return await redis.get(key)
}

export async function initializeOfficialRulesDatabase() {
  console.log("Initializing MTG Comprehensive Rules database...")

  try {
    // Check if rules are already loaded
    const existingRulesCount = await redis.get("mtg:rules:count")
    if (existingRulesCount && Number.parseInt(existingRulesCount as string) > 5) {
      console.log(`Rules already loaded (${existingRulesCount} rules). Skipping initialization.`)
      return {
        success: true,
        rulesLoaded: Number.parseInt(existingRulesCount as string),
        message: "Rules already loaded",
        usedFallback: false,
      }
    }

    let officialRules: ParsedMTGRule[] = []
    let usedFallback = false
    let lastError: string | null = null

    // Try to fetch from official sources
    for (const url of OFFICIAL_RULES_URLS) {
      try {
        console.log(`Attempting to fetch rules from: ${url}`)
        const fetchedRules = await fetchAndParseOfficialRules(url)

        // Ensure we got a valid array
        if (Array.isArray(fetchedRules) && fetchedRules.length > 10) {
          officialRules = fetchedRules
          console.log(`Successfully fetched ${officialRules.length} rules from official source`)
          break
        } else {
          throw new Error("Invalid or empty rules data received")
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${url}:`, error)
        lastError = error instanceof Error ? error.message : "Unknown error"
        continue
      }
    }

    // If all official sources fail, use fallback rules
    if (!Array.isArray(officialRules) || officialRules.length === 0) {
      console.log("All official sources failed, using fallback rules...")
      officialRules = getFallbackRules()
      usedFallback = true
    }

    // Ensure we have a valid array
    if (!Array.isArray(officialRules)) {
      throw new Error("Failed to get valid rules array")
    }

    console.log(`Processing ${officialRules.length} rules...`)

    // Clear existing rules
    try {
      const existingKeys = await redis.keys("rule:*")
      if (Array.isArray(existingKeys) && existingKeys.length > 0) {
        await redis.del(...existingKeys)
      }
    } catch (error) {
      console.warn("Failed to clear existing rules:", error)
    }

    // Clear existing search indexes
    try {
      const searchKeys = await redis.keys("search:*")
      if (Array.isArray(searchKeys) && searchKeys.length > 0) {
        await redis.del(...searchKeys)
      }
    } catch (error) {
      console.warn("Failed to clear search indexes:", error)
    }

    // Store all rules in Redis with multiple indexes for efficient searching
    for (const rule of officialRules) {
      if (!rule || !rule.number || !rule.content) {
        console.warn("Skipping invalid rule:", rule)
        continue
      }

      try {
        // Store the full rule
        await redis.hset(`rule:${rule.number}`, {
          number: rule.number,
          title: rule.subcategory || "General",
          content: rule.content,
          category: rule.category || "General",
          subcategory: rule.subcategory || "",
          section: rule.section || "0",
          keywords: JSON.stringify(Array.isArray(rule.keywords) ? rule.keywords : []),
          examples: JSON.stringify([]), // Official rules don't have separate examples
        })

        // Create search indexes
        const searchTerms = [
          ...(rule.content ? rule.content.toLowerCase().split(/\s+/) : []),
          ...(Array.isArray(rule.keywords) ? rule.keywords.map((k) => k.toLowerCase()) : []),
          rule.number.toLowerCase(),
          (rule.category || "").toLowerCase(),
          ...(rule.subcategory ? rule.subcategory.toLowerCase().split(/\s+/) : []),
        ].filter((term) => term && term.length > 2 && !isCommonWord(term)) // Filter out short words and common words

        // Add to search index (limit to avoid too many small terms)
        const uniqueTerms = [...new Set(searchTerms)].slice(0, 20)
        for (const term of uniqueTerms) {
          if (term) {
            await redis.sadd(`search:${term}`, rule.number)
          }
        }

        // Add to category index
        if (rule.category) {
          await redis.sadd(`category:${rule.category.toLowerCase().replace(/\s+/g, "_")}`, rule.number)
        }
        if (rule.subcategory) {
          await redis.sadd(`subcategory:${rule.subcategory.toLowerCase().replace(/\s+/g, "_")}`, rule.number)
        }
      } catch (error) {
        console.warn(`Failed to store rule ${rule.number}:`, error)
        continue
      }
    }

    // Store rule count and metadata
    await redis.set("mtg:rules:count", officialRules.length)
    await redis.set("mtg:rules:last_updated", new Date().toISOString())
    await redis.set("mtg:rules:used_fallback", usedFallback.toString())

    const message = usedFallback
      ? `Loaded ${officialRules.length} fallback rules (official source unavailable)`
      : `Successfully loaded ${officialRules.length} official MTG rules`

    console.log(message)

    return {
      success: true,
      rulesLoaded: officialRules.length,
      message,
      usedFallback,
      lastError: usedFallback ? lastError : null,
    }
  } catch (error) {
    console.error("Failed to initialize rules database:", error)
    throw error
  }
}

function isCommonWord(word: string): boolean {
  if (!word || typeof word !== "string") return true

  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "must",
    "shall",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "they",
    "them",
    "their",
    "you",
    "your",
    "if",
    "when",
    "where",
    "why",
    "how",
    "what",
    "who",
    "which",
    "than",
    "then",
    "as",
    "so",
  ])
  return commonWords.has(word.toLowerCase())
}

// Get all available keywords from the database
export async function getAllKeywords(): Promise<string[]> {
  try {
    // Get a sample of rules to extract keywords
    const sampleRuleKeys = await redis.keys("rule:*")
    if (!Array.isArray(sampleRuleKeys)) return []

    const sampleRules = await Promise.all(
      sampleRuleKeys.slice(0, 100).map(async (key) => {
        try {
          const rule = await redis.hgetall(key)
          return rule && rule.keywords ? JSON.parse(rule.keywords) : []
        } catch (error) {
          return []
        }
      }),
    )

    // Flatten and deduplicate keywords
    const allKeywords = Array.from(new Set(sampleRules.flat().filter(Boolean))).sort()

    return Array.isArray(allKeywords) ? allKeywords : []
  } catch (error) {
    console.error("Failed to get keywords:", error)
    return []
  }
}

// Enhanced search function with filters
export async function searchRulesWithFilters(query: string, filters: SearchFilters = {}): Promise<MTGRule[]> {
  try {
    const queryLower = query.toLowerCase()
    const searchTerms = queryLower.split(/\s+/).filter((term) => term.length > 2)

    let ruleNumbers: Set<string> = new Set()

    // If searching within a specific category
    if (filters.category) {
      const categoryKey = filters.category.toLowerCase().replace(/\s+/g, "_")
      const categoryRules = await redis.smembers(`category:${categoryKey}`)
      ruleNumbers = new Set(Array.isArray(categoryRules) ? categoryRules : [])
    }

    // If searching within a specific subcategory
    if (filters.subcategory && ruleNumbers.size > 0) {
      const subcategoryKey = filters.subcategory.toLowerCase().replace(/\s+/g, "_")
      const subcategoryRules = await redis.smembers(`subcategory:${subcategoryKey}`)
      const subcategoryArray = Array.isArray(subcategoryRules) ? subcategoryRules : []
      ruleNumbers = new Set([...ruleNumbers].filter((x) => subcategoryArray.includes(x)))
    }

    // Search for rules matching the query terms
    if (searchTerms.length > 0) {
      const matchingSets = await Promise.all(
        searchTerms.map(async (term) => {
          const results = await redis.smembers(`search:${term}`)
          return Array.isArray(results) ? results : []
        }),
      )

      // Find intersection of all search terms (AND logic)
      let intersection = new Set(matchingSets[0] || [])
      for (let i = 1; i < matchingSets.length; i++) {
        intersection = new Set([...intersection].filter((x) => matchingSets[i].includes(x)))
      }

      // If we have a category filter, intersect with category results
      if ((filters.category || filters.subcategory) && ruleNumbers.size > 0) {
        intersection = new Set([...intersection].filter((x) => ruleNumbers.has(x)))
      } else if (!filters.category && !filters.subcategory) {
        ruleNumbers = intersection
      }
    }

    // Direct rule number search
    if (queryLower.match(/^\d+(\.\d+[a-z]?)?$/)) {
      ruleNumbers.add(queryLower)
    }

    // Fetch the actual rule data
    let rules: MTGRule[] = []
    const ruleNumbersArray = Array.from(ruleNumbers).slice(0, 200) // Limit to 200 results for performance

    for (const ruleNumber of ruleNumbersArray) {
      try {
        const ruleData = await redis.hgetall(`rule:${ruleNumber}`)
        if (ruleData && Object.keys(ruleData).length > 0) {
          rules.push({
            number: ruleData.number || "",
            title: ruleData.title || "",
            content: ruleData.content || "",
            category: ruleData.category || "",
            subcategory: ruleData.subcategory || undefined,
            keywords: ruleData.keywords ? JSON.parse(ruleData.keywords) : undefined,
            examples: ruleData.examples ? JSON.parse(ruleData.examples) : undefined,
          })
        }
      } catch (error) {
        console.warn(`Failed to fetch rule ${ruleNumber}:`, error)
        continue
      }
    }

    // Apply post-fetch filters
    if (filters.ruleType || filters.keywords || filters.complexity) {
      rules = rules.filter((rule) => {
        // Filter by rule type
        if (filters.ruleType && getRuleType(rule.number) !== filters.ruleType) {
          return false
        }

        // Filter by keywords (any match)
        if (filters.keywords && Array.isArray(filters.keywords) && filters.keywords.length > 0) {
          const ruleKeywords = Array.isArray(rule.keywords) ? rule.keywords : []
          if (!filters.keywords.some((k) => ruleKeywords.includes(k))) {
            return false
          }
        }

        // Filter by complexity
        if (filters.complexity && getRuleComplexity(rule) !== filters.complexity) {
          return false
        }

        return true
      })
    }

    // Sort by rule number
    return rules.sort((a, b) => {
      const aNum = Number.parseFloat(a.number.replace(/[a-z]/g, ""))
      const bNum = Number.parseFloat(b.number.replace(/[a-z]/g, ""))
      return aNum - bNum
    })
  } catch (error) {
    console.error("Search failed:", error)
    return []
  }
}

// Get all subcategories for a category
export async function getSubcategoriesForCategory(category: string): Promise<string[]> {
  try {
    const categoryKey = category.toLowerCase().replace(/\s+/g, "_")
    const rules = await redis.smembers(`category:${categoryKey}`)
    const rulesArray = Array.isArray(rules) ? rules : []

    // Get unique subcategories
    const subcategories = new Set<string>()

    for (const ruleNumber of rulesArray.slice(0, 100)) {
      // Limit for performance
      try {
        const rule = await redis.hgetall(`rule:${ruleNumber}`)
        if (rule && rule.subcategory) {
          subcategories.add(rule.subcategory)
        }
      } catch (error) {
        continue
      }
    }

    return Array.from(subcategories).sort()
  } catch (error) {
    console.error("Failed to get subcategories:", error)
    return []
  }
}

// Get all rule types
export function getAllRuleTypes(): string[] {
  return Object.keys(ruleTypePatterns).concat(["General"])
}

// Get all complexity levels
export function getComplexityLevels(): string[] {
  return ["Basic", "Intermediate", "Advanced"]
}

export async function searchRules(query: string, category?: string): Promise<MTGRule[]> {
  return searchRulesWithFilters(query, { category })
}

export async function getRulesByCategory(category: string): Promise<MTGRule[]> {
  try {
    const categoryKey = category.toLowerCase().replace(/\s+/g, "_")
    const ruleNumbers = await redis.smembers(`category:${categoryKey}`)
    const ruleNumbersArray = Array.isArray(ruleNumbers) ? ruleNumbers : []

    const rules: MTGRule[] = []
    for (const ruleNumber of ruleNumbersArray.slice(0, 200)) {
      // Limit for performance
      try {
        const ruleData = await redis.hgetall(`rule:${ruleNumber}`)
        if (ruleData && Object.keys(ruleData).length > 0) {
          rules.push({
            number: ruleData.number || "",
            title: ruleData.title || "",
            content: ruleData.content || "",
            category: ruleData.category || "",
            subcategory: ruleData.subcategory || undefined,
            keywords: ruleData.keywords ? JSON.parse(ruleData.keywords) : undefined,
            examples: ruleData.examples ? JSON.parse(ruleData.examples) : undefined,
          })
        }
      } catch (error) {
        continue
      }
    }

    return rules.sort((a, b) => {
      const aNum = Number.parseFloat(a.number.replace(/[a-z]/g, ""))
      const bNum = Number.parseFloat(b.number.replace(/[a-z]/g, ""))
      return aNum - bNum
    })
  } catch (error) {
    console.error("Failed to get rules by category:", error)
    return []
  }
}

export async function getRandomRule(): Promise<MTGRule | null> {
  try {
    // Get a random rule number from the search index
    const searchKeys = await redis.keys("search:*")
    if (!Array.isArray(searchKeys) || searchKeys.length === 0) return null

    const randomSearchKey = searchKeys[Math.floor(Math.random() * searchKeys.length)]
    const ruleNumbers = await redis.smembers(randomSearchKey)
    const ruleNumbersArray = Array.isArray(ruleNumbers) ? ruleNumbers : []

    if (ruleNumbersArray.length === 0) return null

    const randomRuleNumber = ruleNumbersArray[Math.floor(Math.random() * ruleNumbersArray.length)]
    const ruleData = await redis.hgetall(`rule:${randomRuleNumber}`)

    if (ruleData && Object.keys(ruleData).length > 0) {
      return {
        number: ruleData.number || "",
        title: ruleData.title || "",
        content: ruleData.content || "",
        category: ruleData.category || "",
        subcategory: ruleData.subcategory || undefined,
        keywords: ruleData.keywords ? JSON.parse(ruleData.keywords) : undefined,
        examples: ruleData.examples ? JSON.parse(ruleData.examples) : undefined,
      }
    }

    return null
  } catch (error) {
    console.error("Failed to get random rule:", error)
    return null
  }
}

export async function getRulesStats() {
  try {
    const count = await redis.get("mtg:rules:count")
    const lastUpdated = await redis.get("mtg:rules:last_updated")
    const usedFallback = await redis.get("mtg:rules:used_fallback")

    return {
      totalRules: count ? Number.parseInt(count as string) : 0,
      lastUpdated: (lastUpdated as string) || null,
      usedFallback: usedFallback === "true",
    }
  } catch (error) {
    console.error("Failed to get rules stats:", error)
    return {
      totalRules: 0,
      lastUpdated: null,
      usedFallback: false,
    }
  }
}

export async function initializeRules() {
  // Initialize with official rules (with fallback)
  return await initializeOfficialRulesDatabase()
}

export { redis }

import {
  searchRulesWithFilters,
  getAllKeywords,
  getAllRuleTypes,
  getComplexityLevels,
  getSubcategoriesForCategory,
} from "@/lib/redis"

export async function POST(req: Request) {
  try {
    const { query, filters = {} } = await req.json()

    if (!query || typeof query !== "string") {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    const rules = await searchRulesWithFilters(query, filters)

    return Response.json({
      rules,
      total: rules.length,
      query,
      filters,
    })
  } catch (error) {
    console.error("Search error:", error)
    return Response.json({ error: "Search failed" }, { status: 500 })
  }
}

// Add a new GET endpoint to fetch filter options
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")

    const keywords = await getAllKeywords()
    const ruleTypes = getAllRuleTypes()
    const complexityLevels = getComplexityLevels()

    let subcategories: string[] = []
    if (category) {
      subcategories = await getSubcategoriesForCategory(category)
    }

    return Response.json({
      keywords,
      ruleTypes,
      complexityLevels,
      subcategories,
    })
  } catch (error) {
    console.error("Failed to get filter options:", error)
    return Response.json({ error: "Failed to get filter options" }, { status: 500 })
  }
}

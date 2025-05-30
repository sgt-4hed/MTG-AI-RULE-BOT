import { getRulesByCategory } from "@/lib/redis"
import { ruleCategories } from "@/lib/mtg-rules-data"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")

  if (!category) {
    return Response.json({ categories: ruleCategories })
  }

  try {
    const rules = await getRulesByCategory(category)
    return Response.json({ rules, category })
  } catch (error) {
    console.error("Category search error:", error)
    return Response.json({ error: "Failed to fetch rules by category" }, { status: 500 })
  }
}

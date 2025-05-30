import { getRulesStats } from "@/lib/redis"

export async function GET() {
  try {
    const stats = await getRulesStats()
    return Response.json(stats)
  } catch (error) {
    console.error("Failed to get rules stats:", error)
    return Response.json({ error: "Failed to get rules statistics" }, { status: 500 })
  }
}

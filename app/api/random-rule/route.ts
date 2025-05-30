import { getRandomRule } from "@/lib/redis"

export async function GET() {
  try {
    const rule = await getRandomRule()
    return Response.json({ rule })
  } catch (error) {
    console.error("Random rule error:", error)
    return Response.json({ error: "Failed to get random rule" }, { status: 500 })
  }
}

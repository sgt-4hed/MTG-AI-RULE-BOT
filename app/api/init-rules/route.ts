import { initializeOfficialRulesDatabase } from "@/lib/redis"

export async function POST() {
  try {
    const result = await initializeOfficialRulesDatabase()
    return Response.json(result)
  } catch (error) {
    console.error("Failed to initialize rules database:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to initialize rules database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

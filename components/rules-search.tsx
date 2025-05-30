"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Search, BookOpen, Shuffle, Download, CheckCircle, AlertTriangle } from "lucide-react"
import AdvancedFilters, { type SearchFilters } from "./advanced-filters"

interface MTGRule {
  number: string
  title: string
  content: string
  category: string
  subcategory?: string
  keywords?: string[]
  examples?: string[]
}

interface RuleCategory {
  id: string
  name: string
  description: string
  subcategories?: string[]
}

interface RulesStats {
  totalRules: number
  lastUpdated: string | null
  usedFallback?: boolean
}

export default function RulesSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<MTGRule[]>([])
  const [categories] = useState<RuleCategory[]>([
    { id: "1", name: "Game Concepts", description: "Basic game concepts and terminology" },
    { id: "2", name: "Parts of a Card", description: "Card components and characteristics" },
    { id: "3", name: "Card Types", description: "Different types of Magic cards" },
    { id: "4", name: "Zones", description: "Game zones where cards exist" },
    { id: "5", name: "Turn Structure", description: "How turns and phases work" },
    { id: "6", name: "Spells, Abilities, and Effects", description: "How spells and abilities work" },
    { id: "7", name: "Additional Rules", description: "Advanced game mechanics" },
    { id: "8", name: "Multiplayer Rules", description: "Rules for games with more than two players" },
    { id: "9", name: "Casual Variants", description: "Alternative ways to play Magic" },
  ])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isSearching, setIsSearching] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initializationStatus, setInitializationStatus] = useState<string>("")
  const [initializationError, setInitializationError] = useState<string>("")
  const [rulesStats, setRulesStats] = useState<RulesStats>({ totalRules: 0, lastUpdated: null })
  const [randomRule, setRandomRule] = useState<MTGRule | null>(null)

  useEffect(() => {
    loadRulesStats()
  }, [])

  useEffect(() => {
    // Update filters when category changes
    setFilters((prev) => ({
      ...prev,
      category: selectedCategory || undefined,
    }))
  }, [selectedCategory])

  const loadRulesStats = async () => {
    try {
      const response = await fetch("/api/rules-stats")
      const stats = await response.json()
      setRulesStats(stats)
    } catch (error) {
      console.error("Failed to load rules stats:", error)
    }
  }

  const initializeOfficialRules = async () => {
    setIsInitializing(true)
    setInitializationStatus("Fetching official MTG Comprehensive Rules...")
    setInitializationError("")

    try {
      const response = await fetch("/api/init-rules", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        setInitializationStatus(result.message)
        if (result.usedFallback) {
          setInitializationError(
            `Note: Using fallback rules because official source was unavailable. ${result.lastError ? `Error: ${result.lastError}` : ""}`,
          )
        }
        await loadRulesStats()
        setTimeout(() => {
          setInitializationStatus("")
          if (!result.usedFallback) {
            setInitializationError("")
          }
        }, 5000)
      } else {
        setInitializationError(`Error: ${result.error}${result.details ? ` - ${result.details}` : ""}`)
        setInitializationStatus("")
      }
    } catch (error) {
      console.error("Failed to initialize rules:", error)
      setInitializationError("Failed to initialize rules database. Please try again.")
      setInitializationStatus("")
    } finally {
      setIsInitializing(false)
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch("/api/search-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          filters,
        }),
      })
      const data = await response.json()
      setResults(data.rules || [])
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCategorySearch = async (category: string) => {
    setIsSearching(true)
    setSelectedCategory(category)

    try {
      const response = await fetch("/api/search-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query || " ", // Send a space if query is empty
          filters: {
            ...filters,
            category,
          },
        }),
      })
      const data = await response.json()
      setResults(data.rules || [])
    } catch (error) {
      console.error("Category search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const getRandomRule = async () => {
    try {
      const response = await fetch("/api/random-rule")
      const data = await response.json()
      setRandomRule(data.rule)
    } catch (error) {
      console.error("Failed to get random rule:", error)
    }
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const isRulesLoaded = rulesStats.totalRules > 0

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Rules Status Card */}
      <Card
        className={`border-2 ${
          isRulesLoaded
            ? rulesStats.usedFallback
              ? "border-yellow-200 bg-yellow-50"
              : "border-green-200 bg-green-50"
            : "border-blue-200 bg-blue-50"
        }`}
      >
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isRulesLoaded ? (
                rulesStats.usedFallback ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )
              ) : (
                <Download className="h-6 w-6 text-blue-600" />
              )}
              <div>
                <h3 className="font-semibold">
                  {isRulesLoaded
                    ? rulesStats.usedFallback
                      ? "Fallback MTG Rules Loaded"
                      : "Official MTG Rules Loaded"
                    : "Load MTG Rules"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isRulesLoaded
                    ? `${rulesStats.totalRules.toLocaleString()} rules loaded${rulesStats.lastUpdated ? ` • Last updated: ${new Date(rulesStats.lastUpdated).toLocaleDateString()}` : ""}`
                    : "Load Magic: The Gathering Comprehensive Rules"}
                </p>
              </div>
            </div>

            {!isRulesLoaded && (
              <Button onClick={initializeOfficialRules} disabled={isInitializing} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {isInitializing ? "Loading..." : "Load Rules"}
              </Button>
            )}
          </div>

          {isInitializing && (
            <div className="mt-4 space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-gray-600">{initializationStatus}</p>
            </div>
          )}

          {initializationStatus && !isInitializing && (
            <div className="mt-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">{initializationStatus}</p>
            </div>
          )}

          {initializationError && (
            <div className="mt-4 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700">{initializationError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search Rules</TabsTrigger>
          <TabsTrigger value="browse">Browse by Category</TabsTrigger>
          <TabsTrigger value="random">Random Rule</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search MTG Comprehensive Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search rules, keywords, or rule numbers (e.g., '704.3', 'priority', 'combat damage')..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Button onClick={handleSearch} disabled={isSearching || !isRulesLoaded}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

              {/* Advanced Filters */}
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                selectedCategory={selectedCategory}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Browse Rules by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${!isRulesLoaded ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => isRulesLoaded && handleCategorySearch(category.name)}
                  >
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <Badge variant="outline" className="text-xs">
                        Section {category.id}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="random" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Random Rule Discovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-gray-600">Discover random MTG rules to expand your knowledge!</p>
                <Button onClick={getRandomRule} disabled={!isRulesLoaded} className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4" />
                  Get Random Rule
                </Button>
              </div>

              {randomRule && (
                <div className="mt-6">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                          {randomRule.number}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{randomRule.title}</h3>
                            <Badge variant="outline">{randomRule.category}</Badge>
                            {randomRule.subcategory && <Badge variant="secondary">{randomRule.subcategory}</Badge>}
                          </div>
                          <p className="text-gray-700 mb-2">{randomRule.content}</p>
                          {randomRule.keywords && randomRule.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {randomRule.keywords.slice(0, 8).map((keyword) => (
                                <Badge key={keyword} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Search Results ({results.length} rules found)</h3>
            {selectedCategory && <Badge variant="secondary">{selectedCategory}</Badge>}
          </div>

          {results.map((rule) => (
            <Card key={rule.number}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">{rule.number}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{rule.title}</h3>
                      <Badge variant="outline">{rule.category}</Badge>
                      {rule.subcategory && <Badge variant="secondary">{rule.subcategory}</Badge>}
                    </div>
                    <p className="text-gray-700 mb-2">{rule.content}</p>
                    {rule.keywords && rule.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rule.keywords.slice(0, 10).map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {rule.keywords.length > 10 && (
                          <Badge variant="outline" className="text-xs">
                            +{rule.keywords.length - 10} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChatInterface from "@/components/chat-interface"
import RulesSearch from "@/components/rules-search"
import { MessageCircle, Search, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MTGRulebookPage() {
  const [rulesLoaded, setRulesLoaded] = useState(false)
  const [isCheckingRules, setIsCheckingRules] = useState(true)

  useEffect(() => {
    // Check if rules are loaded
    const checkRulesStatus = async () => {
      try {
        const response = await fetch("/api/rules-stats")
        const stats = await response.json()
        setRulesLoaded(stats.totalRules > 0)
      } catch (error) {
        console.error("Failed to check rules status:", error)
      } finally {
        setIsCheckingRules(false)
      }
    }

    checkRulesStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="h-10 w-10 text-blue-600" />
            MTG AI Rulebook
          </h1>
          <p className="text-gray-600 text-lg">
            Your AI-powered assistant for Magic: The Gathering rules and interactions
          </p>
        </div>

        {!rulesLoaded && !isCheckingRules && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-yellow-800">Rules Not Loaded</h3>
                  <p className="text-yellow-700">
                    Please load the MTG rules in the Search tab before using the AI assistant.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const searchTab = document.querySelector('[data-value="search"]')
                    if (searchTab instanceof HTMLElement) {
                      searchTab.click()
                    }
                  }}
                >
                  Go to Search Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2" data-value="chat">
              <MessageCircle className="h-4 w-4" />
              Ask AI
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2" data-value="search">
              <Search className="h-4 w-4" />
              Search Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="search">
            <RulesSearch />
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            This AI assistant uses the Magic: The Gathering Comprehensive Rules. For official rulings, consult a
            certified judge or the official MTG website.
          </p>
        </div>
      </div>
    </div>
  )
}

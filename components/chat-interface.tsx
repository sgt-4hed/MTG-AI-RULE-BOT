"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, BookOpen, Zap, AlertCircle, TestTube } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function ChatInterface() {
  const [errorDetails, setErrorDetails] = useState<string>("")
  const [testResult, setTestResult] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error("=== Chat Interface Error ===")
      console.error("Error object:", error)
      console.error("Error message:", error.message)
      console.error("Error cause:", error.cause)

      // Try to extract more details from the error
      let errorMsg = "Unknown error occurred"

      if (error.message) {
        errorMsg = error.message
      }

      // If it's a fetch error, try to get more details
      if (error.cause) {
        errorMsg += ` (${error.cause})`
      }

      setErrorDetails(errorMsg)
    },
    onFinish: () => {
      setErrorDetails("") // Clear error on successful response
    },
  })

  const [suggestions] = useState([
    "What happens when a creature dies?",
    "How does the stack work?",
    "Can I respond to my own spells?",
    "What are state-based actions?",
    "How does priority work?",
    "What is the difference between activated and triggered abilities?",
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as any)
    setErrorDetails("")
  }

  const testGoogleAI = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test")
      const result = await response.json()
      setTestResult(result)
      console.log("Test result:", result)
    } catch (error) {
      console.error("Test failed:", error)
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Test request failed",
        provider: "Google AI",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const clearError = () => {
    setErrorDetails("")
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Magic: The Gathering AI Rulebook
          </CardTitle>
          <p className="text-blue-100 text-sm">
            Ask me anything about MTG rules and interactions • Powered by Google Gemini
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Test Section */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={testGoogleAI}
                disabled={isTesting}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                {isTesting ? "Testing..." : "Test Google AI"}
              </Button>
              {testResult && (
                <span className={`text-sm ${testResult.success ? "text-green-600" : "text-red-600"}`}>
                  {testResult.success ? "✓ Working" : "✗ Failed"}
                </span>
              )}
            </div>
            {testResult && !testResult.success && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                Error: {testResult.error}
                <br />
                <span className="text-gray-600">
                  Need to add GOOGLE_GENERATIVE_AI_API_KEY environment variable. Get a free API key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google AI Studio
                  </a>
                </span>
              </div>
            )}
            {testResult && testResult.success && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                ✓ Google AI is working! Model: {testResult.provider} • Response: "{testResult.response}"
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center text-gray-600 mb-6">
                  <Zap className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to the MTG AI Rulebook!</h3>
                  <p className="text-sm">
                    Ask me any question about Magic: The Gathering rules and I'll help you find the answer.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Powered by Google Gemini 1.5 Flash - Free & Fast</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto p-3 text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                        <span className="text-gray-500">Gemini is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {(error || errorDetails) && (
                  <div className="flex justify-center">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 max-w-[90%]">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">Chat Error</h4>
                          <p className="text-sm mb-2 font-mono text-xs bg-red-100 p-2 rounded">
                            {errorDetails || error?.message || "Unknown error"}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => reload()}>
                              Retry
                            </Button>
                            <Button size="sm" variant="ghost" onClick={clearError}>
                              Clear
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about MTG rules..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

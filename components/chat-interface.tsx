"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, AlertCircle, Database, Search, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function ChatInterface() {
  const [errorDetails, setErrorDetails] = useState<string>("")

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error("=== Chat Interface Error ===")
      let errorMsg = "Unknown error occurred"
      if (error.message) {
        errorMsg = error.message
      }
      if (error.cause) {
        errorMsg += ` (${error.cause})`
      }
      setErrorDetails(errorMsg)
    },
    onFinish: () => {
      setErrorDetails("")
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const clearError = () => {
    setErrorDetails("")
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">AI Rules Assistant</h2>
              <p className="text-blue-100 text-sm">Ask anything about Magic: The Gathering</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Database className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Search className="h-3 w-3 mr-1" />
                Official Rulings
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages Area */}
          <div className="h-[500px] flex flex-col">
            <ScrollArea className="flex-1 p-6">
              {messages.length === 0 ? (
                <div className="space-y-8">
                  {/* Welcome Message */}
                  <div className="text-center py-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to help with MTG rules!</h3>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                      I have access to live card data, official rulings, and comprehensive rules knowledge.
                    </p>
                  </div>

                  {/* Tips */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-blue-900 mb-2">Pro Tips</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Put card names in quotes: "Lightning Bolt", "Jace, the Mind Sculptor"</li>
                          <li>• Ask about specific interactions between cards</li>
                          <li>• I can explain complex timing and priority rules</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-50 text-gray-900 border border-gray-200 shadow-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-50 rounded-2xl p-4 max-w-[80%] border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div
                              className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                          <span className="text-gray-600">Consulting MTG databases...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(error || errorDetails) && (
                    <div className="flex justify-center">
                      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 max-w-[90%]">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">Something went wrong</h4>
                            <p className="text-sm mb-3">{errorDetails || error?.message || "Unknown error occurred"}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => reload()}>
                                Try Again
                              </Button>
                              <Button size="sm" variant="ghost" onClick={clearError}>
                                Dismiss
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

            {/* Input Area */}
            <div className="border-t bg-gray-50 p-6">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about MTG rules, card interactions, or specific mechanics..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Enhanced with live MTG data • Put card names in quotes for best results
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

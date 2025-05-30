"use client"
import ChatInterface from "@/components/chat-interface"

export default function MTGRulebookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-blue-400/20 blur-xl"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 rounded-full bg-purple-400/20 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 rounded-full bg-white/20 blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Official MTG Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src="/images/mtg-logo.png"
                alt="Magic: The Gathering Logo"
                className="h-16 w-auto object-contain drop-shadow-2xl"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/30 via-red-400/30 to-yellow-400/30 rounded-lg blur-lg opacity-50 animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            AI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
              Rulebook
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-2 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered assistant for Magic: The Gathering rules and interactions
          </p>
          <p className="text-blue-300 text-sm">Enhanced with live card database and official rulings</p>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto">
          <ChatInterface />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-blue-200 text-sm max-w-3xl mx-auto">
          <p className="leading-relaxed">
            This AI assistant provides guidance on Magic: The Gathering rules and interactions using live card data. For
            tournament play, always consult a certified judge or official MTG resources.
          </p>
        </div>
      </div>
    </div>
  )
}

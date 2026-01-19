"use client"

import { useState } from "react"
import { ImagePlus, FileJson, Upload, Layout, ChevronDown, X } from "lucide-react"

interface BuildInterfaceProps {
  onAction?: (action: string) => void
}

export default function BuildInterface({ onAction }: BuildInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const [version, setVersion] = useState("v0 Mini")
  const [showUpgrade, setShowUpgrade] = useState(true)

  const actions = [
    { id: "screenshot", icon: ImagePlus, label: "Clone a Screenshot" },
    { id: "figma", icon: FileJson, label: "Import from Figma" },
    { id: "upload", icon: Upload, label: "Upload a Project" },
    { id: "landing", icon: Layout, label: "Landing Page" }
  ]

  const handleBuild = () => {
    if (prompt.trim()) {
      onAction?.("build")
    }
  }

  const handleAction = (actionId: string) => {
    onAction?.(actionId)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#A4A4A4] px-8 md:px-20 lg:px-32 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">
          What do you want to create?
        </h1>

        {/* Input Section */}
        <div className="mb-4">
          <div className="relative flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 focus-within:border-[#3a3a3a] transition-colors">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleBuild()}
              placeholder="Ask v0 to build..."
              className="flex-1 bg-transparent text-[#E6E6E6] placeholder:text-[#5a5a5a] focus:outline-none text-sm"
            />
            <button className="p-2 text-[#7C7D7D] hover:text-[#A4A4A4] transition-colors">
              <span className="text-lg">+</span>
            </button>
            <div className="relative">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#2E2E2E] hover:bg-[#353535] text-white text-sm transition-colors">
                {version}
                <ChevronDown size={14} className="text-[#7C7D7D]" />
              </button>
            </div>
            <button
              onClick={handleBuild}
              className="p-2 text-[#7C7D7D] hover:text-[#A4A4A4] transition-colors"
              title="Build"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Upgrade Banner */}
        {showUpgrade && (
          <div className="mb-8 flex items-center justify-between text-sm px-4 py-2 bg-[#0a0a0a] text-[#7C7D7D]">
            <span>
              Upgrade to Team to unlock all of v0's features and more credits
            </span>
            <div className="flex items-center gap-3">
              <button className="text-[#40B9FF] hover:text-[#3BA8EE] transition-colors font-medium">
                Upgrade Plan
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="text-[#7C7D7D] hover:text-[#A4A4A4] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] text-[#E6E6E6] hover:text-white text-sm font-medium transition-all duration-200"
              >
                <Icon size={16} />
                {action.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

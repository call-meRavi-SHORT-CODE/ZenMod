"use client"

import { useState } from "react"
import { MessageSquare, Layout, Link2, Database, Route, Settings, Plus, Sparkles, ChevronDown, Calendar, MoreHorizontal, ArrowLeft, Eye, Code, ExternalLink, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HelloworldPage() {
    const router = useRouter()
    const userMessage = ""
    const [followUpInput, setFollowUpInput] = useState("")

    const handleFollowUp = () => {
        if (followUpInput.trim()) {
            setFollowUpInput("")
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Top Header */}
            <header className="h-12 border-b border-gray-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full"></div>
                        <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Generated Page v1</span>
                            <button className="w-4 h-4 rounded bg-gray-800 flex items-center justify-center">
                                <span className="text-xs text-gray-400">?</span>
                            </button>
                        </div>
                        <span className="text-xs text-gray-500">View Project</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs border border-gray-800 rounded-md hover:bg-gray-900 flex items-center gap-1.5">
                        <span>Refer</span>
                    </button>
                    <button className="px-2 py-1.5 text-xs border border-gray-800 rounded-md hover:bg-gray-900">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <button className="px-2 py-1.5 text-xs border border-gray-800 rounded-md hover:bg-gray-900">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 text-xs border border-gray-800 rounded-md hover:bg-gray-900 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-white text-black rounded-md hover:bg-gray-100 font-medium">
                        Publish
                    </button>
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full"></div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-4 gap-6">
                    <button className="flex flex-col items-center gap-1 text-white">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[10px]">Chat</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white">
                        <Layout className="w-5 h-5" />
                        <span className="text-[10px]">Deploy</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white">
                        <Link2 className="w-5 h-5" />
                        <span className="text-[10px]">Connect</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white">
                        <Database className="w-5 h-5" />
                        <span className="text-[10px]">Vars</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white">
                        <Route className="w-5 h-5" />
                        <span className="text-[10px]">Routes</span>
                    </button>
                    <div className="flex-1"></div>
                    <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white">
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px]">Settings</span>
                    </button>
                </aside>

                {/* Chat/Project Area */}
                <div className="w-80 border-r border-gray-800 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-400">Message from user</span>
                        </div>

                        <div className="bg-gray-900 border border-blue-500 rounded-lg p-3 relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium">User Input</span>
                                </div>
                                <button className="text-gray-400 hover:text-white">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">v1</span>
                            <p className="text-sm text-gray-300 mt-3">{userMessage}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <button className="p-1.5 border border-gray-800 rounded hover:bg-gray-900">
                                <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 border border-gray-800 rounded hover:bg-gray-900">
                                <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 border border-gray-800 rounded hover:bg-gray-900">
                                <Code className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-800 p-3">
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 relative">
                            <input
                                type="text"
                                placeholder="Ask a follow-up..."
                                value={followUpInput}
                                onChange={(e) => setFollowUpInput(e.target.value)}
                                className="w-full bg-transparent text-sm outline-none placeholder-gray-500"
                            />
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                                <button className="p-1 hover:bg-gray-800 rounded">
                                    <Plus className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="p-1 hover:bg-gray-800 rounded">
                                    <Sparkles className="w-4 h-4 text-gray-400" />
                                </button>
                                <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-800 rounded text-xs text-gray-400">
                                    <span>v8 Mini</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                <button onClick={handleFollowUp} className="ml-auto p-1.5 bg-gray-800 rounded hover:bg-gray-700">
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Preview/Editor Area */}
                <div className="flex-1 bg-black flex flex-col">
                    {/* Editor Toolbar */}
                    <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-900 rounded">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-900 rounded border border-gray-800">
                                <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-900 rounded border border-gray-800">
                                <Code className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-900 rounded">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-900 rounded">
                                <ExternalLink className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1 bg-gray-900 rounded px-2 py-1">
                                <span className="text-xs text-gray-400">/</span>
                            </div>
                            <button className="p-1 hover:bg-gray-900 rounded">
                                <ExternalLink className="w-4 h-4 text-blue-500" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-900 rounded">
                                <Calendar className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-900 rounded">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Empty Preview Area */}
                    <div className="flex-1 bg-black flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-400 mb-2">helloworld</h1>
                            <p className="text-gray-600">{userMessage}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Upgrade Banner */}
            <div className="h-10 bg-gray-950 border-t border-gray-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-400">Upgrade to Team to unlock all of v0's features and more credits</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="text-xs text-cyan-500 hover:text-cyan-400 font-medium">
                        Upgrade Plan
                    </button>
                    <button className="text-gray-500 hover:text-gray-400">
                        <span className="text-xs">×</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

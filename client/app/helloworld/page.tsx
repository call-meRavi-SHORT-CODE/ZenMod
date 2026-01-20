"use client"

import { useState } from "react"
import { MessageSquare, Layout, Link2, Database, Route, Settings, Plus, Sparkles, ChevronDown, Calendar, MoreHorizontal, ArrowLeft, ArrowRight, Eye, Code, ExternalLink, Share2, Monitor, Globe, RotateCcw } from "lucide-react"
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
        <div className="min-h-screen bg-[#0F0F0F] text-[#A4A4A4] flex flex-col">
            {/* Top Header */}
            <header className="h-12 border-b border-[#2A2A2A] flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-xs">Z</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">Generated Page v1</span>
                            <button className="w-4 h-4 rounded bg-[#353535] flex items-center justify-center">
                                <span className="text-xs text-[#7C7D7D]">?</span>
                            </button>
                        </div>
                        <span className="text-xs text-[#7C7D7D]">View Project</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs border border-[#353535] rounded-md hover:bg-[#1A1A1A] flex items-center gap-1.5">
                        <span>Refer</span>
                    </button>
                    <button className="px-2 py-1.5 text-xs border border-[#353535] rounded-md hover:bg-[#1A1A1A]">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <button className="px-2 py-1.5 text-xs border border-[#353535] rounded-md hover:bg-[#1A1A1A]">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 text-xs border border-[#353535] rounded-md hover:bg-[#1A1A1A] flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-white text-black rounded-md hover:bg-gray-100 font-medium">
                        Publish
                    </button>
                   
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-16 border-r border-[#2A2A2A] flex flex-col items-center py-4 gap-6 bg-[#0F0F0F]">
                    <button className="flex flex-col items-center gap-1 text-white">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[10px]">Chat</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-[#7C7D7D] hover:text-white">
                        <Layout className="w-5 h-5" />
                        <span className="text-[10px]">Deploy</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-[#7C7D7D] hover:text-white">
                        <Link2 className="w-5 h-5" />
                        <span className="text-[10px]">Connect</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-[#7C7D7D] hover:text-white">
                        <Database className="w-5 h-5" />
                        <span className="text-[10px]">Vars</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-[#7C7D7D] hover:text-white">
                        <Route className="w-5 h-5" />
                        <span className="text-[10px]">Routes</span>
                    </button>
                    <div className="flex-1"></div>
                    <button className="flex flex-col items-center gap-1 text-[#7C7D7D] hover:text-white">
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px]">Settings</span>
                    </button>
                </aside>

                {/* Chat/Project Area */}
                <div className="w-140 border-r border-[#2A2A2A] flex flex-col bg-[#0F0F0F]">
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4 text-[#7C7D7D]" />
                            <span className="text-xs text-[#7C7D7D]">Message from user</span>
                        </div>

                        <div className="bg-[#1A1A1A] border border-[#3D5FFF] rounded-lg p-3 relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#3D5FFF]" />
                                    <span className="text-sm font-medium text-white">User Input</span>
                                </div>
                                <button className="text-[#7C7D7D] hover:text-white">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="text-xs text-[#7C7D7D] bg-[#2A2A2A] px-2 py-0.5 rounded">v1</span>
                            <p className="text-sm text-[#A4A4A4] mt-3">{userMessage}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <button className="p-1.5 border border-[#353535] rounded hover:bg-[#1A1A1A]">
                                <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 border border-[#353535] rounded hover:bg-[#1A1A1A]">
                                <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 border border-[#353535] rounded hover:bg-[#1A1A1A]">
                                <Code className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-[#2A2A2A] p-3">
                        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 relative">
                            <input
                                type="text"
                                placeholder="Ask a follow-up..."
                                value={followUpInput}
                                onChange={(e) => setFollowUpInput(e.target.value)}
                                className="w-full bg-transparent text-sm text-[#E6E6E6] outline-none placeholder-[#5A5A5A]"
                            />
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2A2A2A]">
                                <button className="p-1 hover:bg-[#2A2A2A] rounded">
                                    <Plus className="w-4 h-4 text-[#7C7D7D]" />
                                </button>
                                <button className="p-1 hover:bg-[#2A2A2A] rounded">
                                    <Sparkles className="w-4 h-4 text-[#7C7D7D]" />
                                </button>
                                <button className="flex items-center gap-1 px-2 py-1 hover:bg-[#2A2A2A] rounded text-xs text-[#7C7D7D]">
                                    <span>v8 Mini</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                <button onClick={handleFollowUp} className="ml-auto p-1.5 bg-[#2A2A2A] rounded hover:bg-[#353535]">
                                    <ArrowLeft className="w-4 h-4 text-[#7C7D7D]" />
                                </button>

                                
                            </div>

                        
                        </div>

                        <div className="h-10 bg-[#0F0F0F] border-t border-[#2A2A2A] flex items-center justify-between px-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#7C7D7D]">Upgrade to Team to unlock all of v0's features and more credits</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="text-xs text-[#3D5FFF] hover:text-[#5A7FFF] font-medium">
                                    Upgrade Plan
                                </button>
                                <button className="text-[#7C7D7D] hover:text-[#A4A4A4]">
                                    <span className="text-xs">×</span>
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>

                {/* Main Preview/Editor Area */}
                <div className="flex-1 bg-[#0F0F0F] flex flex-col">
                    {/* Editor Toolbar */}
                    <div className="h-10 border-b border-[#2A2A2A] flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-[#1A1A1A] rounded">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-[#1A1A1A] rounded border border-[#2A2A2A]">
                                <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-[#1A1A1A] rounded border border-[#2A2A2A]">
                                <Code className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-left gap-0.5 px-12 min-h-[32px] border border-[#353535] rounded-md bg-[#1A1A1A] transition-colors">
                                <button className="p-0.5 hover:bg-[#2A2A2A] rounded flex items-center">
                                    <ArrowLeft className="w-3.5 h-3.5 text-[#7C7D7D]" />
                                </button>

                                <button className="p-0.5 hover:bg-[#2A2A2A] rounded flex items-center">
                                    <ArrowRight className="w-3.5 h-3.5 text-[#7C7D7D]" />
                                </button>

                               
                                
                                <button className="p-1 hover:bg-[#1A1A1A] rounded">
                                    <Monitor className="w-4 h-4 text-[#7C7D7D]" />
                                </button>
                                <div className="flex items-center gap-0 bg-[#1A1A1A] rounded px-2 py-1">
                                    <span className="text-lg text-[#7C7D7D] select-none">/</span>
                                    <input
                                        type="text"
                                        value={followUpInput}
                                        onChange={e => setFollowUpInput(e.target.value.replace(/^\/*/, ""))}
                                        className="w-32 px-2 py-1 text-xs text-[#E6E6E6] border-none rounded-md bg-[#1A1A1A] outline-none placeholder-[#5A5A5A]"
                                        style={{ paddingLeft: 0 }}
                                    />
                                </div>

                                <button className="p-0.5 hover:bg-[#2A2A2A] rounded flex items-center">
                                    <Globe className="w-3.5 h-3.5 text-[#7C7D7D]" />
                                </button>

                                

                                <button className="p-0.5 hover:bg-[#2A2A2A] rounded flex items-center">
                                    <RotateCcw className="w-3.5 h-3.5 text-[#7C7D7D]" />
                                </button>

                                

                                


                        </div>


                        
                        <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-[#1A1A1A] rounded">
                                <Code className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-[#1A1A1A] rounded">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Empty Preview Area */}
                    <div className="flex-1 bg-[#0F0F0F] flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-[#E6E6E6] mb-2">helloworld</h1>
                            <p className="text-[#7C7D7D]">{userMessage}</p>
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    )
}

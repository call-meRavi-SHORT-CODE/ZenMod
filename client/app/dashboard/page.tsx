"use client"

import { useState } from "react"
import "./dashboard.css"
import Link from "next/link"
import {
    Search,
    FolderOpen,
    Clock,
    Layout,
    FileText,
    Settings,
    Plus,
    ArrowUp,
    Image as ImageIcon,
    Copy,
    Upload,
    Globe,
    MoreHorizontal,
    MessageSquare,
    Gift,
} from "lucide-react"
import LLMConfiguration from "@/components/llm-configuration"

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("new-chat")

    const sidebarItems = [
        { icon: <MessageSquare size={18} />, label: "New Chat", id: "new-chat", isActive: true },
        { icon: <Search size={18} />, label: "Search", id: "search" },
        { icon: <FolderOpen size={18} />, label: "Projects", id: "projects" },
        { icon: <Settings size={18} />, label: "LLM Configuration", id: "llm-configuration" },
        { icon: <FileText size={18} />, label: "Templates", id: "templates" },
    ]

    const recents = [   
        "Nexus Work Management",
        "ZenMod AI platform",
        "Recreate BitFlow dashb...",
        "Clone BitFlow Dashboard",
        "BitFlow dashboard clone",
        "Subscription page clone",
        "Inspiro login clone",
    ]

    return (
        <div className="flex h-screen bg-[#0F0F0F] text-[#A4A4A4] font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-[#2A2A2A] flex flex-col bg-[#0F0F0F]">
                {/* Header */}
                <div className="p-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                        <span className="text-black font-bold text-sm">Z</span>
                    </div>
                    <span className="font-bold text-white">ZenMod</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#353535] text-[#7C7D7D]">Free</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${activeTab === item.id
                                ? "bg-[#353535] text-white"
                                : "text-[#6B6B6B] hover:text-white hover:bg-[#353535]"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}

                    <div className="mt-8 px-3">
                        <button className="flex items-center justify-between w-full text-base font-medium text-[#6B6B6B] hover:text-white mb-2">
                            <span>Favorites</span>
                            <span className="opacity-0 hover:opacity-100 transition-opacity">&gt;</span>
                        </button>
                    </div>

                    <div className="mt-4 px-3">
                        <button className="flex items-center justify-between w-full text-base font-medium text-[#6B6B6B] hover:text-white mb-2">
                            <span>Recents</span>
                            <ArrowUp className="w-3 h-3 rotate-180" />
                        </button>
                        <div className="space-y-1 mt-1">
                            {recents.map((recent, i) => (
                                <button
                                    key={i}
                                    className="w-full text-left truncate px-2 py-1.5 text-base font-medium text-[#6B6B6B] hover:text-white hover:bg-[#353535] rounded-lg transition-colors"
                                >
                                    {recent}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t-0 border-b border-b-[#232323] shadow-[0_-2px_8px_0_rgba(0,0,0,0.12)] space-y-3">
                    <button className="flex items-center w-full p-2 rounded-lg text-base text-white hover:text-white hover:bg-[#353535] transition-colors">
                        <Settings size={20} className="text-white" />
                        <span className="ml-2">Settings</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-2 rounded-lg text-base hover:bg-[#353535] transition-colors">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium border border-purple-500/30">
                            RA
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <div className="text-base font-medium text-white truncate">ravikrishnaj25@gmail...</div>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative bg-[#0F0F0F]">
                {/* Top Header */}
                <header className="h-14 border-b border-[#2A2A2A] flex items-center justify-end px-6 gap-4 bg-[#1A1A1A]">
                    <button className="text-sm font-medium text-[#7C7D7D] hover:text-[#A4A4A4] transition-colors">Upgrade</button>
                    <button className="text-sm font-medium text-[#7C7D7D] hover:text-[#A4A4A4] transition-colors">Feedback</button>
                    <button className="text-sm font-medium text-[#7C7D7D] hover:text-[#A4A4A4] transition-colors flex items-center gap-1">
                        <Gift size={14} /> Refer
                    </button>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#353535] border border-[#2A2A2A]">
                        <div className="w-4 h-4 rounded-full bg-[#616161]"></div>
                        <span className="text-sm font-mono text-[#A4A4A4]">0.35</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500"></div>
                </header>

                {/* Central Content Area */}
                <div className="flex-1 flex flex-col overflow-auto">
                    {activeTab === "llm-configuration" ? (
                        <LLMConfiguration isEmbedded={true} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-4">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-semibold mb-2 tracking-tight text-white">What do you want to create?</h1>
                                <p className="text-[#7C7D7D]">Build stunning apps & websites by chatting with AI.</p>
                            </div>

                            <div className="w-full relative">
                                <div className="relative bg-[#272727] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl focus-within:border-[#353535] focus-within:ring-1 focus-within:ring-[#353535] transition-all">
                                    <textarea
                                        className="w-full bg-transparent text-[#A4A4A4] placeholder:text-[#636363] px-4 py-4 min-h-[120px] resize-none outline-none text-base"
                                        placeholder="Ask ZenMod to build..."
                                    />

                                    <div className="px-3 pb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 rounded-lg text-[#7C7D7D] hover:text-[#A4A4A4] hover:bg-[#353535] transition-colors">
                                                <Plus size={18} />
                                            </button>
                                            <button className="px-3 py-1.5 rounded-lg bg-[#353535] text-[#7C7D7D] text-sm hover:text-[#A4A4A4] hover:bg-[#4A4A4A] transition-colors flex items-center gap-2">
                                                <span className="w-4 h-4 flex items-center justify-center border border-[#616161] rounded text-[10px]">M</span>
                                                Mini
                                            </button>
                                        </div>

                                        <button className="p-2 rounded-lg bg-[#353535] text-[#7C7D7D] hover:text-[#A4A4A4] hover:bg-[#4A4A4A] transition-colors">
                                            <ArrowUp size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-end px-1">
                                    <button className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">
                                        Upgrade Plan
                                    </button>
                                </div>

                                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#2A2A2A] bg-[#272727] text-xs text-[#7C7D7D] hover:text-[#A4A4A4] hover:bg-[#353535] transition-colors">
                                        <Copy size={14} /> Clone a Screenshot
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#2A2A2A] bg-[#272727] text-xs text-[#7C7D7D] hover:text-[#A4A4A4] hover:bg-[#353535] transition-colors">
                                        <ImageIcon size={14} /> Import from Figma
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#2A2A2A] bg-[#272727] text-xs text-[#7C7D7D] hover:text-[#A4A4A4] hover:bg-[#353535] transition-colors">
                                        <Upload size={14} /> Upload a Project
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#2A2A2A] bg-[#272727] text-xs text-[#7C7D7D] hover:text-[#A4A4A4] hover:bg-[#353535] transition-colors">
                                        <Globe size={14} /> Landing Page
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

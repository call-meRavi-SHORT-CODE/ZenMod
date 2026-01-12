"use client"

import { useState } from "react"
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

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("new-chat")

    const sidebarItems = [
        { icon: <MessageSquare size={18} />, label: "New Chat", id: "new-chat", isActive: true },
        { icon: <Search size={18} />, label: "Search", id: "search" },
        { icon: <FolderOpen size={18} />, label: "Projects", id: "projects" },
        { icon: <Clock size={18} />, label: "Recents", id: "recents" },
        { icon: <Layout size={18} />, label: "Design Systems", id: "design-systems" },
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
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col">
                {/* Header */}
                <div className="p-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                        <span className="text-black font-bold text-sm">Z</span>
                    </div>
                    <span className="font-semibold">ZenMod</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">Free</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === item.id
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}

                    <div className="mt-8 px-3">
                        <button className="flex items-center justify-between w-full text-xs text-zinc-500 hover:text-zinc-300 mb-2">
                            <span>Favorites</span>
                            <span className="opacity-0 hover:opacity-100 transition-opacity">&gt;</span>
                        </button>
                    </div>

                    <div className="mt-4 px-3">
                        <button className="flex items-center justify-between w-full text-xs text-zinc-500 hover:text-zinc-300 mb-2">
                            <span>Recents</span>
                            <ArrowUp className="w-3 h-3 rotate-180" />
                        </button>
                        <div className="space-y-1 mt-1">
                            {recents.map((recent, i) => (
                                <button
                                    key={i}
                                    className="w-full text-left truncate px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                                >
                                    {recent}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-zinc-800">
                    <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-900 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium border border-purple-500/30">
                            JD
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium">John Doe</div>
                            <div className="text-xs text-zinc-500">Free Plan</div>
                        </div>
                        <MoreHorizontal size={16} className="text-zinc-500" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative">
                {/* Top Header */}
                <header className="h-14 border-b border-zinc-800 flex items-center justify-end px-6 gap-4">
                    <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Upgrade</button>
                    <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Feedback</button>
                    <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                        <Gift size={14} /> Refer
                    </button>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                        <div className="w-4 h-4 rounded-full bg-zinc-600"></div>
                        <span className="text-sm font-mono">0.35</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500"></div>
                </header>

                {/* Central Chat Interface */}
                <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-semibold mb-2 tracking-tight">What do you want to create?</h1>
                        <p className="text-zinc-500">Build stunning apps & websites by chatting with AI.</p>
                    </div>

                    <div className="w-full relative">
                        <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
                            <textarea
                                className="w-full bg-transparent text-white placeholder:text-zinc-600 px-4 py-4 min-h-[120px] resize-none outline-none text-base"
                                placeholder="Ask ZenMod to build..."
                            />

                            <div className="px-3 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                        <Plus size={18} />
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-2">
                                        <span className="w-4 h-4 flex items-center justify-center border border-zinc-500 rounded text-[10px]">M</span>
                                        Mini
                                    </button>
                                </div>

                                <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
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
                            <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                <Copy size={14} /> Clone a Screenshot
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                <ImageIcon size={14} /> Import from Figma
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                <Upload size={14} /> Upload a Project
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                <Globe size={14} /> Landing Page
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

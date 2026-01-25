"use client"

import { useState, useEffect } from "react"
import {
    MessageSquare,
    Layout,
    Link2,
    Database,
    Route,
    Settings,
    Sparkles,
    ChevronDown,
    MoreHorizontal,
    ArrowLeft,
    ArrowRight,
    Eye,
    Code,
    Share2,
    Monitor,
    Globe,
    RotateCcw,
    ChevronUp,
    Terminal as TerminalIcon,
    FolderOpen
} from "lucide-react"
import { useRouter } from "next/navigation"
import MonacoEditorView from "@/components/monaco-editor-view"
import TerminalView from "@/components/terminal-view"
import ChatInterface from "@/components/chat-interface"
import { useProjectStore } from "@/lib/stores/project-store"
import { useFilesystemStore } from "@/lib/stores/filesystem-store"
import { useAgentStore } from "@/lib/agent/agent-store"

export default function HelloworldPage() {
    const router = useRouter()
    const [showMonacoEditor, setShowMonacoEditor] = useState(true)
    const [terminalCollapsed, setTerminalCollapsed] = useState(false)
    const [dividerPos, setDividerPos] = useState(60)
    const [isDragging, setIsDragging] = useState(false)
    const [activeTab, setActiveTab] = useState<"chat" | "deploy" | "connect" | "vars" | "routes" | "settings">("chat")
    const [previewUrl, setPreviewUrl] = useState("")

    // Stores
    const { currentProject, createProject } = useProjectStore()
    const { initialize: initFS, isLoading: fsLoading } = useFilesystemStore()
    const { pendingCommands, executeCommand } = useAgentStore()

    // Initialize project on mount
    useEffect(() => {
        const init = async () => {
            if (!currentProject) {
                await createProject("New Project")
            }
            await initFS()
        }
        init()
    }, [currentProject, createProject, initFS])

    const handleMouseDown = () => {
        setIsDragging(true)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return
        const container = e.currentTarget
        const rect = container.getBoundingClientRect()
        const newPos = ((e.clientY - rect.top) / rect.height) * 100
        if (newPos > 20 && newPos < 85) {
            setDividerPos(newPos)
        }
    }

    // Handle command execution from chat
    const handleCommandExecute = (command: string) => {
        // This will be triggered when user clicks a command in chat
        // The terminal will pick it up via the pending commands
        executeCommand(command)
    }

    return (
        <div className="h-screen bg-[#0F0F0F] text-[#A4A4A4] flex flex-col overflow-hidden">
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
                            <span className="text-sm font-medium text-white">
                                {currentProject?.name || "Loading..."}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-[#353535] text-[#7C7D7D]">
                                {currentProject?.techStack?.framework || "react"}
                            </span>
                        </div>
                        <span className="text-xs text-[#7C7D7D]">ZenMod Workspace</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="px-3 py-1.5 text-xs border border-[#353535] rounded-md hover:bg-[#1A1A1A] flex items-center gap-1.5"
                    >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Projects
                    </button>
                    <button className="px-2 py-1.5 text-xs border border-[#353535] rounded-md hover:bg-[#1A1A1A]">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1.5 text-xs border border-[#353535] rounded-md hover:bg-[#1A1A1A] flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-white text-black rounded-md hover:bg-gray-100 font-medium">
                        Publish
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-16 border-r border-[#2A2A2A] flex flex-col items-center py-4 gap-6 bg-[#0F0F0F]">
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`flex flex-col items-center gap-1 ${activeTab === "chat" ? "text-white" : "text-[#7C7D7D] hover:text-white"}`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[10px]">Chat</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("deploy")}
                        className={`flex flex-col items-center gap-1 ${activeTab === "deploy" ? "text-white" : "text-[#7C7D7D] hover:text-white"}`}
                    >
                        <Layout className="w-5 h-5" />
                        <span className="text-[10px]">Deploy</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("connect")}
                        className={`flex flex-col items-center gap-1 ${activeTab === "connect" ? "text-white" : "text-[#7C7D7D] hover:text-white"}`}
                    >
                        <Link2 className="w-5 h-5" />
                        <span className="text-[10px]">Connect</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("vars")}
                        className={`flex flex-col items-center gap-1 ${activeTab === "vars" ? "text-white" : "text-[#7C7D7D] hover:text-white"}`}
                    >
                        <Database className="w-5 h-5" />
                        <span className="text-[10px]">Vars</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("routes")}
                        className={`flex flex-col items-center gap-1 ${activeTab === "routes" ? "text-white" : "text-[#7C7D7D] hover:text-white"}`}
                    >
                        <Route className="w-5 h-5" />
                        <span className="text-[10px]">Routes</span>
                    </button>
                    <div className="flex-1"></div>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`flex flex-col items-center gap-1 ${activeTab === "settings" ? "text-white" : "text-[#7C7D7D] hover:text-white"}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px]">Settings</span>
                    </button>
                </aside>

                {/* Chat/Project Area */}
                <div className="w-96 border-r border-[#2A2A2A] flex flex-col bg-[#0F0F0F]">
                    {activeTab === "chat" ? (
                        <ChatInterface onCommandExecute={handleCommandExecute} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[#7C7D7D]">
                            <p className="text-sm">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} panel coming soon</p>
                        </div>
                    )}
                </div>

                {/* Main Preview/Editor Area */}
                <div className="flex-1 bg-[#0F0F0F] flex flex-col overflow-hidden">
                    {/* Editor Toolbar */}
                    <div className="h-10 border-b border-[#2A2A2A] flex items-center justify-between px-4 flex-shrink-0">
                        <div className="flex items-center gap-2">

                            <button
                                className={`p-1 hover:bg-[#1A1A1A] rounded border ${!showMonacoEditor ? "border-[#DDAED3]" : "border-[#2A2A2A]"}`}
                                onClick={() => setShowMonacoEditor(false)}
                                title="Preview"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                className={`p-1 hover:bg-[#1A1A1A] rounded border ${showMonacoEditor ? "border-[#DDAED3]" : "border-[#2A2A2A]"}`}
                                onClick={() => setShowMonacoEditor(true)}
                                title="Code"
                            >
                                <Code className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-0.5 px-3 min-h-[32px] border border-[#353535] rounded-md bg-[#1A1A1A]">
                            <button className="p-0.5 hover:bg-[#2A2A2A] rounded">
                                <ArrowLeft className="w-3.5 h-3.5 text-[#7C7D7D]" />
                            </button>
                            <button className="p-0.5 hover:bg-[#2A2A2A] rounded">
                                <ArrowRight className="w-3.5 h-3.5 text-[#7C7D7D]" />
                            </button>
                            <button className="p-1 hover:bg-[#1A1A1A] rounded">
                                <Monitor className="w-4 h-4 text-[#7C7D7D]" />
                            </button>
                            <div className="flex items-center gap-0 bg-[#1A1A1A] rounded px-2 py-1">
                                <span className="text-sm text-[#7C7D7D] select-none">/</span>
                                <input
                                    type="text"
                                    placeholder="path"
                                    value={previewUrl}
                                    onChange={e => setPreviewUrl(e.target.value)}
                                    className="w-24 px-1 py-1 text-xs text-[#E6E6E6] border-none rounded-md bg-[#1A1A1A] outline-none placeholder-[#5A5A5A]"
                                />
                            </div>
                            <button className="p-0.5 hover:bg-[#2A2A2A] rounded">
                                <Globe className="w-3.5 h-3.5 text-[#7C7D7D]" />
                            </button>
                            <button className="p-0.5 hover:bg-[#2A2A2A] rounded">
                                <RotateCcw className="w-3.5 h-3.5 text-[#7C7D7D]" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="p-1 hover:bg-[#1A1A1A] rounded flex items-center gap-1 text-[#7C7D7D] hover:text-white"
                                onClick={() => setTerminalCollapsed(!terminalCollapsed)}
                            >
                                <TerminalIcon className="w-4 h-4" />
                                <ChevronUp className={`w-3 h-3 transition-transform ${terminalCollapsed ? 'rotate-180' : ''}`} />
                            </button>
                            <button className="p-1 hover:bg-[#1A1A1A] rounded">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Preview or Editor Area with Draggable Terminal */}
                    <div
                        className="flex-1 overflow-hidden flex flex-col bg-[#0F0F0F]"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Main Preview/Editor Panel */}
                        <div
                            style={{ flex: `0 0 ${showMonacoEditor && !terminalCollapsed ? dividerPos + '%' : '100%'}`, minHeight: 0 }}
                            className="overflow-auto bg-[#0F0F0F]"
                        >
                            {!showMonacoEditor ? (
                                <div className="h-full bg-[#0F0F0F] flex items-center justify-center">
                                    <div className="text-center">
                                        <Sparkles className="w-12 h-12 text-[#DDAED3] mx-auto mb-4" />
                                        <h4 className="text-2xl font-bold text-[#E6E6E6] mb-2">Preview</h4>
                                        <p className="text-[#7C7D7D]">Run your app to see the preview here</p>
                                        <p className="text-xs text-[#5A5A5A] mt-2">Use the terminal to run: npm run dev</p>
                                    </div>
                                </div>
                            ) : (
                                <MonacoEditorView onClose={() => setShowMonacoEditor(false)} />
                            )}
                        </div>

                        {/* Draggable Divider */}
                        {showMonacoEditor && !terminalCollapsed && (
                            <div
                                onMouseDown={handleMouseDown}
                                className={`h-1 bg-[#2A2A2A] hover:bg-[#DDAED3] transition-colors cursor-row-resize flex-shrink-0 ${isDragging ? 'bg-[#DDAED3]' : ''}`}
                            />
                        )}

                        {/* Terminal Panel */}
                        {showMonacoEditor && !terminalCollapsed && (
                            <div
                                style={{ flex: `0 0 ${100 - dividerPos + '%'}`, minHeight: 0 }}
                                className="overflow-hidden bg-[#0F0F0F]"
                            >
                                <TerminalView
                                    onClose={() => setTerminalCollapsed(true)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

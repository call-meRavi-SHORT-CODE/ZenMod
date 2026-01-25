"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Square, Sparkles, FileCode, Terminal, Trash2, FolderPlus, FilePlus } from "lucide-react"
import { useAgentStore, ChatMessage } from "@/lib/agent/agent-store"

interface ChatInterfaceProps {
    onCommandExecute?: (command: string) => void
}

export default function ChatInterface({ onCommandExecute }: ChatInterfaceProps) {
    const [input, setInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const {
        messages,
        isProcessing,
        currentStatus,
        sendMessage,
        cancelRequest,
        clearMessages,
        pendingCommands,
        executeCommand,
    } = useAgentStore()

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto"
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`
        }
    }, [input])

    const handleSubmit = async () => {
        if (!input.trim() || isProcessing) return

        const message = input.trim()
        setInput("")
        await sendMessage(message)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleCommandClick = (command: string) => {
        if (onCommandExecute) {
            onCommandExecute(command)
        }
        executeCommand(command)
    }

    const renderMessage = (message: ChatMessage) => {
        const isUser = message.role === "user"

        return (
            <div
                key={message.id}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
            >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isUser
                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                        : "bg-gradient-to-br from-blue-500 to-cyan-500"
                    }`}>
                    {isUser ? (
                        <span className="text-white text-xs font-medium">U</span>
                    ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                    )}
                </div>

                {/* Content */}
                <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-lg px-4 py-3 ${isUser
                            ? "bg-[#2A2A2A] text-white"
                            : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#E6E6E6]"
                        }`}>
                        {/* Streaming indicator */}
                        {message.isStreaming && !message.content && (
                            <div className="flex items-center gap-2 text-[#7C7D7D]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">{currentStatus || "Thinking..."}</span>
                            </div>
                        )}

                        {/* Message content */}
                        {message.content && (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}

                        {/* File operations */}
                        {message.fileOperations && message.fileOperations.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#353535]">
                                <p className="text-xs text-[#7C7D7D] mb-2 flex items-center gap-1">
                                    <FileCode className="w-3 h-3" />
                                    File Changes
                                </p>
                                <div className="space-y-1">
                                    {message.fileOperations.map((op, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <span className={`px-1.5 py-0.5 rounded ${op.type === "create"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : op.type === "modify"
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : "bg-red-500/20 text-red-400"
                                                }`}>
                                                {op.type === "create" ? "+" : op.type === "modify" ? "~" : "-"}
                                            </span>
                                            <span className="text-[#A4A4A4] font-mono">{op.path}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Terminal commands */}
                        {message.commands && message.commands.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#353535]">
                                <p className="text-xs text-[#7C7D7D] mb-2 flex items-center gap-1">
                                    <Terminal className="w-3 h-3" />
                                    Commands
                                </p>
                                <div className="space-y-1">
                                    {message.commands.map((cmd, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleCommandClick(cmd)}
                                            className="block w-full text-left px-2 py-1.5 rounded bg-[#0F0F0F] border border-[#353535] font-mono text-xs text-[#A4A4A4] hover:border-[#DDAED3] hover:text-white transition-colors"
                                        >
                                            $ {cmd}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    <p className="text-[10px] text-[#5A5A5A] mt-1 px-1">
                        {message.timestamp.toLocaleTimeString()}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#0F0F0F]">
            {/* Header */}
            <div className="h-12 border-b border-[#2A2A2A] flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#DDAED3]" />
                    <span className="text-sm font-medium text-white">ZenMod AI</span>
                    {isProcessing && (
                        <span className="flex items-center gap-1 text-xs text-[#7C7D7D]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {currentStatus || "Processing..."}
                        </span>
                    )}
                </div>
                <button
                    onClick={clearMessages}
                    className="p-1.5 rounded hover:bg-[#2A2A2A] text-[#7C7D7D] hover:text-white transition-colors"
                    title="Clear chat"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="w-12 h-12 text-[#DDAED3] mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                            What would you like to build?
                        </h3>
                        <p className="text-sm text-[#7C7D7D] max-w-md">
                            Describe your project and I'll help you create it. I can generate files, run commands, and build complete applications.
                        </p>

                        {/* Quick actions */}
                        <div className="flex flex-wrap gap-2 mt-6 justify-center">
                            <button
                                onClick={() => setInput("Create a modern landing page with a hero section, features grid, and contact form")}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#A4A4A4] hover:border-[#DDAED3] hover:text-white transition-colors"
                            >
                                <FilePlus className="w-3.5 h-3.5" />
                                Landing Page
                            </button>
                            <button
                                onClick={() => setInput("Create a React dashboard with sidebar navigation and data cards")}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#A4A4A4] hover:border-[#DDAED3] hover:text-white transition-colors"
                            >
                                <FolderPlus className="w-3.5 h-3.5" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => setInput("Create a REST API with Express.js including authentication and CRUD endpoints")}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#A4A4A4] hover:border-[#DDAED3] hover:text-white transition-colors"
                            >
                                <Terminal className="w-3.5 h-3.5" />
                                API Server
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Pending commands notification */}
            {pendingCommands.length > 0 && (
                <div className="px-4 py-2 bg-[#1A1A1A] border-t border-[#2A2A2A]">
                    <p className="text-xs text-[#DDAED3] flex items-center gap-2">
                        <Terminal className="w-3 h-3" />
                        {pendingCommands.length} command(s) ready to run
                    </p>
                </div>
            )}

            {/* Input */}
            <div className="border-t border-[#2A2A2A] p-4">
                <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg focus-within:border-[#DDAED3] transition-colors">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe what you want to build..."
                        disabled={isProcessing}
                        className="w-full bg-transparent text-white placeholder:text-[#5A5A5A] px-4 py-3 pr-12 resize-none outline-none text-sm min-h-[44px] max-h-[150px]"
                        rows={1}
                    />

                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        {isProcessing ? (
                            <button
                                onClick={cancelRequest}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                title="Cancel"
                            >
                                <Square className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim()}
                                className="p-2 rounded-lg bg-[#DDAED3] text-black hover:bg-[#E8C0E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Send"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-[10px] text-[#5A5A5A] mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    )
}

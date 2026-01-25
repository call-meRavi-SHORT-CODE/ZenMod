"use client"

import { useState, useEffect, useCallback } from "react"
import Editor from "@monaco-editor/react"
import { X, Folder, File, ChevronRight, RefreshCw, Save, FilePlus, FolderPlus, Trash2 } from "lucide-react"
import { useFilesystemStore } from "@/lib/stores/filesystem-store"
import { FileNode } from "@/lib/unified-filesystem"

interface MonacoEditorViewProps {
    onClose: () => void
}

export default function MonacoEditorView({ onClose }: MonacoEditorViewProps) {
    const {
        fileTree,
        openFiles,
        activeFilePath,
        isLoading,
        initialize,
        refreshFileTree,
        openFile,
        closeFile,
        setActiveFile,
        updateFileContent,
        saveFile,
        createFile,
        createDirectory,
        deleteNode,
    } = useFilesystemStore()

    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/src"]))
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node?: FileNode } | null>(null)
    const [isCreatingFile, setIsCreatingFile] = useState(false)
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [newItemName, setNewItemName] = useState("")
    const [createParentPath, setCreateParentPath] = useState("/")

    // Initialize filesystem on mount
    useEffect(() => {
        initialize()
    }, [initialize])

    // Get active file content
    const activeFile = openFiles.find(f => f.path === activeFilePath)

    // Toggle folder expansion
    const toggleFolderExpand = (path: string) => {
        const newExpanded = new Set(expandedFolders)
        if (newExpanded.has(path)) {
            newExpanded.delete(path)
        } else {
            newExpanded.add(path)
        }
        setExpandedFolders(newExpanded)
    }

    // Handle file click
    const handleFileClick = (node: FileNode) => {
        if (node.type === "file") {
            openFile(node.path)
        } else {
            toggleFolderExpand(node.path)
        }
    }

    // Handle editor content change
    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined && activeFilePath) {
            updateFileContent(activeFilePath, value)
        }
    }

    // Handle save (Ctrl+S)
    const handleSave = useCallback(() => {
        if (activeFilePath) {
            saveFile(activeFilePath)
        }
    }, [activeFilePath, saveFile])

    // Keyboard shortcut for save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault()
                handleSave()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleSave])

    // Handle context menu
    const handleContextMenu = (e: React.MouseEvent, node?: FileNode) => {
        e.preventDefault()
        e.stopPropagation()
        setContextMenu({ x: e.clientX, y: e.clientY, node })
    }

    // Handle create file
    const handleCreateFile = async () => {
        if (newItemName.trim()) {
            const path = createParentPath === "/"
                ? `/${newItemName}`
                : `${createParentPath}/${newItemName}`
            await createFile(path)
            setNewItemName("")
            setIsCreatingFile(false)
        }
    }

    // Handle create folder
    const handleCreateFolder = async () => {
        if (newItemName.trim()) {
            const path = createParentPath === "/"
                ? `/${newItemName}`
                : `${createParentPath}/${newItemName}`
            await createDirectory(path)
            setNewItemName("")
            setIsCreatingFolder(false)
        }
    }

    // Render file tree recursively
    const renderFileTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map((node) => (
            <div key={node.path}>
                <div
                    className={`group flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer hover:bg-[#2A2A2A] transition-colors ${node.type === "file" && activeFilePath === node.path
                        ? "bg-[#2A2A2A] text-[#DDAED3]"
                        : "text-[#A4A4A4]"
                        }`}
                    style={{ paddingLeft: `${8 + depth * 16}px` }}
                    onClick={() => handleFileClick(node)}
                    onContextMenu={(e) => handleContextMenu(e, node)}
                >
                    {node.type === "directory" ? (
                        <>
                            <ChevronRight
                                className={`w-3.5 h-3.5 transition-transform ${expandedFolders.has(node.path) ? "rotate-90" : ""
                                    }`}
                            />
                            <Folder className="w-4 h-4 text-[#7C7D7D]" />
                        </>
                    ) : (
                        <>
                            <div className="w-3.5" />
                            <File className="w-4 h-4 text-[#7C7D7D]" />
                        </>
                    )}
                    <span className="truncate flex-1">{node.name}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Delete ${node.name}?`)) {
                                deleteNode(node.path)
                            }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#3D3D3D] rounded text-[#7C7D7D] hover:text-red-400 transition-opacity"
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
                {node.type === "directory" &&
                    expandedFolders.has(node.path) &&
                    node.children &&
                    renderFileTree(node.children, depth + 1)}
            </div>
        ))
    }

    return (
        <div className="w-full h-full bg-[#1E1E1E] flex flex-col border-0">
            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - File Manager */}
                <div className="w-56 border-r border-[#2A2A2A] bg-[#0F0F0F] flex flex-col">
                    {/* File Manager Header */}
                    <div className="h-10 border-b border-[#2A2A2A] flex items-center justify-between px-3">
                        <span className="text-xs font-semibold text-white flex items-center gap-2">
                            <Folder className="w-4 h-4" />
                            Files
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    setCreateParentPath("/")
                                    setIsCreatingFile(true)
                                }}
                                className="p-1 hover:bg-[#2A2A2A] rounded text-[#7C7D7D] hover:text-white transition-colors"
                                title="New File"
                            >
                                <FilePlus className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => {
                                    setCreateParentPath("/")
                                    setIsCreatingFolder(true)
                                }}
                                className="p-1 hover:bg-[#2A2A2A] rounded text-[#7C7D7D] hover:text-white transition-colors"
                                title="New Folder"
                            >
                                <FolderPlus className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={refreshFileTree}
                                className="p-1 hover:bg-[#2A2A2A] rounded text-[#7C7D7D] hover:text-white transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* File Tree */}
                    <div
                        className="flex-1 overflow-y-auto"
                        onContextMenu={(e) => {
                            if ((e.target as HTMLElement).closest('[data-file-node]') === null) {
                                handleContextMenu(e)
                            }
                        }}
                    >
                        <div className="py-2">
                            {isLoading && fileTree.length === 0 ? (
                                <div className="px-4 py-2 text-xs text-[#7C7D7D]">
                                    Loading files...
                                </div>
                            ) : fileTree.length === 0 ? (
                                <div className="px-4 py-2 text-xs text-[#7C7D7D]">
                                    No files yet
                                </div>
                            ) : (
                                renderFileTree(fileTree)
                            )}

                            {/* Inline File Creation Input */}
                            {isCreatingFile && (
                                <div className="px-2 py-1.5">
                                    <input
                                        type="text"
                                        placeholder="filename.js"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleCreateFile()
                                            if (e.key === "Escape") {
                                                setIsCreatingFile(false)
                                                setNewItemName("")
                                            }
                                        }}
                                        autoFocus
                                        className="w-full bg-[#1E1E1E] text-white text-sm px-2 py-1 rounded outline-none border border-[#DDAED3] focus:border-[#E8C0E0]"
                                    />
                                </div>
                            )}

                            {/* Inline Folder Creation Input */}
                            {isCreatingFolder && (
                                <div className="px-2 py-1.5">
                                    <input
                                        type="text"
                                        placeholder="foldername"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleCreateFolder()
                                            if (e.key === "Escape") {
                                                setIsCreatingFolder(false)
                                                setNewItemName("")
                                            }
                                        }}
                                        autoFocus
                                        className="w-full bg-[#1E1E1E] text-white text-sm px-2 py-1 rounded outline-none border border-[#DDAED3] focus:border-[#E8C0E0]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Context Menu */}
                    {contextMenu && (
                        <div
                            className="fixed bg-[#2A2A2A] border border-[#353535] rounded shadow-lg z-50 py-1 min-w-[180px]"
                            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                            onClick={() => setContextMenu(null)}
                        >
                            <button
                                onClick={() => {
                                    setCreateParentPath(contextMenu.node?.type === "directory" ? contextMenu.node.path : "/")
                                    setIsCreatingFile(true)
                                    setContextMenu(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#A4A4A4] hover:bg-[#353535] hover:text-white transition-colors"
                            >
                                New file...
                            </button>
                            <button
                                onClick={() => {
                                    setCreateParentPath(contextMenu.node?.type === "directory" ? contextMenu.node.path : "/")
                                    setIsCreatingFolder(true)
                                    setContextMenu(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#A4A4A4] hover:bg-[#353535] hover:text-white transition-colors"
                            >
                                New folder...
                            </button>
                            {contextMenu.node && (
                                <>
                                    <div className="border-t border-[#353535] my-1" />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(contextMenu.node!.path)
                                            setContextMenu(null)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-[#A4A4A4] hover:bg-[#353535] hover:text-white transition-colors"
                                    >
                                        Copy path
                                    </button>
                                    <button
                                        onClick={() => {
                                            deleteNode(contextMenu.node!.path)
                                            setContextMenu(null)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#353535] hover:text-red-300 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side - Editor */}
                <div className="flex-1 flex flex-col" onClick={() => setContextMenu(null)}>
                    {/* File Tabs */}
                    <div className="h-10 border-b border-[#2A2A2A] flex items-center gap-1 px-2 bg-[#252525] overflow-x-auto">
                        {openFiles.map((file) => (
                            <div
                                key={file.path}
                                className={`flex items-center gap-2 px-3 py-2 rounded-t text-sm cursor-pointer transition-colors whitespace-nowrap ${activeFilePath === file.path
                                    ? "bg-[#1E1E1E] text-white border-b-2 border-[#DDAED3]"
                                    : "bg-[#2A2A2A] text-[#A4A4A4] hover:text-white"
                                    }`}
                                onClick={() => setActiveFile(file.path)}
                            >
                                <span>{file.name}</span>
                                {file.isDirty && (
                                    <span className="w-2 h-2 rounded-full bg-[#DDAED3]" />
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        closeFile(file.path)
                                    }}
                                    className="hover:bg-[#3D3D3D] p-0.5 rounded transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Editor Tools */}
                    {activeFile && (
                        <div className="h-8 border-b border-[#2A2A2A] bg-[#2A2A2A] flex items-center px-4 gap-4">
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-xs text-[#7C7D7D]">
                                    Lines: {activeFile.content.split("\n").length}
                                </span>
                            </div>
                            <span className="text-xs text-[#7C7D7D]">{activeFile.language}</span>
                            <button
                                onClick={handleSave}
                                disabled={!activeFile.isDirty}
                                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-[#7C7D7D] hover:text-white hover:bg-[#353535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save className="w-3 h-3" />
                                Save
                            </button>
                        </div>
                    )}

                    {/* Editor Container */}
                    <div className="flex-1 overflow-hidden">
                        {activeFile ? (
                            <Editor
                                height="100%"
                                language={activeFile.language}
                                value={activeFile.content}
                                onChange={handleEditorChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: true },
                                    fontSize: 13,
                                    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                                    wordWrap: "on",
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 10, bottom: 10 },
                                    tabSize: 2,
                                    insertSpaces: true,
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#7C7D7D]">
                                <p>Select a file to edit</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="h-8 border-t border-[#2A2A2A] bg-[#2A2A2A] flex items-center px-4 justify-between text-xs text-[#7C7D7D]">
                        <div className="flex items-center gap-4">
                            <span>Files: {openFiles.length}</span>
                            {activeFile && (
                                <span>
                                    {activeFile.name} ({activeFile.language})
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="px-3 py-1 bg-[#DDAED3] text-[#0F0F0F] rounded hover:bg-[#E8C0E0] transition-colors text-xs font-medium"
                        >
                            Close Editor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

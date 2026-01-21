"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { X, Plus, Trash2, ChevronDown, Folder, File, ChevronRight } from "lucide-react"

interface FileTab {
    id: string
    name: string
    language: string
    content: string
}

interface FileTreeNode {
    id: string
    name: string
    type: "file" | "folder"
    children?: FileTreeNode[]
    fileId?: string // Reference to the file tab
}

interface MonacoEditorViewProps {
    onClose: () => void
}

const LANGUAGE_OPTIONS = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
    { value: "sql", label: "SQL" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" },
    { value: "rust", label: "Rust" },
    { value: "go", label: "Go" },
    { value: "yaml", label: "YAML" },
]

export default function MonacoEditorView({ onClose }: MonacoEditorViewProps) {
    const [files, setFiles] = useState<FileTab[]>([
        {
            id: "1",
            name: "index.js",
            language: "javascript",
            content: "// Start typing...\nconsole.log('Hello World');",
        },
    ])

    const [fileTree, setFileTree] = useState<FileTreeNode[]>([
        {
            id: "root",
            name: "src",
            type: "folder",
            children: [
                {
                    id: "1",
                    name: "index.js",
                    type: "file",
                    fileId: "1",
                },
            ],
        },
    ])

    const [activeFileId, setActiveFileId] = useState("1")
    const [newFileName, setNewFileName] = useState("")
    const [showNewFileInput, setShowNewFileInput] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState("javascript")
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root"]))
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
    const [isCreatingFile, setIsCreatingFile] = useState(false)
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [selectedNodeForContext, setSelectedNodeForContext] = useState<FileTreeNode | null>(null)

    // Map file extensions to Monaco editor languages
    const getLanguageFromExtension = (filename: string): string => {
        const ext = filename.split(".").pop()?.toLowerCase() || ""
        const extensionMap: { [key: string]: string } = {
            js: "javascript",
            jsx: "javascript",
            ts: "typescript",
            tsx: "typescript",
            py: "python",
            html: "html",
            htm: "html",
            css: "css",
            scss: "scss",
            json: "json",
            md: "markdown",
            sql: "sql",
            java: "java",
            cpp: "cpp",
            c: "c",
            cs: "csharp",
            php: "php",
            rs: "rust",
            go: "go",
            yaml: "yaml",
            yml: "yaml",
            xml: "xml",
            sh: "shell",
        }
        return extensionMap[ext] || "plaintext"
    }

    const activeFile = files.find((f) => f.id === activeFileId)

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            const language = getLanguageFromExtension(newFileName)
            const newFile: FileTab = {
                id: Date.now().toString(),
                name: newFileName,
                language: language,
                content: "",
            }
            setFiles([...files, newFile])
            
            // Add to file tree
            const newNode: FileTreeNode = {
                id: newFile.id,
                name: newFileName,
                type: "file",
                fileId: newFile.id,
            }
            
            const addToTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
                return nodes.map((node) => {
                    // If a node is selected and it's a folder, add to it
                    if (selectedNodeForContext && node.id === selectedNodeForContext.id && node.type === "folder") {
                        return {
                            ...node,
                            children: [...(node.children || []), newNode],
                        }
                    }
                    // Recursively search in children
                    if (node.children) {
                        return {
                            ...node,
                            children: addToTree(node.children),
                        }
                    }
                    return node
                })
            }

            const updatedTree = selectedNodeForContext && selectedNodeForContext.type === "folder" 
                ? addToTree(fileTree)
                : [...fileTree, newNode]
            
            setFileTree(updatedTree)
            setActiveFileId(newFile.id)
            setNewFileName("")
            setShowNewFileInput(false)
            setIsCreatingFile(false)
            setSelectedNodeForContext(null)
        }
    }

    const handleDeleteFile = (id: string) => {
        const newFiles = files.filter((f) => f.id !== id)
        if (newFiles.length > 0) {
            setFiles(newFiles)
            setActiveFileId(newFiles[0].id)
        } else {
            setFiles(newFiles)
        }
        
        // Remove from file tree
        const removeFromTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
            return nodes
                .filter((node) => node.id !== id)
                .map((node) => ({
                    ...node,
                    children: node.children ? removeFromTree(node.children) : undefined,
                }))
        }
        setFileTree(removeFromTree(fileTree))
    }

    const toggleFolderExpand = (folderId: string) => {
        const newExpanded = new Set(expandedFolders)
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId)
        } else {
            newExpanded.add(folderId)
        }
        setExpandedFolders(newExpanded)
    }

    const getPathForNode = (nodeId: string): string => {
        const buildPath = (nodes: FileTreeNode[], path: string[] = []): string | null => {
            for (const node of nodes) {
                if (node.id === nodeId) {
                    return [...path, node.name].join("/")
                }
                if (node.children) {
                    const result = buildPath(node.children, [...path, node.name])
                    if (result) return result
                }
            }
            return null
        }
        return buildPath(fileTree) || ""
    }

    const handleCreateFolder = () => {
        if (newFileName.trim()) {
            const folderName = newFileName
            const newFolder: FileTreeNode = {
                id: Date.now().toString(),
                name: folderName,
                type: "folder",
                children: [],
            }

            const addToTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
                return nodes.map((node) => {
                    // If a node is selected and it's a folder, add to it
                    if (selectedNodeForContext && node.id === selectedNodeForContext.id && node.type === "folder") {
                        return {
                            ...node,
                            children: [...(node.children || []), newFolder],
                        }
                    }
                    // Recursively search in children
                    if (node.children) {
                        return {
                            ...node,
                            children: addToTree(node.children),
                        }
                    }
                    return node
                })
            }

            // If a folder is selected, add inside it; otherwise add to root
            const updatedTree = selectedNodeForContext && selectedNodeForContext.type === "folder"
                ? addToTree(fileTree)
                : [...fileTree, newFolder]

            setFileTree(updatedTree)
            setNewFileName("")
            setIsCreatingFolder(false)
            setSelectedNodeForContext(null)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
        return nodes.map((node) => (
            <div key={node.id} data-file-node={node.id}>
                <div
                    className={`flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer hover:bg-[#2A2A2A] transition-colors ${
                        node.type === "file" && activeFileId === node.fileId
                            ? "bg-[#2A2A2A] text-[#3D5FFF]"
                            : "text-[#A4A4A4]"
                    }`}
                    style={{ paddingLeft: `${8 + depth * 16}px` }}
                    onContextMenu={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedNodeForContext(node)
                        setContextMenu({ x: e.clientX, y: e.clientY })
                    }}
                >
                    {node.type === "folder" ? (
                        <>
                            <button
                                onClick={() => toggleFolderExpand(node.id)}
                                className="p-0 hover:bg-[#353535] rounded"
                            >
                                <ChevronRight
                                    className={`w-3.5 h-3.5 transition-transform ${
                                        expandedFolders.has(node.id) ? "rotate-90" : ""
                                    }`}
                                />
                            </button>
                            <Folder className="w-4 h-4 text-[#7C7D7D]" />
                            <span>{node.name}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-3.5" />
                            <File className="w-4 h-4 text-[#7C7D7D]" />
                            <span
                                onClick={() => node.fileId && setActiveFileId(node.fileId)}
                                className="flex-1"
                            >
                                {node.name}
                            </span>
                            {files.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteFile(node.id)
                                    }}
                                    className="hover:bg-[#3D3D3D] p-0.5 rounded transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </>
                    )}
                </div>
                {node.type === "folder" &&
                    expandedFolders.has(node.id) &&
                    node.children &&
                    renderFileTree(node.children, depth + 1)}
            </div>
        ))
    }

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined && activeFile) {
            setFiles(
                files.map((f) =>
                    f.id === activeFileId ? { ...f, content: value } : f
                )
            )
        }
    }

    const handleLanguageChange = (language: string) => {
        if (activeFile) {
            setFiles(
                files.map((f) =>
                    f.id === activeFileId ? { ...f, language } : f
                )
            )
            setSelectedLanguage(language)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#1E1E1E] rounded-lg shadow-2xl w-11/12 h-5/6 flex flex-col border border-[#353535]">
                {/* Header */}
                <div className="flex items-center justify-between h-12 border-b border-[#2A2A2A] px-4">
                    <h2 className="text-white font-semibold">Code Editor</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-[#A4A4A4]" />
                    </button>
                </div>

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
                        </div>

                        {/* File Tree */}
                        <div
                            className="flex-1 overflow-y-auto"
                            onContextMenu={(e) => {
                                // Only show context menu for right-click on empty area
                                if ((e.target as HTMLElement).closest('[data-file-node]') === null) {
                                    e.preventDefault()
                                    setSelectedNodeForContext(null)
                                    setContextMenu({ x: e.clientX, y: e.clientY })
                                }
                            }}
                        >
                            <div className="py-2">
                                {renderFileTree(fileTree)}
                                
                                {/* Inline File Creation Input */}
                                {isCreatingFile && (
                                    <div className="px-2 py-1.5">
                                        <input
                                            type="text"
                                            placeholder="filename.js"
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleCreateFile()
                                                }
                                                if (e.key === "Escape") {
                                                    setIsCreatingFile(false)
                                                    setNewFileName("")
                                                }
                                            }}
                                            autoFocus
                                            className="w-full bg-[#1E1E1E] text-white text-sm px-2 py-1 rounded outline-none border border-[#3D5FFF] focus:border-[#5A7FFF]"
                                        />
                                    </div>
                                )}

                                {/* Inline Folder Creation Input */}
                                {isCreatingFolder && (
                                    <div className="px-2 py-1.5">
                                        <input
                                            type="text"
                                            placeholder="foldername"
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleCreateFolder()
                                                }
                                                if (e.key === "Escape") {
                                                    setIsCreatingFolder(false)
                                                    setNewFileName("")
                                                    setSelectedNodeForContext(null)
                                                }
                                            }}
                                            autoFocus
                                            className="w-full bg-[#1E1E1E] text-white text-sm px-2 py-1 rounded outline-none border border-[#3D5FFF] focus:border-[#5A7FFF]"
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
                                        setIsCreatingFile(true)
                                        setContextMenu(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-[#A4A4A4] hover:bg-[#353535] hover:text-white transition-colors"
                                >
                                    New file...
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreatingFolder(true)
                                        setContextMenu(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-[#A4A4A4] hover:bg-[#353535] hover:text-white transition-colors"
                                >
                                    New folder...
                                </button>
                                {selectedNodeForContext && (
                                    <>
                                        <div className="border-t border-[#353535] my-1"></div>
                                        <button
                                            onClick={() => {
                                                const path = getPathForNode(selectedNodeForContext.id)
                                                copyToClipboard(path)
                                                setContextMenu(null)
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-[#A4A4A4] hover:bg-[#353535] hover:text-white transition-colors"
                                        >
                                            Copy path
                                        </button>
                                        <button
                                            onClick={() => {
                                                const path = getPathForNode(selectedNodeForContext.id)
                                                const relativePath = path.replace(/^src\//, "")
                                                copyToClipboard(relativePath)
                                                setContextMenu(null)
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-[#A4A4A4] hover:bg-[#353535] hover:text-white transition-colors"
                                        >
                                            Copy relative path
                                        </button>
                                        <div className="border-t border-[#353535] my-1"></div>
                                        <button
                                            onClick={() => {
                                                handleDeleteFile(selectedNodeForContext.id)
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

                        {/* Editor Toolbar: Language Selector + File Tabs + Line Count */}
                        <div className="h-10 border-b border-[#2A2A2A] flex items-center px-2 bg-[#252525] overflow-x-auto">
                            {/* Language Selector */}
                            {activeFile && (
                                <div className="flex items-center gap-2 mr-4">
                                    <span className="text-xs text-[#7C7D7D]">Language:</span>
                                    <select
                                        value={activeFile.language}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="bg-[#1E1E1E] text-white text-xs px-2 py-1 rounded outline-none border border-[#353535] focus:border-[#3D5FFF]"
                                    >
                                        {LANGUAGE_OPTIONS.map((lang) => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {/* File Tabs */}
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-t text-sm cursor-pointer transition-colors whitespace-nowrap ${
                                        activeFileId === file.id
                                            ? "bg-[#1E1E1E] text-white border-b-2 border-[#3D5FFF]"
                                            : "bg-[#2A2A2A] text-[#A4A4A4] hover:text-white"
                                    }`}
                                    onClick={() => setActiveFileId(file.id)}
                                >
                                    <span>{file.name}</span>
                                    {files.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteFile(file.id)
                                            }}
                                            className="hover:bg-[#3D3D3D] p-0.5 rounded transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {/* Line Count (right side) */}
                            {activeFile && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-xs text-[#7C7D7D]">
                                        Lines: {activeFile.content.split("\n").length}
                                    </span>
                                </div>
                            )}
                        </div>

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
                                        fontFamily:
                                            "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
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
                                    <p>No files open</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="h-8 border-t border-[#2A2A2A] bg-[#2A2A2A] flex items-center px-4 justify-between text-xs text-[#7C7D7D]">
                            <div className="flex items-center gap-4">
                                <span>Total Files: {files.length}</span>
                                {activeFile && (
                                    <span>
                                        Current: {activeFile.name} ({activeFile.language})
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="px-3 py-1 bg-[#3D5FFF] text-white rounded hover:bg-[#5A7FFF] transition-colors text-xs"
                            >
                                Close Editor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

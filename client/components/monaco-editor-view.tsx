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

    const activeFile = files.find((f) => f.id === activeFileId)

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            const newFile: FileTab = {
                id: Date.now().toString(),
                name: newFileName,
                language: selectedLanguage,
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
            
            const updatedTree = [...fileTree]
            if (updatedTree[0]?.children) {
                updatedTree[0].children.push(newNode)
            }
            setFileTree(updatedTree)
            
            setActiveFileId(newFile.id)
            setNewFileName("")
            setShowNewFileInput(false)
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

    const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
        return nodes.map((node) => (
            <div key={node.id}>
                <div
                    className={`flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer hover:bg-[#2A2A2A] transition-colors ${
                        node.type === "file" && activeFileId === node.fileId
                            ? "bg-[#2A2A2A] text-[#3D5FFF]"
                            : "text-[#A4A4A4]"
                    }`}
                    style={{ paddingLeft: `${8 + depth * 16}px` }}
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
                            <button
                                onClick={() => setShowNewFileInput(true)}
                                className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5 text-[#A4A4A4]" />
                            </button>
                        </div>

                        {/* File Tree */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="py-2">
                                {renderFileTree(fileTree)}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Editor */}
                    <div className="flex-1 flex flex-col">
                        {/* File Tabs */}
                        <div className="h-10 border-b border-[#2A2A2A] flex items-center gap-1 px-2 bg-[#252525] overflow-x-auto">
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
                        </div>

                        {/* New File Input */}
                        {showNewFileInput && (
                            <div className="h-12 border-b border-[#2A2A2A] bg-[#2A2A2A] flex items-center gap-2 px-4">
                                <input
                                    type="text"
                                    placeholder="filename.js"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleCreateFile()
                                        if (e.key === "Escape") {
                                            setShowNewFileInput(false)
                                            setNewFileName("")
                                        }
                                    }}
                                    autoFocus
                                    className="flex-1 bg-[#1E1E1E] text-white text-sm px-2 py-1 rounded outline-none border border-[#353535] focus:border-[#3D5FFF]"
                                />

                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="bg-[#1E1E1E] text-white text-sm px-2 py-1 rounded outline-none border border-[#353535] focus:border-[#3D5FFF]"
                                >
                                    {LANGUAGE_OPTIONS.map((lang) => (
                                        <option key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleCreateFile}
                                    className="px-3 py-1 bg-[#3D5FFF] text-white text-sm rounded hover:bg-[#5A7FFF] transition-colors"
                                >
                                    Create
                                </button>

                                <button
                                    onClick={() => {
                                        setShowNewFileInput(false)
                                        setNewFileName("")
                                    }}
                                    className="px-2 py-1 hover:bg-[#3D3D3D] rounded transition-colors"
                                >
                                    <X className="w-4 h-4 text-[#A4A4A4]" />
                                </button>
                            </div>
                        )}

                        {/* Editor Tools & Language Selector */}
                        {activeFile && (
                            <div className="h-8 border-b border-[#2A2A2A] bg-[#2A2A2A] flex items-center px-4 gap-4">
                                <div className="flex items-center gap-2">
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

                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-xs text-[#7C7D7D]">
                                        Lines: {activeFile.content.split("\n").length}
                                    </span>
                                </div>
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

"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { X, Loader2, Cloud, CloudOff, RefreshCw } from "lucide-react"
import { webContainerService } from "@/lib/webcontainer-service"
import { isWebContainerSupported, isCommandSupported, getAlternativeSuggestion } from "@/lib/web-sandbox"
import { unifiedFS } from "@/lib/unified-filesystem"
import { useFilesystemStore } from "@/lib/stores/filesystem-store"

// Aesthetic prompt with gradient colors and working directory
const getPrompt = (cwd: string) => `\x1b[38;2;100;100;120m${cwd}\x1b[0m \x1b[38;2;221;174;211m›\x1b[0m `
const PROMPT_PLAIN = "› " // For cursor positioning calculations

interface TerminalViewProps {
  onClose: () => void
  onCommandRun?: (command: string) => void
}

export default function TerminalView({ onClose, onCommandRun }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<Terminal | null>(null)
  const inputBufferRef = useRef("")
  const commandHistoryRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const isExecutingRef = useRef(false)
  const cwdRef = useRef("/")
  const [isBooting, setIsBooting] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)

  const { refreshFileTree } = useFilesystemStore()

  // Get current prompt
  const getCurrentPrompt = () => getPrompt(cwdRef.current)

  // Execute command in WebContainer
  const executeCommand = useCallback(async (command: string, term: Terminal) => {
    if (!command.trim() || isExecutingRef.current) return

    isExecutingRef.current = true

    // Add to history
    commandHistoryRef.current.push(command)
    if (commandHistoryRef.current.length > 50) {
      commandHistoryRef.current.shift()
    }
    historyIndexRef.current = -1

    // Handle built-in commands
    if (command.toLowerCase() === "clear" || command.toLowerCase() === "cls") {
      term.clear()
      term.write(getCurrentPrompt())
      isExecutingRef.current = false
      return
    }

    // Handle cd command specially
    if (command.startsWith("cd ")) {
      const targetDir = command.slice(3).trim()
      let newPath = targetDir

      if (targetDir === "..") {
        const parts = cwdRef.current.split("/").filter(Boolean)
        parts.pop()
        newPath = "/" + parts.join("/")
      } else if (targetDir === "~" || targetDir === "/") {
        newPath = "/"
      } else if (!targetDir.startsWith("/")) {
        newPath = cwdRef.current === "/"
          ? `/${targetDir}`
          : `${cwdRef.current}/${targetDir}`
      }

      // Verify directory exists
      try {
        await webContainerService.readDir(newPath)
        cwdRef.current = newPath || "/"
        unifiedFS.setCwd(cwdRef.current)
        term.write("\r\n" + getCurrentPrompt())
      } catch {
        term.write(`\r\n\x1b[38;2;210;130;130mcd: no such directory: ${targetDir}\x1b[0m\r\n` + getCurrentPrompt())
      }

      isExecutingRef.current = false
      return
    }

    if (command.toLowerCase() === "pwd") {
      term.write(`\r\n${cwdRef.current}\r\n` + getCurrentPrompt())
      isExecutingRef.current = false
      return
    }

    if (command.toLowerCase() === "help") {
      term.write("\r\n")
      term.write("\x1b[38;2;221;174;211m┌─────────────────────────────────────────────────────────┐\x1b[0m\r\n")
      term.write("\x1b[38;2;221;174;211m│\x1b[0m  \x1b[38;2;180;200;220mZenMod Terminal\x1b[0m \x1b[38;2;120;120;140m// Browser-based Node.js\x1b[0m             \x1b[38;2;221;174;211m│\x1b[0m\r\n")
      term.write("\x1b[38;2;221;174;211m└─────────────────────────────────────────────────────────┘\x1b[0m\r\n\r\n")
      term.write("\x1b[38;2;150;180;210mSupported\x1b[0m\r\n")
      term.write("  \x1b[38;2;180;220;200mnode\x1b[0m           \x1b[38;2;120;120;140m─\x1b[0m Run JavaScript files\r\n")
      term.write("  \x1b[38;2;180;220;200mnpm\x1b[0m            \x1b[38;2;120;120;140m─\x1b[0m Node package manager\r\n")
      term.write("  \x1b[38;2;180;220;200mnpx\x1b[0m            \x1b[38;2;120;120;140m─\x1b[0m Execute npm packages\r\n")
      term.write("  \x1b[38;2;180;220;200myarn, pnpm\x1b[0m     \x1b[38;2;120;120;140m─\x1b[0m Alternative package managers\r\n")
      term.write("  \x1b[38;2;180;220;200mls, cat, pwd\x1b[0m   \x1b[38;2;120;120;140m─\x1b[0m File system commands\r\n")
      term.write("  \x1b[38;2;180;220;200mmkdir, rm\x1b[0m      \x1b[38;2;120;120;140m─\x1b[0m Create/remove files\r\n")
      term.write("  \x1b[38;2;180;220;200mclear\x1b[0m          \x1b[38;2;120;120;140m─\x1b[0m Clear terminal\r\n")
      term.write("\r\n\x1b[38;2;210;150;150mNot Available\x1b[0m\r\n")
      term.write("  \x1b[38;2;140;140;140mpython, pip, go, cargo\x1b[0m\r\n")
      term.write("\r\n\x1b[38;2;100;100;120m// All commands run in isolated ZenMod environment\x1b[0m\r\n")
      term.write("\r\n" + getCurrentPrompt())
      isExecutingRef.current = false
      return
    }

    // Check if command is supported
    const supportCheck = isCommandSupported(command)
    if (!supportCheck.supported) {
      term.write(`\r\n\x1b[38;2;210;130;130m× ${supportCheck.message}\x1b[0m\r\n`)
      const suggestion = getAlternativeSuggestion(command)
      if (suggestion) {
        term.write(`\x1b[38;2;221;174;211m  ${suggestion}\x1b[0m\r\n`)
      }
      term.write("\r\n" + getCurrentPrompt())
      isExecutingRef.current = false
      return
    }

    term.write("\r\n\x1b[38;2;180;180;200m› Running...\x1b[0m\r\n")

    const startTime = Date.now()

    try {
      // Set up real-time output streaming
      webContainerService.onOutput((data) => {
        const formattedOutput = data.replace(/\r?\n/g, "\r\n")
        term.write(formattedOutput)
      })

      const result = await webContainerService.executeCommand(command)
      const executionTime = Date.now() - startTime

      // If there was no streamed output, show the buffered output
      if (!result.output && !result.error) {
        term.write("\x1b[38;2;100;100;120m(no output)\x1b[0m\r\n")
      }

      // Display errors in muted red
      if (result.error && result.exitCode !== 0) {
        term.write(`\x1b[38;2;210;130;130m${result.error.replace(/\r?\n/g, "\r\n")}\x1b[0m\r\n`)
      }

      // Display execution info with gradient-style colors
      const exitColor = result.exitCode === 0 ? "\x1b[38;2;150;200;170m" : "\x1b[38;2;210;130;130m"
      term.write(`\x1b[38;2;80;80;100m[\x1b[0m${exitColor}${result.exitCode}\x1b[0m\x1b[38;2;80;80;100m]\x1b[0m \x1b[38;2;100;100;120m${executionTime}ms\x1b[0m \x1b[38;2;221;174;211m·\x1b[0m \x1b[38;2;140;140;160mzenmod\x1b[0m\r\n`)

      // Sync filesystem after command execution
      // This ensures any files created/modified by terminal commands appear in editor
      await refreshFileTree()

      // Notify parent of command execution
      onCommandRun?.(command)

    } catch (error) {
      if (error instanceof Error) {
        term.write(`\x1b[38;2;210;130;130m× ${error.message}\x1b[0m\r\n`)
      } else {
        term.write("\x1b[38;2;210;130;130m× Unknown error occurred\x1b[0m\r\n")
      }
    } finally {
      isExecutingRef.current = false
      term.write(getCurrentPrompt())
    }
  }, [refreshFileTree, onCommandRun])

  useEffect(() => {
    if (!terminalRef.current) return

    // Check WebContainer support
    if (!isWebContainerSupported()) {
      setBootError("WebContainers require SharedArrayBuffer. Please ensure your browser supports it and the page has the required security headers.")
      setIsBooting(false)
      return
    }

    // Initialize terminal with aesthetic color scheme
    const term = new Terminal({
      cols: 80,
      rows: 24,
      theme: {
        background: "#0F0F0F",
        foreground: "#D0D0D0",
        cursor: "#DDAED3",
        cursorAccent: "#0F0F0F",
        selectionBackground: "#3D5FFF40",
        black: "#0F0F0F",
        red: "#D28282",
        green: "#96C8A8",
        yellow: "#DDAED3",
        blue: "#B4C8DC",
        magenta: "#DDAED3",
        cyan: "#96B4C8",
        white: "#D0D0D0",
        brightBlack: "#505060",
        brightRed: "#E0A0A0",
        brightGreen: "#A8D8B8",
        brightYellow: "#E8C0E0",
        brightBlue: "#C8D8E8",
        brightMagenta: "#E8C0E0",
        brightCyan: "#A8C8D8",
        brightWhite: "#E8E8E8",
      },
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: 13,
      fontWeight: "normal",
      lineHeight: 1.2,
      letterSpacing: 0,
      scrollback: 5000,
      cursorBlink: true,
    })

    terminalInstanceRef.current = term
    term.open(terminalRef.current)

    // Add fit addon
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    // Fit after a short delay to ensure DOM is ready
    setTimeout(() => fitAddon.fit(), 0)

    // Boot WebContainer
    term.write("\x1b[38;2;221;174;211m┌─────────────────────────────────────────────────────────┐\x1b[0m\r\n")
    term.write("\x1b[38;2;221;174;211m│\x1b[0m  \x1b[38;2;180;200;220mZenMod\x1b[0m \x1b[38;2;150;170;190mTerminal\x1b[0m                                       \x1b[38;2;221;174;211m│\x1b[0m\r\n")
    term.write("\x1b[38;2;221;174;211m│\x1b[0m  \x1b[38;2;100;100;120mIsolated browser-based execution\x1b[0m                      \x1b[38;2;221;174;211m│\x1b[0m\r\n")
    term.write("\x1b[38;2;221;174;211m└─────────────────────────────────────────────────────────┘\x1b[0m\r\n")
    term.write("\r\n\x1b[38;2;150;150;170m› Booting WebContainer...\x1b[0m\r\n")

    // Boot the WebContainer
    webContainerService.boot()
      .then(async () => {
        setIsBooting(false)
        setIsReady(true)

        // Initialize unified filesystem
        await unifiedFS.initialize()

        term.write("\x1b[38;2;150;200;170m✓ Ready\x1b[0m\r\n")
        term.write("\x1b[38;2;100;100;120m  Type 'help' for available commands\x1b[0m\r\n\r\n" + getCurrentPrompt())
      })
      .catch((error) => {
        setIsBooting(false)
        setBootError(error.message)
        term.write(`\x1b[38;2;210;130;130m× Failed to boot: ${error.message}\x1b[0m\r\n`)
        term.write("\x1b[38;2;221;174;211m  WebContainers require specific browser security headers\x1b[0m\r\n")
      })

    // Handle terminal input
    term.onData((data) => {
      // Handle escape sequences for arrow keys
      if (data === "\x1b[A") {
        // Arrow Up - previous command
        if (commandHistoryRef.current.length > 0) {
          if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
            historyIndexRef.current++
            const historyCommand = commandHistoryRef.current[commandHistoryRef.current.length - 1 - historyIndexRef.current]

            // Clear current input
            term.write("\r" + " ".repeat(cwdRef.current.length + PROMPT_PLAIN.length + inputBufferRef.current.length + 2) + "\r" + getCurrentPrompt())
            inputBufferRef.current = historyCommand
            term.write(historyCommand)
          }
        }
        return
      }

      if (data === "\x1b[B") {
        // Arrow Down - next command
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--
          const historyCommand = commandHistoryRef.current[commandHistoryRef.current.length - 1 - historyIndexRef.current]

          // Clear current input
          term.write("\r" + " ".repeat(cwdRef.current.length + PROMPT_PLAIN.length + inputBufferRef.current.length + 2) + "\r" + getCurrentPrompt())
          inputBufferRef.current = historyCommand
          term.write(historyCommand)
        } else if (historyIndexRef.current === 0) {
          historyIndexRef.current = -1
          term.write("\r" + " ".repeat(cwdRef.current.length + PROMPT_PLAIN.length + inputBufferRef.current.length + 2) + "\r" + getCurrentPrompt())
          inputBufferRef.current = ""
        }
        return
      }

      if (data === "\r") {
        // Enter key - execute command
        const command = inputBufferRef.current.trim()
        inputBufferRef.current = ""

        if (command !== "") {
          executeCommand(command, term)
        } else {
          term.write("\r\n" + getCurrentPrompt())
        }
      } else if (data === "\u007F" || data === "\b") {
        // Backspace
        if (inputBufferRef.current.length > 0 && !isExecutingRef.current) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1)
          term.write("\b \b")
        }
      } else if (data === "\u0003") {
        // Ctrl+C - cancel current operation
        if (isExecutingRef.current) {
          webContainerService.killCurrentProcess()
        }
        term.write("\x1b[38;2;140;140;160m^C\x1b[0m\r\n" + getCurrentPrompt())
        inputBufferRef.current = ""
        historyIndexRef.current = -1
      } else if (data === "\u000C") {
        // Ctrl+L - clear screen
        term.clear()
        term.write(getCurrentPrompt() + inputBufferRef.current)
      } else if (data.charCodeAt(0) >= 32 && !isExecutingRef.current) {
        // Regular printable character
        inputBufferRef.current += data
        term.write(data)
      }
    })

    // Handle window resize
    const handleResize = () => {
      try {
        fitAddon.fit()
      } catch (e) {
        // Ignore errors during resize
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit()
      } catch (e) {
        // Ignore errors
      }
    })

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
      webContainerService.killCurrentProcess()
      term.dispose()
    }
  }, [executeCommand])

  return (
    <div className="h-full w-full flex flex-col bg-[#0F0F0F] overflow-hidden">
      {/* Terminal Header */}
      <div className="h-10 border-b border-[#2A2A2A] flex items-center justify-between px-4 flex-shrink-0 bg-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A4A4A4] font-medium">Terminal</span>
          {isBooting && (
            <span className="flex items-center gap-1 text-xs text-yellow-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Booting...
            </span>
          )}
          {isReady && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <Cloud className="w-3 h-3" />
              ZenMod
            </span>
          )}
          {bootError && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <CloudOff className="w-3 h-3" />
              Error
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2A2A2A] rounded text-[#7C7D7D] hover:text-[#E6E6E6]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal Container - Scrolling contained here */}
      <div
        ref={terminalRef}
        className="flex-1 w-full overflow-hidden bg-[#0F0F0F]"
        style={{
          fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
        }}
      />
    </div>
  )
}

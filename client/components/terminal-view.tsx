"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { X, Loader2, Cloud, CloudOff } from "lucide-react"
import { webContainerService } from "@/lib/webcontainer-service"
import { isWebContainerSupported, isCommandSupported, getAlternativeSuggestion } from "@/lib/web-sandbox"

interface TerminalViewProps {
  onClose: () => void
}

export default function TerminalView({ onClose }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<Terminal | null>(null)
  const inputBufferRef = useRef("")
  const commandHistoryRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const isExecutingRef = useRef(false)
  const [isBooting, setIsBooting] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)

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
      term.write("$ ")
      isExecutingRef.current = false
      return
    }

    if (command.toLowerCase() === "help") {
      term.write("\r\n\x1b[1;36m📦 WebContainer Sandbox\x1b[0m - Browser-based Node.js environment\r\n\r\n")
      term.write("\x1b[1;33mSupported Commands:\x1b[0m\r\n")
      term.write("  node           - Run JavaScript files\r\n")
      term.write("  npm            - Node package manager\r\n")
      term.write("  npx            - Execute npm packages\r\n")
      term.write("  yarn, pnpm     - Alternative package managers\r\n")
      term.write("  ls, cat, pwd   - File system commands\r\n")
      term.write("  mkdir, rm      - Create/remove files\r\n")
      term.write("  clear          - Clear terminal\r\n")
      term.write("\r\n\x1b[1;31mNot Supported:\x1b[0m\r\n")
      term.write("  python, pip    - Use Node.js instead\r\n")
      term.write("  go, cargo      - Language-specific tools\r\n")
      term.write("\r\n\x1b[90mTip: All commands run in an isolated browser sandbox!\x1b[0m\r\n")
      term.write("\r\n$ ")
      isExecutingRef.current = false
      return
    }

    // Check if command is supported
    const supportCheck = isCommandSupported(command)
    if (!supportCheck.supported) {
      term.write(`\r\n\x1b[31m❌ ${supportCheck.message}\x1b[0m\r\n`)
      const suggestion = getAlternativeSuggestion(command)
      if (suggestion) {
        term.write(`\x1b[33m💡 ${suggestion}\x1b[0m\r\n`)
      }
      term.write("\r\n$ ")
      isExecutingRef.current = false
      return
    }

    term.write("\r\n\x1b[33m⏳ Running in sandbox...\x1b[0m\r\n")

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
        term.write("\x1b[90m(no output)\x1b[0m\r\n")
      }

      // Display errors in red (if not already shown via streaming)
      if (result.error && result.exitCode !== 0) {
        term.write(`\x1b[31m${result.error.replace(/\r?\n/g, "\r\n")}\x1b[0m\r\n`)
      }

      // Display execution info
      const exitColor = result.exitCode === 0 ? "\x1b[32m" : "\x1b[31m"
      term.write(`\x1b[90m[Exit: ${exitColor}${result.exitCode}\x1b[90m | Time: ${executionTime}ms | Sandbox]\x1b[0m\r\n`)
    } catch (error) {
      if (error instanceof Error) {
        term.write(`\x1b[31m❌ Error: ${error.message}\x1b[0m\r\n`)
      } else {
        term.write("\x1b[31m❌ Unknown error occurred\x1b[0m\r\n")
      }
    } finally {
      isExecutingRef.current = false
      term.write("$ ")
    }
  }, [])

  useEffect(() => {
    if (!terminalRef.current) return

    // Check WebContainer support
    if (!isWebContainerSupported()) {
      setBootError("WebContainers require SharedArrayBuffer. Please ensure your browser supports it and the page has the required security headers.")
      setIsBooting(false)
      return
    }

    // Initialize terminal
    const term = new Terminal({
      cols: 80,
      rows: 24,
      theme: {
        background: "#0F0F0F",
        foreground: "#E6E6E6",
        cursor: "#E6E6E6",
        cursorAccent: "#0F0F0F",
        selectionBackground: "#3D5FFF",
        black: "#000000",
        red: "#FF5555",
        green: "#55FF55",
        yellow: "#FFFF55",
        blue: "#5555FF",
        magenta: "#FF55FF",
        cyan: "#55FFFF",
        white: "#E6E6E6",
        brightBlack: "#555555",
        brightRed: "#FF8888",
        brightGreen: "#88FF88",
        brightYellow: "#FFFF88",
        brightBlue: "#8888FF",
        brightMagenta: "#FF88FF",
        brightCyan: "#88FFFF",
        brightWhite: "#FFFFFF",
      },
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: 18,
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
    term.write("\x1b[36m╔══════════════════════════════════════════════════════════╗\x1b[0m\r\n")
    term.write("\x1b[36m║\x1b[0m  \x1b[1;32mZenMod Sandbox Terminal\x1b[0m - WebContainer Environment      \x1b[36m║\x1b[0m\r\n")
    term.write("\x1b[36m║\x1b[0m  \x1b[90mIsolated browser-based execution - No local access\x1b[0m       \x1b[36m║\x1b[0m\r\n")
    term.write("\x1b[36m╚══════════════════════════════════════════════════════════╝\x1b[0m\r\n")
    term.write("\r\n\x1b[33m⏳ Booting WebContainer...\x1b[0m\r\n")

    // Boot the WebContainer
    webContainerService.boot()
      .then(() => {
        setIsBooting(false)
        setIsReady(true)
        term.write("\x1b[32m✓ WebContainer ready!\x1b[0m\r\n")
        term.write("\x1b[90mType 'help' for available commands\x1b[0m\r\n\r\n$ ")
      })
      .catch((error) => {
        setIsBooting(false)
        setBootError(error.message)
        term.write(`\x1b[31m❌ Failed to boot WebContainer: ${error.message}\x1b[0m\r\n`)
        term.write("\x1b[33mTip: WebContainers require specific browser security headers.\x1b[0m\r\n")
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
            term.write("\r$ " + " ".repeat(inputBufferRef.current.length) + "\r$ ")
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
          term.write("\r$ " + " ".repeat(inputBufferRef.current.length) + "\r$ ")
          inputBufferRef.current = historyCommand
          term.write(historyCommand)
        } else if (historyIndexRef.current === 0) {
          historyIndexRef.current = -1
          term.write("\r$ " + " ".repeat(inputBufferRef.current.length) + "\r$ ")
          inputBufferRef.current = ""
        }
        return
      }

      if (data === "\r") {
        // Enter key - execute command
        term.write("\r\n")
        const command = inputBufferRef.current.trim()
        inputBufferRef.current = ""
        
        if (command !== "") {
          executeCommand(command, term)
        } else {
          term.write("$ ")
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
        term.write("^C\r\n$ ")
        inputBufferRef.current = ""
        historyIndexRef.current = -1
      } else if (data === "\u000C") {
        // Ctrl+L - clear screen
        term.clear()
        term.write("$ " + inputBufferRef.current)
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
              Sandbox
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

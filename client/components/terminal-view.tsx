"use client"

import { useEffect, useRef } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { X } from "lucide-react"

interface TerminalViewProps {
  onClose: () => void
}

export default function TerminalView({ onClose }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstanceRef = useRef<Terminal | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

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
      fontSize: 12,
      fontWeight: "normal",
      lineHeight: 1.2,
      letterSpacing: 0,
      scrollback: 1000,
      cursorBlink: true,
    })

    terminalInstanceRef.current = term
    term.open(terminalRef.current)

    // Add fit addon
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    
    // Fit after a short delay to ensure DOM is ready
    setTimeout(() => fitAddon.fit(), 0)

    // Write initial prompt
    term.write("$ ")

    // Handle terminal input
    let inputBuffer = ""

    term.onData((data) => {
      if (data === "\r") {
        // Enter key - execute command
        term.write("\r\n")

        // Simulate command execution
        if (inputBuffer.toLowerCase() === "clear") {
          term.clear()
        } else if (inputBuffer.trim() !== "") {
          // Mock output
          term.write(`Executing: ${inputBuffer}\r\n`)
          term.write("$ ")
        } else {
          term.write("$ ")
        }

        inputBuffer = ""
      } else if (data === "\u007F") {
        // Backspace
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1)
          term.write("\b \b")
        }
      } else if (data === "\u0003") {
        // Ctrl+C
        term.write("^C\r\n$ ")
        inputBuffer = ""
      } else {
        // Regular character
        inputBuffer += data
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
      term.dispose()
    }
  }, [])

  return (
    <div className="h-full w-full flex flex-col bg-[#0F0F0F] overflow-hidden">
      {/* Terminal Header */}
      <div className="h-10 border-b border-[#2A2A2A] flex items-center justify-between px-4 flex-shrink-0 bg-[#1A1A1A]">
        <span className="text-xs text-[#A4A4A4] font-medium">Terminal</span>
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

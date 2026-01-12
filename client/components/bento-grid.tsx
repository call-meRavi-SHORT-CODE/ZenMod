"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Zap, Code, Gauge, Workflow, Lock, BarChart3 } from "lucide-react"
import gsap from "gsap"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function SystemStatus() {
  const [dots, setDots] = useState([true, true, true, false, true])

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => prev.map(() => Math.random() > 0.2))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      {dots.map((active, i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-700"}`}
          animate={active ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function KeyboardCommand() {
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPressed(true)
      setTimeout(() => setPressed(false), 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-1">
      <kbd className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono">⌘</kbd>
      <kbd className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono">K</kbd>
    </div>
  )
}

function AnimatedChart() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const points = [
    { x: 0, y: 60 },
    { x: 20, y: 45 },
    { x: 40, y: 55 },
    { x: 60, y: 30 },
    { x: 80, y: 40 },
    { x: 100, y: 15 },
  ]

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`
  }, "")

  return (
    <svg ref={ref} viewBox="0 0 100 70" className="w-full h-24">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {isInView && (
        <>
          <path d={`${pathD} L 100 70 L 0 70 Z`} fill="url(#chartGradient)" className="opacity-50" />
          <path d={pathD} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="draw-line" />
        </>
      )}
    </svg>
  )
}

export function BentoGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isInView && headingRef.current) {
      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      })
    }
  }, [isInView])

  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="text-center mb-16 opacity-0" style={{ transform: "translateY(20px)" }}>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-instrument-sans)" }}
          >
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Built for people who hate boilerplate and love momentum.</p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* AI Feature */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
                  <Zap className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI that gets your vibe</h3>
                <p className="text-zinc-400 text-sm">
                  Talk in plain English. Get clean, working code — not just suggestions. Think it → type it → run it.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Editor Feature */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Code className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Edit in real time</h3>
            <p className="text-zinc-400 text-sm mb-6">Full-power editor. Multi-file projects. Instant AI updates.</p>
            <div className="text-sm text-zinc-300">Your code. Your rules.</div>
          </motion.div>

          {/* Runtime Feature */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Workflow className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Run it instantly</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Every project runs in a secure sandbox. No installs. No configs. No stress.
            </p>
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-mono">
              ~40ms
              <span className="text-zinc-500">preview refresh</span>
            </div>
          </motion.div>

          {/* Command Palette */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <BarChart3 className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Command everything</h3>
            <p className="text-zinc-400 text-sm mb-6">Keyboard-first. One shortcut away from anything.</p>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono">
                ⌘
              </kbd>
              <kbd className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-mono">
                K
              </kbd>
            </div>
          </motion.div>

          {/* Monitoring Feature */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Gauge className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Stay in the loop</h3>
            <p className="text-zinc-400 text-sm mb-4">See what's running. What's breaking. What's fast.</p>
            <div className="text-sm text-zinc-400">Live stats. Zero guesswork.</div>
          </motion.div>

          {/* Security Feature */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Lock className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Safe by default</h3>
            <p className="text-zinc-400 text-sm mb-4">Isolated sandboxes. Hard limits. Auto-cleanups.</p>
            <div className="text-sm text-zinc-400">Break things safely 😌</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AnimatedText } from "@/components/animated-text"
import { VibeBackground } from "@/components/vibe-background"

const avatars = [
  "/professional-headshot-1.png",
  "/professional-headshot-2.png",
  "/professional-headshot-3.png",
  "/professional-headshot-4.png",
  "/professional-headshot-5.png",
]

const textRevealVariants = {
  hidden: { y: "100%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.1,
    },
  }),
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-16 overflow-hidden">
      <VibeBackground />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 pointer-events-none" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">



        {/* Headline with text mask animation */}
        <div className="mb-6 flex flex-col items-center">
          <AnimatedText
            text="Code with Vibe"
            type="split"
            delay={0.2}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2 text-center"
            style={{ fontFamily: "var(--font-cal-sans), sans-serif" }}
          />
          <AnimatedText
            text="Build. Run. Repeat"
            type="split"
            delay={0.5}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-500 text-center"
            style={{ fontFamily: "var(--font-cal-sans), sans-serif" }}
          />
        </div>

        {/* Subheadline */}
        <AnimatedText
          text="An AI coding playground where ideas turn into running apps — instantly. Chat. Generate. Edit. Run. Repeat."
          type="split"
          delay={0.5}
          className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto mb-16 leading-relaxed"
        />

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-white/10"
            >
              Start Coding
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>

        </div>


      </div>
    </section>
  )
}

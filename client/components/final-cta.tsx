"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import gsap from "gsap"

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (isInView && headingRef.current) {
      const text = headingRef.current.textContent || ""
      const words = text.split(" ")
      headingRef.current.innerHTML = words.map((word) => `<span class="word inline-block">${word}</span>`).join(" ")

      const wordElements = headingRef.current.querySelectorAll(".word")
      gsap.fromTo(
        wordElements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
        },
      )
    }
  }, [isInView])

  return (
    <section className="py-24 px-4">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2
          ref={headingRef}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-cal-sans)" }}
        >
          Ready to build in flow?
        </h2>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Ideas don't wait. Neither should you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-8 h-14 text-base font-medium shadow-lg shadow-white/20"
          >
            Start coding with ZenMod
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-14 text-base font-medium border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 bg-transparent"
          >
            Talk to Sales
          </Button>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          No credit card. No pressure.{" "}
          <span className="text-zinc-300 font-medium">Free forever for solo builders.</span>
        </p>
      </motion.div>
    </section>
  )
}

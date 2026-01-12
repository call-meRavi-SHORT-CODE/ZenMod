"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import gsap from "gsap"

interface AnimatedTextProps {
  text: string
  className?: string
  type?: "split" | "typewriter" | "fade" | "slide"
  delay?: number
  style?: CSSProperties
}

export function AnimatedText({ text, className = "", type = "split", delay = 0, style }: AnimatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textRef.current) return

    const element = textRef.current

    switch (type) {
      case "split": {
        const words = text.split(" ")
        element.innerHTML = words.map((word) => `<span class="word inline-block">${word}</span>`).join(" ")

        const wordElements = element.querySelectorAll(".word")
        gsap.fromTo(
          wordElements,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            delay,
            ease: "power2.out",
          },
        )
        break
      }

      case "typewriter": {
        const originalText = text
        element.textContent = ""

        gsap.to(element, {
          duration: originalText.length * 0.05,
          delay,
          ease: "none",
          onUpdate: function () {
            const progress = this.progress()
            const charCount = Math.floor(progress * originalText.length)
            element.textContent = originalText.substring(0, charCount)
          },
        })
        break
      }

      case "fade": {
        gsap.fromTo(
          element,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1,
            delay,
            ease: "power2.out",
          },
        )
        break
      }

      case "slide": {
        gsap.fromTo(
          element,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay,
            ease: "power2.out",
          },
        )
        break
      }
    }

    return () => {
      gsap.killTweensOf(element)
    }
  }, [text, type, delay])

  return <div ref={textRef} className={className} style={style} />
}

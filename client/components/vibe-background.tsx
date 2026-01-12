"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function VibeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)

    camera.position.z = 50

    const particleCount = 150
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const colorPalette = [
      new THREE.Color(0x10b981), // emerald
      new THREE.Color(0x06b6d4), // cyan
      new THREE.Color(0x8b5cf6), // purple
      new THREE.Color(0xec4899), // pink
      new THREE.Color(0xf59e0b), // amber
    ]

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100

      velocities[i * 3] = (Math.random() - 0.5) * 0.5
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const lineGeometry = new THREE.BufferGeometry()
    const linePositions = []

    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 200
      const y = (Math.random() - 0.5) * 200
      const z = (Math.random() - 0.5) * 100

      linePositions.push(x, y, z)
      linePositions.push(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, z + (Math.random() - 0.5) * 20)
    }

    lineGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3))

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.2,
      linewidth: 1,
    })

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lines)

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const positionAttribute = geometry.getAttribute("position") as THREE.BufferAttribute
    const posArray = positionAttribute.array as Float32Array

    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.001

      // Update particle positions
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i * 3]
        posArray[i * 3 + 1] += velocities[i * 3 + 1]
        posArray[i * 3 + 2] += velocities[i * 3 + 2]

        // Wrap around edges
        if (posArray[i * 3] > 100) posArray[i * 3] = -100
        if (posArray[i * 3] < -100) posArray[i * 3] = 100
        if (posArray[i * 3 + 1] > 100) posArray[i * 3 + 1] = -100
        if (posArray[i * 3 + 1] < -100) posArray[i * 3 + 1] = 100
      }

      positionAttribute.needsUpdate = true

      // Gentle rotation
      particles.rotation.x += 0.0001
      particles.rotation.y += 0.0002
      lines.rotation.x += 0.0001
      lines.rotation.y += 0.00015

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      containerRef.current?.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)" }}
    />
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"

interface JoystickProps {
  onMove: (x: number, y: number) => void
  size?: number
}

export function Joystick({ onMove, size = 200 }: JoystickProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true)
    updatePosition(clientX, clientY)
  }, [])

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return
      updatePosition(clientX, clientY)
    },
    [isDragging],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove(0, 0)
  }, [onMove])

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = clientX - centerX
      const deltaY = clientY - centerY

      const maxDistance = size / 2 - 20
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      let x = deltaX
      let y = deltaY

      if (distance > maxDistance) {
        x = (deltaX / distance) * maxDistance
        y = (deltaY / distance) * maxDistance
      }

      setPosition({ x, y })

      // Normalize to -1 to 1 range
      const normalizedX = x / maxDistance
      const normalizedY = y / maxDistance

      onMove(normalizedX, normalizedY)
    },
    [size, onMove],
  )

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    },
    [handleMove],
  )

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    },
    [handleMove],
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      handleEnd()
    },
    [handleEnd],
  )

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd, { passive: false })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  return (
    <div className="flex justify-center">
      <div
        ref={containerRef}
        className="relative bg-muted/30 rounded-full border-2 border-primary/30 cursor-pointer select-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary/50 rounded-full transform -translate-x-1/2 -translate-y-1/2" />

        {/* Knob */}
        <div
          ref={knobRef}
          className="absolute w-10 h-10 bg-primary rounded-full border-2 border-primary-foreground transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 neon-glow"
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            boxShadow: isDragging ? "0 0 20px currentColor" : "0 0 10px currentColor",
          }}
        />

        {/* Direction indicators */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">↑</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">↓</div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">←</div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">→</div>
      </div>
    </div>
  )
}
